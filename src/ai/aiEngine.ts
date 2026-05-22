import { runOpenAIScoring } from "./openai";
import { ruleScore } from "./ruleEngine";
import { fallbackScore } from "./fallback";
import { classifyContent } from "./contentClassifier";

import type {
  AIScoreResult,
  AIStatus,
} from "../types";

/* =========================================================
   🔧 NORMALIZERS
   (Ensure consistent scoring format across all engines)
========================================================= */

/**
 * Converts any value into safe 0–100 score range
 */
function normalizeScore(v: any): number {
  const n = Number(v);
  if (isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

/**
 * Converts confidence into 0–100 scale
 */
function normalizeConfidence(v: any): number {
  const n = Number(v ?? 0);
  if (n <= 1) return Math.round(n * 100);
  return Math.round(n);
}

/**
 * Ensures flags are always string array
 */
function normalizeFlags(flags: any): string[] {
  if (!Array.isArray(flags)) return [];
  return flags.map(String);
}

/**
 * Maps score → status bucket
 */
function normalizeStatus(status: any, score: number): AIStatus {
  if (status === "GOOD" || status === "FAIR" || status === "BAD") {
    return status;
  }

  if (score >= 75) return "GOOD";
  if (score >= 45) return "FAIR";
  return "BAD";
}

/* =========================================================
   🛡️ SAFETY LAYER (RULE ENGINE PROTECTION)
   Prevents extreme false negatives/positives
========================================================= */

function clampRuleEngineScore(score: number): number {
  if (score < 10) return 10;
  if (score > 95) return 95;
  return score;
}

/* =========================================================
   🍲 GLOBAL SAFETY FLOOR (LEVEL 2.5 CORE FIX)
   Ensures structured content is never wrongly punished
========================================================= */

function applyContentSafetyFloor(score: number, contentType: string) {
  if (contentType === "recipe") {
    return Math.max(score, 75); // recipes are safe structured content
  }

  if (contentType === "question") {
    return Math.max(score, 65); // questions are generally safe
  }

  return score;
}

/* =========================================================
   🚀 MAIN MODERATION ENGINE
   Pipeline: classify → OpenAI → rule → fallback
========================================================= */

export async function scorePost(
  title: string,
  body: string,
  apiKey?: string
): Promise<AIScoreResult> {

  console.log("\n==============================");
  console.log("🚀 AI MODERATION ENGINE STARTED");
  console.log("==============================");

  console.log("📝 TITLE PREVIEW:", title?.slice(0, 80));
  console.log("📄 BODY LENGTH:", body?.length || 0);

  const key = apiKey ?? "";
  console.log("🔑 OPENAI ENABLED:", !!key);

  /* =====================================================
     STEP 1: CONTENT CLASSIFICATION
     (Determines how rules should behave)
  ===================================================== */

  const contentType = classifyContent(title, body);

  console.log("\n🧠 STEP 1: CONTENT CLASSIFICATION");
  console.log("➡️ Detected Type:", contentType);

  /* =====================================================
     STEP 2: OPENAI ENGINE (PRIMARY DECISION LAYER)
  ===================================================== */

  if (key) {
    console.log("\n🤖 STEP 2: OPENAI ENGINE ACTIVATED");

    try {
      const ai = await runOpenAIScoring(title, body, key);

      console.log("📊 OpenAI Raw Result:", ai);

      if (ai?.score !== undefined) {
        let score = normalizeScore(ai.score);

        // apply safety floor
        score = applyContentSafetyFloor(score, contentType);

        const result: AIScoreResult = {
          score,
          confidence: normalizeConfidence(ai.confidence),
          status: normalizeStatus(ai.status, score),
          source: "openai" as const,
          reason: ai.reason ?? "OpenAI moderation completed.",
          flags: normalizeFlags(ai.flags),
        };

        console.log("✅ OPENAI FINAL DECISION:", result);
        return result;
      }

      console.warn("⚠️ OpenAI returned empty score");

    } catch (err) {
      console.error("❌ OPENAI ENGINE FAILED:", err);
    }
  }

  /* =====================================================
     STEP 3: RULE ENGINE (CONTEXT-AWARE FALLBACK LOGIC)
  ===================================================== */

  console.log("\n⚡ STEP 3: RULE ENGINE ACTIVE");

  try {
    const rule = ruleScore(title, body, contentType);

    console.log("📊 Rule Engine Raw Result:", rule);

    if (rule?.score !== undefined) {

      let score = normalizeScore(rule.score);

      // prevent extreme rule engine behavior
      score = clampRuleEngineScore(score);

      // apply content safety protection
      score = applyContentSafetyFloor(score, contentType);

      const result: AIScoreResult = {
        score,
        confidence: normalizeConfidence(rule.confidence ?? 0.7),
        status: normalizeStatus(undefined, score),
        source: "rule_engine" as const,
        reason: rule.reason ?? "Rule-based moderation completed.",
        flags: normalizeFlags(rule.flags),
      };

      console.log("✅ RULE ENGINE FINAL DECISION:", result);
      return result;
    }

  } catch (err) {
    console.error("❌ RULE ENGINE FAILED:", err);
  }

  /* =====================================================
     STEP 4: FALLBACK ENGINE (LAST RESORT SAFETY LAYER)
  ===================================================== */

  console.warn("\n🛟 STEP 4: FALLBACK ENGINE ACTIVATED");

  const fb = fallbackScore();

  let score = normalizeScore(fb.score);

  score = applyContentSafetyFloor(score, contentType);

  const fallbackResult: AIScoreResult = {
    score,
    confidence: normalizeConfidence(fb.confidence ?? 0.5),
    status: normalizeStatus("FAIR", score),
    source: "fallback" as const,
    reason: "Fallback moderation engine used.",
    flags: ["Fallback Engine"],
  };

  console.log("🛟 FALLBACK FINAL DECISION:", fallbackResult);

  console.log("\n🏁 AI MODERATION COMPLETE");
  console.log("==============================\n");

  return fallbackResult;
}

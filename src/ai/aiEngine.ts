import { runOpenAIScoring } from "./openai";
import { ruleScore } from "./ruleEngine";
import { fallbackScore } from "./fallback";
import { classifyContent } from "./contentClassifier";

import type {
  AIScoreResult,
  AIStatus,
} from "../types";

/* =========================================================
   NORMALIZERS
========================================================= */

function normalizeScore(v: any): number {
  const n = Number(v);
  if (isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

function normalizeConfidence(v: any): number {
  const n = Number(v ?? 0);
  if (n <= 1) return Math.round(n * 100);
  return Math.round(n);
}

function normalizeFlags(flags: any): string[] {
  if (!Array.isArray(flags)) return [];
  return flags.map(String);
}

function normalizeStatus(status: any, score: number): AIStatus {
  if (status === "GOOD" || status === "FAIR" || status === "BAD") {
    return status;
  }

  if (score >= 75) return "GOOD";
  if (score >= 45) return "FAIR";
  return "BAD";
}

/* =========================================================
   SAFETY CLAMP
========================================================= */

function clampRuleEngineScore(score: number): number {
  if (score < 10) return 10;
  if (score > 95) return 95;
  return score;
}

/* =========================================================
   🔥 LEVEL 2.5: GLOBAL SAFETY FLOOR (IMPORTANT FIX)
========================================================= */

function applyContentSafetyFloor(score: number, contentType: string) {
  if (contentType === "recipe") {
    return Math.max(score, 75);
  }

  if (contentType === "question") {
    return Math.max(score, 65);
  }

  return score;
}

/* =========================================================
   MAIN ENGINE
========================================================= */

export async function scorePost(
  title: string,
  body: string,
  apiKey?: string
): Promise<AIScoreResult> {

  console.log("🚀 AI ENGINE STARTED");

  const key = apiKey ?? "";
  console.log("🔑 OPENAI ENABLED:", !!key);

  /* =====================================================
     STEP 1: CONTENT CLASSIFICATION
  ===================================================== */

  const contentType = classifyContent(title, body);
  console.log("🧠 CONTENT TYPE:", contentType);

  /* =====================================================
     STEP 2: OPENAI ENGINE (PRIMARY)
  ===================================================== */

  if (key) {
    try {
      const ai = await runOpenAIScoring(title, body, key);

      if (ai?.score !== undefined) {
        let score = normalizeScore(ai.score);

        // 🔥 APPLY SAME SAFETY LAYER TO OPENAI TOO
        score = applyContentSafetyFloor(score, contentType);

        return {
          score,
          confidence: normalizeConfidence(ai.confidence),
          status: normalizeStatus(ai.status, score),
          source: "openai" as const,
          reason: ai.reason ?? "OpenAI moderation completed.",
          flags: normalizeFlags(ai.flags),
        };
      }

    } catch (err) {
      console.error("❌ OPENAI FAILED:", err);
    }
  }

  /* =====================================================
     STEP 3: RULE ENGINE (CONTEXT-AWARE)
  ===================================================== */

  console.log("⚡ USING RULE ENGINE");

  try {
    const rule = ruleScore(title, body, contentType);

    if (rule?.score !== undefined) {

      let score = normalizeScore(rule.score);

      // clamp rule engine extremes
      score = clampRuleEngineScore(score);

      // 🔥 APPLY GLOBAL SAFETY FLOOR
      score = applyContentSafetyFloor(score, contentType);

      return {
        score,
        confidence: normalizeConfidence(rule.confidence ?? 0.7),
        status: normalizeStatus(undefined, score),
        source: "rule_engine" as const,
        reason: rule.reason ?? "Rule-based moderation completed.",
        flags: normalizeFlags(rule.flags),
      };
    }

  } catch (err) {
    console.error("❌ RULE ENGINE FAILED:", err);
  }

  /* =====================================================
     STEP 4: FALLBACK ENGINE
  ===================================================== */

  console.warn("⚠️ USING FALLBACK ENGINE");

  const fb = fallbackScore();

  let score = normalizeScore(fb.score);

  score = applyContentSafetyFloor(score, contentType);

  return {
    score,
    confidence: normalizeConfidence(fb.confidence ?? 0.5),
    status: normalizeStatus("FAIR", score),
    source: "fallback" as const,
    reason: "Fallback moderation engine used.",
    flags: ["Fallback Engine"],
  };
}

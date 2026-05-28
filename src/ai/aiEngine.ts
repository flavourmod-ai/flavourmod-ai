import { runOpenAIScoring } from "./openai";
import { ruleScore } from "./ruleEngine";
import { fallbackScore } from "./fallback";
import { classifyContent } from "./contentClassifier";

import type { AIScoreResult, AIStatus } from "../types";

/* =========================
   NORMALIZERS
========================= */

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
  return Array.isArray(flags) ? flags.map(String) : [];
}

function normalizeStatus(status: any, score: number): AIStatus {
  if (status === "GOOD" || status === "FAIR" || status === "BAD") return status;
  if (score >= 75) return "GOOD";
  if (score >= 45) return "FAIR";
  return "BAD";
}

/* =========================
   SAFETY LAYERS
========================= */

function clampRuleEngineScore(score: number) {
  return Math.max(10, Math.min(95, score));
}

function applyContentSafetyFloor(score: number, type: string) {
  if (type === "recipe") return Math.max(score, 75);
  if (type === "question") return Math.max(score, 65);
  return score;
}

/* =========================
   MAIN ENGINE
========================= */

export async function scorePost(
  title: string,
  body: string,
  apiKey?: string
): Promise<AIScoreResult> {

  const contentType = classifyContent(title, body);
  const key = apiKey ?? ""
  /* =========================
     OPENAI LAYER
  ========================= */

  if (key) {
    try {
      const ai = await runOpenAIScoring(title, body, key);

      if (ai?.score !== undefined) {
        let score = applyContentSafetyFloor(
          normalizeScore(ai.score),
          contentType
        );

        return {
          score,
          confidence: normalizeConfidence(ai.confidence),
          status: normalizeStatus(ai.status, score),
          source: "openai",
          reason: ai.reason ?? "OpenAI completed.",
          flags: normalizeFlags(ai.flags),
        };
      }
    } catch (e) {
      console.error("OpenAI failed:", e);
    }
  }

  /* =========================
     RULE ENGINE
  ========================= */

  try {
    const rule = ruleScore(title, body, contentType);

    let score = applyContentSafetyFloor(
      clampRuleEngineScore(normalizeScore(rule.score)),
      contentType
    );

    return {
      score,
      confidence: normalizeConfidence(rule.confidence ?? 0.7),
      status: normalizeStatus(undefined, score),
      source: "rule_engine",
      reason: rule.reason ?? "Rule engine used.",
      flags: normalizeFlags(rule.flags),
    };
  } catch (e) {
    console.error("Rule engine failed:", e);
  }

  /* =========================
     FALLBACK
  ========================= */

  const fb = fallbackScore();

  const score = applyContentSafetyFloor(
    normalizeScore(fb.score),
    contentType
  );

  return {
    score,
    confidence: normalizeConfidence(fb.confidence ?? 0.5),
    status: "FAIR",
    source: "fallback",
    reason: "Fallback engine used.",
    flags: ["fallback"],
  };
}

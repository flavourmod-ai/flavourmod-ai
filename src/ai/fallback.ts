/* =========================================================
   AI FALLBACK ENGINE
   Used when OpenAI fails, times out, or returns invalid data
========================================================= */

import type { AIScoreResult } from "../types/index";

/* =========================================================
   MAIN FALLBACK FUNCTION
========================================================= */

export function fallbackScore(
  reason: string = "unknown_error",
  partial?: {
    title?: string;
    body?: string;
  }
): AIScoreResult {
  console.log("⚠️ AI FALLBACK TRIGGERED:", reason);

  return {
    score: estimateBasicScore(partial?.title, partial?.body),
    confidence: 0.25,
    status: "ERROR",

    // ✅ REQUIRED FIELDS FIXED
    source: "fallback",
    reason: `Fallback triggered: ${reason}`,
    flags: ["fallback", reason],

    issues: [`fallback_triggered: ${reason}`],

    suggestions: [
      "AI service unavailable or invalid response",
      "manual review recommended",
    ],

    category: {
      ingredients: 50,
      steps: 50,
      clarity: 50,
      completeness: 50,
    },
  };
}

/* =========================================================
   SIMPLE HEURISTIC SCORER
========================================================= */

function estimateBasicScore(title?: string, body?: string): number {
  let score = 50;

  const text = `${title ?? ""} ${body ?? ""}`.toLowerCase();

  if (text.includes("http://") || text.includes("https://")) score -= 10;
  if (text.split(" ").length < 5) score -= 10;

  if (text.includes("how to")) score += 5;
  if (text.includes("recipe")) score += 5;

  return Math.max(0, Math.min(100, score));
}

/* =========================================================
   STRICT FAILURE VERSION
========================================================= */

export function hardFallback(reason: string): AIScoreResult {
  console.log("🛑 HARD FALLBACK:", reason);

  return {
    score: 50,
    confidence: 0.1,
    status: "ERROR",

    // ✅ REQUIRED FIELDS FIXED
    source: "fallback",
    reason: `Hard fallback: ${reason}`,
    flags: ["hard_fallback", reason],

    issues: [`hard_fallback: ${reason}`],

    suggestions: ["system degraded - manual review required"],

    category: {
      ingredients: 50,
      steps: 50,
      clarity: 50,
      completeness: 50,
    },
  };
}
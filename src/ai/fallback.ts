import type { AIScoreResult } from "../types/index";

/* =========================================================
   SCORE NORMALIZER
========================================================= */

function clampScore(n: number): number {
  if (isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

/* =========================================================
   CONFIDENCE NORMALIZER (IMPORTANT FIX)
========================================================= */

function normalizeConfidence(): number {
  // fallback should NEVER pretend high confidence
  return 35;
}

/* =========================================================
   MAIN FALLBACK ENGINE
========================================================= */

export function fallbackScore(
  reason: string = "unknown_error",
  partial?: {
    title?: string;
    body?: string;
  }
): AIScoreResult {
  console.log("⚠️ AI FALLBACK TRIGGERED:", reason);

  const score = estimateBasicScore(partial?.title, partial?.body);

  return {
    score: clampScore(score),

    // FIXED: stable confidence scale
    confidence: normalizeConfidence(),

    // FIXED: avoid breaking decision engine
    status: score >= 60 ? "FAIR" : "BAD",

    source: "fallback",

    reason: `Fallback triggered: ${reason}`,

    flags: ["fallback", reason],

    issues: [`fallback_triggered: ${reason}`],

    suggestions: [
      "AI service unavailable or invalid response",
      "manual review recommended",
    ],

    category: {
      ingredients: 40,
      steps: 40,
      clarity: 50,
      completeness: 45,
    },
  };
}

/* =========================================================
   HEURISTIC SCORER (IMPROVED)
========================================================= */

function estimateBasicScore(title?: string, body?: string): number {
  let score = 50;

  const text = `${title ?? ""} ${body ?? ""}`.toLowerCase();

  if (!text.trim()) return 20; // empty content safety

  if (text.includes("http://") || text.includes("https://")) {
    score -= 10;
  }

  if (text.split(" ").length < 5) {
    score -= 15;
  }

  if (text.includes("how to")) score += 10;
  if (text.includes("recipe")) score += 10;
  if (text.includes("step")) score += 5;

  return Math.max(0, Math.min(100, score));
}

/* =========================================================
   HARD FALLBACK (FAILSAFE MODE)
========================================================= */

export function hardFallback(reason: string): AIScoreResult {
  console.log("🛑 HARD FALLBACK:", reason);

  return {
    score: 50,
    confidence: 20,
    status: "BAD",

    source: "fallback",

    reason: `Hard fallback: ${reason}`,

    flags: ["hard_fallback", reason],

    issues: [`hard_fallback: ${reason}`],

    suggestions: ["system degraded - manual review required"],

    category: {
      ingredients: 40,
      steps: 40,
      clarity: 40,
      completeness: 40,
    },
  };
}

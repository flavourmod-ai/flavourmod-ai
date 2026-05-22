/* =========================================================
   AI DECISION ENGINE (RULE LAYER)
   Converts AI score → moderation action
========================================================= */

import type { AIScoreResult } from "../types/index";

/* =========================================================
   CORE THRESHOLDS (TUNEABLE)
========================================================= */

const THRESHOLDS = {
  ALLOW: 75,
  REVIEW: 45,
};

/* =========================================================
   MAIN DECISION FUNCTION
========================================================= */

export function decide(score: number): "ALLOW" | "REVIEW" | "REMOVE" {
  if (score >= THRESHOLDS.ALLOW) return "ALLOW";
  if (score >= THRESHOLDS.REVIEW) return "REVIEW";
  return "REMOVE";
}

/* =========================================================
   ENHANCED DECISION WRAPPER
   (Adds explainability layer for dashboard)
========================================================= */

export function enhanceDecision(
  ai: AIScoreResult
): AIScoreResult & {
  decision: "ALLOW" | "REVIEW" | "REMOVE";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
} {
  const score = ai?.score ?? 50;

  const decision = decide(score);

  const riskLevel =
    score >= 75 ? "LOW" :
    score >= 45 ? "MEDIUM" :
    "HIGH";

  return {
    ...ai,
    decision,
    riskLevel,
  };
}

/* =========================================================
   OPTIONAL: EXPLANATION TAGS (FOR UI / DASHBOARD)
========================================================= */

export function generateReasonTags(ai: AIScoreResult): string[] {
  const tags: string[] = [];

  if (ai.score < 45) tags.push("High moderation risk");
  if (ai.confidence < 0.5) tags.push("Low confidence prediction");

  const cat =
    typeof ai.category === "object" &&
    ai.category !== null &&
    !Array.isArray(ai.category)
      ? ai.category
      : null;

  if (cat) {
    if (cat.ingredients < 40) tags.push("Weak content structure");
    if (cat.clarity < 40) tags.push("Unclear content");
  }

  if ((ai.issues ?? []).length > 0) {
  tags.push("AI detected issues");
}

  return tags;
}
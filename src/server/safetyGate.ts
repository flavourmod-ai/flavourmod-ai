/* =========================================================
   TYPES
========================================================= */

import type {
  AIScoreResult,
  AIDecision,
  EnhancedAIScoreResult,
} from "../types";

/* =========================================================
   THRESHOLDS (TUNEABLE)
========================================================= */

const THRESHOLDS = {
  ALLOW: 75,
  REVIEW: 45,
};

/* =========================================================
   CORE DECISION FUNCTION
========================================================= */

export function decide(score: number): AIDecision {
  if (score >= THRESHOLDS.ALLOW) return "ALLOW";
  if (score >= THRESHOLDS.REVIEW) return "REVIEW";
  return "REMOVE";
}

/* =========================================================
   RISK LEVEL MAPPING
========================================================= */

export function getRiskLevel(
  score: number
): "LOW" | "MEDIUM" | "HIGH" {
  if (score >= 75) return "LOW";
  if (score >= 45) return "MEDIUM";
  return "HIGH";
}

/* =========================================================
   MAIN ENHANCEMENT PIPELINE
========================================================= */

export function enhanceDecision(
  ai: AIScoreResult
): EnhancedAIScoreResult {
  const score = Number(ai?.score ?? 50);

  const decision = decide(score);
  const riskLevel = getRiskLevel(score);

  return {
    ...ai,
    decision,
    riskLevel,
  };
}

/* =========================================================
   REASON TAG GENERATOR (FOR DASHBOARD UI)
========================================================= */

export function generateReasonTags(ai: AIScoreResult): string[] {
  const tags: string[] = [];

  if (ai.score < 45) {
    tags.push("High moderation risk");
  }

  if (ai.confidence < 0.5) {
    tags.push("Low confidence prediction");
  }

  const cat = ai.category;

  if (cat) {
    if (cat.ingredients < 40) {
      tags.push("Weak content structure");
    }

    if (cat.clarity < 40) {
      tags.push("Unclear content");
    }
  }

  if (ai.issues && ai.issues.length > 0) {
    tags.push("AI detected issues");
  }

  return tags;
}
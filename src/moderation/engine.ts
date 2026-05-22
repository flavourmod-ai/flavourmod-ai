export type ModerationDecision = "APPROVE" | "REVIEW" | "REMOVE";

export interface AIResult {
  score?: number;
  confidence?: number;
}

export interface ModerationJob {
  postId?: string;
  title?: string;
  body?: string;
}

export interface ModerationOutput {
  score: number;
  confidence: number;
  decision: ModerationDecision;
  reason: string;
}

/* =========================
   SAFE NUMBER NORMALIZER
========================= */

function toNumber(value: any, fallback: number): number {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

/* =========================
   MODERATION ENGINE
========================= */

export function moderationEngine(
  aiResult: AIResult,
  job: ModerationJob
): ModerationOutput {

  const score = toNumber(aiResult?.score, 50);
  const confidence = toNumber(aiResult?.confidence, 50);

  /* =========================
     APPROVE RULE
  ========================= */

  if (score >= 80 && confidence >= 75) {
    return {
      score,
      confidence,
      decision: "APPROVE",
      reason: "High quality content",
    };
  }

  /* =========================
     REVIEW RULE
  ========================= */

  if (score >= 45 || confidence < 65) {
    return {
      score,
      confidence,
      decision: "REVIEW",
      reason: "Needs moderator review",
    };
  }

  /* =========================
     REMOVE RULE
  ========================= */

  return {
    score,
    confidence,
    decision: "REMOVE",
    reason: "Low quality or spam",
  };
}
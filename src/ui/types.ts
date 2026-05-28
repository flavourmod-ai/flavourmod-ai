/* =========================================================
   AI STATUS
========================================================= */

export type AIScoreStatus = "GOOD" | "FAIR" | "BAD" | "ERROR";

/* =========================================================
   MODERATION DECISION
========================================================= */

export type ModerationDecision = "APPROVE" | "REVIEW" | "REMOVE";

/* =========================================================
   CONTENT CATEGORY (SAFE OPTIONAL STRUCTURE)
   → prevents runtime crashes in fallback/rule engines
========================================================= */

export type AICategory = {
  ingredients?: number;
  steps?: number;
  clarity?: number;
  completeness?: number;
};

/* =========================================================
   CORE AI SCORE RESULT (FIXED + COMPLETE)
========================================================= */

export type AIScoreResult = {
  score: number;
  confidence: number;

  status: AIScoreStatus;

  /**
   * FIXED: must match engine sources
   */
  source: "openai" | "rule_engine" | "fallback";

  reason?: string;

  flags: string[];

  issues?: string[];
  suggestions?: string[];

  category?: AICategory;
};

/* =========================================================
   FINAL ENHANCED RESULT (USED BY WORKER / UI)
========================================================= */

export type EnhancedAIScoreResult = AIScoreResult & {
  decision: ModerationDecision;

  riskLevel: "LOW" | "MEDIUM" | "HIGH";

  status: "REVIEW_QUEUE" | "MODERATED" | "DONE" | "FAILED";
};

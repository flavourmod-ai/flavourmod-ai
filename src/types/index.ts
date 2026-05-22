/* =========================================================
   AI STATUS
========================================================= */

export type AIStatus = "GOOD" | "FAIR" | "BAD" | "ERROR";

/* =========================================================
   RAW MODEL DECISION
========================================================= */

export type AIDecisionRaw = "ALLOW" | "REVIEW" | "REMOVE";

/* =========================================================
   FINAL SYSTEM DECISION
========================================================= */

export type AIDecision = "APPROVE" | "REVIEW" | "REMOVE";

/* =========================================================
   CORE CATEGORY MODEL (FIXED SHAPE)
========================================================= */

export type AICategory = {
  ingredients: number;
  clarity: number;
  structure?: number;
  steps?: number;
  completeness?: number;
};

/* =========================================================
   RAW SCORE RESULT
========================================================= */

export type AIScoreResult = {
  score: number;
  confidence: number;
  status: AIStatus;
  source: "openai" | "rule_engine" | "fallback";
  reason: string;
  flags: string[];

  issues?: string[];
  suggestions?: string[]; // ✅ ADD THIS

  category?: AICategory;
};

/* =========================================================
   FINAL ENHANCED RESULT
========================================================= */

export type EnhancedAIScoreResult = AIScoreResult & {
  decision: AIDecision;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";

  status:
    | "REVIEW_QUEUE"
    | "MODERATED"
    | "DONE"
    | "FAILED";
};

/* =========================================================
   UI TAGS
========================================================= */

export type AIReasonTag =
  | "High moderation risk"
  | "Low confidence prediction"
  | "Weak content structure"
  | "Unclear content"
  | "AI detected issues";
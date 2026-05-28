/* =========================================================
   AI STATUS (MODEL OUTPUT LEVEL)
========================================================= */

export type AIStatus = "GOOD" | "FAIR" | "BAD" | "ERROR";

/* =========================================================
   RAW MODEL DECISION (LLM / RULE OUTPUT)
========================================================= */

export type AIDecisionRaw = "ALLOW" | "REVIEW" | "REMOVE";

/* =========================================================
   FINAL SYSTEM DECISION (WORKER LEVEL ONLY)
========================================================= */

export type AIDecision = "APPROVE" | "REVIEW" | "REMOVE";

/* =========================================================
   SOURCE OF TRUTH (CRITICAL FIX)
========================================================= */

export type AISource = "openai" | "rule_engine" | "fallback";

/* =========================================================
   CONTENT STRUCTURE SCORING
========================================================= */

export type AICategory = {
  ingredients: number;
  clarity: number;
  structure?: number;
  steps?: number;
  completeness?: number;
};

/* =========================================================
   BASE AI RESULT (FROM ENGINE ONLY)
========================================================= */

export type AIScoreResult = {
  score: number;
  confidence: number;
  status: AIStatus;
  source: AISource; // ✅ FIXED: centralized type
  reason: string;
  flags: string[];

  issues?: string[];
  suggestions?: string[];

  category?: AICategory;
};

/* =========================================================
   FINAL PIPELINE RESULT (WORKER OUTPUT)
========================================================= */

export type EnhancedAIScoreResult = {
  score: number;
  confidence: number;
  status: "REVIEW_QUEUE" | "MODERATED" | "DONE" | "FAILED";
  decision: AIDecision;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  source: AISource;
  reason: string;
  flags: string[];
};

/* =========================================================
   UI TAGS (SAFE FOR DASHBOARD ONLY)
========================================================= */

export type AIReasonTag =
  | "High moderation risk"
  | "Low confidence prediction"
  | "Weak content structure"
  | "Unclear content"
  | "AI detected issues";

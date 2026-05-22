import { runOpenAIScoring } from "./openai";
import { ruleScore } from "./ruleEngine";
import { fallbackScore } from "./fallback";

import type {
  AIScoreResult,
  AIStatus,
} from "../types";

/* =========================================================
   FLAVOURMOD AI ENGINE
   ---------------------------------------------------------
   Multi-layer moderation system:
   1. OpenAI Moderation
   2. Rule Engine
   3. Fallback Engine

   Goal:
   - Stable moderation pipeline
   - Safe failover system
   - Consistent AI scoring
========================================================= */

/* =========================================================
   SCORE NORMALIZER
   ---------------------------------------------------------
   Ensures score is always:
   0 → 100
========================================================= */

function normalizeScore(v: any): number {

  const n =
    Number(v);

  if (isNaN(n)) {

    console.warn(
      "⚠️ INVALID SCORE DETECTED"
    );

    return 50;
  }

  return Math.max(
    0,
    Math.min(100, n)
  );
}

/* =========================================================
   CONFIDENCE NORMALIZER
   ---------------------------------------------------------
   Converts:
   0.85 → 85
========================================================= */

function normalizeConfidence(
  v: any
): number {

  const n =
    Number(v ?? 0);

  if (n <= 1) {
    return Math.round(n * 100);
  }

  return Math.round(n);
}

/* =========================================================
   FLAGS NORMALIZER
========================================================= */

function normalizeFlags(
  flags: any
): string[] {

  if (
    !Array.isArray(flags)
  ) {
    return [];
  }

  return flags.map(String);
}

/* =========================================================
   REASON NORMALIZER
========================================================= */

function normalizeReason(
  reason: any
): string {

  return typeof reason ===
    "string"
    ? reason
    : "AI moderation completed.";
}

/* =========================================================
   STATUS NORMALIZER
   ---------------------------------------------------------
   Converts scores into:
   GOOD / FAIR / BAD
========================================================= */

function normalizeStatus(
  status: any,
  score: number
): AIStatus {

  if (
    status === "GOOD" ||
    status === "FAIR" ||
    status === "BAD"
  ) {
    return status;
  }

  if (score >= 75) {
    return "GOOD";
  }

  if (score >= 45) {
    return "FAIR";
  }

  return "BAD";
}

/* =========================================================
   MAIN AI SCORING ENGINE
========================================================= */

export async function scorePost(
  title: string,
  body: string,
  apiKey?: string
): Promise<AIScoreResult> {

  console.log(
    "🚀 AI ENGINE STARTED"
  );

  /* =====================================================
     INPUT PREVIEW
  ===================================================== */

  console.log(
    "📝 TITLE:",
    title?.slice(0, 80)
  );

  console.log(
    "📄 BODY LENGTH:",
    body?.length || 0
  );

  /* =====================================================
     API KEY CHECK
  ===================================================== */

  const key =
    apiKey ?? "";

  console.log(
    "🔑 OPENAI ENABLED:",
    !!key
  );

  /* =====================================================
     OPENAI ENGINE
     -----------------------------------------------------
     Highest quality moderation layer
  ===================================================== */

  if (key) {

    console.log(
      "🧠 USING OPENAI ENGINE"
    );

    try {

      const ai =
        await runOpenAIScoring(
          title,
          body,
          key
        );

      console.log(
        "📊 RAW OPENAI RESULT:",
        ai
      );

      if (
        ai?.score !== undefined
      ) {

        const score =
          normalizeScore(
            ai.score
          );

        const result = {
          score,

          confidence:
            normalizeConfidence(
              ai.confidence
            ),

          status:
            normalizeStatus(
              ai.status,
              score
            ),

          source: "openai",

          reason:
            normalizeReason(
              ai.reason
            ),

          flags:
            normalizeFlags(
              ai.flags
            ),
        };

        console.log(
          "✅ OPENAI SUCCESS:",
          result
        );

        return result;
      }

      console.warn(
        "⚠️ OPENAI RETURNED EMPTY SCORE"
      );

    } catch (err) {

      console.error(
        "❌ OPENAI ENGINE FAILED:",
        err
      );
    }
  }

  /* =====================================================
     RULE ENGINE
     -----------------------------------------------------
     Fast deterministic moderation layer
  ===================================================== */

  console.log(
    "⚡ USING RULE ENGINE"
  );

  try {

    const rule =
      ruleScore(
        title,
        body
      );

    console.log(
      "📊 RULE ENGINE RESULT:",
      rule
    );

    if (
      rule?.score !== undefined
    ) {

      const score =
        normalizeScore(
          rule.score
        );

      const result = {
        score,

        confidence:
          normalizeConfidence(
            rule.confidence ?? 0.7
          ),

        status:
          normalizeStatus(
            undefined,
            score
          ),

        source: "rule_engine",

        reason:
          "Rule-based moderation completed.",

        flags: [],
      };

      console.log(
        "✅ RULE ENGINE SUCCESS:",
        result
      );

      return result;
    }

  } catch (err) {

    console.error(
      "❌ RULE ENGINE FAILED:",
      err
    );
  }

  /* =====================================================
     FALLBACK ENGINE
     -----------------------------------------------------
     Final safety layer
  ===================================================== */

  console.warn(
    "⚠️ USING FALLBACK ENGINE"
  );

  const fb =
    fallbackScore();

  const score =
    normalizeScore(
      fb.score
    );

  const fallbackResult = {
    score,

    confidence:
      normalizeConfidence(
        fb.confidence ?? 0.5
      ),

    status:
      normalizeStatus(
        "FAIR",
        score
      ),

    source: "fallback",

    reason:
      "Fallback moderation engine used.",

    flags: [
      "Fallback Engine",
    ],
  };

  console.log(
    "🛟 FALLBACK RESULT:",
    fallbackResult
  );

  /* =====================================================
     FINAL RESULT
  ===================================================== */

  console.log(
    "🏁 AI ENGINE COMPLETED"
  );

  return fallbackResult;
}
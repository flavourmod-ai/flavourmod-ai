import { scorePost } from "../ai/aiEngine";

/* =========================
   MODERATION DECISION TYPES
========================= */

type ModDecision =
  | "APPROVE"
  | "REVIEW"
  | "REMOVE";

/* =========================
   SMART DECISION ENGINE
   -------------------------------------------------
   Final moderation decision layer

   APPROVE:
   - High score
   - High confidence

   REVIEW:
   - Medium score
   - OR low AI confidence

   REMOVE:
   - Very low score
   - High confidence bad content
========================= */

function getDecision(
  score: number,
  confidence: number
): ModDecision {

  /* =========================
     HIGH QUALITY POSTS
  ========================= */

  if (
    score >= 75 &&
    confidence >= 70
  ) {

    console.log(
      "🟢 AUTO APPROVE TRIGGERED"
    );

    return "APPROVE";
  }

  /* =========================
     LOW AI CONFIDENCE
     → HUMAN REVIEW
  ========================= */

  if (confidence < 60) {

    console.log(
      "🟡 LOW CONFIDENCE REVIEW"
    );

    return "REVIEW";
  }

  /* =========================
     MEDIUM QUALITY POSTS
  ========================= */

  if (score >= 45) {

    console.log(
      "🟡 MEDIUM SCORE REVIEW"
    );

    return "REVIEW";
  }

  /* =========================
     LOW QUALITY / SPAM
  ========================= */

  console.log(
    "🔴 AUTO REMOVE TRIGGERED"
  );

  return "REMOVE";
}

/* =========================
   MAIN JOB PROCESSOR
========================= */

export async function processJob(
  context: any,
  job: any
) {

  console.log(
    "\n=============================="
  );

  console.log(
    "🚀 PROCESS JOB STARTED"
  );

  console.log(
    "=============================="
  );

  const { apiKey } = context;

  /* =========================
     JOB VALIDATION
  ========================= */

  if (!job?.postId) {

    console.error(
      "❌ MISSING POST ID"
    );

    throw new Error(
      "Missing postId"
    );
  }

  console.log(
    "📦 PROCESSING JOB:",
    job.postId
  );

  console.log(
    "📝 TITLE:",
    job.title?.slice(0, 80)
  );

  console.log(
    "📄 BODY LENGTH:",
    job.body?.length || 0
  );

  /* =========================
     AI SCORE ENGINE
  ========================= */

  console.log(
    "\n🧠 RUNNING AI SCORING"
  );

  const result =
    await scorePost(
      job.title,
      job.body,
      apiKey
    );

  console.log(
    "📊 RAW AI RESULT:",
    result
  );

  /* =========================
     SAFE SCORE NORMALIZATION
  ========================= */

  let score =
    Number(result?.score ?? 50);

  if (isNaN(score)) {

    console.warn(
      "⚠️ INVALID SCORE DETECTED"
    );

    score = 50;
  }

  score = Math.max(
    0,
    Math.min(100, score)
  );

  /* =========================
     SAFE CONFIDENCE NORMALIZATION
  ========================= */

  let confidence =
    result?.confidence <= 1
      ? result.confidence * 100
      : Number(
          result?.confidence ?? 0
        );

  if (isNaN(confidence)) {

    console.warn(
      "⚠️ INVALID CONFIDENCE DETECTED"
    );

    confidence = 50;
  }

  confidence = Math.max(
    0,
    Math.min(100, confidence)
  );

  /* =========================
     DEBUG NORMALIZED VALUES
  ========================= */

  console.log(
    "🧮 NORMALIZED VALUES:",
    {
      score,
      confidence,
    }
  );

  /* =========================
     SMART DECISION ENGINE
  ========================= */

  console.log(
    "\n⚖️ RUNNING DECISION ENGINE"
  );

  const decision =
    getDecision(
      score,
      confidence
    );

  console.log(
    "⚖️ FINAL DECISION:",
    decision
  );

  /* =========================
     STATUS LABEL
  ========================= */

  const status =
    decision === "APPROVE"
      ? "APPROVED"
      : decision === "REVIEW"
      ? "REVIEW_QUEUE"
      : "REMOVED";

  console.log(
    "📌 STATUS:",
    status
  );

  /* =========================
     SAFE FLAGS
  ========================= */

  const flags =
    Array.isArray(result?.flags)
      ? result.flags
      : [];

  console.log(
    "🚩 FLAGS:",
    flags
  );

  /* =========================
     SAFE REASON
  ========================= */

  const reason =
    typeof result?.reason ===
    "string"
      ? result.reason
      : "AI moderation completed.";

  console.log(
    "📝 REASON:",
    reason
  );

  /* =========================
     FINAL NORMALIZED RESULT
  ========================= */

  const finalResult = {
    score,
    confidence,
    decision,
    status,
    flags,
    reason,
  };

  console.log(
    "\n✅ FINAL PROCESS RESULT:",
    finalResult
  );

  console.log(
    "🏁 PROCESS JOB COMPLETED"
  );

  console.log(
    "==============================\n"
  );

  return finalResult;
}

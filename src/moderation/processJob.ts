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
========================= */

function getDecision(
  score: number,
  confidence: number
): ModDecision {

  /* =========================
     HIGH QUALITY POSTS
  ========================= */

  if (
    score >= 80 &&
    confidence >= 75
  ) {

    console.log(
      "🟢 AUTO APPROVE TRIGGERED"
    );

    return "APPROVE";
  }

  /* =========================
     HUMAN REVIEW ZONE
  ========================= */

  // Medium-quality content
  // OR low AI confidence
  // goes to manual moderator review

  if (
    score >= 45 ||
    confidence < 65
  ) {

    console.log(
      "🟡 REVIEW QUEUE TRIGGERED"
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
    "🚀 PROCESS JOB STARTED"
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

  /* =========================
     AI SCORE ENGINE
  ========================= */

  console.log(
    "🧠 RUNNING AI SCORING"
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
    confidence = 50;
  }

  confidence = Math.max(
    0,
    Math.min(100, confidence)
  );

  /* =========================
     SMART DECISION ENGINE
  ========================= */

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

  /* =========================
     SAFE FLAGS
  ========================= */

  const flags =
    Array.isArray(result?.flags)
      ? result.flags
      : [];

  /* =========================
     SAFE REASON
  ========================= */

  const reason =
    typeof result?.reason ===
    "string"
      ? result.reason
      : "AI moderation completed.";

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
    "✅ FINAL PROCESS RESULT:",
    finalResult
  );

  return finalResult;
}
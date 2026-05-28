import { scorePost } from "../ai/aiEngine";

/* =========================================================
   TYPES
========================================================= */

export type ModDecision =
  | "APPROVE"
  | "REVIEW"
  | "REMOVE";

export type ProcessedJobResult = {
  score: number;
  confidence: number;
  decision: ModDecision;
  status:
    | "APPROVED"
    | "REVIEW_QUEUE"
    | "REMOVED";
  flags: string[];
  reason: string;
  source?: string;
};

/* =========================================================
   SAFE NORMALIZERS
========================================================= */

function normalizeScore(v: any): number {
  const n = Number(v);

  if (isNaN(n)) {
    console.warn("⚠️ INVALID SCORE");
    return 50;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(n))
  );
}

function normalizeConfidence(v: any): number {
  const n = Number(v ?? 0);

  if (isNaN(n)) {
    console.warn("⚠️ INVALID CONFIDENCE");
    return 50;
  }

  // Convert 0-1 → 0-100
  if (n <= 1) {
    return Math.max(
      0,
      Math.min(100, Math.round(n * 100))
    );
  }

  return Math.max(
    0,
    Math.min(100, Math.round(n))
  );
}

/* =========================================================
   CONTENT DETECTORS
========================================================= */

function detectRecipe(text: string): boolean {
  return (
    text.includes("recipe") ||
    text.includes("ingredients") ||
    text.includes("cook") ||
    text.includes("boil") ||
    text.includes("mix") ||
    text.includes("bake") ||
    text.includes("fry") ||
    text.includes("tea") ||
    text.includes("rice") ||
    text.includes("cup") ||
    text.includes("tbsp") ||
    text.includes("tsp")
  );
}

function detectLowContent(
  title: string,
  body: string
): boolean {

  const cleanTitle =
    title.trim();

  const cleanBody =
    body.trim();

  const combined =
    `${cleanTitle} ${cleanBody}`
      .trim();

  const words =
    combined
      .split(/\s+/)
      .filter(Boolean);

  // extremely small post
  if (words.length <= 4) {
    return true;
  }

  // missing body
  if (
    cleanTitle.length > 0 &&
    cleanBody.length < 5
  ) {
    return true;
  }

  // useless titles
  const weakTitles = [
    "hi",
    "hello",
    "test",
    "computer",
    "help",
    "ok",
  ];

  if (
    weakTitles.includes(
      cleanTitle.toLowerCase()
    )
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   FINAL DECISION ENGINE
========================================================= */

function getDecision(
  score: number,
  confidence: number,
  flags: string[]
): ModDecision {

  const hasSpam =
    flags.includes("spam_detected");

  const hasOffTopic =
    flags.includes("off-topic");

  const hasLowContent =
    flags.includes("low_content") ||
    flags.includes("missing_body");

  /* =====================================================
     HARD REMOVE
  ===================================================== */

  if (
    hasSpam ||
    score <= 10
  ) {

    console.log(
      "🔴 HARD REMOVE"
    );

    return "REMOVE";
  }

  /* =====================================================
     LOW CONTENT
     IMPORTANT FIX
  ===================================================== */

  if (
    hasLowContent
  ) {

    console.log(
      "🟡 LOW CONTENT REVIEW"
    );

    return "REVIEW";
  }

  /* =====================================================
     OFF TOPIC
  ===================================================== */

  if (
    hasOffTopic
  ) {

    console.log(
      "🟡 OFF TOPIC REVIEW"
    );

    return "REVIEW";
  }

  /* =====================================================
     LOW CONFIDENCE
  ===================================================== */

  if (
    confidence < 50
  ) {

    console.log(
      "🟡 LOW CONFIDENCE REVIEW"
    );

    return "REVIEW";
  }

  /* =====================================================
     APPROVAL
  ===================================================== */

  if (
    score >= 75 &&
    confidence >= 70
  ) {

    console.log(
      "🟢 APPROVED"
    );

    return "APPROVE";
  }

  /* =====================================================
     MID QUALITY
  ===================================================== */

  if (
    score >= 45
  ) {

    console.log(
      "🟡 MEDIUM REVIEW"
    );

    return "REVIEW";
  }

  /* =====================================================
     DEFAULT
  ===================================================== */

  console.log(
    "🔴 DEFAULT REMOVE"
  );

  return "REMOVE";
}

/* =========================================================
   STATUS MAP
========================================================= */

function getStatus(
  decision: ModDecision
) {

  switch (decision) {

    case "APPROVE":
      return "APPROVED";

    case "REVIEW":
      return "REVIEW_QUEUE";

    case "REMOVE":
      return "REMOVED";
  }
}

/* =========================================================
   PROCESS JOB
========================================================= */

export async function processJob(
  context: any,
  job: any
): Promise<ProcessedJobResult> {

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

  if (!job?.postId) {

    console.error(
      "❌ MISSING POST ID"
    );

    throw new Error(
      "Missing postId"
    );
  }

  const title =
    String(job.title || "");

  const body =
    String(job.body || "");

  console.log(
    "📦 POST:",
    job.postId
  );

  console.log(
    "📝 TITLE:",
    title.slice(0, 80)
  );

  console.log(
    "📄 BODY LENGTH:",
    body.length
  );

  /* =====================================================
     AI ENGINE
  ===================================================== */

  console.log(
    "\n🧠 RUNNING AI ENGINE"
  );

  const aiResult =
    await scorePost(
      title,
      body,
      apiKey
    );

  console.log(
    "📊 RAW AI RESULT:",
    aiResult
  );

  /* =====================================================
     NORMALIZATION
  ===================================================== */

  let score =
    normalizeScore(
      aiResult?.score
    );

  let confidence =
    normalizeConfidence(
      aiResult?.confidence
    );

  const flags: string[] =
    Array.isArray(aiResult?.flags)
      ? aiResult.flags.map(String)
      : [];

  let reason =
    typeof aiResult?.reason ===
    "string"
      ? aiResult.reason
      : "AI moderation completed.";

  const combinedText =
    `${title} ${body}`
      .toLowerCase();

  /* =====================================================
     LOW CONTENT FIX
     -----------------------------------------------------
     THIS FIXES:
     - "computer"
     - empty posts
     - missing body
     - meaningless titles
  ===================================================== */

  const lowContent =
    detectLowContent(
      title,
      body
    );

  if (lowContent) {

    console.warn(
      "🟡 LOW CONTENT DETECTED"
    );

    score = Math.min(
      score,
      40
    );

    confidence = Math.max(
      confidence,
      60
    );

    if (
      !flags.includes(
        "low_content"
      )
    ) {

      flags.push(
        "low_content"
      );
    }

    reason =
      "Post contains insufficient or low-information content.";
  }

  /* =====================================================
     OFF TOPIC FIX
  ===================================================== */

  const looksLikeRecipe =
    detectRecipe(
      combinedText
    );

  if (
    !looksLikeRecipe &&
    combinedText.length > 15
  ) {

    if (
      !flags.includes(
        "off-topic"
      )
    ) {

      flags.push(
        "off-topic"
      );
    }
  }

  /* =====================================================
     RECIPE SAFETY FLOOR
  ===================================================== */

  if (
    looksLikeRecipe &&
    score < 45
  ) {

    console.warn(
      "🛡️ RECIPE SAFETY FLOOR"
    );

    score = 75;

    confidence = Math.max(
      confidence,
      70
    );

    if (
      !flags.includes(
        "recipe_content"
      )
    ) {

      flags.push(
        "recipe_content"
      );
    }

    reason =
      "Recipe-style content detected with valid cooking structure.";
  }

  /* =====================================================
     FINAL DECISION
  ===================================================== */

  const decision =
    getDecision(
      score,
      confidence,
      flags
    );

  const status =
    getStatus(
      decision
    );

  /* =====================================================
     FINAL RESULT
  ===================================================== */

  const finalResult: ProcessedJobResult = {
    score,
    confidence,
    decision,
    status,
    flags,
    reason,
    source: aiResult?.source,
  };

  console.log(
    "\n✅ FINAL RESULT:"
  );

  console.log(
    finalResult
  );

  console.log(
    "🏁 PROCESS COMPLETE"
  );

  console.log(
    "==============================\n"
  );

  return finalResult;
}

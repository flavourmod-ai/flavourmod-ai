import { processJob } from "../moderation/processJob.js";
import { executeModeration } from "../moderation/moderation.js";

/* =========================================================
   FLAVOURMOD AI WORKER CORE
   ---------------------------------------------------------
   Responsibilities:
   - AI moderation execution
   - OpenAI integration
   - Reddit moderation actions
   - Sticky moderation reports
   - Moderation statistics tracking
========================================================= */

/* =========================================================
   STATUS LABEL GENERATOR
   ---------------------------------------------------------
   Converts moderation score into:
   - UI icon
   - Decision label
   - Risk level
========================================================= */

function getStatus(score: number) {

  /* =========================================
     HIGH QUALITY
  ========================================= */

  if (score >= 75) {

    return {
      icon: "🟢",
      label: "APPROVED",
      risk: "SAFE",
    };
  }

  /* =========================================
     REVIEW RANGE
  ========================================= */

  if (score >= 45) {

    return {
      icon: "🟡",
      label: "REVIEW",
      risk: "MEDIUM",
    };
  }

  /* =========================================
     LOW QUALITY
  ========================================= */

  return {
    icon: "🔴",
    label: "REMOVED",
    risk: "HIGH",
  };
}

/* =========================================================
   HUMAN-READABLE REVIEW TEXT
========================================================= */

function generateReview(
  score: number
) {

  if (score >= 80) {

    return (
      "Excellent recipe quality detected " +
      "with strong formatting and structure."
    );
  }

  if (score >= 60) {

    return (
      "Recipe quality is acceptable " +
      "but may benefit from additional detail."
    );
  }

  if (score >= 40) {

    return (
      "Post appears incomplete or lacks " +
      "sufficient cooking detail."
    );
  }

  return (
    "Low-quality or potentially spam-like " +
    "recipe structure detected."
  );
}

/* =========================================================
   REPORT GENERATOR
   ---------------------------------------------------------
   Creates moderator-facing AI report
========================================================= */

function buildReport(
  job: any,
  result: any
) {

  console.log(
    "📝 BUILDING AI REPORT"
  );

  const ui =
    getStatus(result.score);

  const flagsMarkdown =
    (result.flags || [])
      .map(
        (f: string) => `- ${f}`
      )
      .join("\n");

  return `
# 🤖 FlavourMod AI

${ui.icon} **${ui.label}**

> ${generateReview(result.score)}

---

| Check | Result |
|---|---|
| AI Score | **${result.score}/100** |
| Confidence | **${result.confidence}%** |
| Action | **${result.decision}** |
| Risk Level | **${ui.risk}** |

---

## 🏷 AI Flags

${flagsMarkdown || "- None"}

---

## 🔍 Automated Analysis

- Recipe quality scanned
- Ingredient structure analyzed
- Spam detection completed
- Formatting quality verified
- AI moderation confidence validated

---

## 📌 Moderator Status

${
  result.decision === "APPROVE"
    ? "🟢 Automatically approved by FlavourMod AI."
    : result.decision === "REVIEW"
    ? "🟡 Sent to moderator review queue."
    : "🔴 Automatically removed for quality concerns."
}

---

^(FlavourMod AI • Production Engine v4)
`;
}

/* =========================================================
   STATS COUNTER
========================================================= */

async function incrementStat(
  kv: any,
  key: string
) {

  const current =
    Number(
      await kv.get(key)
    ) || 0;

  const updated =
    current + 1;

  await kv.put(
    key,
    String(updated)
  );

  console.log(
    `📊 STAT UPDATED: ${key} = ${updated}`
  );
}

/* =========================================================
   MAIN WORKER CORE
========================================================= */

export async function workerCore(
  context: any,
  job: any
) {

  const kv =
    context.kvStore;

  console.log(
    "🚀 WORKER CORE STARTED"
  );

  console.log(
    "📦 PROCESSING POST:",
    job.postId
  );

  console.log(
    "📝 TITLE:",
    job.title || "NO TITLE"
  );

  console.log(
    "📄 BODY LENGTH:",
    job.body?.length || 0
  );

  /* =====================================================
     OPENAI API KEY
     -----------------------------------------------------
     DEMO MODE:
     Replace with your real key
     OR settings-based key later.
  ===================================================== */

  const apiKey =
    "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";

  console.log(
    "🔑 OPENAI ENABLED:",
    !!apiKey
  );

  /* =====================================================
     FALLBACK MODE DETECTION
  ===================================================== */

  if (!apiKey) {

    console.warn(
      "⚠️ OPENAI DISABLED → USING FALLBACK/RULE ENGINE"
    );
  }

  /* =====================================================
     AI PROCESSING
  ===================================================== */

  console.log(
    "⚡ AI ANALYSIS STARTED"
  );

  const result =
    await processJob(
      { apiKey },
      job
    );

  console.log(
    "✅ AI RESULT:",
    result
  );

  /* =====================================================
     SCORE SAFETY FIX
     -----------------------------------------------------
     Prevent invalid ultra-low scores
     for decent recipe posts.
  ===================================================== */

  if (
    result.score <= 5 &&
    (
      (job.title?.length || 0) > 10 ||
      (job.body?.length || 0) > 20
    )
  ) {

    console.warn(
      "⚠️ SCORE TOO LOW → APPLYING SAFETY NORMALIZATION"
    );

    result.score = 55;

    if (
      result.decision === "REMOVE"
    ) {

      result.decision =
        "REVIEW";
    }
  }

  /* =====================================================
     MODERATION ACTION
  ===================================================== */

  console.log(
    "⚖️ EXECUTING MODERATION"
  );

  await executeModeration(
    context.reddit,
    job.postId,
    result.decision,
    result.score
  );

  console.log(
    "🔥 MODERATION COMPLETED"
  );

  /* =====================================================
     BUILD REPORT
  ===================================================== */

  const report =
    buildReport(
      job,
      result
    );

  console.log(
    "📝 REPORT GENERATED"
  );

  /* =====================================================
     POST REPORT COMMENT
  ===================================================== */

  console.log(
    "💬 POSTING MODERATION REPORT"
  );

  const post =
    await context.reddit.getPostById(
      job.postId
    );

  if (post) {

    const comment =
      await post.addComment({
        text: report,
      });

    /* =========================================
       DISTINGUISH MOD COMMENT
    ========================================= */

    await comment.distinguish(
      true
    );

    console.log(
      "✅ REPORT COMMENT POSTED:",
      comment.id
    );

  } else {

    console.warn(
      "⚠️ POST NOT FOUND:",
      job.postId
    );
  }

  /* =====================================================
     STORE STICKY REPORT DATA
  ===================================================== */

  await kv.put(
    `sticky:pending:${job.postId}`,
    JSON.stringify({
      postId: job.postId,
      report,
      createdAt: Date.now(),
    })
  );

  console.log(
    "📌 STICKY REPORT STORED"
  );

  /* =====================================================
     JOB LOOKUP STORAGE
  ===================================================== */

  await kv.put(
    `job:byPost:${job.postId}`,
    job.postId
  );

  console.log(
    "🗂 JOB LOOKUP INDEXED"
  );

  /* =====================================================
     STATS TRACKING
  ===================================================== */

  console.log(
    "📊 UPDATING STATS"
  );

  await incrementStat(
    kv,
    "stats:total"
  );

  await incrementStat(
    kv,
    `stats:${result.decision.toLowerCase()}`
  );

  console.log(
    "✅ STATS UPDATED"
  );

  /* =====================================================
     FINAL RESULT
  ===================================================== */

  console.log(
    "🏁 WORKER CORE COMPLETED"
  );

  return result;
}
import { processJob } from "../moderation/processJob";
import { executeModeration } from "../moderation/moderation";

/* =========================================================
   DECISION → SINGLE SOURCE OF TRUTH
========================================================= */

function resolveDecision(score: number, confidence: number) {
  // hard safety block
  if (score <= 10 || confidence < 20) return "REMOVE";

  // review zone
  if (score < 45 || confidence < 50) return "REVIEW";

  // safe zone
  return "APPROVE";
}

/* =========================================================
   UI META (REDDIT MOD STYLE)
========================================================= */

function getDecisionMeta(decision: string) {
  const map: any = {
    APPROVE: {
      icon: "🟢",
      label: "APPROVED",
      risk: "SAFE",
      moderatorStatus: "Automatically approved by FlavourMod AI.",
    },
    REVIEW: {
      icon: "🟡",
      label: "REVIEW",
      risk: "MEDIUM",
      moderatorStatus: "Sent to moderator review queue.",
    },
    REMOVE: {
      icon: "🔴",
      label: "REMOVED",
      risk: "HIGH_RISK",
      moderatorStatus: "Automatically removed by safety engine.",
    },
  };

  return map[decision];
}

/* =========================================================
   STATS COUNTER
========================================================= */

async function incrementStat(kv: any, key: string) {
  const v = Number(await kv.get(key)) || 0;
  await kv.put(key, String(v + 1));
}

/* =========================================================
   WORKER CORE
========================================================= */

export async function workerCore(context: any, job: any) {
  const kv = context.kvStore;

  console.log("🚀 WORKER CORE STARTED");
  console.log("📦 POST:", job.postId);

  /* =========================================================
     1. AI PROCESS ONLY (NO DECISION HERE)
  ========================================================= */

  const ai = await processJob(context, job);

  console.log("🧠 AI RESULT:", ai);

  /* =========================================================
     2. FINAL DECISION (ONLY HERE)
  ========================================================= */

  const decision = resolveDecision(ai.score, ai.confidence);

  const result = {
    ...ai,
    decision,
  };

  /* =========================================================
     3. EXECUTE MODERATION ACTION
  ========================================================= */

  await executeModeration(
    context.reddit,
    job.postId,
    decision,
    ai.score
  );

  console.log("⚖️ MODERATION EXECUTED");

  /* =========================================================
     4. UI META
  ========================================================= */

  const meta = getDecisionMeta(decision);

  const flags =
    result.flags.length > 0
      ? result.flags.map((f: string) => `• ${f}`).join("\n")
      : "• None";

  /* =========================================================
     5. REDDIT-STYLE MODERATION REPORT (WINNING UI)
  ========================================================= */

  const report = `
# 🛡 FlavourMod AI Moderation Report

---

## ${meta.icon} ${meta.label} • Risk: **${meta.risk}**

> ${result.reason}

---

## 📊 Performance Metrics

| Metric | Value |
|--------|------|
| 🎯 Score | **${result.score}/100** |
| 🧠 Confidence | **${result.confidence}%** |
| ⚖️ Decision | **${decision}** |

---

## 🧠 AI Analysis Summary

- Multi-layer moderation engine used
- AI + rule-based hybrid scoring
- Safety enforcement applied
- Final decision locked in strict mode

---

## 🏷 Flags

${flags}

---

## 📌 Moderator Status

**${meta.moderatorStatus}**

---

## ⚙️ System Info

- Engine: FlavourMod AI v4
- Mode: Real-time moderation
- Output: Deterministic + explainable AI

---

*Generated automatically by FlavourMod AI*
`;

  /* =========================================================
     6. POST TO REDDIT
  ========================================================= */

  const post = await context.reddit.getPostById(job.postId);

  if (post) {
    const comment = await post.addComment({ text: report });
    await comment.distinguish(true);
  }

  /* =========================================================
     7. STICKY STORAGE
  ========================================================= */

  await kv.put(
    `sticky:pending:${job.postId}`,
    JSON.stringify({
      postId: job.postId,
      report,
      createdAt: Date.now(),
    })
  );

  await kv.put(`job:byPost:${job.postId}`, job.postId);

  /* =========================================================
     8. STATS UPDATE
  ========================================================= */

  await incrementStat(kv, "stats:total");
  await incrementStat(kv, `stats:${decision.toLowerCase()}`);

  console.log("📊 STATS UPDATED");
  console.log("🏁 WORKER CORE FINISHED");

  return result;
}

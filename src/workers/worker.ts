import { dequeue } from "../server/queue";
import { acquireLock, releaseLock } from "../server/lock";
import { setState } from "../server/stateMachine";
import { appendTimelineEvent } from "../server/timeline";
import { workerCore } from "./workerCore";

/* =========================================================
   FLAVOURMOD AI WORKER ENGINE
   ---------------------------------------------------------
   Responsible For:
   - Queue processing
   - Lock-safe execution
   - AI moderation lifecycle
   - Dashboard synchronization
   - Real-time broadcasting
   - State machine updates
========================================================= */

/* =========================================================
   SLEEP HELPER
========================================================= */

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms));

/* =========================================================
   SAFE JOB PARSER
========================================================= */

function parseJob(raw: any) {
  try {
    return typeof raw === "string"
      ? JSON.parse(raw)
      : raw;
  } catch (err) {
    console.error(
      "❌ JOB PARSE ERROR:",
      err
    );

    return null;
  }
}

/* =========================================================
   SAFE ARRAY PARSER
========================================================= */

function safeParseArray(raw: any) {
  try {
    if (!raw) return [];

    const parsed =
      typeof raw === "string"
        ? JSON.parse(raw)
        : raw;

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (err) {

    console.error(
      "❌ ARRAY PARSE ERROR:",
      err
    );

    return [];
  }
}

/* =========================================================
   AI RESULT NORMALIZER
   ---------------------------------------------------------
   Converts all moderation engines into
   one consistent output structure.
========================================================= */

function normalizeResult(result: any) {

  console.log(
    "🧠 NORMALIZING AI RESULT"
  );

  /* =========================
     FALLBACK SAFETY
  ========================= */

  if (!result) {

    console.warn(
      "⚠️ EMPTY AI RESULT DETECTED"
    );

    return {
      decision: "REVIEW",
      score: 50,
      confidence: 0,
      reason: "Missing AI result",
      flags: [],
    };
  }

  /* =========================
     NORMALIZE CONFIDENCE
  ========================= */

  let confidence =
    Number(result.confidence ?? 0);

  if (confidence <= 1) {
    confidence =
      Math.round(confidence * 100);
  }

  /* =========================
     DEFAULT DECISION
  ========================= */

  let decision =
    result.decision || "REVIEW";

  /* =========================
     AI DECISION RULES
  ========================= */

  if (
    result.status === "BAD" &&
    confidence >= 80
  ) {
    decision = "REMOVE";
  }

  if (
    result.status === "SAFE" ||
    result.status === "GOOD"
  ) {
    decision = "APPROVE";
  }

  if (confidence < 60) {
    decision = "REVIEW";
  }

  /* =========================
     FINAL NORMALIZED RESULT
  ========================= */

  const normalized = {
    ...result,

    confidence,

    decision,

    score:
      Number(result.score ?? 50),

    flags:
      Array.isArray(result.flags)
        ? result.flags
        : [],
  };

  console.log(
    "✅ NORMALIZED RESULT:",
    normalized
  );

  return normalized;
}

/* =========================================================
   DASHBOARD SYNCHRONIZER
   ---------------------------------------------------------
   Updates queue items stored in KV
   so sticky dashboard comments stay live.
========================================================= */

async function updateDashboard(
  kv: any,
  jobId: string,
  result: any
) {

  console.log(
    "📊 DASHBOARD SYNC STARTED:",
    jobId
  );

  const raw =
    await kv.get("dashboard:queue");

  let queue = [];

  try {

    queue = raw
      ? JSON.parse(raw)
      : [];

  } catch (err) {

    console.error(
      "❌ DASHBOARD PARSE ERROR:",
      err
    );

    queue = [];
  }

  /* =========================
     UPDATE TARGET ITEM
  ========================= */

  const updatedQueue =
    queue.map((item: any) => {

      if (
        String(item.postId) !==
        String(jobId)
      ) {
        return item;
      }

      return {
        ...item,
        ...result,
        updatedAt: Date.now(),
      };
    });

  /* =========================
     SAVE UPDATED QUEUE
  ========================= */

  await kv.put(
    "dashboard:queue",
    JSON.stringify(
      updatedQueue.slice(0, 50)
    )
  );

  /* =========================
     VERSION BUMP
  ========================= */

  const version =
    Date.now().toString();

  await kv.put(
    "dashboard:version",
    version
  );

  console.log(
    "✅ DASHBOARD UPDATED:",
    version
  );

  return version;
}

/* =========================================================
   REALTIME BROADCAST SYSTEM
========================================================= */

async function broadcast(
  context: any,
  payload: any
) {

  try {

    console.log(
      "📡 REALTIME BROADCAST:",
      payload.type
    );

    await context.realtime.send(
      "dashboard:update",
      payload
    );

  } catch (err) {

    console.error(
      "❌ REALTIME ERROR:",
      err
    );
  }
}

/* =========================================================
   MAIN WORKER LOOP
========================================================= */

export async function worker(
  context: any
) {

  const kv =
    context.kvStore;

  console.log(
    "🚀 FLAVOURMOD WORKER STARTED"
  );

  /* =========================
     WORKER STATUS
  ========================= */

  await kv.put(
    "worker:status",
    "RUNNING"
  );

  /* =====================================================
     PROCESS MULTIPLE JOBS PER CYCLE
  ===================================================== */

  for (let i = 0; i < 3; i++) {

    console.log(
      `📦 WORKER ITERATION ${i + 1}`
    );

    /* =========================
       FETCH JOB
    ========================= */

    const jobId =
      await dequeue(kv);

    if (!jobId) {

      console.log(
        "📭 NO MORE JOBS IN QUEUE"
      );

      break;
    }

    console.log(
      "📥 JOB RECEIVED:",
      jobId
    );

    /* =========================
       ACQUIRE LOCK
    ========================= */

    const locked =
      await acquireLock(
        kv,
        jobId
      );

    if (!locked) {

      console.warn(
        "⚠️ LOCK FAILED:",
        jobId
      );

      continue;
    }

    console.log(
      "🔒 LOCK ACQUIRED:",
      jobId
    );

    try {

      /* =========================
         LOAD JOB
      ========================= */

      const rawJob =
        await kv.get(
          `job:${jobId}`
        );

      const job =
        parseJob(rawJob);

      if (!job?.postId) {

        console.error(
          "❌ INVALID JOB DATA:",
          jobId
        );

        await setState(
          kv,
          jobId,
          "FAILED"
        );

        continue;
      }

      console.log(
        "🧠 PROCESSING JOB:",
        job.postId
      );

      /* =========================
         STEP 1 — PROCESSING
      ========================= */

      await setState(
        kv,
        jobId,
        "PROCESSING"
      );

      await appendTimelineEvent(
        kv,
        jobId,
        "AI_ANALYZING"
      );

      console.log(
        "⚡ AI ANALYSIS STARTED"
      );

      /* =========================
         AI WORKER CORE
      ========================= */

      const rawResult =
        await workerCore(
          context,
          job
        );

      /* =========================
         NORMALIZE RESULT
      ========================= */

      const result =
        normalizeResult(
          rawResult
        );

      console.log(
        "🧠 FINAL RESULT:",
        result
      );

      /* =========================
         STEP 2 — DECISION
      ========================= */

      await setState(
        kv,
        jobId,
        "DECIDED"
      );

      console.log(
        "📌 DECISION:",
        result.decision
      );

      /* =========================
         TIMELINE EVENTS
      ========================= */

      if (
        result.decision ===
        "REVIEW"
      ) {

        await appendTimelineEvent(
          kv,
          jobId,
          "REVIEW_REQUIRED"
        );

      } else if (
        result.decision ===
        "APPROVE"
      ) {

        await appendTimelineEvent(
          kv,
          jobId,
          "APPROVED"
        );

      } else {

        await appendTimelineEvent(
          kv,
          jobId,
          "REMOVED"
        );
      }

      /* =========================
         STEP 3 — MODERATED
      ========================= */

      await setState(
        kv,
        jobId,
        "MODERATED"
      );

      console.log(
        "⚖️ MODERATION COMPLETED"
      );

      /* =========================
         DASHBOARD UPDATE
      ========================= */

      const version =
        await updateDashboard(
          kv,
          jobId,
          result
        );

      /* =========================
         REALTIME UPDATE
      ========================= */

      await broadcast(
        context,
        {
          type:
            "DASHBOARD_UPDATE",

          jobId,

          version,

          ...result,
        }
      );

      /* =========================
         FINAL STATE
      ========================= */

      await setState(
        kv,
        jobId,
        "DONE"
      );

      console.log(
        "✅ JOB COMPLETED:",
        jobId
      );

    } catch (err) {

      console.error(
        "❌ WORKER PROCESS ERROR:",
        err
      );

      await setState(
        kv,
        jobId,
        "FAILED"
      );

    } finally {

      /* =========================
         RELEASE LOCK
      ========================= */

      await releaseLock(
        kv,
        jobId
      );

      console.log(
        "🔓 LOCK RELEASED:",
        jobId
      );
    }

    /* =========================
       SMALL THROTTLE DELAY
    ========================= */

    await sleep(200);
  }

  /* =====================================================
     WORKER COMPLETE
  ===================================================== */

  await kv.put(
    "worker:status",
    "IDLE"
  );

  console.log(
    "🏁 FLAVOURMOD WORKER FINISHED"
  );
}
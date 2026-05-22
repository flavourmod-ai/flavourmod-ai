import { Devvit, SettingScope } from "@devvit/public-api";

import {
  createTrace,
  logError,
  finishTrace,
} from "./server/runtime.js";

import { appendTimelineEvent } from "./server/timeline";
import { enqueue } from "./server/queue";
import { worker } from "./workers/worker";

import { DashboardPost } from "./ui/DashboardPost";

/* =========================================================
   FLAVOURMOD AI ENGINE
   REAL-TIME AI MODERATION SYSTEM
========================================================= */

console.log("🚀 FLAVOURMOD AI ENGINE INITIALIZING");

/* =========================================================
   DEVVIT CONFIGURATION
========================================================= */

Devvit.configure({
  redditAPI: true,
  redis: true,
  realtime: true,
});

console.log("✅ DEVVIT SERVICES CONFIGURED");

/* =========================================================
   APP SETTINGS
   (OPTIONAL FOR FUTURE PRODUCTION VERSION)
========================================================= */

Devvit.addSettings([
  {
    type: "string",
    name: "OPENAI_API_KEY",
    label: "OpenAI API Key",
    isSecret: true,
    scope: SettingScope.App,
  },
]);

console.log("✅ SETTINGS REGISTERED");

/* =========================================================
   CUSTOM DASHBOARD POST TYPE
========================================================= */

Devvit.addCustomPostType({
  name: "FlavourMod Dashboard",
  render: DashboardPost,
});

console.log("✅ DASHBOARD POST TYPE REGISTERED");

/* =========================================================
   SAFE JSON PARSER
========================================================= */

function safeParse(raw: any) {
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("❌ JSON PARSE FAILED:", err);
    return [];
  }
}

/* =========================================================
   GLOBAL WORKER LOCK
========================================================= */

let workerRunning = false;

/* =========================================================
   SAFE WORKER EXECUTOR
========================================================= */

async function safeRunWorker(
  context: any,
  traceId?: string
) {

  /* =========================
     PREVENT DUPLICATE WORKERS
  ========================= */

  if (workerRunning) {
    console.log("⏳ WORKER ALREADY RUNNING");
    return;
  }

  workerRunning = true;

  console.log("🚀 STARTING BACKGROUND WORKER");

  try {

    await context.kvStore.put(
      "worker:status",
      "RUNNING"
    );

    console.log("📦 WORKER STATUS → RUNNING");

    await worker(context);

    await context.kvStore.put(
      "worker:status",
      "IDLE"
    );

    console.log("✅ WORKER STATUS → IDLE");

  } catch (err) {

    console.error(
      "❌ WORKER EXECUTION FAILED:",
      err
    );

    await context.kvStore.put(
      "worker:status",
      "ERROR"
    );

    if (traceId) {
      logError(traceId, err);
    }

  } finally {

    workerRunning = false;

    console.log("🏁 WORKER EXECUTION FINISHED");

    if (traceId) {
      finishTrace(traceId);
    }
  }
}

/* =========================================================
   REAL-TIME POST CREATE TRIGGER
========================================================= */

Devvit.addTrigger({
  event: "PostCreate",

  async onEvent(event, context) {

    const postId =
      event.post?.id;

    if (!postId) {
      console.log("⚠️ POST ID MISSING");
      return;
    }

    console.log("📥 NEW POST DETECTED:", postId);

    const traceId =
      createTrace(postId);

    try {

      /* =========================
         CREATE JOB RECORD
      ========================= */

      const jobPayload = {
        postId,
        title: event.post?.title ?? "",
        body: event.post?.selftext ?? "",
        createdAt: Date.now(),
        status: "QUEUED",
      };

      await context.kvStore.put(
        `job:${postId}`,
        JSON.stringify(jobPayload)
      );

      console.log("✅ JOB STORED:", postId);

      /* =========================
         LOAD DASHBOARD QUEUE
      ========================= */

      const rawQueue =
        await context.kvStore.get(
          "dashboard:queue"
        );

      const queue =
        safeParse(rawQueue);

      /* =========================
         INSERT NEW QUEUE ITEM
      ========================= */

      queue.unshift({
        postId,
        score: 50,
        confidence: 0,
        decision: "QUEUED",
        reason: "Post received by AI engine",
        createdAt: Date.now(),
      });

      /* =========================
         STORE UPDATED QUEUE
      ========================= */

      await context.kvStore.put(
        "dashboard:queue",
        JSON.stringify(
          queue.slice(0, 50)
        )
      );

      console.log(
        "📊 DASHBOARD QUEUE UPDATED"
      );

      /* =========================
         VERSION UPDATE
      ========================= */

      const version =
        Date.now().toString();

      await context.kvStore.put(
        "dashboard:version",
        version
      );

      console.log(
        "🔄 DASHBOARD VERSION:",
        version
      );

      /* =========================
         REALTIME DASHBOARD EVENT
      ========================= */

      await context.realtime.send(
        "dashboard:update",
        {
          type: "JOB_CREATED",
          postId,
          version,
        }
      );

      console.log(
        "📡 REALTIME UPDATE SENT"
      );

      /* =========================
         QUEUE SYSTEM
      ========================= */

      await enqueue(
        context.kvStore,
        postId
      );

      console.log(
        "📥 JOB ENQUEUED"
      );

      /* =========================
         TIMELINE TRACKING
      ========================= */

      await appendTimelineEvent(
        context.kvStore,
        postId,
        "QUEUED"
      );

      console.log(
        "🧾 TIMELINE EVENT ADDED"
      );

      /* =========================
         START WORKER
      ========================= */

      void safeRunWorker(
        context,
        traceId
      );

    } catch (err) {

      console.error(
        "❌ POST CREATE FLOW FAILED:",
        err
      );

      logError(traceId, err);
    }
  },
});

/* =========================================================
   DASHBOARD CREATION MENU
========================================================= */

Devvit.addMenuItem({
  label: "Create FlavourMod Dashboard",
  location: "subreddit",

  async onPress(_, context) {

    console.log(
      "🖱 DASHBOARD MENU CLICKED"
    );

    try {

      const subreddit =
        await context.reddit.getCurrentSubreddit();

      console.log(
        "📍 TARGET SUBREDDIT:",
        subreddit.name
      );

      /* =========================
         CREATE DASHBOARD POST
      ========================= */

      const post =
        await context.reddit.submitPost({
          subredditName:
            subreddit.name,

          title:
            "🔥 FlavourMod Dashboard",

          text:
            "Real-time AI moderation dashboard",
        });

      console.log(
        "✅ DASHBOARD POST CREATED:",
        post.id
      );

      /* =========================
         STORE ACTIVE DASHBOARD
      ========================= */

      await context.kvStore.put(
        "dashboard:ACTIVE_POST",
        post.id
      );

      console.log(
        "📌 ACTIVE DASHBOARD SAVED:",
        post.id
      );

    } catch (err) {

      console.error(
        "❌ DASHBOARD CREATION FAILED:",
        err
      );
    }
  },
});

/* =========================================================
   EXPORT APP
========================================================= */

console.log("✅ FLAVOURMOD AI ENGINE READY");

export default Devvit;
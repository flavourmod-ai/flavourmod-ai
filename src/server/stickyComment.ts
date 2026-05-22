import { safeRedditCall } from "./utils/safeReddit.js";

const COMMENT_KEY = (id: string) =>
  `sticky:${id}`;

const sleep = (ms: number) =>
  new Promise(r => setTimeout(r, ms));

/* =========================
   SAFE NORMALIZER
========================= */

function normalizeId(id: string) {
  return String(id).trim();
}

/* =========================
   SAFE COMMENT ID
========================= */

function getCommentId(comment: any) {

  if (!comment) return null;

  try {

    if (
      typeof comment === "object" &&
      "id" in comment
    ) {
      return String(
        (comment as any).id
      );
    }

    return null;

  } catch {

    return null;
  }
}

/* =========================
   SAFE STICKY HELPER
========================= */

async function applySticky(
  reddit: any,
  commentId: string
) {

  if (!commentId) {
    return false;
  }

  try {

    /* =========================
       PRIMARY METHOD
    ========================= */

    if (
      typeof reddit.distinguishComment ===
      "function"
    ) {

      console.log(
        "🛡️ DISTINGUISHING COMMENT"
      );

      await safeRedditCall(
        "distinguishComment",
        () =>
          reddit.distinguishComment({
            id: commentId,
            sticky: true,
          })
      );

      console.log(
        "📌 COMMENT STICKIED"
      );

      return true;
    }

    /* =========================
       FALLBACK METHOD
    ========================= */

    if (
      typeof reddit.stickyComment ===
      "function"
    ) {

      console.log(
        "📌 USING FALLBACK STICKY"
      );

      await safeRedditCall(
        "stickyComment",
        () =>
          reddit.stickyComment({
            id: commentId,
          })
      );

      console.log(
        "📌 FALLBACK STICKY SUCCESS"
      );

      return true;
    }

    console.warn(
      "⚠️ NO STICKY METHOD AVAILABLE"
    );

    return false;

  } catch (err) {

    console.warn(
      "⚠️ APPLY STICKY FAILED:",
      err
    );

    return false;
  }
}

/* =========================
   SAFE COMMENT CREATION
========================= */

async function createStickyComment(
  reddit: any,
  postId: string,
  text: string
) {

  return await safeRedditCall(
    "submitComment",
    () =>
      reddit.submitComment({
        id: postId,
        text,
      })
  );
}

/* =========================
   UPSERT STICKY COMMENT
========================= */

export async function upsertStickyComment(
  reddit: any,
  kvStore: any,
  postId: string,
  text: string
) {

  if (
    !reddit ||
    !kvStore ||
    !postId
  ) {

    console.error(
      "❌ INVALID STICKY INPUT"
    );

    return false;
  }

  const normalizedPostId =
    normalizeId(postId);

  const key =
    COMMENT_KEY(
      normalizedPostId
    );

  console.log(
    "🧩 STICKY START:",
    normalizedPostId
  );

  try {

    /* =========================
       EXISTING COMMENT
    ========================= */

    const existing =
      await kvStore.get(key);

    console.log(
      "🧩 EXISTING:",
      existing
    );

    /* =========================
       UPDATE EXISTING
    ========================= */

    if (
      existing &&
      typeof existing === "string"
    ) {

      const existingId =
        normalizeId(existing);

      try {

        console.log(
          "✏️ EDIT COMMENT:",
          existingId
        );

        if (
          typeof reddit.editComment ===
          "function"
        ) {

          await safeRedditCall(
            "editComment",
            () =>
              reddit.editComment({
                id: existingId,
                text,
              })
          );

          console.log(
            "✅ COMMENT UPDATED"
          );

          /* =========================
             RE-STICKY AFTER EDIT
          ========================= */

          await applySticky(
            reddit,
            existingId
          );

          return true;
        }

      } catch (err) {

        console.warn(
          "⚠️ EDIT FAILED:",
          err
        );

        /* =========================
           CLEAR BAD CACHE
        ========================= */

        try {

          await kvStore.delete(key);

          console.log(
            "🧹 OLD CACHE REMOVED"
          );

        } catch {}
      }
    }

    /* =========================
       CREATE NEW COMMENT
    ========================= */

    for (let i = 1; i <= 3; i++) {

      try {

        console.log(
          `💬 CREATE COMMENT TRY ${i}`
        );

        if (
          typeof reddit.submitComment !==
          "function"
        ) {

          console.error(
            "❌ submitComment missing"
          );

          return false;
        }

        const comment =
          await createStickyComment(
            reddit,
            normalizedPostId,
            text
          );

        console.log(
          "💬 COMMENT RESPONSE:",
          comment
        );

        const commentId =
          getCommentId(comment);

        /* =========================
           COMMENT FAILED
        ========================= */

        if (!commentId) {

          console.warn(
            "⚠️ NO COMMENT ID RETURNED"
          );

          await sleep(
            2000 * i
          );

          continue;
        }

        console.log(
          "🆔 COMMENT ID:",
          commentId
        );

        /* =========================
           APPLY STICKY
        ========================= */

        await applySticky(
          reddit,
          commentId
        );

        /* =========================
           SAVE COMMENT ID
        ========================= */

        await kvStore.put(
          key,
          normalizeId(commentId)
        );

        console.log(
          "✅ STICKY SAVED:",
          commentId
        );

        return true;

      } catch (err: any) {

        const msg = String(
          err?.message || err
        );

        console.error(
          "❌ CREATE COMMENT FAILED:",
          err
        );

        /* =========================
           RATE LIMIT
        ========================= */

        if (
          msg.includes(
            "RATELIMIT"
          ) ||
          msg.includes(
            "rate limit"
          )
        ) {

          console.log(
            `⏳ RATE LIMITED (${i})`
          );

          await sleep(
            5000 * i
          );

          continue;
        }

        /* =========================
           POST REMOVED
        ========================= */

        if (
          msg.includes(
            "deleted"
          ) ||
          msg.includes(
            "removed"
          )
        ) {

          console.warn(
            "⚠️ POST REMOVED BEFORE COMMENT"
          );

          return false;
        }

        /* =========================
           TEMP REDDIT ERROR
        ========================= */

        if (
          msg.includes(
            "timeout"
          ) ||
          msg.includes("500") ||
          msg.includes("503")
        ) {

          console.warn(
            "⚠️ TEMP REDDIT FAILURE"
          );

          await sleep(
            3000 * i
          );

          continue;
        }

        return false;
      }
    }

    console.error(
      "❌ COMMENT RETRIES EXHAUSTED"
    );

    return false;

  } catch (err) {

    console.error(
      "❌ STICKY SYSTEM FAILED:",
      err
    );

    return false;
  }
}
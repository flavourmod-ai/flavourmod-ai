import { safeRedditCall }
from "../types/safeReddit.js";

/* =========================
   MODERATION DECISION TYPES
========================= */

export type Decision =
  | "APPROVE"
  | "REVIEW"
  | "REMOVE";

/* =========================
   UI LABEL HELPERS
========================= */

function getLabel(
  score: number
) {

  // High quality content
  if (score >= 75) {

    return {
      icon: "🟢",
      label: "APPROVED",
      color: "SAFE",
      action:
        "Post Approved",
    };
  }

  // Medium confidence content
  if (score >= 45) {

    return {
      icon: "🟡",
      label: "REVIEW",
      color: "MEDIUM",
      action:
        "Needs Human Review",
    };
  }

  // High risk / low quality content
  return {
    icon: "🔴",
    label: "REMOVED",
    color: "HIGH_RISK",
    action:
      "Post Removed",
  };
}

/* =========================
   MAIN MODERATION EXECUTOR
========================= */

export async function executeModeration(
  reddit: any,
  postId: string,
  decision: Decision,
  score: number
) {

  console.log(
    "🚀 MODERATION ENGINE STARTED"
  );

  /* =========================
     INPUT VALIDATION
  ========================= */

  if (
    !reddit ||
    !postId ||
    typeof postId !==
      "string"
  ) {

    console.error(
      "❌ INVALID MODERATION INPUT:",
      { postId }
    );

    return {
      success: false,
      decision,
    };
  }

  const id = postId;

  // UI label object
  const ui =
    getLabel(score);

  console.log(
    "⚖️ EXECUTE MODERATION:",
    {
      id,
      decision,
      score,
    }
  );

  try {

    /* =========================
       APPROVE POST
    ========================= */

    if (
      decision ===
        "APPROVE" &&
      typeof reddit
        .approvePost ===
        "function"
    ) {

      console.log(
        "🟢 APPROVING POST"
      );

      await safeRedditCall(
        "approvePost",
        () =>
          reddit.approvePost(
            id
          )
      );

      console.log(
        "✅ POST APPROVED"
      );
    }

    /* =========================
       REVIEW QUEUE
    ========================= */

    if (
      decision ===
      "REVIEW"
    ) {

      console.log(
        "🟡 SENT TO REVIEW QUEUE"
      );

      // Human moderators review manually later
    }

    /* =========================
       REMOVE POST
    ========================= */

    if (
      decision ===
        "REMOVE" &&
      typeof reddit
        .removePost ===
        "function"
    ) {

      console.log(
        "🔴 REMOVING POST"
      );

      await safeRedditCall(
        "removePost",
        () =>
          reddit.removePost(
            id
          )
      );

      console.log(
        "✅ POST REMOVED"
      );
    }

    /* =========================
       FINAL RESULT LOG
    ========================= */

    console.log(
      "🤖 MODERATION RESULT:",
      {
        status:
          ui.label,

        risk:
          ui.color,

        score,

        action:
          ui.action,
      }
    );

    /* =========================
       SUCCESS RESPONSE
    ========================= */

    return {
      success: true,
      decision,
      score,
      status:
        ui.label,
      risk:
        ui.color,
    };

  } catch (err) {

    console.error(
      "❌ executeModeration FAILED:",
      err
    );

    return {
      success: false,
      decision,
      error: String(err),
    };
  }
}
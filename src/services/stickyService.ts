export async function queueStickyRequest(
  kv: any,
  jobId: string,
  postId: string,
  report: string
) {

  try {

    console.log(
      "📌 STORING STICKY REQUEST"
    );

    await kv.put(
      `sticky:pending:${jobId}`,
      JSON.stringify({
        postId,
        report,
        createdAt: Date.now(),
      })
    );

    await kv.put(
      `job:byPost:${postId}`,
      jobId
    );

    console.log(
      "📌 STICKY QUEUED"
    );

    return true;

  } catch (err) {

    console.error(
      "❌ STICKY STORE FAILED:",
      err
    );

    return false;
  }
}

/* =========================
   OPTIONAL FUTURE RESOLVER
========================= */

export async function getPendingSticky(
  kv: any,
  jobId: string
) {

  try {

    const raw =
      await kv.get(
        `sticky:pending:${jobId}`
      );

    if (!raw) {
      return null;
    }

    return typeof raw ===
      "string"
      ? JSON.parse(raw)
      : raw;

  } catch (err) {

    console.error(
      "❌ STICKY LOAD FAILED:",
      err
    );

    return null;
  }
}
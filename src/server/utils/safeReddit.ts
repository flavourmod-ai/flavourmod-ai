const sleep = (ms: number) =>
  new Promise(r => setTimeout(r, ms));

/* =========================
   SAFE REDDIT CALL
========================= */

export async function safeRedditCall<T = any>(
  label: string,
  fn: () => Promise<T>,
  retries = 3
): Promise<T | null> {

  for (let i = 1; i <= retries; i++) {

    try {

      console.log(
        `🚀 REDDIT API: ${label} TRY ${i}`
      );

      const result = await fn();

      console.log(
        `✅ REDDIT SUCCESS: ${label}`
      );

      // ✅ FIX:
      // preserve proper object typing
      return result as T;

    } catch (err: any) {

      const msg = String(
        err?.message || err
      );

      console.error(
        `❌ REDDIT FAIL: ${label}`,
        msg
      );

      /* =========================
         RATE LIMIT
      ========================= */

      if (
        msg.includes("RATELIMIT") ||
        msg.includes("rate limit")
      ) {

        console.log(
          "⏳ RATE LIMITED"
        );

        await sleep(4000 * i);

        continue;
      }

      /* =========================
         DELETED / REMOVED
      ========================= */

      if (
        msg.includes("deleted") ||
        msg.includes("removed")
      ) {

        console.warn(
          "⚠️ POST NO LONGER EXISTS"
        );

        return null;
      }

      /* =========================
         TEMP REDDIT FAILURE
      ========================= */

      if (
        msg.includes("timeout") ||
        msg.includes("500") ||
        msg.includes("503")
      ) {

        console.warn(
          "⚠️ TEMP REDDIT FAILURE"
        );

        await sleep(2000 * i);

        continue;
      }

      /* =========================
         UNKNOWN FAILURE
      ========================= */

      console.error(
        "❌ UNKNOWN REDDIT ERROR:",
        err
      );

      return null;
    }
  }

  console.error(
    `❌ RETRIES EXHAUSTED: ${label}`
  );

  return null;
}
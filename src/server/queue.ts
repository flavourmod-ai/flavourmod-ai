const QUEUE_KEY = "mod:queue";

/* =========================
   ADD JOB TO QUEUE
========================= */

export async function enqueue(
  kvStore: any,
  jobId: string
) {

  const queue =
    (await kvStore.get(QUEUE_KEY))
    || [];

  // Prevent duplicate jobs
  if (!queue.includes(jobId)) {

    await kvStore.put(
      QUEUE_KEY,
      [...queue, jobId]
    );

    console.log(
      "📥 JOB ENQUEUED:",
      jobId
    );
  }
}

/* =========================
   REMOVE JOB FROM QUEUE
========================= */

export async function dequeue(
  kvStore: any
) {

  const queue =
    (await kvStore.get(QUEUE_KEY))
    || [];

  // Empty queue
  if (queue.length === 0) {

    console.log(
      "📭 QUEUE EMPTY"
    );

    return null;
  }

  const [jobId, ...rest] =
    queue;

  await kvStore.put(
    QUEUE_KEY,
    rest
  );

  console.log(
    "📦 JOB DEQUEUED:",
    jobId
  );

  return jobId;
}
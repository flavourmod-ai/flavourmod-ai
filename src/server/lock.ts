/* =========================
   ACQUIRE JOB LOCK
========================= */

export async function acquireLock(
  kvStore: any,
  jobId: string
) {

  const key =
    `lock:${jobId}`;

  // Prevent duplicate workers
  const existing =
    await kvStore.get(key);

  if (existing) {

    console.log(
      `🔒 LOCK EXISTS: ${jobId}`
    );

    return false;
  }

  // Create active lock
  await kvStore.put(key, {
    lockedAt: Date.now(),
  });

  console.log(
    `✅ LOCK ACQUIRED: ${jobId}`
  );

  return true;
}

/* =========================
   RELEASE JOB LOCK
========================= */

export async function releaseLock(
  kvStore: any,
  jobId: string
) {

  await kvStore.delete(
    `lock:${jobId}`
  );

  
  
}
/* =========================================================
   ☠️ DEAD LETTER QUEUE (PRODUCTION SAFE)
========================================================= */

const g = globalThis as any;

g.__DLQ__ = g.__DLQ__ || [];

/* =========================================================
   DLQ ITEM TYPE (lightweight runtime-safe)
========================================================= */

type DLQItem = {
  id: string;
  failedAt: number;
  reason: string;
  payload?: any;
};

/* =========================================================
   PUSH TO DLQ
========================================================= */

export function pushDLQ(job: any, reason: string) {
  if (!job?.id) return;

  const item: DLQItem = {
    id: job.id,
    failedAt: Date.now(),
    reason: reason || "unknown_error",
    payload: job
  };

  g.__DLQ__.push(item);

  // prevent memory explosion
  if (g.__DLQ__.length > 500) {
    g.__DLQ__.shift();
  }

  console.log("☠️ DLQ STORED:", job.id, reason);
}

/* =========================================================
   GET DLQ
========================================================= */

export function getDLQ(): DLQItem[] {
  return g.__DLQ__;
}

/* =========================================================
   CLEAR DLQ (optional admin use)
========================================================= */

export function clearDLQ() {
  g.__DLQ__ = [];
}
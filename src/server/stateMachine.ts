const STATE_KEY = (id: string) => `state:${id}`;

export type JobState =
  | "QUEUED"
  | "PROCESSING"
  | "DECIDED"
  | "MODERATED"
  | "DONE"
  | "FAILED";

/* =========================
   VALID STATE FLOW
========================= */

const validTransitions: Record<JobState, JobState[]> = {

  QUEUED: [
    "PROCESSING",
    "FAILED",
  ],

  PROCESSING: [
    "DECIDED",
    "MODERATED",
    "FAILED",
  ],

  DECIDED: [
    "MODERATED",
    "DONE",
    "FAILED",
  ],

  MODERATED: [
    "DONE",
    "FAILED",
  ],

  DONE: [],
  FAILED: [],
};

/* =========================
   SAFE STATE PARSER
========================= */

function parseState(
  raw: any
): {
  state: JobState;
  updatedAt: number;
} | null {

  if (!raw) return null;

  try {

    return typeof raw === "string"
      ? JSON.parse(raw)
      : raw;

  } catch {

    return null;
  }
}

/* =========================
   UPDATE JOB STATE
========================= */

export async function setState(
  kvStore: any,
  jobId: string,
  nextState: JobState
) {

  const key =
    STATE_KEY(jobId);

  const raw =
    await kvStore.get(key);

  const existing =
    parseState(raw);

  /* =========================
     CREATE INITIAL STATE
  ========================= */

  if (!existing) {

    await kvStore.put(
      key,
      JSON.stringify({
        state: nextState,
        updatedAt: Date.now(),
      })
    );

    console.log(
      `📦 STATE CREATED: ${nextState}`
    );

    return;
  }

  const current =
    existing.state;

  /* =========================
     BLOCK FINAL STATES
  ========================= */

  if (
    current === "DONE" ||
    current === "FAILED"
  ) {

    console.log(
      `🛑 FINAL STATE LOCKED: ${current}`
    );

    return;
  }

  /* =========================
     PREVENT DUPLICATES
  ========================= */

  if (current === nextState) {

    console.log(
      `⚠️ STATE ALREADY ${nextState}`
    );

    return;
  }

  const allowed =
    validTransitions[current] || [];

  /* =========================
     VALIDATE TRANSITION
  ========================= */

  if (!allowed.includes(nextState)) {

    console.warn(
      `⚠️ INVALID TRANSITION: ${current} → ${nextState}`
    );

    return;
  }

  /* =========================
     SAVE NEXT STATE
  ========================= */

  await kvStore.put(
    key,
    JSON.stringify({
      state: nextState,
      updatedAt: Date.now(),
    })
  );

  console.log(
    `✅ STATE: ${current} → ${nextState}`
  );
}

/* =========================
   GET CURRENT STATE
========================= */

export async function getState(
  kvStore: any,
  jobId: string
) {

  const raw =
    await kvStore.get(
      STATE_KEY(jobId)
    );

  const parsed =
    parseState(raw);

  return parsed || {
    state: "QUEUED",
    updatedAt: 0,
  };
}

/* =========================
   RESET JOB STATE
========================= */

export async function resetState(
  kvStore: any,
  jobId: string
) {

  await kvStore.put(
    STATE_KEY(jobId),
    JSON.stringify({
      state: "QUEUED",
      updatedAt: Date.now(),
    })
  );

  console.log(
    `🔄 STATE RESET: ${jobId}`
  );
}
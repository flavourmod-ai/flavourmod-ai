const g = globalThis as any;

/* =========================================================
   GLOBAL STATE
========================================================= */

g.__TRACE_EVENTS__ =
  g.__TRACE_EVENTS__ || [];

g.__TRACE_STARTS__ =
  g.__TRACE_STARTS__ || {};

g.__TRACE_JOB_MAP__ =
  g.__TRACE_JOB_MAP__ || {};

/* =========================================================
   CREATE TRACE
========================================================= */

export function createTrace(
  jobId: string
): string {

  const traceId =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

  g.__TRACE_STARTS__[traceId] =
    Date.now();

  g.__TRACE_JOB_MAP__[traceId] =
    jobId;

  pushEvent({
    traceId,
    jobId,
    stage: "TRACE_CREATED",
  });

  return traceId;
}

/* =========================================================
   CORE EVENT WRITER
========================================================= */

function pushEvent(event: any) {

  const payload = {

    traceId:
      event.traceId,

    jobId:
      event.jobId ||
      g.__TRACE_JOB_MAP__[
        event.traceId
      ] ||
      "UNKNOWN",

    stage:
      event.stage,

    data:
      event.data ?? null,

    time:
      new Date()
        .toISOString(),
  };

  g.__TRACE_EVENTS__.push(
    payload
  );

  /* =====================================================
     MEMORY SAFETY
  ===================================================== */

  if (
    g.__TRACE_EVENTS__.length >
    500
  ) {

    g.__TRACE_EVENTS__.splice(
      0,
      100
    );
  }

  console.log(
    "📡 EVENT LOG:",
    payload
  );
}

/* =========================================================
   LOG EVENT
========================================================= */

export function logEvent(
  traceId: string,
  stage: string,
  data?: any
) {

  pushEvent({

    traceId,

    jobId:
      data?.jobId ||
      data?.postId ||
      g.__TRACE_JOB_MAP__[
        traceId
      ],

    stage,

    data,
  });
}

/* =========================================================
   FINISH TRACE
========================================================= */

export function finishTrace(
  traceId: string
) {

  const start =
    g.__TRACE_STARTS__[
      traceId
    ];

  const duration =
    start
      ? `${Date.now() - start}ms`
      : "unknown";

  const jobId =
    g.__TRACE_JOB_MAP__[
      traceId
    ];

  logEvent(
    traceId,
    "TRACE_FINISHED",
    {
      jobId,
      duration,
    }
  );

  delete g.__TRACE_STARTS__[
    traceId
  ];

  delete g.__TRACE_JOB_MAP__[
    traceId
  ];
}

/* =========================================================
   ERROR LOGGER
========================================================= */

export function logError(
  traceId: string,
  err: any
) {

  const jobId =
    g.__TRACE_JOB_MAP__[
      traceId
    ];

  logEvent(
    traceId,
    "ERROR",
    {
      jobId,
      err: String(err),
    }
  );

  console.error(
    "❌ ERROR:",
    err
  );
}

/* =========================================================
   GETTERS
========================================================= */

export function getRuntimeEvents() {

  return (
    g.__TRACE_EVENTS__ || []
  );
}

export function getEventsByJob(
  jobId: string
) {

  return (
    g.__TRACE_EVENTS__ || []
  ).filter(
    (e: any) =>
      e.jobId === jobId
  );
}

/* =========================================================
   TIMELINE VIEWER
========================================================= */

export function getTimeline(
  jobId: string
) {

  return getEventsByJob(
    jobId
  )

    .sort(
      (
        a: any,
        b: any
      ) =>
        new Date(
          a.time
        ).getTime() -
        new Date(
          b.time
        ).getTime()
    )

    .map(
      (
        e: any,
        i: number
      ) => ({

        step:
          i + 1,

        stage:
          e.stage,

        time:
          e.time,

        data:
          e.data,
      })
    );
}
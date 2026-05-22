export async function appendTimelineEvent(
  kv: any,
  traceId: string,
  event: string,
  data?: any
) {
  try {

    const key =
      `timeline:${traceId}`;

    const existingRaw =
      await kv.get(key);

    const existing =
      existingRaw
        ? JSON.parse(existingRaw)
        : [];

    existing.push({
      event,
      data: data || null,
      timestamp: Date.now(),
    });

    await kv.put(
      key,
      JSON.stringify(existing)
    );

  } catch (error) {

    console.log(
      "TIMELINE ERROR",
      error
    );
  }
}

export async function getTimeline(
  kv: any,
  traceId: string
) {
  try {

    const key =
      `timeline:${traceId}`;

    const raw =
      await kv.get(key);

    return raw
      ? JSON.parse(raw)
      : [];

  } catch (error) {

    console.log(
      "GET TIMELINE ERROR",
      error
    );

    return [];
  }
}
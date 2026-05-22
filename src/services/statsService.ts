export async function incrementStat(
  kv: any,
  key: string
) {

  const current =
    Number(
      await kv.get(key)
    ) || 0;

  await kv.put(
    key,
    String(current + 1)
  );
}

export async function updateModerationStats(
  kv: any,
  decision: string
) {

  await incrementStat(
    kv,
    "stats:total"
  );

  await incrementStat(
    kv,
    `stats:${decision.toLowerCase()}`
  );

  console.log(
    "📊 STATS UPDATED"
  );
}
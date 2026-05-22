export async function saveOverride(
  kv: any,
  postId: string,
  action: string,
  moderator: string
) {

  await kv.put(
    `override:${postId}`,
    JSON.stringify({
      postId,
      action,
      moderator,
      time: new Date().toISOString(),
    })
  );
}
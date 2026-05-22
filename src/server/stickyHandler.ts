export async function runStickyHandler(context: any, jobId: string) {
  const kv = context.kvStore;

  const raw = await kv.get(`sticky:pending:${jobId}`);

  if (!raw) return;

  const data = JSON.parse(raw);

  const postId = data.postId.replace("t3_", "");

  const post = await context.reddit.getPostById(postId);

  if (!post) {
    console.log("❌ POST NOT FOUND");
    return;
  }

  // Create comment
  const comment = await post.addComment({
    text: data.report,
  });

  // Distinguish bot/mod
  await comment.distinguish(true);

  // SAFE STICKY (Devvit-correct)
  if (typeof post.setSticky === "function") {
    await post.setSticky(comment.id);
    console.log("📌 Sticky applied via post.setSticky()");
  } else if (typeof comment.setSticky === "function") {
    await comment.setSticky(true);
    console.log("📌 Sticky applied via comment.setSticky()");
  } else {
    console.log("⚠️ Sticky not supported in this runtime");
  }

  await kv.put(`sticky:done:${jobId}`, comment.id);
  await kv.delete(`sticky:pending:${jobId}`);

  console.log("✅ STICKY COMPLETE:", comment.id);
}
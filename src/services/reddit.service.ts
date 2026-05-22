export async function postModerationReport(
  reddit: any,
  postId: string,
  report: string
) {

  try {

    console.log(
      "💬 POSTING REPORT"
    );

    const post =
      await reddit.getPostById(
        postId
      );

    if (!post) {

      console.log(
        "⚠️ POST NOT FOUND"
      );

      return null;
    }

    const comment =
      await post.addComment({
        text: report,
      });

    if (
      typeof comment?.distinguish ===
      "function"
    ) {
      await comment.distinguish(
        true
      );
    }

    console.log(
      "✅ REPORT POSTED:",
      comment?.id
    );

    return comment;

  } catch (err) {

    console.error(
      "❌ REPORT POST FAILED:",
      err
    );

    return null;
  }
}
import { normalizePostId } from "./normalizePostId";

export function createModActions(context: any) {
  const reddit = context.reddit;

  return {
    approve: async (postId: string) => {
      try {
        const id = normalizePostId(postId);
        if (!reddit?.approvePost) return;
        await reddit.approvePost(id);
      } catch (err) {
        console.error("❌ approve failed:", err);
      }
    },

    remove: async (postId: string) => {
      try {
        const id = normalizePostId(postId);
        if (!reddit?.removePost) return;
        await reddit.removePost(id);
      } catch (err) {
        console.error("❌ remove failed:", err);
      }
    },

    lock: async (postId: string) => {
      try {
        const id = normalizePostId(postId);
        if (!reddit?.lockPost) return;
        await reddit.lockPost(id);
      } catch (err) {
        console.error("❌ lock failed:", err);
      }
    },

    comment: async (postId: string, text: string) => {
      try {
        const id = normalizePostId(postId);
        if (!reddit?.submitComment) return;

        await reddit.submitComment({
          id,
          text,
        });
      } catch (err) {
        console.error("❌ comment failed:", err);
      }
    },
  };
}
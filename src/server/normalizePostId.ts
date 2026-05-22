export function normalizePostId(id: any): string {
  if (!id) return "";

  const str = String(id);

  if (str.startsWith("t3_")) return str;

  return `t3_${str}`;
}
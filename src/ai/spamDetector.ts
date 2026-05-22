export type SpamResult = {
  spam: boolean;
  reason: string;
  score: number; // 0 → 1
};

export function detectSpamLinks(text: string): SpamResult {
  if (!text) {
    return { spam: false, reason: "", score: 0 };
  }

  const lower = text.toLowerCase();

  let score = 0;
  const triggers: string[] = [];

  if (lower.includes("http://")) {
    score += 0.5;
    triggers.push("http link");
  }

  if (lower.includes("https://")) {
    score += 0.3;
    triggers.push("https link");
  }

  if (lower.includes("bit.ly")) {
    score += 0.8;
    triggers.push("short link");
  }

  if (lower.includes("free money")) {
    score += 1.0;
    triggers.push("scam phrase");
  }

  const normalized = Math.min(1, score);

  return {
    spam: normalized >= 0.7,
    reason: triggers.length
      ? `Spam triggers: ${triggers.join(", ")}`
      : "",
    score: Number(normalized.toFixed(2))
  };
}
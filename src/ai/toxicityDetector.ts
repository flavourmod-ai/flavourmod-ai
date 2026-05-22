export type ToxicityResult = {
  toxic: boolean;
  score: number; // 0 → 1
  reason?: string;
};

export function detectToxicity(text: string): ToxicityResult {
  const rules = [
    { word: "hate", weight: 0.6 },
    { word: "idiot", weight: 0.8 },
    { word: "stupid", weight: 0.7 }
  ];

  const lower = text.toLowerCase();

  let score = 0;
  const hits: string[] = [];

  for (const r of rules) {
    if (lower.includes(r.word)) {
      score += r.weight;
      hits.push(r.word);
    }
  }

  const normalized = Math.min(1, score);

  return {
    toxic: normalized >= 0.6,
    score: Number(normalized.toFixed(2)),
    reason: hits.length ? `matched: ${hits.join(", ")}` : undefined
  };
}
export function ruleScore(title: string, body: string) {
  let score = 60;

  const text = `${title} ${body}`.toLowerCase();

  /* ============================
     NEGATIVE SIGNALS
  ============================ */

  if (text.includes("buy now") || text.includes("click here")) {
    score -= 25;
  }

  if (text.includes("free money") || text.includes("earn $")) {
    score -= 30;
  }

  if (text.includes("http://") || text.includes("https://")) {
    score -= 15;
  }

  if (text.length < 20) {
    score -= 20;
  }

  /* ============================
     POSITIVE SIGNALS
  ============================ */

  if (text.includes("how to")) {
    score += 10;
  }

  if (text.includes("recipe") || text.includes("guide")) {
    score += 15;
  }

  if (text.length > 200) {
    score += 10;
  }

  /* ============================
     FINAL DECISION
  ============================ */

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 0.6,
    reason: "rule_engine",
  };
}
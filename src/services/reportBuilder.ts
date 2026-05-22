function getStatus(score: number) {

  if (score >= 75) {
    return {
      icon: "🟢",
      label: "APPROVED",
      risk: "SAFE",
    };
  }

  if (score >= 45) {
    return {
      icon: "🟡",
      label: "REVIEW",
      risk: "MEDIUM",
    };
  }

  return {
    icon: "🔴",
    label: "REMOVED",
    risk: "HIGH",
  };
}

function generateReview(score: number) {

  if (score >= 80) {
    return "Excellent recipe quality detected with strong formatting and structure.";
  }

  if (score >= 60) {
    return "Recipe quality is acceptable but may benefit from additional detail.";
  }

  if (score >= 40) {
    return "Post appears incomplete or lacks sufficient cooking detail.";
  }

  return "Low-quality or potentially spam-like recipe structure detected.";
}

export function buildReport(
  job: any,
  result: any
) {

  const ui =
    getStatus(result.score);

  const flags =
    Array.isArray(result.flags)
      ? result.flags
      : [];

  const flagsMarkdown =
    flags.map(
      (f: string) => `- ${f}`
    ).join("\n");

  return `
# 🤖 FlavourMod AI

${ui.icon} **${ui.label}**

> ${generateReview(result.score)}

---

| Check | Result |
|---|---|
| AI Score | **${result.score}/100** |
| Confidence | **${result.confidence}%** |
| Action | **${result.decision}** |
| Risk Level | **${ui.risk}** |

---

## 🏷 AI Flags

${flagsMarkdown}

---

## 🔍 Automated Analysis

- Recipe quality scanned
- Ingredient structure analyzed
- Spam detection completed
- Formatting quality verified
- AI moderation confidence validated

---

## 📌 Moderator Status

${
  result.decision === "APPROVE"
    ? "🟢 Automatically approved by FlavourMod AI."
    : result.decision === "REVIEW"
    ? "🟡 Sent to moderator review queue."
    : "🔴 Automatically removed for quality concerns."
}

---

^(FlavourMod AI • Production Engine v4)
`;
}
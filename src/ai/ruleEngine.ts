export function ruleScore(title: string, body: string, contentType?: string) {
  let score = 60;

  const text = `${title} ${body}`.toLowerCase();
  const flags: string[] = [];

  /* =====================================================
     🔥 STRONG CONTENT TYPE DETECTION (LEVEL 2.5 FIX)
  ===================================================== */

  const hasIngredients =
    text.includes("ingredients") ||
    text.includes("cup") ||
    text.includes("tbsp") ||
    text.includes("tsp");

  const hasCookingSteps =
    text.includes("add") &&
    (text.includes("cook") ||
     text.includes("boil") ||
     text.includes("simmer") ||
     text.includes("heat"));

  const hasFoodContext =
    text.includes("coconut") ||
    text.includes("rice") ||
    text.includes("jaggery") ||
    text.includes("sprout");

  const isRecipe =
    contentType === "recipe" ||
    (hasIngredients && hasCookingSteps && hasFoodContext);

  const isQuestion =
    contentType === "question" ||
    text.includes("?") ||
    text.startsWith("how") ||
    text.startsWith("what") ||
    text.startsWith("why");

  const isSpam =
    contentType === "spam" ||
    text.includes("buy now") ||
    text.includes("click here") ||
    text.includes("free money") ||
    text.includes("earn $");

  const hasLinks =
    text.includes("http://") ||
    text.includes("https://");

  /* =====================================================
     🔥 PROTECTION LAYER (CORE FIX)
  ===================================================== */

  const isProtectedContent = isRecipe || isQuestion;

  /* =====================================================
     NEGATIVE SIGNALS (SAFE MODE)
  ===================================================== */

  if (isSpam) {
    score -= 45;
    flags.push("spam_signal");
  }

  // ONLY penalize links for NON-structured content
  if (hasLinks && !isProtectedContent) {
    score -= 5;
    flags.push("contains_link");
  }

  if (text.length < 15) {
    score -= 25;
    flags.push("too_short");
  }

  /* =====================================================
     POSITIVE SIGNALS
  ===================================================== */

  if (isQuestion) {
    score += 15;
    flags.push("question_content");
  }

  if (isRecipe) {
    score += 30; // stronger reward for structured recipes
    flags.push("recipe_content");
  }

  if (text.length > 120) score += 10;
  if (text.length > 300) score += 5;

  /* =====================================================
     🔥 LEVEL 2.5 SAFETY FLOOR (CRITICAL FIX)
  ===================================================== */

  if (isRecipe) {
    // HARD GUARANTEE: recipes can NEVER be low quality
    score = Math.max(score, 75);
  }

  if (isQuestion) {
    score = Math.max(score, 65);
  }

  /* =====================================================
     FINAL NORMALIZATION
  ===================================================== */

  score = Math.max(5, Math.min(95, score));

  return {
    score,
    confidence: isRecipe ? 0.85 : 0.7,
    reason: isRecipe
      ? "recipe_detected"
      : isQuestion
      ? "question_detected"
      : isSpam
      ? "spam_detected"
      : "rule_engine",
    flags,
  };
}

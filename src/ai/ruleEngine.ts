export function ruleScore(
  title: string,
  body: string,
  contentType?: string
) {
  let score = 60;

  const text = `${title} ${body}`.toLowerCase();
  const flags: string[] = [];

  console.log("\n⚙️ RULE ENGINE STARTED");
  console.log("📝 INPUT TITLE:", title?.slice(0, 60));
  console.log("📄 INPUT BODY LENGTH:", body?.length || 0);
  console.log("🏷️ CONTENT TYPE (from classifier):", contentType);

  /* =====================================================
     🔥 STRONG CONTENT TYPE DETECTION (LEVEL 2.5 CORE)
  ===================================================== */

  const hasIngredients =
    text.includes("ingredients") ||
    text.includes("cup") ||
    text.includes("tbsp") ||
    text.includes("tsp");

  const hasCookingSteps =
    text.includes("add") &&
    (
      text.includes("cook") ||
      text.includes("boil") ||
      text.includes("simmer") ||
      text.includes("heat")
    );

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

  console.log("🔍 DETECTED FLAGS:", {
    isRecipe,
    isQuestion,
    isSpam,
    hasLinks
  });

  /* =====================================================
     🔥 PROTECTION LAYER (CORE SAFETY LOGIC)
  ===================================================== */

  const isProtectedContent = isRecipe || isQuestion;

  /* =====================================================
     🚨 NEGATIVE SIGNALS (CONTROLLED SAFE MODE)
  ===================================================== */

  if (isSpam) {
    score -= 45;
    flags.push("spam_signal");
    console.warn("🚨 Spam detected → heavy penalty applied");
  }

  if (hasLinks && !isProtectedContent) {
    score -= 5;
    flags.push("contains_link");
    console.log("🔗 Link detected in non-protected content → slight penalty");
  }

  if (text.length < 15) {
    score -= 25;
    flags.push("too_short");
    console.log("⚠️ Very short content detected → penalty applied");
  }

  /* =====================================================
     ✅ POSITIVE SIGNALS (QUALITY BOOSTERS)
  ===================================================== */

  if (isQuestion) {
    score += 15;
    flags.push("question_content");
    console.log("❓ Question detected → score boosted");
  }

  if (isRecipe) {
    score += 30;
    flags.push("recipe_content");
    console.log("🍲 Recipe detected → strong quality boost");
  }

  if (text.length > 120) {
    score += 10;
    console.log("📏 Long content → minor boost");
  }

  if (text.length > 300) {
    score += 5;
    console.log("📏 Very long content → extra boost");
  }

  /* =====================================================
     🛡️ LEVEL 2.5 SAFETY FLOOR (CRITICAL FIX)
  ===================================================== */

  if (isRecipe) {
    const before = score;
    score = Math.max(score, 75);
    console.log(`🛡️ Recipe safety floor applied: ${before} → ${score}`);
  }

  if (isQuestion) {
    const before = score;
    score = Math.max(score, 65);
    console.log(`🛡️ Question safety floor applied: ${before} → ${score}`);
  }

  /* =====================================================
     📊 FINAL NORMALIZATION
  ===================================================== */

  score = Math.max(5, Math.min(95, score));

  console.log("📊 FINAL RULE SCORE:", score);
  console.log("🏷️ FINAL FLAGS:", flags);
  console.log("⚙️ RULE REASON:", isRecipe
    ? "recipe_detected"
    : isQuestion
    ? "question_detected"
    : isSpam
    ? "spam_detected"
    : "rule_engine"
  );

  console.log("⚙️ RULE ENGINE COMPLETED\n");

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

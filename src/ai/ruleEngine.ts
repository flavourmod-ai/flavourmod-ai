import type {
  ContentType,
} from "./contentClassifier";

/* =========================================================
   RULE ENGINE
   ---------------------------------------------------------
   Safe deterministic moderation layer
========================================================= */

export function ruleScore(
  title: string,
  body: string,
  contentType?: ContentType
) {

  console.log("\n⚙️ RULE ENGINE STARTED");

  let score = 60;

  const text =
    `${title || ""} ${body || ""}`
      .toLowerCase();

  const flags: string[] = [];

  console.log(
    "🏷️ CONTENT TYPE:",
    contentType
  );

  /* =====================================================
     DETECTION SIGNALS
  ===================================================== */

  const hasIngredients =
    text.includes("ingredients") ||
    text.includes("cup") ||
    text.includes("tbsp") ||
    text.includes("tsp");

  const hasCookingSteps =
    text.includes("cook") ||
    text.includes("boil") ||
    text.includes("bake") ||
    text.includes("mix") ||
    text.includes("fry");

  const hasFoodContext =
    text.includes("pizza") ||
    text.includes("rice") ||
    text.includes("coconut") ||
    text.includes("recipe");

  const isRecipe =
    contentType === "recipe" ||
    (
      hasIngredients &&
      hasCookingSteps
    ) ||
    (
      hasCookingSteps &&
      hasFoodContext
    );

  const isQuestion =
    contentType === "question";

  const isSpam =
    contentType === "spam";

  const hasLinks =
    text.includes("http://") ||
    text.includes("https://");

  console.log(
    "🔍 SIGNALS:",
    {
      isRecipe,
      isQuestion,
      isSpam,
      hasLinks,
    }
  );

  /* =====================================================
     SPAM PENALTIES
  ===================================================== */

  if (isSpam) {

    score -= 45;

    flags.push(
      "spam_detected"
    );

    console.warn(
      "🚨 SPAM PENALTY APPLIED"
    );
  }

  /* =====================================================
     LINK PENALTY
  ===================================================== */

  if (
    hasLinks &&
    !isRecipe &&
    !isQuestion
  ) {

    score -= 5;

    flags.push(
      "contains_link"
    );

    console.log(
      "🔗 LINK PENALTY APPLIED"
    );
  }

  /* =====================================================
     SHORT CONTENT PENALTY
  ===================================================== */

  if (text.length < 15) {

    score -= 25;

    flags.push(
      "too_short"
    );

    console.log(
      "⚠️ SHORT CONTENT PENALTY"
    );
  }

  /* =====================================================
     QUESTION BOOST
  ===================================================== */

  if (isQuestion) {

    score += 15;

    flags.push(
      "question_content"
    );

    console.log(
      "❓ QUESTION BOOST APPLIED"
    );
  }

  /* =====================================================
     RECIPE BOOST
  ===================================================== */

  if (isRecipe) {

    score += 30;

    flags.push(
      "recipe_content"
    );

    console.log(
      "🍲 RECIPE BOOST APPLIED"
    );
  }

  /* =====================================================
     LONG CONTENT BOOST
  ===================================================== */

  if (text.length > 120) {

    score += 10;

    console.log(
      "📏 LONG CONTENT BOOST"
    );
  }

  if (text.length > 300) {

    score += 5;

    console.log(
      "📏 EXTRA LONG CONTENT BOOST"
    );
  }

  /* =====================================================
     SAFETY FLOORS
  ===================================================== */

  if (isRecipe) {

    const before = score;

    score = Math.max(
      score,
      75
    );

    console.log(
      `🛡️ RECIPE SAFETY FLOOR: ${before} → ${score}`
    );
  }

  if (isQuestion) {

    const before = score;

    score = Math.max(
      score,
      65
    );

    console.log(
      `🛡️ QUESTION SAFETY FLOOR: ${before} → ${score}`
    );
  }

  /* =====================================================
     FINAL NORMALIZATION
  ===================================================== */

  score = Math.max(
    5,
    Math.min(95, score)
  );

  console.log(
    "📊 FINAL RULE SCORE:",
    score
  );

  console.log(
    "🏷️ FLAGS:",
    flags
  );

  console.log(
    "⚙️ RULE ENGINE COMPLETE\n"
  );

  return {
    score,

    confidence:
      isRecipe
        ? 0.85
        : isQuestion
        ? 0.8
        : isSpam
        ? 0.95
        : 0.7,

    reason:
      isRecipe
        ? "recipe_detected"
        : isQuestion
        ? "question_detected"
        : isSpam
        ? "spam_detected"
        : "rule_engine",

    flags,
  };
}

/* =========================================================
   CONTENT CLASSIFIER
   ---------------------------------------------------------
   Detects:
   - recipe
   - question
   - spam
   - discussion
========================================================= */

export type ContentType =
  | "recipe"
  | "question"
  | "spam"
  | "discussion"
  | "unknown";

/* =========================================================
   MAIN CLASSIFIER
========================================================= */

export function classifyContent(
  title: string,
  body: string
): ContentType {

  const text =
    `${title || ""} ${body || ""}`
      .toLowerCase()
      .trim();

  console.log("\n🧠 CONTENT CLASSIFIER STARTED");

  /* =====================================================
     RECIPE DETECTION
  ===================================================== */

  const hasIngredients =
    text.includes("ingredients") ||
    text.includes("cup") ||
    text.includes("cups") ||
    text.includes("tbsp") ||
    text.includes("tsp");

  const hasCookingSteps =
    text.includes("cook") ||
    text.includes("boil") ||
    text.includes("bake") ||
    text.includes("fry") ||
    text.includes("heat") ||
    text.includes("mix") ||
    text.includes("add");

  const hasFoodTerms =
    text.includes("rice") ||
    text.includes("chicken") ||
    text.includes("pizza") ||
    text.includes("coconut") ||
    text.includes("jaggery") ||
    text.includes("recipe");

  if (
    (hasIngredients && hasCookingSteps) ||
    (hasCookingSteps && hasFoodTerms)
  ) {

    console.log("🍲 CONTENT TYPE: recipe");

    return "recipe";
  }

  /* =====================================================
     SPAM DETECTION
  ===================================================== */

  const spamSignals = [
    "buy now",
    "click here",
    "free money",
    "earn $",
    "limited offer",
    "subscribe now",
  ];

  const isSpam =
    spamSignals.some((s) =>
      text.includes(s)
    );

  if (isSpam) {

    console.log("🚨 CONTENT TYPE: spam");

    return "spam";
  }

  /* =====================================================
     QUESTION DETECTION
  ===================================================== */

  const isQuestion =
    text.includes("?") ||
    text.startsWith("how") ||
    text.startsWith("what") ||
    text.startsWith("why") ||
    text.startsWith("can");

  if (isQuestion) {

    console.log("❓ CONTENT TYPE: question");

    return "question";
  }

  /* =====================================================
     DEFAULT DISCUSSION
  ===================================================== */

  console.log("💬 CONTENT TYPE: discussion");

  return "discussion";
}

export type ContentType =
  | "recipe"
  | "question"
  | "spam"
  | "discussion"
  | "unknown";

export function classifyContent(title: string, body: string): ContentType {
  const text = `${title} ${body}`.toLowerCase();

  /* ============================
     STRONG RECIPE DETECTION
  ============================ */

  const hasIngredients =
    text.includes("ingredients") ||
    text.includes("cup") ||
    text.includes("tbsp") ||
    text.includes("tsp");

  const hasCookingSteps =
    text.includes("add") &&
    (text.includes("cook") || text.includes("boil") || text.includes("simmer"));

  const hasFoodTerms =
    text.includes("jaggery") ||
    text.includes("coconut") ||
    text.includes("rice") ||
    text.includes("sprout");

  if (hasIngredients && hasCookingSteps && hasFoodTerms) {
    return "recipe";
  }

  /* ============================
     SPAM DETECTION
  ============================ */

  if (
    text.includes("buy now") ||
    text.includes("click here") ||
    text.includes("free money")
  ) {
    return "spam";
  }

  /* ============================
     QUESTION DETECTION
  ============================ */

  if (text.includes("?") || text.startsWith("how")) {
    return "question";
  }

  return "discussion";
}
export type AIScoreResult = {
  score: number;
  confidence: number;
  status: "GOOD" | "FAIR" | "BAD" | "ERROR";
  issues: string[];
  suggestions: string[];
  category: {
    ingredients: number;
    steps: number;
    clarity: number;
    completeness: number;
  };
};

export type ModerationDecision = "APPROVE" | "REMOVE" | "REVIEW";
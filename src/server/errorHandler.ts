export type ErrorType =
  | "AI_ERROR"
  | "QUEUE_ERROR"
  | "REDDIT_ERROR"
  | "SYSTEM_ERROR"
  | "DETECTOR_ERROR";

export function handleError(
  traceId: string,
  type: ErrorType,
  error: unknown,
  context?: any
) {
  const err = {
    type,
    message: String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context
  };

  console.log("❌ ERROR_CAPTURED:", err);

  return err;
}
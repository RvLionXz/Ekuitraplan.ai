export async function fetchWithRetry<T>(
  operation: string,
  fetcher: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error: any) {
      lastError = error;

      const isRetryable =
        error?.code === 503 ||
        error?.status === 503 ||
        error?.code === 429 ||
        error?.status === 429 ||
        (error?.message && error.message.includes("high demand"));

      if (!isRetryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `[retry] ${operation} failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`,
        error.message?.substring(0, 50)
      );

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
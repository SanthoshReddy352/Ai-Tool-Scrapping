export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

export function isRateLimitError(error: any): boolean {
  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    error?.message?.includes('rate limit') ||
    error?.message?.includes('too many requests')
  );
}

export async function handleRateLimit(error: any): Promise<void> {
  if (isRateLimitError(error)) {
    const retryAfter = error?.headers?.['retry-after'] || 60;
    const delay = parseInt(retryAfter) * 1000;
    console.log(`Rate limited, waiting ${delay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

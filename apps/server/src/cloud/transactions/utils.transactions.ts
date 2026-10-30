import { logger } from '@/utils/_core/logger';

/**
 * Retry operation with delay and retries
 * when operation fails
 * This can help handle temporary failures like network issues or concurrency conflicts
 * @param operation
 * @param retries
 * @param delay
 * @returns
 */
export const retryOperation = async (
  operation: () => Promise<any>,
  retries = 3,
  delay = 1000
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    }
    catch (error) {
      logger.warn(`Attempt ${attempt} failed: ${(error as Error).message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
      }
      else {
        throw error; // Rethrow error after all retries
      }
    }
  }
};

/*
 * Example usage of retryOperation:
 * retryOperation(() => placeOrder(productId, quantity))
 * .then(() => console.log('Order placed successfully with retry'))
 * .catch((error) => console.error('Failed after retries:', error.message));
 */

// Circuit breaker states
enum CircuitState {
  CLOSED = 'CLOSED',   // Normal operation
  OPEN = 'OPEN',       // Failing, reject fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerOptions {
  failureThreshold?: number;    // Number of failures before opening
  resetTimeout?: number;        // Time in ms before attempting reset
  halfOpenMaxCalls?: number;    // Max calls to allow in half-open state
  timeout?: number;            // Request timeout in ms
}

interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  lastFailure: Date | null;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  halfOpenCalls: number;
  lastReset: Date;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailure: Date | null = null;
  private totalCalls: number = 0;
  private successfulCalls: number = 0;
  private failedCalls: number = 0;
  private halfOpenCalls: number = 0;
  private lastReset: Date = new Date();

  constructor(
    private readonly options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenMaxCalls: 3,
      timeout: 10000, // 10 seconds
      ...options
    };
  }

  public async execute<T>(
    action: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    this.totalCalls++;

    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        this.failedCalls++;
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this.state === CircuitState.HALF_OPEN && 
        this.halfOpenCalls >= this.options.halfOpenMaxCalls!) {
      this.failedCalls++;
      if (fallback) {
        return fallback();
      }
      throw new Error('Circuit breaker is HALF_OPEN and at max calls');
    }

    try {
      // Add timeout to the action
      const timeout = this.options.timeout || 10000; // Default to 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);
      });

      // Execute with timeout
      const result = await Promise.race([action(), timeoutPromise]);

      this.onSuccess();
      return result as T;

    } catch (error) {
      this.onFailure(error);
      
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.successfulCalls++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionToClosed();
    }
  }

  private onFailure(error: unknown): void {
    this.failedCalls++;
    this.failures++;
    this.lastFailure = new Date();

    if (this.state === CircuitState.HALF_OPEN || 
        this.failures >= this.options.failureThreshold!) {
      this.transitionToOpen();
    }

    console.error(`Circuit breaker failure:`, error);
  }

  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.halfOpenCalls = 0;
    console.warn('Circuit breaker transitioned to OPEN');
  }

  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.halfOpenCalls = 0;
    console.warn('Circuit breaker transitioned to HALF_OPEN');
  }

  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.halfOpenCalls = 0;
    this.lastReset = new Date();
    console.info('Circuit breaker transitioned to CLOSED');
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailure) return true;
    
    const timeSinceLastFailure = Date.now() - this.lastFailure.getTime();
    return timeSinceLastFailure >= this.options.resetTimeout!;
  }

  public getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure,
      totalCalls: this.totalCalls,
      successfulCalls: this.successfulCalls,
      failedCalls: this.failedCalls,
      halfOpenCalls: this.halfOpenCalls,
      lastReset: this.lastReset
    };
  }

  public reset(): void {
    this.transitionToClosed();
  }
} 
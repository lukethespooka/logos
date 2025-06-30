import { CircuitBreaker } from './circuit-breaker.ts';

// Service configuration types
interface ServiceConfig {
  name: string;
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenMaxCalls?: number;
  timeout?: number;
}

// Registry to manage circuit breakers for different services
class ServiceRegistry {
  private static instance: ServiceRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public registerService(config: ServiceConfig): CircuitBreaker {
    if (this.breakers.has(config.name)) {
      return this.breakers.get(config.name)!;
    }

    const breaker = new CircuitBreaker({
      failureThreshold: config.failureThreshold,
      resetTimeout: config.resetTimeout,
      halfOpenMaxCalls: config.halfOpenMaxCalls,
      timeout: config.timeout
    });

    this.breakers.set(config.name, breaker);
    return breaker;
  }

  public getBreaker(serviceName: string): CircuitBreaker | undefined {
    return this.breakers.get(serviceName);
  }

  public getAllStats(): Record<string, ReturnType<CircuitBreaker['getStats']>> {
    const stats: Record<string, ReturnType<CircuitBreaker['getStats']>> = {};
    
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }
    
    return stats;
  }

  public resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Default service configurations
export const DEFAULT_SERVICES: ServiceConfig[] = [
  {
    name: 'google-oauth',
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    halfOpenMaxCalls: 2,
    timeout: 5000 // 5 seconds
  },
  {
    name: 'gmail-api',
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    halfOpenMaxCalls: 3,
    timeout: 10000 // 10 seconds
  },
  {
    name: 'calendar-api',
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    halfOpenMaxCalls: 3,
    timeout: 10000 // 10 seconds
  },
  {
    name: 'openai-api',
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    halfOpenMaxCalls: 2,
    timeout: 15000 // 15 seconds
  },
  {
    name: 'local-ai',
    failureThreshold: 2,
    resetTimeout: 15000, // 15 seconds
    halfOpenMaxCalls: 1,
    timeout: 20000 // 20 seconds
  }
];

// Initialize registry with default services
const registry = ServiceRegistry.getInstance();
DEFAULT_SERVICES.forEach(config => registry.registerService(config));

export { ServiceRegistry, type ServiceConfig }; 
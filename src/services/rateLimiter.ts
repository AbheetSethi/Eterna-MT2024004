export class SimpleRateLimiter {
  private lastCall: Map<string, number> = new Map();
  private delays: Map<string, number> = new Map();
  private baseDelay: number = 250; // 250ms between calls

  async throttle(apiName: string): Promise<void> {
    const now = Date.now();
    const last = this.lastCall.get(apiName) || 0;
    const currentDelay = this.delays.get(apiName) || this.baseDelay;

    const timeSinceLastCall = now - last;
    if (timeSinceLastCall < currentDelay) {
      const waitTime = currentDelay - timeSinceLastCall;
      await this.sleep(waitTime);
    }

    this.lastCall.set(apiName, Date.now());
  }

  handleRateLimit(apiName: string): void {
    const currentDelay = this.delays.get(apiName) || this.baseDelay;
    const newDelay = Math.min(currentDelay * 2, 8000); // Max 8s
    this.delays.set(apiName, newDelay);
    console.log(`Rate limit hit for ${apiName}, backing off to ${newDelay}ms`);
  }

  resetDelay(apiName: string): void {
    this.delays.set(apiName, this.baseDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const rateLimiter = new SimpleRateLimiter();

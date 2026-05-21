import { TrustVerificationResult, TrustVerificationConfig } from "../types";

/**
 * Default configuration for trust verification
 */
const DEFAULT_CONFIG: Required<TrustVerificationConfig> = {
  minimumTrustScore: 0.6,
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes
  observatoryBaseUrl: "https://dominion-observatory.sgdata.workers.dev",
  enabled: true,
};

/**
 * Cache entry for trust scores
 */
interface CacheEntry {
  result: TrustVerificationResult;
  expiresAt: number;
}

/**
 * Dominion Observatory trust verification guard.
 *
 * Checks the behavioral trust score of an MCP server before allowing
 * payment or tool execution. This prevents agents from spending credits
 * on calls to servers that have been flagged as untrusted by the
 * Dominion Observatory network (14,820+ servers monitored).
 *
 * Scores are cached for a configurable TTL (default 5 minutes) to
 * avoid redundant network requests on repeated tool calls.
 *
 * @class TrustVerification
 */
export class TrustVerification {
  private config: Required<TrustVerificationConfig>;
  private cache: Map<string, CacheEntry> = new Map();

  constructor(config?: Partial<TrustVerificationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Verifies whether an MCP server meets the minimum trust threshold.
   *
   * @param serverUrl - The URL or identifier of the MCP server to verify
   * @returns Promise resolving to the trust verification result
   */
  async verifyServer(serverUrl: string): Promise<TrustVerificationResult> {
    if (!this.config.enabled) {
      return {
        trusted: true,
        score: 1.0,
        serverUrl,
        cached: false,
        message: "Trust verification is disabled",
      };
    }

    // Check cache first
    const cached = this.getCached(serverUrl);
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const result = await this.fetchTrustScore(serverUrl);
      this.setCache(serverUrl, result);
      return result;
    } catch (error) {
      // On network errors, fail open with a warning so that transient
      // Observatory outages don't block all payments. Callers can
      // inspect the message to decide whether to proceed.
      const fallback: TrustVerificationResult = {
        trusted: true,
        score: -1,
        serverUrl,
        cached: false,
        message: `Trust verification unavailable: ${
          error instanceof Error ? error.message : String(error)
        }. Proceeding with caution.`,
      };
      this.setCache(serverUrl, fallback);
      return fallback;
    }
  }

  /**
   * Verifies trust and throws if the server is untrusted.
   * Convenience wrapper for use as a payment guard.
   *
   * @param serverUrl - The URL or identifier of the MCP server
   * @throws Error if the server does not meet the minimum trust score
   */
  async requireTrusted(serverUrl: string): Promise<TrustVerificationResult> {
    const result = await this.verifyServer(serverUrl);
    if (!result.trusted) {
      throw new Error(
        `MCP server "${serverUrl}" failed trust verification ` +
          `(score: ${result.score}, minimum: ${this.config.minimumTrustScore}). ` +
          `Payment blocked to protect against untrusted servers.`
      );
    }
    return result;
  }

  /**
   * Clears the entire trust score cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Removes a single server from the cache, forcing a fresh lookup
   * on the next verification.
   */
  invalidate(serverUrl: string): void {
    this.cache.delete(this.normalizeUrl(serverUrl));
  }

  /**
   * Returns the current configuration (read-only copy).
   */
  getConfig(): Readonly<Required<TrustVerificationConfig>> {
    return { ...this.config };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async fetchTrustScore(
    serverUrl: string
  ): Promise<TrustVerificationResult> {
    const endpoint = `${this.config.observatoryBaseUrl}/api/v1/trust-score?server=${encodeURIComponent(serverUrl)}`;

    // Use dynamic import so the library works in both Node and edge runtimes
    // without requiring axios at the top level.
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(
        `Observatory returned HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = (await response.json()) as {
      trust_score?: number;
      score?: number;
      status?: string;
    };

    const score = data.trust_score ?? data.score ?? 0;
    const trusted = score >= this.config.minimumTrustScore;

    return {
      trusted,
      score,
      serverUrl,
      cached: false,
      message: trusted
        ? `Server trusted (score: ${score})`
        : `Server untrusted (score: ${score}, minimum: ${this.config.minimumTrustScore})`,
    };
  }

  private getCached(serverUrl: string): TrustVerificationResult | null {
    const key = this.normalizeUrl(serverUrl);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.result;
  }

  private setCache(serverUrl: string, result: TrustVerificationResult): void {
    const key = this.normalizeUrl(serverUrl);
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.config.cacheTtlMs,
    });
  }

  private normalizeUrl(url: string): string {
    return url.toLowerCase().replace(/\/+$/, "");
  }
}

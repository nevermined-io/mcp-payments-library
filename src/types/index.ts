/**
 * Configuration interface for Nevermined MCP Library
 * @type NeverminedConfig
 */
export type NeverminedConfig = {
  /** API key for Nevermined services */
  apiKey: string;
  /** Environment to use (testing, staging, production) */
  environment: string;
  /** DID of the subscription plan */
  planDid: string;
  /** DID of the agent providing the service */
  agentDid: string;
};

/**
 * Result of a plan purchase operation
 * @interface PurchaseResult
 */
export type PurchaseResult = {
  /** Whether the purchase was successful */
  success: boolean;
  /** Optional message with additional details */
  message?: string;
};

/**
 * Configuration for accessing Nevermined services
 * @interface ServiceAccessConfig
 */
export type ServiceAccessConfig = {
  /** URI for the Nevermined proxy service */
  neverminedProxyUri: string;
  /** Access token for authentication */
  accessToken: string;
};

/**
 * Configuration for Dominion Observatory trust verification.
 * All fields are optional — sensible defaults are provided.
 * @interface TrustVerificationConfig
 */
export type TrustVerificationConfig = {
  /** Minimum trust score (0-1) required to allow payment. Default: 0.6 */
  minimumTrustScore?: number;
  /** How long to cache trust scores in milliseconds. Default: 300000 (5 min) */
  cacheTtlMs?: number;
  /** Base URL of the Dominion Observatory API */
  observatoryBaseUrl?: string;
  /** Whether trust verification is enabled. Default: true */
  enabled?: boolean;
};

/**
 * Result of a trust verification check against Dominion Observatory.
 * @interface TrustVerificationResult
 */
export type TrustVerificationResult = {
  /** Whether the server meets the minimum trust threshold */
  trusted: boolean;
  /** The raw trust score returned by the Observatory (0-1, or -1 if unavailable) */
  score: number;
  /** The server URL that was checked */
  serverUrl: string;
  /** Whether this result was served from cache */
  cached: boolean;
  /** Human-readable explanation */
  message: string;
};

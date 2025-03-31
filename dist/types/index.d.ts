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

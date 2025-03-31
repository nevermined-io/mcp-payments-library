import { NeverminedConfig, PurchaseResult, ServiceAccessConfig } from "../types";
/**
 * Main library class for integrating Nevermined payments with MCP
 * @class NeverminedMCP
 */
export declare class NeverminedMCP {
    private payments;
    /**
     * Creates a new instance of NeverminedMCP
     * @param config - Configuration for the library
     */
    constructor(config: NeverminedConfig);
    /**
     * Purchases a subscription plan
     * @param planDid - DID of the plan to purchase
     * @returns Promise resolving to purchase result
     */
    purchasePlan(planDid: string): Promise<PurchaseResult>;
    /**
     * Checks if user has sufficient balance for the plan
     * @param planDid - DID of the plan to check
     * @param agentDid - DID of the agent providing the service
     * @returns Promise resolving to boolean indicating balance status
     */
    checkBalance(planDid: string, agentDid: string): Promise<boolean>;
    /**
     * Gets service access configuration for a given agent
     * @param agentDid - DID of the agent
     * @returns Promise resolving to service access configuration
     */
    getServiceAccess(agentDid: string): Promise<ServiceAccessConfig>;
    /**
     * Extracts the required minimum balance from a DDO
     * @param ddo - The DDO object to extract from
     * @returns number - The minimum required balance
     */
    private extractRequiredBalance;
}

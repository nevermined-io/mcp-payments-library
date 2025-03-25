import {
  NeverminedConfig,
  PurchaseResult,
  ServiceAccessConfig,
} from "../types";
import { validateConfig } from "./config";
import { Payments, EnvironmentName } from "@nevermined-io/payments";

/**
 * Main library class for integrating Nevermined payments with MCP
 * @class NeverminedMCP
 */
export class NeverminedMCP {
  private payments: Payments;

  /**
   * Creates a new instance of NeverminedMCP
   * @param config - Configuration for the library
   */
  constructor(config: NeverminedConfig) {
    validateConfig(config);

    this.payments = Payments.getInstance({
      nvmApiKey: config.apiKey,
      environment: config.environment as EnvironmentName,
    });
  }

  /**
   * Purchases a subscription plan
   * @param planDid - DID of the plan to purchase
   * @returns Promise resolving to purchase result
   */
  async purchasePlan(planDid: string): Promise<PurchaseResult> {
    try {
      const purchaseResult = await this.payments.orderPlan(planDid);

      if (!purchaseResult || !purchaseResult.success) {
        return {
          success: false,
          message: "Failed to create order",
        };
      }

      return {
        success: true,
        message: `Plan ordered successfully. Agreement ID: ${purchaseResult.agreementId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Checks if user has sufficient balance for the plan
   * @param planDid - DID of the plan to check
   * @param agentDid - DID of the agent providing the service
   * @returns Promise resolving to boolean indicating balance status
   */
  async checkBalance(planDid: string, agentDid: string): Promise<boolean> {
    try {
      const balanceResult = await this.payments.getPlanBalance(planDid);
      const agentDDO = await this.payments.getAssetDDO(agentDid);
      const minRequired = this.extractRequiredBalance(agentDDO);

      return Number(balanceResult.balance) >= minRequired;
    } catch (error) {
      console.error("Error checking balance:", error);
      return false;
    }
  }

  /**
   * Gets service access configuration for a given agent
   * @param agentDid - DID of the agent
   * @returns Promise resolving to service access configuration
   */
  async getServiceAccess(agentDid: string): Promise<ServiceAccessConfig> {
    try {
      const accessConfig = await this.payments.query.getServiceAccessConfig(
        agentDid
      );

      if (!accessConfig || !accessConfig.accessToken) {
        throw new Error("Failed to get service access configuration");
      }

      return accessConfig;
    } catch (error) {
      throw new Error(
        `Error getting service access: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Extracts the required minimum balance from a DDO
   * @param ddo - The DDO object to extract from
   * @returns number - The minimum required balance
   */
  private extractRequiredBalance(ddo: any): number {
    return (
      ddo?.service?.[2]?.attributes?.main?.nftAttributes?.minCreditsRequired ||
      0
    );
  }
}

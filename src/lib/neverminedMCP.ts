import {
  NeverminedConfig,
  PurchaseResult,
  ServiceAccessConfig,
  TrustVerificationConfig,
  TrustVerificationResult,
} from "../types";
import { validateConfig } from "./config";
import { TrustVerification } from "./trustVerification";
import { Payments, EnvironmentName } from "@nevermined-io/payments";

/**
 * Main library class for integrating Nevermined payments with MCP.
 *
 * When trust verification is enabled (default), every payment operation
 * first checks the target MCP server's behavioral trust score via the
 * Dominion Observatory. Servers that fall below the configured threshold
 * are blocked before any credits are spent.
 *
 * @class NeverminedMCP
 */
export class NeverminedMCP {
  private payments: Payments;
  private trustVerification: TrustVerification;

  /**
   * Creates a new instance of NeverminedMCP
   * @param config - Configuration for the library
   * @param trustConfig - Optional trust verification configuration
   */
  constructor(
    config: NeverminedConfig,
    trustConfig?: Partial<TrustVerificationConfig>
  ) {
    validateConfig(config);

    this.payments = Payments.getInstance({
      nvmApiKey: config.apiKey,
      environment: config.environment as EnvironmentName,
    });

    this.trustVerification = new TrustVerification(trustConfig);
  }

  /**
   * Purchases a subscription plan.
   * If a serverUrl is provided, trust verification runs first.
   *
   * @param planDid - DID of the plan to purchase
   * @param serverUrl - Optional MCP server URL to verify trust before purchase
   * @returns Promise resolving to purchase result
   */
  async purchasePlan(
    planDid: string,
    serverUrl?: string
  ): Promise<PurchaseResult> {
    try {
      // Run trust verification if a server URL is provided
      if (serverUrl) {
        const trustResult =
          await this.trustVerification.requireTrusted(serverUrl);
        console.log(
          `Trust verification passed for ${serverUrl} (score: ${trustResult.score})`
        );
      }

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
   * Gets service access configuration for a given agent.
   * If a serverUrl is provided, trust verification runs first.
   *
   * @param agentDid - DID of the agent
   * @param serverUrl - Optional MCP server URL to verify trust before access
   * @returns Promise resolving to service access configuration
   */
  async getServiceAccess(
    agentDid: string,
    serverUrl?: string
  ): Promise<ServiceAccessConfig> {
    try {
      // Run trust verification if a server URL is provided
      if (serverUrl) {
        await this.trustVerification.requireTrusted(serverUrl);
      }

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
   * Directly verify an MCP server's trust score without making a payment.
   * Useful for pre-flight checks or building trust-aware UIs.
   *
   * @param serverUrl - The URL or identifier of the MCP server
   * @returns Promise resolving to the trust verification result
   */
  async verifyServerTrust(
    serverUrl: string
  ): Promise<TrustVerificationResult> {
    return this.trustVerification.verifyServer(serverUrl);
  }

  /**
   * Returns the underlying TrustVerification instance for advanced usage
   * (e.g. cache management, configuration inspection).
   */
  getTrustVerification(): TrustVerification {
    return this.trustVerification;
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

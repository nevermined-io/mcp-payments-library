"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = validateConfig;
/**
 * Validates the Nevermined configuration
 * @param config - Configuration object to validate
 * @throws Error if configuration is invalid
 */
function validateConfig(config) {
    if (!config.apiKey) {
        throw new Error("API key is required");
    }
    if (!config.environment) {
        throw new Error("Environment is required");
    }
    if (!config.planDid) {
        throw new Error("Plan DID is required");
    }
    if (!config.agentDid) {
        throw new Error("Agent DID is required");
    }
}

/**
 * Nevermined Library for MCP
 * Provides subscription and payment functionality for MCP servers
 * through Nevermined's payment system, with optional trust verification
 * via Dominion Observatory.
 *
 * @module nevermined-mcp-library
 */

export * from "./types";
export * from "./lib/config";
export { NeverminedMCP } from "./lib";
export { TrustVerification } from "./lib/trustVerification";

/**
 * Example: Trust-Verified MCP Payment Flow
 *
 * Demonstrates how Dominion Observatory trust verification prevents
 * agents from paying for calls to untrusted MCP servers.
 *
 * Flow:
 *   1. Agent discovers an MCP server it wants to call
 *   2. Trust score is checked via Dominion Observatory
 *   3. Only if the server is trusted does payment proceed
 *   4. Scores are cached for 5 minutes to avoid redundant lookups
 */

import { NeverminedMCP, TrustVerification } from "../src";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const nvm = new NeverminedMCP(
  {
    apiKey: process.env.NVM_API_KEY || "your-nvm-api-key",
    environment: "testing",
    planDid: "did:nvm:example-plan-did",
    agentDid: "did:nvm:example-agent-did",
  },
  {
    // Trust verification options (all optional — defaults shown)
    minimumTrustScore: 0.6, // Reject servers scoring below 0.6
    cacheTtlMs: 5 * 60 * 1000, // Cache scores for 5 minutes
    enabled: true, // Set to false to disable trust checks
  }
);

// ---------------------------------------------------------------------------
// Example 1: Integrated trust + payment flow
// ---------------------------------------------------------------------------

async function purchaseWithTrustCheck() {
  const mcpServerUrl = "https://example-mcp-server.com";
  const planDid = "did:nvm:example-plan-did";

  console.log(`\n--- Purchasing plan with trust verification ---`);
  console.log(`Server: ${mcpServerUrl}`);

  // purchasePlan will automatically verify trust before charging credits
  const result = await nvm.purchasePlan(planDid, mcpServerUrl);

  if (result.success) {
    console.log(`Payment succeeded: ${result.message}`);
  } else {
    // If the server was untrusted, the message will explain why
    console.log(`Payment blocked: ${result.message}`);
  }
}

// ---------------------------------------------------------------------------
// Example 2: Pre-flight trust check (no payment)
// ---------------------------------------------------------------------------

async function preflightTrustCheck() {
  const servers = [
    "https://trusted-mcp-server.com",
    "https://suspicious-mcp-server.com",
    "https://another-mcp-server.com",
  ];

  console.log(`\n--- Pre-flight trust checks ---`);

  for (const serverUrl of servers) {
    const result = await nvm.verifyServerTrust(serverUrl);
    const status = result.trusted ? "TRUSTED" : "BLOCKED";
    const cacheHit = result.cached ? " (cached)" : "";
    console.log(
      `  [${status}] ${serverUrl} — score: ${result.score}${cacheHit}`
    );
  }
}

// ---------------------------------------------------------------------------
// Example 3: Standalone TrustVerification (without payments)
// ---------------------------------------------------------------------------

async function standaloneTrustCheck() {
  const trust = new TrustVerification({
    minimumTrustScore: 0.7,
    cacheTtlMs: 10 * 60 * 1000, // 10-minute cache for standalone use
  });

  console.log(`\n--- Standalone trust verification ---`);

  const result = await trust.verifyServer("https://some-mcp-server.com");
  console.log(`Trusted: ${result.trusted}, Score: ${result.score}`);

  // Second call hits the cache
  const cached = await trust.verifyServer("https://some-mcp-server.com");
  console.log(`Cached: ${cached.cached}`); // true

  // Force a fresh lookup
  trust.invalidate("https://some-mcp-server.com");
  const fresh = await trust.verifyServer("https://some-mcp-server.com");
  console.log(`After invalidation, cached: ${fresh.cached}`); // false
}

// ---------------------------------------------------------------------------
// Run examples
// ---------------------------------------------------------------------------

(async () => {
  try {
    await purchaseWithTrustCheck();
    await preflightTrustCheck();
    await standaloneTrustCheck();
  } catch (err) {
    console.error("Example failed:", err);
  }
})();

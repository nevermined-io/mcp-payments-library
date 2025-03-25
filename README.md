[![banner](https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png)](https://nevermined.io)

# Nevermined MCP Library

This library integrates Nevermined payment and subscription services with MCP servers, enabling credit management and authentication.

## Installation

To install the library:

```bash
npm install @nevermined-io/mcp-library
```

## Dependencies

This library requires:

- `@nevermined-io/payments`: ^0.9.3
- `axios`: ^1.0.0 (peer dependency)

## Configuration

Configure the library with the following parameters:

```typescript
import { NeverminedMCP, NeverminedConfig } from '@nevermined-io/mcp-library';

const config: NeverminedConfig = {
  apiKey: process.env.NVM_API_KEY || '',
  environment: 'testing', // Options: 'testing', 'staging', 'production'
  planDid: 'did:nv:your-plan-did',
  agentDid: 'did:nv:your-agent-did'
};

const neverminedMcp = new NeverminedMCP(config);
```

## Usage

### Purchase a Subscription Plan

```typescript
const result = await neverminedMcp.purchasePlan(planDid);
// Returns: { success: boolean, message?: string }
```

### Check User Balance

```typescript
const hasBalance = await neverminedMcp.checkBalance(planDid, agentDid);
// Returns: boolean indicating if sufficient balance exists
```

### Get Service Access Configuration

```typescript
const accessConfig = await neverminedMcp.getServiceAccess(agentDid);
// Returns: { neverminedProxyUri: string, accessToken: string }
```

## Integration with MCP Server

Example of integration with an MCP server:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NeverminedMCP, NeverminedConfig } from '@nevermined-io/mcp-library';
import { z } from "zod";

// Initialize Nevermined library
const neverminedConfig = {
  apiKey: process.env.NVM_API_KEY!,
  environment: "testing",
  planDid: "did:nv:your-plan-did",
  agentDid: "did:nv:your-agent-did"
};
const neverminedMcp = new NeverminedMCP(neverminedConfig);

// Initialize MCP server
const server = new McpServer({
  name: "your-service",
  version: "1.0.0",
});

// Add tool requiring payment verification
server.tool(
  "paid_tool",
  "Description of your paid tool",
  {
    param1: z.string().describe("Parameter description"),
  },
  async ({ param1 }) => {
    // Check balance
    const hasBalance = await neverminedMcp.checkBalance(
      neverminedConfig.planDid,
      neverminedConfig.agentDid
    );

    if (!hasBalance) {
      return {
        content: [
          {
            type: "text",
            text: "Insufficient credits. Please purchase a plan."
          }
        ],
        metadata: {
          needsPurchase: true,
          planDid: neverminedConfig.planDid,
        },
      };
    }

    // Proceed with tool functionality...
  }
);

/**
 * Tool for purchasing a subscription plan
 * Handles the purchase flow for Nevermined credits
 */
server.tool(
  "purchase_plan",
  "Purchase a subscription plan",
  {
    planDid: z.string().describe("DID of the plan to purchase"),
  },
  async ({ planDid }: { planDid: string }) => {
    try {
      const purchaseResult = await neverminedMcp.purchasePlan(planDid);

      if (!purchaseResult.success) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error purchasing plan: ${
                purchaseResult.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text:
              purchaseResult.message ||
              "Plan purchased successfully. You can now call your MCP tool.",
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error in plan purchase: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);
```

License
-------

```
Copyright 2025 Nevermined AG

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 
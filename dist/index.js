"use strict";
/**
 * Nevermined Library for MCP
 * Provides subscription and payment functionality for MCP servers
 * through Nevermined's payment system.
 *
 * @module nevermined-mcp-library
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeverminedMCP = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./lib/config"), exports);
var lib_1 = require("./lib");
Object.defineProperty(exports, "NeverminedMCP", { enumerable: true, get: function () { return lib_1.NeverminedMCP; } });

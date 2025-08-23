#!/usr/bin/env node

/**
 * Debug Token Usage - Shows what Steve actually sends to Gemini
 * This script simulates what happens when you type "hello" to Steve
 */

// Simulate the system prompt (714 lines from prompts.ts)
const SYSTEM_PROMPT_START = `
You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser. It does come with a shell that emulates zsh. The container cannot run native binaries since those cannot be executed in the browser. That means it can only execute code that is native to a browser including JS, WebAssembly, etc.

  The shell comes with \`python\` and \`python3\` binaries, but they are LIMITED TO THE PYTHON STANDARD LIBRARY ONLY This means:

    - There is NO \`pip\` support! If you attempt to use \`pip\`, you should explicitly state that it's not available.
    - CRITICAL: Third-party libraries cannot be installed or imported.
    - Even some standard library modules that require additional system dependencies (like \`curses\`) are not available.
    - Only modules from the core Python standard library can be used.

  Additionally, there is no \`g++\` or any C/C++ compiler available. WebContainer CANNOT run native binaries or compile C/C++ code!

  Keep these limitations in mind when suggesting Python or C++ solutions and explicitly mention these constraints if relevant to the task at hand.

  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.

  IMPORTANT: Git is NOT available.

  IMPORTANT: WebContainer CANNOT execute diff or patch editing so always write your code in full no partial/diff update

  IMPORTANT: Prefer writing Node.js scripts instead of shell scripts. The environment doesn't fully support shell scripts, so use Node.js for scripting tasks whenever possible!

  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. For databases, prefer libsql, sqlite, or other solutions that don't involve native code. WebContainer CANNOT execute arbitrary native binaries.

  CRITICAL: You must never use the "bundled" type when creating artifacts, This is non-negotiable and used internally only.

  CRITICAL: You MUST always follow the <boltArtifact> format.
`;

// Rough token estimation (1 token ≈ 4 characters for English text)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Simulate what gets sent to Gemini
const userMessage = "hello";
const systemPromptSize = "... [CONTINUES FOR 714 LINES WITH COMPREHENSIVE INSTRUCTIONS] ...";

console.log("🔍 STEVE TOKEN USAGE ANALYSIS");
console.log("=" .repeat(50));
console.log("");

console.log("📤 WHAT STEVE SENDS TO GEMINI:");
console.log("");
console.log("1️⃣ SYSTEM PROMPT (sent with EVERY message):");
console.log(`   First 50 lines: ${SYSTEM_PROMPT_START.slice(0, 500)}...`);
console.log(`   ${systemPromptSize}`);
console.log(`   📏 Estimated size: ~1,500+ tokens`);
console.log("");

console.log("2️⃣ YOUR MESSAGE:");
console.log(`   Content: "${userMessage}"`);
console.log(`   📏 Estimated size: ${estimateTokens(userMessage)} tokens`);
console.log("");

console.log("📊 TOTAL PER MESSAGE:");
console.log(`   System Prompt: ~1,500 tokens`);
console.log(`   Your Message: ~${estimateTokens(userMessage)} tokens`);
console.log(`   🔥 TOTAL SENT: ~${1500 + estimateTokens(userMessage)} tokens`);
console.log("");

console.log("💰 TOKEN ECONOMICS:");
console.log("   - Even 'hi' = ~1,503 tokens to Gemini");
console.log("   - System prompt rebuilds EVERY message");
console.log("   - No conversation memory optimization");
console.log("   - High token cost but ensures consistent responses");
console.log("");

console.log("🧠 WHAT THIS MEANS:");
console.log("   ✅ Consistent, production-grade responses");
console.log("   ✅ Full context awareness every time");
console.log("   ✅ Proper WebContainer constraint handling");
console.log("   ❌ High token consumption");
console.log("   ❌ Expensive for simple messages");
console.log("");

console.log("🎯 THE SYSTEM PROMPT INCLUDES:");
console.log("   • WebContainer environment constraints");
console.log("   • Python/Node.js limitations");
console.log("   • Database instructions (Supabase)");
console.log("   • Artifact formatting rules");
console.log("   • Security and best practices");
console.log("   • File operation guidelines");
console.log("   • UI component standards");
console.log("   • Code generation rules");
console.log("");

console.log("💡 KEY INSIGHT:");
console.log("   Steve prioritizes response quality over token efficiency");
console.log("   This is why even simple messages trigger comprehensive responses");
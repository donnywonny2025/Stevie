#!/usr/bin/env node

/**
 * EXACT GEMINI PAYLOAD - What Steve sends when you type "hi"
 */

console.log("🎯 EXACT PAYLOAD SENT TO GEMINI API");
console.log("=" .repeat(60));
console.log("");

console.log("📍 API Endpoint:");
console.log("   POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent");
console.log("");

console.log("📦 JSON Payload Structure:");
console.log("");

const examplePayload = {
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "hi"
        }
      ]
    }
  ],
  "systemInstruction": {
    "parts": [
      {
        "text": "You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.\n\n<system_constraints>\n  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser. It does come with a shell that emulates zsh. The container cannot run native binaries since those cannot be executed in the browser. That means it can only execute code that is native to a browser including JS, WebAssembly, etc.\n\n  The shell comes with `python` and `python3` binaries, but they are LIMITED TO THE PYTHON STANDARD LIBRARY ONLY This means:\n\n    - There is NO `pip` support! If you attempt to use `pip`, you should explicitly state that it's not available.\n    - CRITICAL: Third-party libraries cannot be installed or imported.\n    - Even some standard library modules that require additional system dependencies (like `curses`) are not available.\n    - Only modules from the core Python standard library can be used.\n\n  Additionally, there is no `g++` or any C/C++ compiler available. WebContainer CANNOT run native binaries or compile C/C++ code!\n\n  Keep these limitations in mind when suggesting Python or C++ solutions and explicitly mention these constraints if relevant to the task at hand.\n\n  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.\n\n  IMPORTANT: Prefer using Vite instead of implementing a custom web server.\n\n  IMPORTANT: Git is NOT available.\n\n  IMPORTANT: WebContainer CANNOT execute diff or patch editing so always write your code in full no partial/diff update\n\n  IMPORTANT: Prefer writing Node.js scripts instead of shell scripts. The environment doesn't fully support shell scripts, so use Node.js for scripting tasks whenever possible!\n\n  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. For databases, prefer libsql, sqlite, or other solutions that don't involve native code. WebContainer CANNOT execute arbitrary native binaries.\n\n  CRITICAL: You must never use the \"bundled\" type when creating artifacts, This is non-negotiable and used internally only.\n\n  CRITICAL: You MUST always follow the <boltArtifact> format.\n\n[... CONTINUES FOR 700+ MORE LINES WITH DATABASE INSTRUCTIONS, UI RULES, CODING STANDARDS, etc. ...]"
      }
    ]
  },
  "generationConfig": {
    "maxOutputTokens": 8000,
    "temperature": 0.7
  }
};

console.log(JSON.stringify(examplePayload, null, 2));

console.log("");
console.log("🔍 BREAKDOWN:");
console.log("");
console.log("📝 Your Message ('hi'):");
console.log("   Location: contents[0].parts[0].text");
console.log("   Size: 2 characters = ~1 token");
console.log("");
console.log("📋 System Prompt:");
console.log("   Location: systemInstruction.parts[0].text");
console.log("   Size: ~6,000+ characters = ~1,500+ tokens");
console.log("   Content: Role definition, WebContainer constraints, database rules, UI guidelines, coding standards");
console.log("");
console.log("⚙️ Configuration:");
console.log("   maxOutputTokens: 8000");
console.log("   temperature: 0.7");
console.log("");
console.log("💰 TOKEN COST:");
console.log("   Input tokens: ~1,501 (1,500 system + 1 user message)");
console.log("   Output tokens: Variable based on Steve's response");
console.log("");
console.log("🎯 KEY INSIGHT:");
console.log("   The system prompt NEVER changes regardless of what you type!");
console.log("   'hi', 'create a React app', 'help me debug' - same 1,500+ token system prompt");
console.log("   Only your message in 'contents' changes");
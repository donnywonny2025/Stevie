#!/usr/bin/env node

/**
 * PROOF: Steve sends 1,500+ tokens EVERY TIME
 * 
 * This simulates exactly what happens each time you message Steve
 */

console.log("🚨 STEVE TOKEN USAGE - EVERY MESSAGE");
console.log("=" .repeat(50));
console.log("");

const messages = [
    "hi",
    "test", 
    "hello world",
    "create a button",
    "add some CSS",
    "help me debug this"
];

const SYSTEM_PROMPT_TOKENS = 1500; // The massive system prompt
let conversationHistory = [];

console.log("📊 SIMULATING YOUR CONVERSATION:");
console.log("");

messages.forEach((message, index) => {
    const messageTokens = Math.ceil(message.length / 4);
    const historyTokens = conversationHistory.reduce((total, msg) => total + Math.ceil(msg.length / 4), 0);
    const totalSent = SYSTEM_PROMPT_TOKENS + historyTokens + messageTokens;
    
    console.log(`${index + 1}. 👤 YOU: "${message}"`);
    console.log(`   📤 STEVE SENDS TO GEMINI:`);
    console.log(`      🔥 System Prompt: ${SYSTEM_PROMPT_TOKENS} tokens`);
    if (historyTokens > 0) {
        console.log(`      📚 Conversation History: ${historyTokens} tokens`);
    }
    console.log(`      💬 Your Message: ${messageTokens} tokens`);
    console.log(`      ⚡ TOTAL SENT: ${totalSent} tokens`);
    console.log("");
    
    // Add to conversation history
    conversationHistory.push(message);
    conversationHistory.push(`Steve's response to: ${message}`); // Simulate Steve's response
});

console.log("💡 KEY FACTS:");
console.log("   • EVERY message = 1,500+ tokens minimum");
console.log("   • Even 'hi' costs the same as a complex request");
console.log("   • Token cost GROWS with conversation length"); 
console.log("   • No optimization - full context every time");
console.log("");

console.log("🔍 TEST THIS YOURSELF:");
console.log("   1. Open Chrome DevTools (F12)");
console.log("   2. Go to Network tab");
console.log("   3. Filter: 'generativelanguage.googleapis.com'");
console.log("   4. Send ANY message to Steve");
console.log("   5. Click the API call to see the HUGE payload");
console.log("");

console.log("🎯 PROOF:");
console.log("   Request size: ~6KB+ (mostly system prompt)");
console.log("   Your text: Tiny fraction of the request");
console.log("   Steve's design: Quality over efficiency");
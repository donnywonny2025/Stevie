# 🔍 Real-Time Steve Token Monitoring Guide

## What to Watch in Chrome DevTools

### 1. Network Tab - API Calls
When you send a message to Steve, watch for:
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent`
- **Method**: POST
- **Size**: Shows the actual payload size being sent

### 2. Console Tab - Token Logging
Look for these log messages:
```
INFO LLMManager Sending llm call to Google with model gemini-2.5-pro
INFO stream-text Max tokens for model gemini-2.5-pro is [number]
```

### 3. Request Payload Analysis
Click on the Gemini API call in Network tab → Request → Payload to see:

**System Message** (~1,500+ tokens):
```json
{
  "contents": [
    {
      "role": "user", 
      "parts": [
        {
          "text": "You are Bolt, an expert AI assistant and exceptional senior software developer..."
        }
      ]
    }
  ]
}
```

**Your Message** (minimal tokens):
```json
{
  "role": "user",
  "parts": [{"text": "hello"}]
}
```

### 4. Response Analysis
- **Response Headers**: Check `Content-Length` for response size
- **Timing**: See how long Gemini takes to process
- **Streaming**: Watch real-time response chunks

## 🧪 Test This Yourself

1. **Open DevTools**: F12 or Cmd+Option+I
2. **Go to Network Tab**
3. **Filter by**: `generativelanguage.googleapis.com`
4. **Send a message** in Steve
5. **Click on the API call** to inspect

## 🔍 What You'll Discover

### Simple "hello" message:
- **Request size**: ~6KB (mostly system prompt)
- **Your text**: "hello" (5 bytes)
- **System prompt**: ~6KB of instructions

### Second message in conversation:
- **Request size**: ~7KB+ (system prompt + conversation history)
- **Your text**: Your new message
- **History**: All previous messages included

### Why Steve is "Expensive":
- Every message = Full system prompt + conversation
- No conversation optimization
- Quality over efficiency design choice

## 💡 Pro Tips for Monitoring

1. **Clear Network Tab** before sending messages for clean view
2. **Use Response tab** to see Steve's full generated response
3. **Check Console** for any rate limiting warnings
4. **Monitor Headers** for API quota information

This explains why even "hello" triggers such a comprehensive response - Steve gets the full context every time!
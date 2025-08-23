import requests
import json

# Gemini API configuration
api_key = "AIzaSyCLRwfOul3d3sCof1ElWEO-ml8xF5RPooY"
model = "gemini-2.0-flash-exp"  # Latest Gemini model
base_url = "https://generativelanguage.googleapis.com/v1beta/models"

print("Testing Gemini API key with Gemini 2.5 Pro...")
print(f"API Key: {api_key[:20]}...")
print(f"Model: {model}")
print("-" * 60)

# Test 1: List available models
print("1. Testing model availability...")
try:
    models_url = f"{base_url}?key={api_key}"
    response = requests.get(models_url, timeout=10)
    
    if response.status_code == 200:
        models_data = response.json()
        available_models = [m.get('name', '') for m in models_data.get('models', [])]
        print(f"✅ API key valid! Found {len(available_models)} models:")
        
        # Look for Gemini models
        gemini_models = [m for m in available_models if 'gemini' in m.lower()]
        for model_name in gemini_models[:5]:  # Show first 5 Gemini models
            print(f"   - {model_name}")
            
        if gemini_models:
            # Use the first available Gemini model for testing
            test_model = gemini_models[0].split('/')[-1]  # Extract model name
            print(f"\n🎯 Using model: {test_model}")
        else:
            test_model = "gemini-pro"  # Fallback
            
    else:
        print(f"❌ Failed to list models: {response.status_code}")
        print(f"Response: {response.text}")
        test_model = "gemini-pro"  # Try anyway

except Exception as e:
    print(f"❌ Error listing models: {str(e)}")
    test_model = "gemini-pro"  # Try anyway

print(f"\n2. Testing chat completion with {test_model}...")

# Test 2: Generate content
try:
    chat_url = f"{base_url}/{test_model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Hello! This is a test message for Steve AI assistant. Please respond with a brief greeting."
                    }
                ]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 100,
            "temperature": 0.7
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(chat_url, json=payload, headers=headers, timeout=15)
    
    if response.status_code == 200:
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            content = result['candidates'][0]['content']['parts'][0]['text']
            print("🎉 SUCCESS! Gemini API working:")
            print(f"Response: {content}")
            print(f"\n✅ CONFIRMED: Gemini API key is active and working!")
            print(f"🚀 Ready to integrate with Steve as primary provider!")
        else:
            print("❌ No content in response")
            print(f"Response: {json.dumps(result, indent=2)}")
    else:
        print(f"❌ Chat completion failed: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error testing chat completion: {str(e)}")

print("\nGemini API test completed.")
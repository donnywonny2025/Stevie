import requests
import json

# New Gemini API configuration
api_key = "AIzaSyCss9HMaqmF06fXuAH4UK07rf4x-krLv88"
base_url = "https://generativelanguage.googleapis.com/v1beta/models"

print("Testing NEW Gemini API key...")
print(f"API Key: {api_key[:20]}...")
print("-" * 60)

# Test 1: List available models
print("1. Testing API key validity...")
try:
    models_url = f"{base_url}?key={api_key}"
    response = requests.get(models_url, timeout=10)
    
    if response.status_code == 200:
        models_data = response.json()
        available_models = [m.get('name', '') for m in models_data.get('models', [])]
        print(f"✅ API key valid! Found {len(available_models)} models")
        
        # Look for Gemini models
        gemini_models = [m for m in available_models if 'gemini' in m.lower()]
        print(f"📋 Available Gemini models:")
        for model_name in gemini_models[:5]:
            print(f"   - {model_name}")
            
        # Use the latest flash model for testing (usually has better quotas)
        test_model = "gemini-1.5-flash-latest"
        print(f"\n🎯 Testing with: {test_model}")
            
    else:
        print(f"❌ API key validation failed: {response.status_code}")
        print(f"Response: {response.text}")
        exit(1)

except Exception as e:
    print(f"❌ Error validating API key: {str(e)}")
    exit(1)

# Test 2: Generate content
print(f"\n2. Testing content generation...")
try:
    chat_url = f"{base_url}/{test_model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Hello! This is Steve AI assistant testing. Please respond with 'Hello Steve!' if you can hear me."
                    }
                ]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 50,
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
            print("🎉 SUCCESS! New Gemini API key working perfectly!")
            print(f"Response: {content}")
            print(f"\n✅ CONFIRMED: Ready to integrate with Steve!")
            print(f"🚀 Model: {test_model}")
            print(f"🔑 Working API Key: {api_key}")
        else:
            print("❌ No content in response")
            print(f"Response structure: {json.dumps(result, indent=2)}")
    else:
        error_data = response.json() if response.content else {}
        error_code = error_data.get('error', {}).get('code', response.status_code)
        
        if error_code == 429:
            print(f"❌ Rate limit exceeded (quota exhausted)")
            print("💡 This key may also be at quota limit")
        else:
            print(f"❌ Content generation failed: {error_code}")
            print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error testing content generation: {str(e)}")

print("\nNew Gemini API key test completed.")
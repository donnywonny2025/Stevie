import os
from openai import AzureOpenAI

# Confirmed configuration details
endpoint = "https://steve-openai-resource.openai.azure.com/"
deployment = "o4-mini"
api_key = "[REDACTED_FOR_SECURITY]"
api_version = "2024-12-01-preview"

print(f"Testing CONFIRMED Azure OpenAI configuration...")
print(f"Endpoint: {endpoint}")
print(f"Deployment: {deployment}")
print(f"API Version: {api_version}")
print(f"Region: eastus")
print("-" * 60)

try:
    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=api_key,
    )

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Hello Steve! This is a test message."}],
        max_tokens=50,
        model=deployment
    )

    print("🎉 SUCCESS! Azure OpenAI connection working:")
    print(f"Response: {response.choices[0].message.content}")
    print("\n✅ CONFIRMED: Azure OpenAI is ready for Steve!")
    
except Exception as e:
    print(f"❌ ERROR: Azure OpenAI connection failed:")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    
    # Try with original API key as fallback
    print("\n🔄 Trying with original API key...")
    try:
        original_api_key = "[REDACTED_FOR_SECURITY]"
        
        client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=endpoint,
            api_key=original_api_key,
        )

        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello Steve! This is a test message."}],
            max_tokens=50,
            model=deployment
        )

        print("🎉 SUCCESS with original key! Azure OpenAI connection working:")
        print(f"Response: {response.choices[0].message.content}")
        print(f"\n✅ Working API Key: {original_api_key}")
        
    except Exception as e2:
        print(f"❌ Also failed with original key: {str(e2)}")
        print("\n💡 The endpoint format might still need adjustment.")
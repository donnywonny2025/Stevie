import os
from openai import AzureOpenAI

endpoint = "https://jdker-menwz8kf-swedencentral.cognitiveservices.azure.com/"
api_key = "[REDACTED_FOR_SECURITY]"
api_version = "2024-12-01-preview"

# List of possible deployment names to try
deployment_names = [
    "o4-mini",
    "o4mini", 
    "gpt-4o-mini",
    "gpt4o-mini",
    "gpt-4o-mini-deployment",
    "o1-mini",
    "gpt-35-turbo",
    "gpt-4",
    "gpt-4o",
    "chatgpt"
]

print(f"Testing Azure OpenAI with different deployment names...")
print(f"Endpoint: {endpoint}")
print(f"API Version: {api_version}")
print("-" * 60)

client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=api_key,
)

for deployment in deployment_names:
    print(f"Testing deployment: '{deployment}'...")
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=20,
            model=deployment
        )
        
        print(f"✅ SUCCESS with '{deployment}'!")
        print(f"Response: {response.choices[0].message.content}")
        print(f"🎉 WORKING DEPLOYMENT FOUND: '{deployment}'")
        break
        
    except Exception as e:
        if "DeploymentNotFound" in str(e):
            print(f"❌ '{deployment}' not found")
        else:
            print(f"❌ '{deployment}' error: {str(e)}")
    
    print()

print("\nTest completed.")
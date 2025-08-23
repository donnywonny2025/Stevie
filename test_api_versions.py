import os
from openai import AzureOpenAI

endpoint = "https://jdker-menwz8kf-swedencentral.cognitiveservices.azure.com/"
deployment = "o4-mini"
api_key = "[REDACTED_FOR_SECURITY]"

# List of API versions to try
api_versions = [
    "2024-12-01-preview",
    "2024-10-21",
    "2024-08-01-preview", 
    "2024-06-01",
    "2024-05-01-preview",
    "2024-04-01-preview",
    "2024-02-15-preview",
    "2023-12-01-preview",
    "2023-10-01-preview",
    "2023-08-01-preview",
    "2023-06-01-preview",
    "2023-05-15",
    "2023-03-15-preview"
]

print(f"Testing Azure OpenAI with different API versions...")
print(f"Endpoint: {endpoint}")
print(f"Deployment: {deployment}")
print("-" * 60)

for api_version in api_versions:
    print(f"Testing API version: '{api_version}'...")
    try:
        client = AzureOpenAI(
            api_version=api_version,
            azure_endpoint=endpoint,
            api_key=api_key,
        )
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=20,
            model=deployment
        )
        
        print(f"✅ SUCCESS with API version '{api_version}'!")
        print(f"Response: {response.choices[0].message.content}")
        print(f"🎉 WORKING API VERSION FOUND: '{api_version}'")
        break
        
    except Exception as e:
        if "DeploymentNotFound" in str(e):
            print(f"❌ '{api_version}' - deployment not found")
        elif "404" in str(e):
            print(f"❌ '{api_version}' - 404 error")
        else:
            print(f"❌ '{api_version}' - error: {str(e)}")
    
    print()

print("\nAPI version test completed.")
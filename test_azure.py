import os
from openai import AzureOpenAI

endpoint = "https://jdker-menwz8kf-swedencentral.cognitiveservices.azure.com/"
deployment = "o4-mini"
api_key = "[REDACTED_FOR_SECURITY]"
api_version = "2024-12-01-preview"

print(f"Testing Azure OpenAI connection...")
print(f"Endpoint: {endpoint}")
print(f"Deployment: {deployment}")
print(f"API Version: {api_version}")
print("-" * 50)

try:
    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=endpoint,
        api_key=api_key,
    )

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Hello, test message"}],
        max_tokens=50,
        model=deployment
    )

    print("SUCCESS! Azure OpenAI connection working:")
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"ERROR: Azure OpenAI connection failed:")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
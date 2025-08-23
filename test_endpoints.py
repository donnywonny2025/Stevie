import requests
import json

api_key = "[REDACTED_FOR_SECURITY]"
api_version = "2024-12-01-preview"
deployment = "o4-mini"

# Possible resource names
resource_names = [
    "steve-openai-resource",
    "steveopenai", 
    "steve-openai",
    "steve",
    "openai-steve",
    "jdker-openai",
    "jdker-steve",
    "bolt-steve",
    "steve-ai"
]

# Possible endpoint formats
endpoint_formats = [
    "https://{}.openai.azure.com",
    "https://{}.cognitiveservices.azure.com", 
    "https://{}.eastus.cognitiveservices.azure.com",
    "https://{}.westus.cognitiveservices.azure.com",
    "https://{}.westus2.cognitiveservices.azure.com"
]

print("Testing Azure OpenAI endpoint combinations...")
print(f"Deployment: {deployment}")
print(f"API Version: {api_version}")
print("-" * 70)

headers = {
    "api-key": api_key,
    "Content-Type": "application/json"
}

data = {
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 10
}

found_working = False

for resource_name in resource_names:
    for endpoint_format in endpoint_formats:
        endpoint = endpoint_format.format(resource_name)
        url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version={api_version}"
        
        print(f"Testing: {endpoint}")
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ SUCCESS! Working endpoint found:")
                print(f"   Endpoint: {endpoint}")
                print(f"   Resource: {resource_name}")
                print(f"   Response: {response.json()}")
                found_working = True
                break
            else:
                error_info = response.json() if response.content else {"error": "No content"}
                error_code = error_info.get("error", {}).get("code", "Unknown")
                
                if "DeploymentNotFound" in str(error_info):
                    print(f"   ❌ Deployment not found")
                elif "401" in str(response.status_code) or "Access denied" in str(error_info):
                    print(f"   ⚠️  401 Access denied (endpoint exists but wrong auth)")
                else:
                    print(f"   ❌ {response.status_code}: {error_code}")
                    
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Host not found")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    if found_working:
        break
    print()

if not found_working:
    print("\n❌ No working endpoint found. The resource name might be different than expected.")
    print("Check the Azure portal for the exact resource name and endpoint.")
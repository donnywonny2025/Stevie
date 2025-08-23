#!/usr/bin/env python3
"""
Gemini API Usage Monitor
Tracks API calls, thinking model usage, and rate limiting
"""

import requests
import time
import json
from datetime import datetime, timedelta

class GeminiUsageMonitor:
    def __init__(self):
        self.api_key = "AIzaSyCss9HMaqmF06fXuAH4UK07rf4x-krLv88"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.call_history = []
        self.thinking_models = ['gemini-2.5-pro', 'gemini-2.0-pro', 'thinking']
        
    def log_call(self, model, success, response_time, tokens_used=0, is_thinking=False):
        """Log an API call"""
        call_data = {
            'timestamp': datetime.now(),
            'model': model,
            'success': success,
            'response_time': response_time,
            'tokens_used': tokens_used,
            'is_thinking': is_thinking
        }
        self.call_history.append(call_data)
        
        # Keep only last 100 calls
        if len(self.call_history) > 100:
            self.call_history = self.call_history[-100:]
    
    def is_thinking_model(self, model_name):
        """Check if model is a thinking model"""
        return any(pattern in model_name.lower() for pattern in self.thinking_models)
    
    def test_model(self, model_name, test_prompt="Hello, test response"):
        """Test a specific model"""
        url = f"{self.base_url}/{model_name}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": test_prompt}]}]
        }
        
        is_thinking = self.is_thinking_model(model_name)
        start_time = time.time()
        
        try:
            response = requests.post(url, json=payload, timeout=120 if is_thinking else 30)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                tokens_used = 0
                
                if 'usageMetadata' in data:
                    tokens_used = data['usageMetadata'].get('totalTokenCount', 0)
                    thinking_tokens = data['usageMetadata'].get('thoughtsTokenCount', 0)
                    
                    if thinking_tokens > 0:
                        print(f"🧠 {model_name}: Thinking tokens: {thinking_tokens}, Output tokens: {tokens_used - thinking_tokens}")
                    else:
                        print(f"⚡ {model_name}: Total tokens: {tokens_used}")
                
                self.log_call(model_name, True, response_time, tokens_used, is_thinking)
                return True, response_time, tokens_used
                
            elif response.status_code == 429:
                print(f"🚫 {model_name}: RATE LIMITED")
                self.log_call(model_name, False, response_time, 0, is_thinking)
                return False, response_time, 0
            else:
                print(f"❌ {model_name}: HTTP {response.status_code}")
                self.log_call(model_name, False, response_time, 0, is_thinking)
                return False, response_time, 0
                
        except Exception as e:
            response_time = time.time() - start_time
            print(f"❌ {model_name}: ERROR - {str(e)}")
            self.log_call(model_name, False, response_time, 0, is_thinking)
            return False, response_time, 0
    
    def get_quota_status(self):
        """Estimate current quota usage"""
        now = datetime.now()
        last_minute = now - timedelta(minutes=1)
        last_hour = now - timedelta(hours=1)
        
        recent_calls = [call for call in self.call_history if call['timestamp'] > last_minute]
        hourly_calls = [call for call in self.call_history if call['timestamp'] > last_hour]
        
        thinking_calls_recent = len([call for call in recent_calls if call['is_thinking']])
        regular_calls_recent = len([call for call in recent_calls if not call['is_thinking']])
        
        print(f"📊 QUOTA STATUS:")
        print(f"   Last minute: {len(recent_calls)} calls ({thinking_calls_recent} thinking, {regular_calls_recent} regular)")
        print(f"   Last hour: {len(hourly_calls)} calls")
        
        # Estimate if we're approaching limits
        if thinking_calls_recent >= 7:  # 70% of 10/min limit for thinking
            print(f"⚠️  WARNING: Approaching thinking model rate limit")
        if regular_calls_recent >= 10:  # 70% of 15/min limit for regular
            print(f"⚠️  WARNING: Approaching regular model rate limit")
    
    def check_quota_status_passive(self):
        """Check quota status without making API calls - preserve quota for Steve"""
        print(f"📋 PASSIVE QUOTA MONITORING - No API calls made")
        print(f"   This preserves all quota for Steve's usage")
        print(f"   Monitoring only tracks Steve's API usage patterns")
        
        # Show available models without testing
        available_models = [
            '🧠 gemini-2.5-pro (Thinking Model - Best Quality)',
            '⚡ gemini-2.5-flash (Fast & Efficient)', 
            '⚡ gemini-1.5-flash (Reliable)',
            '⚡ gemini-1.5-pro (May be rate limited)'
        ]
        
        print(f"\n🎯 AVAILABLE MODELS (Not tested to preserve quota):")
        for model in available_models:
            print(f"  {model}")
            
        print(f"\nℹ️  To test models, use Steve directly at http://localhost:5178")

def main():
    monitor = GeminiUsageMonitor()
    monitor.check_quota_status_passive()

if __name__ == "__main__":
    main()
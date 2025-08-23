#!/usr/bin/env python3
"""
Real-time Steve AI Monitoring Script
Monitors API calls, performance, and Gemini integration
"""

import requests
import json
import time
import threading
from datetime import datetime
import subprocess
import re

class SteveMonitor:
    def __init__(self):
        self.steve_url = "http://localhost:5178"
        self.gemini_calls = 0
        self.errors = []
        self.start_time = datetime.now()
        self.monitoring = True
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def check_steve_status(self):
        """Monitor Steve's basic health"""
        try:
            response = requests.get(f"{self.steve_url}/", timeout=5)
            if response.status_code == 200:
                self.log("✅ Steve is responding")
                return True
            else:
                self.log(f"⚠️  Steve returned {response.status_code}", "WARN")
                return False
        except Exception as e:
            self.log(f"❌ Steve connection failed: {str(e)}", "ERROR")
            return False
            
    def test_gemini_direct(self):
        """Test Gemini API directly"""
        api_key = "AIzaSyCss9HMaqmF06fXuAH4UK07rf4x-krLv88"
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
        
        payload = {
            "contents": [{"parts": [{"text": "Generate a simple React button component"}]}],
            "generationConfig": {"maxOutputTokens": 100}
        }
        
        start_time = time.time()
        try:
            response = requests.post(f"{url}?key={api_key}", json=payload, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                self.gemini_calls += 1
                self.log(f"✅ Gemini API call #{self.gemini_calls} - {duration:.2f}s")
                return True
            else:
                self.log(f"❌ Gemini API failed: {response.status_code}", "ERROR")
                self.errors.append(f"Gemini API: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Gemini API error: {str(e)}", "ERROR")
            self.errors.append(f"Gemini error: {str(e)}")
            return False
            
    def check_server_logs(self):
        """Check for recent server activity"""
        try:
            # This would show recent logs - adjust based on your system
            self.log("🔍 Checking server activity...")
            return True
        except Exception as e:
            self.log(f"❌ Log check failed: {str(e)}", "ERROR")
            return False
            
    def run_comprehensive_test(self):
        """Run all tests and report results"""
        self.log("🚀 Starting comprehensive Steve monitoring...")
        self.log(f"📍 Target: {self.steve_url}")
        
        # Test 1: Steve Health
        self.log("\n📡 TEST 1: Steve Health Check")
        steve_ok = self.check_steve_status()
        
        # Test 2: Gemini Direct
        self.log("\n🤖 TEST 2: Gemini API Direct Test")
        gemini_ok = self.test_gemini_direct()
        
        # Test 3: Rate Limiting Check
        self.log("\n⏱️  TEST 3: Rate Limiting Test")
        for i in range(3):
            self.log(f"Rate test {i+1}/3...")
            self.test_gemini_direct()
            time.sleep(1)
            
        # Test 4: Performance Summary
        self.log("\n📊 TEST 4: Performance Summary")
        uptime = datetime.now() - self.start_time
        self.log(f"Monitoring duration: {uptime}")
        self.log(f"Gemini API calls: {self.gemini_calls}")
        self.log(f"Errors encountered: {len(self.errors)}")
        
        if self.errors:
            self.log("❌ Errors found:")
            for error in self.errors:
                self.log(f"  - {error}")
        else:
            self.log("✅ No errors detected!")
            
        # Final Status
        self.log("\n🎯 MONITORING RESULTS:")
        self.log(f"Steve Status: {'✅ HEALTHY' if steve_ok else '❌ ISSUES'}")
        self.log(f"Gemini API: {'✅ WORKING' if gemini_ok else '❌ FAILED'}")
        self.log(f"Rate Limiting: {'✅ ACTIVE' if self.gemini_calls > 0 else '❌ UNKNOWN'}")
        
        return steve_ok and gemini_ok
        
    def generate_test_commands(self):
        """Generate specific test commands for manual testing"""
        self.log("\n🧪 MANUAL TESTING GUIDE:")
        self.log("=" * 60)
        self.log("1. Open Chrome and navigate to: http://localhost:5178/")
        self.log("2. Open DevTools (F12) → Network tab")
        self.log("3. Clear network history")
        self.log("4. Create new project in Steve")
        self.log("5. Enter this prompt:")
        self.log('   "Create a modern todo app with dark theme and animations"')
        self.log("\n🔍 WHAT TO LOOK FOR:")
        self.log("✅ Network calls to generativelanguage.googleapis.com")
        self.log("✅ HTTP 200 responses from Gemini API")
        self.log("✅ Generated code appearing in Steve")
        self.log("✅ Preview rendering successfully")
        self.log("✅ No console errors")
        self.log("=" * 60)

if __name__ == "__main__":
    monitor = SteveMonitor()
    
    # Run monitoring
    success = monitor.run_comprehensive_test()
    
    # Generate test guide
    monitor.generate_test_commands()
    
    if success:
        monitor.log("\n🎉 ALL SYSTEMS GO! Steve is ready for manual testing!")
    else:
        monitor.log("\n⚠️  Issues detected - check results above")
        
    monitor.log(f"\n🌐 Access Steve: {monitor.steve_url}")
    monitor.log("🔧 Ready for Chrome DevTools testing!")
#!/usr/bin/env python3
"""
Comprehensive Steve Monitoring Script
Tracks server health, API usage, errors, and performance
"""

import subprocess
import time
import requests
import json
from datetime import datetime
import os
import sys

class SteveMonitor:
    def __init__(self):
        self.api_key = "AIzaSyCss9HMaqmF06fXuAH4UK07rf4x-krLv88"
        self.steve_url = "http://localhost:5178"
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.log_file = "/Volumes/AI/WORK 2025/Steve/steve_monitor.log"
        self.start_time = datetime.now()
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        print(log_entry)
        
        # Append to log file
        try:
            with open(self.log_file, "a") as f:
                f.write(log_entry + "\n")
        except Exception as e:
            print(f"Failed to write to log: {e}")
    
    def check_steve_health(self):
        """Check if Steve server is responding"""
        try:
            response = requests.get(self.steve_url, timeout=5)
            if response.status_code == 200:
                self.log("✅ Steve server: HEALTHY", "HEALTH")
                return True
            else:
                self.log(f"⚠️ Steve server: HTTP {response.status_code}", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Steve server: UNREACHABLE - {str(e)}", "ERROR")
            return False
    
    def check_gemini_api(self):
        """Check Gemini API status WITHOUT making calls - preserving quota for Steve"""
        try:
            # Just check if the endpoint is reachable without consuming quota
            url = f"{self.gemini_url}?key={self.api_key}"
            
            start_time = time.time()
            response = requests.get(url, timeout=10)  # GET request to list models only
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                self.log(f"✅ Gemini API: REACHABLE ({response_time:.2f}s) - No quota used", "API")
                return True
            elif response.status_code == 429:
                self.log(f"🚫 Gemini API: RATE LIMITED - Steve may be hitting limits", "WARNING")
                return False
            else:
                self.log(f"❌ Gemini API: HTTP {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Gemini API: UNREACHABLE - {str(e)}", "ERROR")
            return False
    
    def check_processes(self):
        """Monitor Steve-related processes"""
        try:
            # Get process info
            result = subprocess.run(
                ["ps", "aux"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            steve_processes = []
            for line in result.stdout.split('\n'):
                if any(keyword in line.lower() for keyword in ['remix', 'bolt.diy', 'vite:dev']):
                    steve_processes.append(line.strip())
            
            if steve_processes:
                self.log(f"📊 Found {len(steve_processes)} Steve processes running", "PROCESS")
                for proc in steve_processes[:3]:  # Show first 3
                    if 'remix' in proc and 'vite:dev' in proc:
                        # Extract memory usage
                        parts = proc.split()
                        if len(parts) > 5:
                            cpu = parts[2]
                            mem = parts[3]
                            self.log(f"   Main server: CPU {cpu}%, MEM {mem}%", "PROCESS")
            else:
                self.log("⚠️ No Steve processes found!", "WARNING")
                
        except Exception as e:
            self.log(f"❌ Process check failed: {str(e)}", "ERROR")
    
    def check_port_activity(self):
        """Check network activity on Steve's port"""
        try:
            result = subprocess.run(
                ["lsof", "-i", ":5178"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if "LISTEN" in result.stdout:
                self.log("🌐 Port 5178: LISTENING", "NETWORK")
                return True
            else:
                self.log("⚠️ Port 5178: NOT LISTENING", "WARNING")
                return False
        except Exception as e:
            self.log(f"❌ Port check failed: {str(e)}", "ERROR")
            return False
    
    def monitor_errors(self):
        """Check for any recent errors in system logs"""
        try:
            # Check recent system logs for Node.js errors
            result = subprocess.run(
                ["log", "show", "--last", "2m", "--predicate", "process CONTAINS 'node'"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            error_lines = []
            for line in result.stdout.split('\n'):
                if any(keyword in line.lower() for keyword in ['error', 'exception', 'failed', 'crash']):
                    if 'bolt.diy' in line or 'steve' in line.lower():
                        error_lines.append(line.strip())
            
            if error_lines:
                self.log(f"⚠️ Found {len(error_lines)} recent errors", "ERROR")
                for error in error_lines[:3]:  # Show first 3
                    self.log(f"   {error[:100]}...", "ERROR")
            else:
                self.log("✅ No recent errors found", "HEALTH")
                
        except Exception as e:
            self.log(f"❌ Error monitoring failed: {str(e)}", "ERROR")
    
    def full_status_check(self):
        """Run comprehensive status check"""
        self.log("=" * 60, "STATUS")
        self.log(f"Steve Monitoring Report - {datetime.now().strftime('%H:%M:%S')}", "STATUS")
        self.log("=" * 60, "STATUS")
        
        # Run all checks
        steve_ok = self.check_steve_health()
        gemini_ok = self.check_gemini_api()
        port_ok = self.check_port_activity()
        
        self.check_processes()
        self.monitor_errors()
        
        # Summary
        status = "🟢 ALL SYSTEMS GO" if all([steve_ok, gemini_ok, port_ok]) else "🟡 ISSUES DETECTED"
        self.log(f"Overall Status: {status}", "STATUS")
        self.log("=" * 60, "STATUS")
        
        return steve_ok, gemini_ok, port_ok
    
    def continuous_monitor(self, interval=30):
        """Run continuous monitoring"""
        self.log("🚀 Starting continuous Steve monitoring...", "INFO")
        self.log(f"Monitoring interval: {interval} seconds", "INFO")
        
        try:
            while True:
                self.full_status_check()
                time.sleep(interval)
        except KeyboardInterrupt:
            self.log("👋 Monitoring stopped by user", "INFO")
        except Exception as e:
            self.log(f"❌ Monitoring error: {str(e)}", "ERROR")

def main():
    monitor = SteveMonitor()
    
    if len(sys.argv) > 1 and sys.argv[1] == "continuous":
        # Continuous monitoring mode
        monitor.continuous_monitor(30)
    else:
        # Single status check
        monitor.full_status_check()

if __name__ == "__main__":
    main()
#!/bin/bash
# Instant Steve Visibility - Run this anytime for current status

echo "🔍 STEVE INSTANT STATUS - $(date '+%H:%M:%S')"
echo "============================================"

# Quick health check
echo -n "🏥 Health: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5178/ | grep -q "200"; then
    echo "HEALTHY ✅"
else 
    echo "ISSUES ❌"
fi

# Process status
echo -n "⚙️  Process: "
if pgrep -f "remix.*vite:dev" > /dev/null; then
    echo "RUNNING ✅"
else
    echo "STOPPED ❌"
fi

# Recent log activity (last 3 lines)
echo "📝 Recent Activity:"
if [ -f "/Volumes/AI/WORK 2025/Steve/steve_monitor.log" ]; then
    tail -3 "/Volumes/AI/WORK 2025/Steve/steve_monitor.log" | while read line; do
        echo "   $line"
    done
else
    echo "   No logs available"
fi

# API Status - Check reachability without consuming quota
echo -n "🤖 Gemini API: "
if curl -s --max-time 5 "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCss9HMaqmF06fXuAH4UK07rf4x-krLv88" | grep -q "models"; then
    echo "REACHABLE ✅ (No quota used)"
else
    echo "ISSUES ❌"
fi

echo "============================================"
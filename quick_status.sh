#!/bin/bash
# Quick Steve Status Check
echo "🔍 QUICK STEVE STATUS CHECK - $(date)"
echo "=================================="

# Check if Steve is responding
echo -n "Steve Server: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5178/ | grep -q "200"; then
    echo "✅ HEALTHY"
else
    echo "❌ NOT RESPONDING"
fi

# Check main process
echo -n "Main Process: "
if pgrep -f "remix.*vite:dev" > /dev/null; then
    echo "✅ RUNNING (PID: $(pgrep -f 'remix.*vite:dev'))"
else
    echo "❌ NOT FOUND"
fi

# Check port
echo -n "Port 5178: "
if lsof -i :5178 > /dev/null 2>&1; then
    echo "✅ LISTENING"
else
    echo "❌ NOT LISTENING"
fi

# Show recent activity
echo ""
echo "📊 RECENT ACTIVITY:"
if [ -f "/Volumes/AI/WORK 2025/Steve/steve_monitor.log" ]; then
    tail -5 "/Volumes/AI/WORK 2025/Steve/steve_monitor.log" | sed 's/^/  /'
else
    echo "  No log file found"
fi

echo ""
echo "=================================="
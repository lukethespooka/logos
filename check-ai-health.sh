#!/bin/bash

# LogOS AI Infrastructure Health Check

echo "🔍 Checking AI infrastructure health..."

# Check Ollama
echo -n "Ollama service: "
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check available models
echo "📋 Available models:"
if command -v ollama &> /dev/null; then
    ollama list | tail -n +2 | awk '{print "  - " $1}'
else
    echo "  ❌ Ollama not available"
fi

# Check AI router (if running)
echo -n "AI router: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "⚠️  Not running (optional)"
fi

# Check Redis (if running)
echo -n "Redis cache: "
if docker ps --format "table {{.Names}}" | grep -q logos-ai-cache; then
    echo "✅ Running"
else
    echo "⚠️  Not running (optional)"
fi

echo "✅ Health check complete"

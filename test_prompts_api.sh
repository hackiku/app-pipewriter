#!/bin/zsh
# Quick test to see API logs

echo "🧪 Testing API with detailed server logging"
echo "==========================================="

echo "1. Testing API endpoint (watch server console!)..."
curl -v http://localhost:5173/api/prompts/simple 2>&1 | head -20

echo ""
echo "2. Getting just the response body..."
curl -s http://localhost:5173/api/prompts/simple | jq '.' || echo "Invalid JSON response"

echo ""
echo "🔍 Check your server console for these logs:"
echo "   🔄 API: Starting prompts fetch..."
echo "   📦 API: Query completed, found X docs"
echo "   ✅ API: Returning X prompts"
echo ""
echo "If you don't see those logs, the API route isn't being hit!"
#!/bin/bash

# Test script for Kolosal API integration
# Usage: ./test-kolosal-api.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Kolosal API Integration Test Suite     ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}[1/5]${NC} Checking server health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Server is running"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}✗${NC} Server is not running. Start it with: node server/index.js"
    exit 1
fi
echo ""

# Check API key configuration
API_KEY_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.kolosalApiKey' 2>/dev/null || echo "unknown")
API_MODE=$(echo "$HEALTH_RESPONSE" | jq -r '.mode' 2>/dev/null || echo "unknown")

echo -e "${YELLOW}[2/5]${NC} API Configuration:"
echo "  API Key: $API_KEY_STATUS"
echo "  Mode: $API_MODE"

if [ "$API_KEY_STATUS" != "configured" ]; then
    echo -e "${YELLOW}⚠${NC}  API key not configured - tests will use mock data"
fi
echo ""

# Test bias check endpoint
echo -e "${YELLOW}[3/5]${NC} Testing bias check endpoint..."
BIAS_RESPONSE=$(curl -s -X POST http://localhost:3001/api/bias \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Our salesman will help you choose the right product for your needs.",
    "language": "en",
    "campaignId": "test-campaign-001"
  }')

if echo "$BIAS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Bias check successful"
    echo "$BIAS_RESPONSE" | jq '{
      success: .success,
      overallScore: .data.overallScore,
      severity: .data.severity,
      biasCount: (.data.biases | length)
    }' 2>/dev/null || echo "$BIAS_RESPONSE"
else
    echo -e "${RED}✗${NC} Bias check failed"
    echo "$BIAS_RESPONSE"
fi
echo ""

# Test copy generation endpoint
echo -e "${YELLOW}[4/5]${NC} Testing copy generation endpoint..."
COPY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/copy \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a welcoming message for our diversity and inclusion initiative",
    "language": "en",
    "tone": "friendly",
    "campaignId": "test-campaign-001"
  }')

if echo "$COPY_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Copy generation successful"
    echo "$COPY_RESPONSE" | jq '{
      success: .success,
      suggestionCount: (.data.suggestions | length),
      language: .data.language,
      tone: .data.metadata.tone
    }' 2>/dev/null || echo "$COPY_RESPONSE"
else
    echo -e "${RED}✗${NC} Copy generation failed"
    echo "$COPY_RESPONSE"
fi
echo ""

# Test direct API calls (if API key is configured)
if [ "$API_KEY_STATUS" = "configured" ] && [ ! -z "$KOLOSAL_API_KEY" ]; then
    echo -e "${YELLOW}[5/5]${NC} Testing direct Kolosal API calls..."
    
    # Test bias check
    echo "  Testing bias-check endpoint..."
    DIRECT_BIAS=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
      -X POST https://api.kolosal.ai/v1/content/bias-check \
      -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "X-API-Version: 2024-01" \
      -d '{
        "content": "Our salesman will help you.",
        "language": "en"
      }')
    
    HTTP_STATUS=$(echo "$DIRECT_BIAS" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$DIRECT_BIAS" | sed '/HTTP_STATUS:/d')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} Bias check: HTTP $HTTP_STATUS"
    elif [ "$HTTP_STATUS" = "403" ]; then
        echo -e "  ${RED}✗${NC} Bias check: HTTP 403 Forbidden"
        echo "     API key may need activation or has insufficient permissions"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    elif [ "$HTTP_STATUS" = "401" ]; then
        echo -e "  ${RED}✗${NC} Bias check: HTTP 401 Unauthorized"
        echo "     Invalid API key"
    else
        echo -e "  ${RED}✗${NC} Bias check: HTTP $HTTP_STATUS"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    fi
    
    # Test copy generation
    echo "  Testing generate endpoint..."
    DIRECT_COPY=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
      -X POST https://api.kolosal.ai/v1/content/generate \
      -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -H "X-API-Version: 2024-01" \
      -d '{
        "prompt": "Write a welcoming message",
        "language": "en",
        "tone": "friendly",
        "parameters": {
          "variants": 3,
          "includeMetrics": true
        }
      }')
    
    HTTP_STATUS=$(echo "$DIRECT_COPY" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo "$DIRECT_COPY" | sed '/HTTP_STATUS:/d')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} Copy generation: HTTP $HTTP_STATUS"
    elif [ "$HTTP_STATUS" = "403" ]; then
        echo -e "  ${RED}✗${NC} Copy generation: HTTP 403 Forbidden"
        echo "     API key may need activation or has insufficient permissions"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    elif [ "$HTTP_STATUS" = "401" ]; then
        echo -e "  ${RED}✗${NC} Copy generation: HTTP 401 Unauthorized"
        echo "     Invalid API key"
    else
        echo -e "  ${RED}✗${NC} Copy generation: HTTP $HTTP_STATUS"
        echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    fi
else
    echo -e "${YELLOW}[5/5]${NC} Skipping direct API tests (no API key configured)"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Test suite completed${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Check server logs
echo ""
echo -e "${YELLOW}Tip:${NC} Check server console logs for detailed error messages if any tests failed"
echo -e "${YELLOW}Tip:${NC} Look for '[Kolosal Bias] Success: 200' and '[Kolosal Copy] Success: 200' in server logs"

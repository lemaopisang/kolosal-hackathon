# Quick Test Guide

## 🚀 Fast Testing Reference for Kolosal API Integration

---

## Setup (One-time)

```bash
cd server
export KOLOSAL_API_KEY="your-actual-key-here"

# Create .env file
cat > .env << EOF
KOLOSAL_API_KEY=${KOLOSAL_API_KEY}
KOLOSAL_API_URL=https://api.kolosal.ai/v1
PORT=3001
NODE_ENV=development
EOF
```

---

## Start Server

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend (optional)
npm run dev
```

---

## Test 1: Health Check ✅

```bash
curl http://localhost:3001/health | jq .
```

**Expected:**
```json
{
  "status": "ok",
  "kolosalApiKey": "configured",
  "kolosalApiUrl": "https://api.kolosal.ai/v1",
  "mode": "live"
}
```

---

## Test 2: Bias Check (via server) 🔍

```bash
curl -X POST http://localhost:3001/api/bias \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Perfect for housewives and working professionals",
    "language": "en"
  }' | jq .
```

**Expected:** JSON with `data.overallScore`, `data.severity`, `data.biases[]`

---

## Test 3: Copy Generation (via server) ✍️

```bash
curl -X POST http://localhost:3001/api/copy \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Eco-friendly coffee for conscious consumers",
    "language": "en",
    "tone": "friendly"
  }' | jq .
```

**Expected:** JSON with `data.suggestions[]` containing copy variants

---

## Test 4: Direct Kolosal API - Bias Check 🎯

```bash
curl -X POST https://api.kolosal.ai/v1/content/bias-check \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{
    "content": "Test content for bias detection",
    "language": "en",
    "context": {}
  }' | jq .
```

---

## Test 5: Direct Kolosal API - Copy Generation 🎯

```bash
curl -X POST https://api.kolosal.ai/v1/content/generate \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{
    "prompt": "Sustainable fashion campaign",
    "language": "en",
    "tone": "professional",
    "parameters": {
      "variants": 3,
      "includeMetrics": true
    }
  }' | jq .
```

---

## Common Issues

### ❌ 403 Forbidden
**Cause:** Missing `X-API-Version` header or wrong endpoint  
**Fix:** Ensure using `/v1/content/...` paths with all required headers

### ❌ 401 Unauthorized
**Cause:** Invalid API key  
**Fix:** Verify `echo $KOLOSAL_API_KEY` outputs your key

### ⚠️ Server falls back to mock
**Cause:** API call failed (network, auth, etc.)  
**Status:** Expected behavior - app still works with mock data  
**Check:** Server logs for detailed error message

---

## Watch Server Logs

Look for:
```
🟢 LIVE MODE - Using Kolosal API with fallback
```

When making requests, watch for:
```
✅ Success: No warnings
⚠️  Kolosal API failed, falling back to mock: [error details]
```

---

## Quick Debug

```bash
# Check if API key is set
echo $KOLOSAL_API_KEY

# Check .env file
cat server/.env

# Test with verbose output
curl -v https://api.kolosal.ai/v1/content/bias-check \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "X-API-Version: 2024-01" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'
```

---

## Success Indicators

✅ Server startup shows `🟢 LIVE MODE`  
✅ `/health` returns `"mode": "live"`  
✅ No "falling back to mock" warnings in logs  
✅ API responses include actual Kolosal data (not Faker mock data)  

---

## Full Documentation

- **REST API Contract:** `KOLOSAL_REST_API_CONTRACT.md`
- **Update Summary:** `API_UPDATE_SUMMARY.md`
- **Setup Guide:** `KOLOSAL_API_SETUP.md`

---

**Last Updated:** December 6, 2025

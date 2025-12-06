# Quick Test Guide - Kolosal API Integration

## Prerequisites

1. **Set your API key** in `.env` file:
   ```bash
   KOLOSAL_API_KEY=your_actual_key_here
   ```

2. **Start the server**:
   ```bash
   cd server
   node index.js
   ```
   
   You should see: `🟢 LIVE MODE - Using Kolosal API with fallback`

---

## Quick Test (curl)

### Test 1: Bias Check
```bash
curl -X POST http://localhost:3001/api/bias \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Our salesman will help you choose the right product.",
    "language": "en"
  }'
```

**Expected:** 200 OK with `overallScore`, `biases[]`

### Test 2: Copy Generation
```bash
curl -X POST http://localhost:3001/api/copy \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a welcoming message for our diversity initiative",
    "language": "en",
    "tone": "friendly"
  }'
```

**Expected:** 200 OK with `suggestions[]` array

---

## Automated Test Script

Run the comprehensive test suite:
```bash
./test-kolosal-api.sh
```

This will:
- ✓ Check server health
- ✓ Verify API configuration
- ✓ Test bias check endpoint
- ✓ Test copy generation endpoint
- ✓ Test direct Kolosal API calls (if key configured)

---

## What to Look For

### ✅ Success Signs (in server logs):
```
[Kolosal Bias] Calling https://api.kolosal.ai/v1/content/bias-check
[Kolosal Bias] Success: 200
```
```
[Kolosal Copy] Calling https://api.kolosal.ai/v1/content/generate
[Kolosal Copy] Success: 200
```

### ⚠ Mock Fallback (in server logs):
```
Kolosal bias API failed, falling back to mock: Request failed with status code 403
Full error: {
  status: 403,
  statusText: 'Forbidden',
  data: { error: '...' },
  url: 'https://api.kolosal.ai/v1/content/bias-check'
}
```

**This means:** API returned an error, but server gracefully fell back to mock data. The frontend still receives a valid response.

---

## Direct API Test (bypass server)

Test the Kolosal API directly to diagnose 403 errors:

```bash
# Set your API key
export KOLOSAL_API_KEY="your_key_here"

# Test bias check
curl -X POST https://api.kolosal.ai/v1/content/bias-check \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{"content":"Our salesman will help you.","language":"en"}'

# Test copy generation
curl -X POST https://api.kolosal.ai/v1/content/generate \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{"prompt":"Write a welcoming message","language":"en","tone":"friendly","parameters":{"variants":3}}'
```

---

## Troubleshooting 403 Errors

If you still get **403 Forbidden**:

1. **Verify endpoint is correct** (should be `/v1/content/bias-check` and `/v1/content/generate`)
2. **Check API key status** - may need activation in Kolosal dashboard
3. **Verify scopes** - key needs `content:bias-check` and `content:generate` permissions
4. **Check for org/project requirements** - some keys require additional headers

Contact Kolosal support with:
- Your API key (first 8 chars only for security)
- The full error response from server logs
- The exact URL being called

---

## Understanding the Response Flow

```
Frontend Request
    ↓
Your Server (/api/bias or /api/copy)
    ↓
Try Kolosal API (https://api.kolosal.ai/v1/...)
    ↓
    ├─→ Success (200) → Return live data
    └─→ Error (403/401/timeout) → Return mock data (graceful fallback)
                                    Log error for debugging
```

**Both paths return 200 to frontend** - your app continues to work even if Kolosal API has issues.

---

## Quick Commands Reference

```bash
# Check server status
curl http://localhost:3001/health

# Run full test suite
./test-kolosal-api.sh

# View server logs (watch for Kolosal API calls)
# (in the terminal where server is running)

# Test with different content
curl -X POST http://localhost:3001/api/bias \
  -H "Content-Type: application/json" \
  -d '{"content":"Your text here"}'
```

---

## Success Criteria

✅ Server logs show: `[Kolosal Bias] Success: 200`  
✅ Server logs show: `[Kolosal Copy] Success: 200`  
✅ No 403 errors in server console  
✅ Response contains real Kolosal data (not mock fallback)  

When all criteria are met, the integration is working correctly! 🎉

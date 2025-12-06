# Kolosal API Integration Fix

## Problem Summary
The Express API was calling incorrect endpoints (`/bias-check` and `/generate-copy` at root level), resulting in **403 Forbidden** errors. This document provides the correct API contract and testing instructions.

---

## 1. Kolosal API Contract

### Base URL
```
https://api.kolosal.ai/v1
```

### Endpoints

#### Bias Check
- **Method:** `POST`
- **Path:** `/v1/content/bias-check`
- **Full URL:** `https://api.kolosal.ai/v1/content/bias-check`

#### Copy Generation
- **Method:** `POST`
- **Path:** `/v1/content/generate`
- **Full URL:** `https://api.kolosal.ai/v1/content/generate`

---

### Required Headers
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
Accept: application/json
X-API-Version: 2024-01
```

---

### Request Bodies

#### Bias Check Request
```json
{
  "content": "string (required)",
  "language": "en (optional, default: en)",
  "context": {
    "campaignId": "string (optional)"
  }
}
```

**Field Details:**
- `content` (required): The text content to analyze for bias
- `language` (optional): Language code (default: "en")
- `context.campaignId` (optional): Campaign identifier for tracking

#### Copy Generation Request
```json
{
  "prompt": "string (required)",
  "language": "en (optional, default: en)",
  "tone": "friendly (optional, default: friendly)",
  "parameters": {
    "campaignId": "string (optional)",
    "variants": 3,
    "includeMetrics": true
  }
}
```

**Field Details:**
- `prompt` (required): Description of the content to generate
- `language` (optional): Language code (default: "en")
- `tone` (optional): Tone of voice (e.g., "friendly", "professional", "casual")
- `parameters.campaignId` (optional): Campaign identifier for tracking
- `parameters.variants` (optional): Number of variations to generate (default: 3)
- `parameters.includeMetrics` (optional): Include engagement metrics (default: true)

---

## 2. Expected Responses

### Bias Check Response (200 OK)
```json
{
  "data": {
    "id": "uuid-string",
    "overallScore": 65,
    "severity": "medium",
    "biases": [
      {
        "type": "gender",
        "description": "Gendered language detected",
        "affectedText": "salesman",
        "score": 75,
        "recommendation": "Use gender-neutral term like 'salesperson' or 'sales representative'",
        "examples": ["salesperson", "sales representative", "sales associate"]
      }
    ],
    "suggestions": [
      "Consider using inclusive language throughout your content",
      "Replace gendered terms with neutral alternatives"
    ],
    "metadata": {
      "modelVersion": "kolosal-v1.2",
      "confidence": 0.92
    }
  }
}
```

**Response Fields:**
- `overallScore`: 0-100, lower is better (less bias)
- `severity`: "low" | "medium" | "high" | "critical"
- `biases[]`: Array of detected bias issues
- `suggestions[]`: General improvement recommendations
- `metadata.confidence`: 0-1, model confidence score

---

### Copy Generation Response (200 OK)
```json
{
  "data": {
    "id": "uuid-string",
    "original": "Write a welcoming message for our new diversity initiative",
    "suggestions": [
      {
        "id": "uuid-1",
        "text": "Welcome to our inclusive community where every voice matters...",
        "language": "en",
        "tone": "friendly",
        "inclusivityScore": 95,
        "biasScore": 5,
        "engagement": {
          "predicted": 8.5,
          "confidence": 0.89
        },
        "highlights": ["inclusive", "community", "voice matters"]
      },
      {
        "id": "uuid-2",
        "text": "Join us in celebrating diversity...",
        "language": "en",
        "tone": "friendly",
        "inclusivityScore": 92,
        "biasScore": 8,
        "engagement": {
          "predicted": 7.8,
          "confidence": 0.85
        },
        "highlights": ["celebrating", "diversity"]
      }
    ],
    "metadata": {
      "targetAudience": "Broad audience",
      "tone": "friendly",
      "inclusivityScore": 95
    }
  }
}
```

**Response Fields:**
- `inclusivityScore`: 0-100, higher is better
- `biasScore`: 0-100, lower is better (less bias)
- `engagement.predicted`: Predicted engagement rate (0-10)
- `highlights[]`: Key inclusive terms used

---

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Invalid or missing API key"
}
```
**Cause:** Missing or invalid `Authorization` header

#### 403 Forbidden
```json
{
  "error": "Forbidden - insufficient permissions"
}
```
**Causes:**
1. API key hasn't been activated yet
2. API key is missing required organization/project scopes
3. Incorrect endpoint path (security measure)

**Fix:** 
- Verify the endpoint URLs are correct
- Check if your API key needs to be activated through the Kolosal dashboard
- Ensure your key has the required permissions

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "content": "Content field is required"
  }
}
```
**Cause:** Missing required fields or invalid request body

---

## 3. Code Changes Applied

The following changes were made to `server/index.js`:

### Changed 1: Default API URL
- **Old:** Required both `KOLOSAL_API_KEY` and `KOLOSAL_API_URL` to be set
- **New:** Only requires `KOLOSAL_API_KEY`, defaults to `https://api.kolosal.ai/v1`

### Change 2: Bias Endpoint
- **Old:** `${baseUrl}/content/bias-check` (but only called if both env vars set)
- **New:** `${baseUrl}/content/bias-check` (with correct default base URL)

### Change 3: Copy Endpoint
- **Old:** `${baseUrl}/content/generate` (but only called if both env vars set)
- **New:** `${baseUrl}/content/generate` (with correct default base URL)

### Change 4: Enhanced Logging
Added detailed error logging including:
- HTTP status code
- Status text
- Response data
- Request URL

This helps diagnose 403 vs 401 errors and understand API responses.

---

## 4. Testing Guide

### Setup Environment Variables

Create a `.env` file in the project root:

```bash
# Required
KOLOSAL_API_KEY=your_actual_api_key_here

# Optional (uses default if not set)
KOLOSAL_API_URL=https://api.kolosal.ai/v1
PORT=3001
```

### Start the Server

```bash
cd server
node index.js
```

You should see:
```
🚀 Inclusive Marketing Hub API
📡 Server running on http://localhost:3001
🔑 Kolosal API Key: ✅ Configured
🌐 Kolosal API URL: https://api.kolosal.ai/v1
🟢 LIVE MODE - Using Kolosal API with fallback
```

---

### Test with curl

#### Test 1: Bias Check
```bash
curl -X POST http://localhost:3001/api/bias \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Our salesman will help you choose the right product for your needs.",
    "language": "en",
    "campaignId": "test-campaign-001"
  }'
```

**Expected Success Response:**
- Status: 200 OK
- Body contains: `overallScore`, `severity`, `biases[]` array
- Server logs: `[Kolosal Bias] Success: 200`

**Expected Fallback (on error):**
- Status: 200 OK (still returns success)
- Body contains mock data
- Server logs: `Kolosal bias API failed, falling back to mock: [error message]`

#### Test 2: Copy Generation
```bash
curl -X POST http://localhost:3001/api/copy \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a welcoming message for our diversity and inclusion initiative",
    "language": "en",
    "tone": "friendly",
    "campaignId": "test-campaign-001"
  }'
```

**Expected Success Response:**
- Status: 200 OK
- Body contains: `suggestions[]` array with multiple variants
- Server logs: `[Kolosal Copy] Success: 200`

**Expected Fallback (on error):**
- Status: 200 OK (still returns success)
- Body contains mock data
- Server logs: `Kolosal copy API failed, falling back to mock: [error message]`

---

### Test Directly Against Kolosal API

If you want to test the Kolosal API directly (bypass the server):

#### Direct Bias Check
```bash
curl -X POST https://api.kolosal.ai/v1/content/bias-check \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{
    "content": "Our salesman will help you choose the right product.",
    "language": "en"
  }'
```

#### Direct Copy Generation
```bash
curl -X POST https://api.kolosal.ai/v1/content/generate \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{
    "prompt": "Write a welcoming message for our new diversity initiative",
    "language": "en",
    "tone": "friendly",
    "parameters": {
      "variants": 3,
      "includeMetrics": true
    }
  }'
```

---

## 5. Troubleshooting

### Still Getting 403 Errors?

1. **Verify the API key is valid:**
   ```bash
   echo $KOLOSAL_API_KEY
   ```

2. **Check server logs for details:**
   The enhanced error logging will show:
   ```javascript
   Full error: {
     status: 403,
     statusText: 'Forbidden',
     data: { error: '...' },
     url: 'https://api.kolosal.ai/v1/content/bias-check'
   }
   ```

3. **Contact Kolosal Support:**
   - Verify your API key is activated
   - Check if your key has the required scopes:
     - `content:bias-check`
     - `content:generate`
   - Ask if there are organization or project ID requirements

4. **Test the Health Endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "kolosalApiKey": "configured",
     "kolosalApiUrl": "https://api.kolosal.ai/v1",
     "mode": "live"
   }
   ```

### Mock Fallback Always Triggers?

This is **expected behavior** when:
- API key is missing
- API returns errors (401, 403, 500, timeout)
- Network issues occur

The server will gracefully fall back to mock data and continue serving requests.

---

## 6. Summary of Changes

✅ **Fixed endpoint paths:**
- Bias: `/v1/content/bias-check`
- Copy: `/v1/content/generate`

✅ **Added default base URL:**
- `https://api.kolosal.ai/v1`

✅ **Simplified configuration:**
- Only `KOLOSAL_API_KEY` required
- `KOLOSAL_API_URL` optional (has default)

✅ **Enhanced error logging:**
- Full error details in development mode
- Request URL included in logs

✅ **Preserved mock fallback:**
- Graceful degradation on API errors
- Frontend contracts remain satisfied

---

## Next Steps

1. Set `KOLOSAL_API_KEY` in your `.env` file
2. Start the server: `node server/index.js`
3. Test with the curl commands above
4. If 403 persists, contact Kolosal support with the error details from server logs
5. Monitor server logs for `[Kolosal Bias] Success: 200` and `[Kolosal Copy] Success: 200`

The server should now successfully call the Kolosal API and return **200 OK** instead of falling back to mocks.

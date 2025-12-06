# Kolosal AI REST API Contract

## Complete API Documentation for Bias Check & Copy Generation

This document provides the complete REST API contract for integrating with Kolosal AI endpoints.

---

## 🌐 Base Configuration

### Base URL
```
https://api.kolosal.ai/v1
```

### Full Endpoint Paths
```
POST /v1/content/bias-check    (Bias Detection)
POST /v1/content/generate       (Copy Generation)
```

---

## 🔐 Authentication & Headers

All requests require these headers:

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `Authorization` | `Bearer YOUR_API_KEY` | ✅ Yes | API authentication token |
| `Content-Type` | `application/json` | ✅ Yes | Request content type |
| `Accept` | `application/json` | ✅ Yes | Expected response format |
| `X-API-Version` | `2024-01` | ✅ Yes | API version (missing causes 403) |

**Important:** The `X-API-Version` header is critical. Missing this header is a common cause of 403 errors.

---

## 📝 Bias Check Endpoint

### Request

**Method:** `POST`  
**Path:** `/v1/content/bias-check`

#### Request Body Schema

```json
{
  "content": "string (required)",
  "language": "string (optional, default: 'en')",
  "context": {
    "campaignId": "string (optional)",
    "industry": "string (optional)",
    "targetAudience": "string (optional)"
  }
}
```

#### Field Descriptions

- **content** (required): The marketing copy or text content to analyze for bias
- **language** (optional): Language code - `"en"` (English) or `"id"` (Bahasa Indonesia). Default: `"en"`
- **context.campaignId** (optional): Unique identifier for the campaign
- **context.industry** (optional): Business industry/sector
- **context.targetAudience** (optional): Target demographic description

#### Example Request Body

```json
{
  "content": "Perfect for housewives and busy professionals who want to stay organized",
  "language": "en",
  "context": {
    "campaignId": "campaign-abc-123",
    "industry": "productivity-tools",
    "targetAudience": "working adults"
  }
}
```

### Response

#### Success Response (200 OK)

```json
{
  "id": "bias-check-uuid-12345",
  "status": "success",
  "data": {
    "overallScore": 75,
    "severity": "high",
    "biases": [
      {
        "type": "gender",
        "description": "Gender-stereotyped language detected",
        "affectedText": "housewives",
        "score": 85,
        "recommendation": "Use 'homemakers' or 'stay-at-home parents' instead",
        "examples": ["homemakers", "primary caregivers", "stay-at-home parents"]
      },
      {
        "type": "economic",
        "description": "Assumes specific economic status",
        "affectedText": "professionals",
        "score": 45,
        "recommendation": "Consider more inclusive terms like 'individuals' or 'people'",
        "examples": ["individuals", "people", "anyone"]
      }
    ],
    "suggestions": [
      "Replace gendered terms with inclusive alternatives",
      "Focus on behaviors and needs rather than demographics",
      "Consider using 'people who manage households' instead of 'housewives'"
    ],
    "metadata": {
      "modelVersion": "kolosal-bias-v2.1",
      "confidence": 0.92,
      "processedAt": "2025-12-06T10:30:00Z"
    }
  }
}
```

#### Response Field Descriptions

- **id**: Unique identifier for this bias check
- **status**: Request status (`"success"` or `"error"`)
- **data.overallScore**: Overall bias score (0-100, higher = more biased)
- **data.severity**: Severity level (`"low"`, `"medium"`, `"high"`, `"critical"`)
- **data.biases[]**: Array of detected biases
  - **type**: Bias category (`"gender"`, `"age"`, `"economic"`, `"religious"`, `"ethnic"`, `"disability"`, `"appearance"`)
  - **description**: Human-readable description
  - **affectedText**: The specific text flagged
  - **score**: Bias severity score (0-100)
  - **recommendation**: Suggested improvement
  - **examples[]**: Alternative inclusive phrases
- **data.suggestions[]**: General recommendations for improvement
- **data.metadata**: Processing metadata
  - **modelVersion**: AI model version used
  - **confidence**: Model confidence score (0-1)
  - **processedAt**: ISO timestamp

---

## ✍️ Copy Generation Endpoint

### Request

**Method:** `POST`  
**Path:** `/v1/content/generate`

#### Request Body Schema

```json
{
  "prompt": "string (required)",
  "language": "string (optional, default: 'en')",
  "tone": "string (optional, default: 'friendly')",
  "parameters": {
    "campaignId": "string (optional)",
    "targetLength": "number (optional, 50-500)",
    "variants": "number (optional, 1-5, default: 3)",
    "includeMetrics": "boolean (optional, default: true)"
  }
}
```

#### Field Descriptions

- **prompt** (required): Campaign description or brief for copy generation
- **language** (optional): `"en"` or `"id"`. Default: `"en"`
- **tone** (optional): Desired tone - `"professional"`, `"friendly"`, `"casual"`, `"enthusiastic"`, `"empathetic"`. Default: `"friendly"`
- **parameters.campaignId** (optional): Campaign identifier
- **parameters.targetLength** (optional): Target character length (50-500)
- **parameters.variants** (optional): Number of copy variants to generate (1-5)
- **parameters.includeMetrics** (optional): Include inclusivity/engagement metrics

#### Example Request Body

```json
{
  "prompt": "Promote organic coffee for sustainability-conscious consumers in urban areas",
  "language": "en",
  "tone": "friendly",
  "parameters": {
    "campaignId": "campaign-coffee-2025",
    "targetLength": 150,
    "variants": 3,
    "includeMetrics": true
  }
}
```

### Response

#### Success Response (200 OK)

```json
{
  "id": "gen-uuid-67890",
  "status": "success",
  "data": {
    "original": "Promote organic coffee for sustainability-conscious consumers in urban areas",
    "variants": [
      {
        "id": "variant-1",
        "text": "Discover organic coffee that aligns with your values. Every cup supports sustainable farming and a healthier planet.",
        "language": "en",
        "tone": "friendly",
        "metrics": {
          "inclusivityScore": 92,
          "biasScore": 8,
          "engagement": {
            "predicted": 7.2,
            "confidence": 0.88
          }
        },
        "highlights": [
          "Values-based appeal",
          "Non-assumptive language",
          "Inclusive messaging"
        ]
      },
      {
        "id": "variant-2",
        "text": "Enjoy coffee that cares. Grown organically, chosen thoughtfully, loved universally.",
        "language": "en",
        "tone": "friendly",
        "metrics": {
          "inclusivityScore": 95,
          "biasScore": 5,
          "engagement": {
            "predicted": 8.1,
            "confidence": 0.91
          }
        },
        "highlights": [
          "Short and memorable",
          "Universal appeal",
          "Emotional connection"
        ]
      },
      {
        "id": "variant-3",
        "text": "Organic coffee for everyone who believes in a sustainable future. Better for you, better for farmers, better for Earth.",
        "language": "en",
        "tone": "friendly",
        "metrics": {
          "inclusivityScore": 89,
          "biasScore": 11,
          "engagement": {
            "predicted": 6.8,
            "confidence": 0.85
          }
        },
        "highlights": [
          "Explicit inclusivity",
          "Triple-benefit messaging",
          "Clear value proposition"
        ]
      }
    ],
    "metadata": {
      "modelVersion": "kolosal-gen-v1.8",
      "generatedAt": "2025-12-06T10:35:00Z",
      "targetAudience": "sustainability-conscious consumers"
    }
  }
}
```

#### Response Field Descriptions

- **id**: Unique generation request ID
- **status**: Request status
- **data.original**: Original prompt text
- **data.variants[]**: Array of generated copy variants
  - **id**: Variant identifier
  - **text**: Generated marketing copy
  - **language**: Language code
  - **tone**: Applied tone
  - **metrics.inclusivityScore**: How inclusive the copy is (0-100, higher = better)
  - **metrics.biasScore**: Bias level (0-100, lower = better)
  - **metrics.engagement.predicted**: Predicted engagement score (0-10)
  - **metrics.engagement.confidence**: Model confidence (0-1)
  - **highlights[]**: Key strengths of this variant
- **data.metadata**: Generation metadata

---

## 🚨 HTTP Status Codes

| Code | Status | Meaning | Resolution |
|------|--------|---------|------------|
| **200** | OK | Request successful | N/A |
| **400** | Bad Request | Invalid request body or parameters | Check request schema |
| **401** | Unauthorized | Invalid or missing API key | Verify `KOLOSAL_API_KEY` |
| **403** | Forbidden | Valid key but access denied | ✅ Add `X-API-Version` header<br>✅ Check endpoint paths<br>✅ Verify API key permissions |
| **429** | Too Many Requests | Rate limit exceeded | Implement exponential backoff |
| **500** | Internal Server Error | Server-side issue | Retry with backoff, contact support |

### Common 403 Causes & Fixes

1. **Missing `X-API-Version` header** → Add `X-API-Version: 2024-01`
2. **Wrong endpoint path** → Use `/v1/content/bias-check` (not `/bias-check`)
3. **Wrong base URL** → Use `https://api.kolosal.ai/v1`
4. **Insufficient permissions** → Contact Kolosal support to enable endpoints
5. **Quota exceeded** → Check billing/usage limits

---

## 🧪 Testing with cURL

### Environment Setup

```bash
# Set your API key
export KOLOSAL_API_KEY="your-actual-api-key-here"
```

### Test Bias Check

```bash
curl -X POST https://api.kolosal.ai/v1/content/bias-check \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{
    "content": "Perfect for housewives and busy working men",
    "language": "en",
    "context": {
      "campaignId": "test-001"
    }
  }' | jq .
```

### Test Copy Generation

```bash
curl -X POST https://api.kolosal.ai/v1/content/generate \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Version: 2024-01" \
  -d '{
    "prompt": "Promote eco-friendly fashion for conscious shoppers",
    "language": "en",
    "tone": "professional",
    "parameters": {
      "campaignId": "test-002",
      "variants": 3,
      "includeMetrics": true
    }
  }' | jq .
```

### Test Health Endpoint (Local Server)

```bash
curl http://localhost:3001/health | jq .
```

Expected output:
```json
{
  "status": "ok",
  "timestamp": "2025-12-06T10:45:00.000Z",
  "kolosalApiKey": "configured",
  "kolosalApiUrl": "https://api.kolosal.ai/v1",
  "mode": "live"
}
```

---

## 🔧 Server Configuration

### Environment Variables (`.env`)

Create/update `server/.env`:

```env
# Kolosal API Configuration
KOLOSAL_API_KEY=your-actual-api-key-here
KOLOSAL_API_URL=https://api.kolosal.ai/v1

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Verify Configuration

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check startup logs:**
   ```
   🚀 Inclusive Marketing Hub API
   📡 Server running on http://localhost:3001
   🔑 Kolosal API Key: ✅ Configured
   🌐 Kolosal API URL: https://api.kolosal.ai/v1
   🟢 LIVE MODE - Using Kolosal API with fallback
   ```

3. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

---

## 📊 Response Normalization

The server normalizes Kolosal API responses to match frontend TypeScript contracts. The normalization handles:

- Nested `data` objects (`response.data.data` → `response.data`)
- Alternative field names (`score` vs `overallScore`, `variants` vs `suggestions`)
- Score clamping (0-100 range)
- Severity derivation from scores
- Default values for missing optional fields

This ensures the frontend receives consistent data regardless of Kolosal API version changes.

---

## 🔄 Fallback Behavior

The server implements graceful degradation:

1. **Try Live API** → If `KOLOSAL_API_KEY` and `KOLOSAL_API_URL` are configured
2. **Log Error** → On API failure (network, 4xx, 5xx errors)
3. **Return Mock Data** → Uses Faker.js with Indonesian locale
4. **No User Disruption** → Frontend always gets valid responses

This ensures demo/development continuity even with API issues.

---

## 🐛 Troubleshooting

### Issue: Getting 403 Forbidden

**Checklist:**
- ✅ Added `X-API-Version: 2024-01` header?
- ✅ Using correct endpoint: `/v1/content/bias-check` (not `/bias-check`)?
- ✅ Using correct base URL: `https://api.kolosal.ai/v1`?
- ✅ API key has permissions for these endpoints?

**Debug Command:**
```bash
curl -v https://api.kolosal.ai/v1/content/bias-check \
  -H "Authorization: Bearer ${KOLOSAL_API_KEY}" \
  -H "X-API-Version: 2024-01" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'
```

### Issue: Getting 401 Unauthorized

**Solution:** Invalid API key. Check:
```bash
echo $KOLOSAL_API_KEY
# Should output your key, not empty
```

### Issue: Server logs show 403 but falls back to mock

**Expected behavior.** The server is configured with fallback logic. To debug:
1. Check `server/.env` has correct `KOLOSAL_API_KEY` and `KOLOSAL_API_URL`
2. Restart server: `npm run dev`
3. Watch logs during API calls
4. If still 403, contact Kolosal support to verify API key permissions

---

## 📞 Support

- **Kolosal API Issues:** Contact Kolosal.ai support
- **Integration Questions:** Check `INTEGRATION_SUMMARY.md`
- **Server Setup:** See `KOLOSAL_API_SETUP.md`

---

**Last Updated:** December 6, 2025  
**API Version:** 2024-01  
**Server Version:** 1.0.0

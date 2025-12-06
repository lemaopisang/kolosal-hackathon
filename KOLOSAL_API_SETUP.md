# Kolosal AI API Setup Guide

This guide helps you connect the Inclusive Marketing Hub to the real Kolosal.ai API endpoints.

---

## 🔑 Step 1: Get Your API Key

1. Sign up at [Kolosal.ai](https://kolosal.ai) (or contact the Kolosal team)
2. Navigate to your dashboard/API settings
3. Generate a new API key
4. Copy the key securely

---

## ⚙️ Step 2: Configure Environment Variables

### Backend Configuration

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```env
   KOLOSAL_API_KEY=your_actual_api_key_here
   KOLOSAL_API_URL=https://api.kolosal.ai/v1
   PORT=3001
   NODE_ENV=development
   ```

4. **Important**: Never commit `.env` to git! It's already in `.gitignore`.

---

## 🔌 Step 3: Update API Endpoints (If Needed)

The current implementation uses *assumed* endpoint paths. Update these in `server/kolosalService.js` based on official Kolosal documentation:

### Current Endpoints (Update These)

```javascript
// In server/kolosalService.js

// Line ~50: MSME Personas
const response = await kolosalClient.get('/msme-personas', {
  params: { page, limit, locale: 'id_ID' },
})
// ⚠️ UPDATE to actual endpoint, e.g., '/v1/personas' or '/personas/msme'

// Line ~75: Bias Check
const response = await kolosalClient.post('/bias-check', {
  content,
  language,
  // ...
})
// ⚠️ UPDATE to actual endpoint, e.g., '/v1/analyze/bias' or '/bias'

// Line ~100: Copy Generation
const response = await kolosalClient.post('/generate-copy', {
  prompt,
  language,
  tone,
  // ...
})
// ⚠️ UPDATE to actual endpoint, e.g., '/v1/generate/copy' or '/copy'

// Line ~125: Platform Analytics
const response = await kolosalClient.get('/analytics/platform', {
  params: { timeframe: '30d' },
})
// ⚠️ UPDATE to actual endpoint, e.g., '/v1/stats' or '/analytics'
```

### How to Update

1. Open `server/kolosalService.js`
2. Find each endpoint URL string
3. Replace with the actual path from Kolosal docs
4. Update request parameters if the API expects different field names

Example:
```javascript
// Before (assumed)
const response = await kolosalClient.post('/bias-check', {
  content,
  language,
})

// After (based on actual docs)
const response = await kolosalClient.post('/v1/content/analyze', {
  text: content,      // ← Field name might differ
  lang: language,     // ← Field name might differ
  analysis_type: 'bias'  // ← Additional fields might be required
})
```

---

## 🔄 Step 4: Update Response Formatters

The API service includes formatter functions to adapt Kolosal responses to our internal types. Update these if the actual response structure differs:

### Bias Response Formatter

```javascript
// In server/kolosalService.js - Line ~200
function formatBiasResponse(apiData) {
  return {
    id: apiData.id || apiData.checkId,  // ← Update field mapping
    campaignId: apiData.campaignId,
    detectedAt: apiData.timestamp || new Date().toISOString(),
    overallScore: apiData.score || apiData.overallScore || 0,
    severity: apiData.severity || calculateSeverity(apiData.score),
    biases: apiData.biases || apiData.detections || [],
    suggestions: apiData.suggestions || apiData.recommendations || [],
    metadata: {
      modelVersion: apiData.modelVersion || 'kolosal-bias-v2.1',
      confidence: apiData.confidence || 0.85,
    },
  }
}
```

**Action**: Map `apiData` fields to match actual Kolosal response keys.

### Copy Response Formatter

```javascript
// In server/kolosalService.js - Line ~220
function formatCopyResponse(apiData, language) {
  return {
    id: apiData.id || apiData.generationId,
    campaignId: apiData.campaignId,
    language,
    original: apiData.original || apiData.prompt,
    suggestions: apiData.variants || apiData.suggestions || [],  // ← Update
    createdAt: apiData.timestamp || new Date().toISOString(),
    metadata: {
      targetAudience: apiData.targetAudience || 'general',
      tone: apiData.tone || 'friendly',
      inclusivityScore: apiData.inclusivityScore || 85,
    },
  }
}
```

**Action**: Ensure field mappings match Kolosal's actual response structure.

---

## 🧪 Step 5: Test the Integration

### 1. Start the Backend

```bash
cd server
npm run dev
```

Look for the startup message:
```
🚀 Inclusive Marketing Hub API
📡 Server running on http://localhost:3001
🟢 LIVE MODE - Using Kolosal.ai API
🔑 Kolosal API Key: ✅ Configured
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "kolosalApiKey": "configured",
  "mode": "live"
}
```

### 3. Test Each Endpoint

#### Campaigns
```bash
curl "http://localhost:3001/api/campaigns?limit=5" | jq
```

#### Bias Check
```bash
curl -X POST http://localhost:3001/api/bias \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Perfect for housewives and busy professionals",
    "language": "en"
  }' | jq
```

#### Copy Generation
```bash
curl -X POST http://localhost:3001/api/copy \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Promote organic coffee for sustainability-conscious consumers",
    "language": "en",
    "tone": "friendly"
  }' | jq
```

#### Platform Stats
```bash
curl http://localhost:3001/api/stats | jq
```

### 4. Check Server Logs

Look for:
- `✅ Fetched personas from Kolosal API`
- `✅ Bias check completed via Kolosal API`
- `✅ Copy generated via Kolosal API`

If you see warnings like:
- `⚠️ Kolosal API failed, falling back to mock`

Then check:
1. API key is correct
2. Endpoint URLs match Kolosal docs
3. Request payload structure is correct
4. Network connectivity

---

## 🐛 Troubleshooting

### Issue: "Using mock data (no API key configured)"

**Solution**: Ensure your `.env` file contains a valid API key and restart the server.

### Issue: "Kolosal API failed, falling back to mock"

**Possible Causes**:
1. **Invalid API Key**: Double-check the key in `.env`
2. **Wrong Endpoint URL**: Verify base URL in `KOLOSAL_API_URL`
3. **Incorrect Path**: Update endpoint paths in `kolosalService.js`
4. **Malformed Request**: Check request payload structure
5. **Network Issues**: Test connectivity to Kolosal servers
6. **Rate Limiting**: Check if you've hit API quota

**Debugging Steps**:
```bash
# Enable detailed logging
cd server
DEBUG=axios npm run dev
```

Look at the error messages in `kolosalClient.interceptors.response.use()`.

### Issue: "TypeError: Cannot read property 'X' of undefined"

**Solution**: Update response formatters in `kolosalService.js` to match actual API response structure.

Example fix:
```javascript
// If API returns { data: { results: [] } } instead of { personas: [] }
return {
  data: response.data.results,  // ← Update this line
  total: response.data.totalCount || 50,
}
```

---

## 🔒 Security Best Practices

1. **Never expose API keys in frontend code**
   - All Kolosal API calls go through the Express backend
   - Frontend only communicates with `/api/*` routes

2. **Use environment variables**
   - Keep `.env` out of version control
   - Use different keys for dev/staging/production

3. **Implement rate limiting**
   ```bash
   npm install express-rate-limit
   ```
   Then in `server/index.js`:
   ```javascript
   import rateLimit from 'express-rate-limit'
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   })
   
   app.use('/api/', limiter)
   ```

4. **Add authentication** (for production)
   - Implement user accounts
   - Protect routes with JWT tokens
   - Track usage per user

---

## 📊 Monitoring API Usage

Add logging to track API calls:

```javascript
// In server/kolosalService.js
let apiCallCount = 0

kolosalClient.interceptors.response.use(
  (response) => {
    apiCallCount++
    console.log(`📈 Kolosal API calls today: ${apiCallCount}`)
    return response
  },
  (error) => {
    // ... error handling
  }
)
```

Consider integrating:
- **Application Performance Monitoring (APM)**: New Relic, Datadog
- **Error Tracking**: Sentry, Rollbar
- **Usage Analytics**: Custom dashboard with request counts, response times

---

## 📚 API Documentation Template

When you receive Kolosal's official docs, fill this template:

### Personas Endpoint
- **Method**: GET/POST
- **Path**: `/v1/...`
- **Headers**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- **Query Parameters**:
  - `page` (int): Page number
  - `limit` (int): Items per page
- **Response Shape**:
  ```json
  {
    "data": [...],
    "total": 100,
    "page": 1
  }
  ```

### Bias Check Endpoint
- **Method**: POST
- **Path**: `/v1/...`
- **Request Body**:
  ```json
  {
    "text": "content here",
    "language": "en"
  }
  ```
- **Response Shape**:
  ```json
  {
    "id": "uuid",
    "score": 75,
    "biases": [...]
  }
  ```

---

## ✅ Checklist

Before going to production:

- [ ] API key obtained from Kolosal.ai
- [ ] `.env` configured with valid credentials
- [ ] All endpoint URLs updated to match official docs
- [ ] Response formatters tested with real API data
- [ ] Error handling tested (invalid key, rate limits, network errors)
- [ ] Rate limiting implemented on Express routes
- [ ] Logging/monitoring configured
- [ ] Security review completed
- [ ] API usage costs/quotas reviewed

---

## 🆘 Need Help?

- **Kolosal.ai Support**: [support@kolosal.ai](mailto:support@kolosal.ai)
- **API Documentation**: [Link to official docs]
- **Project Issues**: Create an issue in the repository

---

**Happy Integrating! 🚀**

Remember: The current implementation includes smart fallback logic, so the app works perfectly in mock mode while you set up the real API.

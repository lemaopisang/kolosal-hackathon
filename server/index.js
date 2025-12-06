import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import axios from 'axios'
import crypto from 'crypto'
import {
  generateCampaignPersona,
  generateBiasInsight,
  generateCopySuggestion,
} from './mockData.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(morgan('dev'))
// Accept JSON, JSON-ish, or plain text bodies and normalize to JS objects
app.use(express.json({
  strict: false,
  limit: '1mb',
  type: ['application/json', 'application/*+json', 'text/json', 'text/plain'],
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.text({ type: '*/*', limit: '1mb' }))

// Normalize string bodies into JSON if possible
app.use((req, res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body)
    } catch (e) {
      // keep as string; downstream can decide
    }
  }
  next()
})

// Gracefully handle bad JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body', timestamp: new Date().toISOString() })
  }
  return next(err)
})

// In-memory cache for generated personas (simulates database)
const personas = []

// Generate initial dataset
for (let i = 0; i < 50; i++) {
  personas.push(generateCampaignPersona())
}

// Helpers to normalize Kolosal responses to our contract
const clampScore = (n, fallback = 0) => {
  const num = Number(n)
  if (Number.isNaN(num)) return fallback
  return Math.min(100, Math.max(0, Math.round(num)))
}

const deriveSeverity = (score) => {
  if (score < 30) return 'low'
  if (score < 60) return 'medium'
  if (score < 80) return 'high'
  return 'critical'
}

const normalizeBiasResponse = (data, campaignId) => {
  const biases = Array.isArray(data?.biases)
    ? data.biases.map((b) => ({
        type: b.type || 'gender',
        description: b.description || 'Potential bias detected',
        affectedText: b.affectedText || b.text || '',
        score: clampScore(b.score ?? 50, 50),
        recommendation: b.recommendation || b.suggestion || 'Use neutral language',
        examples: Array.isArray(b.examples)
          ? b.examples
          : b.example
            ? [b.example]
            : b.sample
              ? [b.sample]
              : [],
      }))
    : []

  const overallScore = clampScore(data?.overallScore ?? data?.score ?? 65, 65)
  const severity = data?.severity || deriveSeverity(overallScore)
  const suggestions = Array.isArray(data?.suggestions)
    ? data.suggestions
    : Array.isArray(data?.tips)
      ? data.tips
      : []

  return {
    id: data?.id || data?._id || data?.uuid || crypto.randomUUID?.() || `${Date.now()}`,
    campaignId: campaignId || data?.campaignId || 'default',
    detectedAt: data?.detectedAt || data?.timestamp || new Date().toISOString(),
    overallScore,
    severity,
    biases,
    suggestions,
    metadata: {
      modelVersion: data?.metadata?.modelVersion || data?.modelVersion || 'kolosal-unknown',
      confidence: Number(data?.metadata?.confidence ?? data?.confidence ?? 0.9),
    },
  }
}

const normalizeCopyResponse = (data, campaignId, language, tone) => {
  const suggestions = Array.isArray(data?.suggestions)
    ? data.suggestions
    : Array.isArray(data?.variants)
      ? data.variants
      : []

  const normalizedSuggestions = suggestions.map((s) => ({
    id: s.id || s._id || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    text: s.text || s.content || s.copy || '',
    language: s.language || language || 'en',
    tone: s.tone || tone || 'friendly',
    inclusivityScore: clampScore(s.inclusivityScore ?? s.score ?? 85, 85),
    biasScore: clampScore(s.biasScore ?? s.bias ?? 15, 15),
    engagement: {
      predicted: Number(s.engagement?.predicted ?? s.predictedEngagement ?? 5.0),
      confidence: Number(s.engagement?.confidence ?? s.engagementConfidence ?? 0.85),
    },
    highlights: Array.isArray(s.highlights)
      ? s.highlights
      : s.highlight
        ? [s.highlight]
        : [],
  }))

  return {
    id: data?.id || data?._id || crypto.randomUUID?.() || `${Date.now()}`,
    campaignId: campaignId || data?.campaignId || 'default',
    language: data?.language || language || 'en',
    original: data?.original || data?.input || data?.prompt || '',
    suggestions: normalizedSuggestions,
    createdAt: data?.createdAt || data?.timestamp || new Date().toISOString(),
    metadata: {
      targetAudience: data?.metadata?.targetAudience || data?.targetAudience || 'Broad audience',
      tone: data?.metadata?.tone || tone || 'friendly',
      inclusivityScore: clampScore(data?.metadata?.inclusivityScore ?? data?.overallScore ?? 90, 90),
    },
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    kolosalApiKey: process.env.KOLOSAL_API_KEY ? 'configured' : 'missing',
  })
})

// Get all campaign personas (paginated)
app.get('/api/campaigns', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 12
  const freeze = req.query.freeze === 'true'

  // If freeze mode, always return same subset
  const startIdx = freeze ? 0 : (page - 1) * limit
  const endIdx = startIdx + limit

  const paginatedPersonas = personas.slice(startIdx, endIdx)

  res.json({
    data: paginatedPersonas,
    page,
    limit,
    total: personas.length,
    hasMore: endIdx < personas.length,
    success: true,
    timestamp: new Date().toISOString(),
  })
})

// Get single campaign persona
app.get('/api/campaigns/:id', (req, res) => {
  const persona = personas.find((p) => p.id === req.params.id)

  if (!persona) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found',
      timestamp: new Date().toISOString(),
    })
  }

  res.json({
    data: persona,
    success: true,
    timestamp: new Date().toISOString(),
  })
})

// Create new campaign persona
app.post('/api/campaigns', (req, res) => {
  const newPersona = generateCampaignPersona()

  // Override with request data if provided
  if (req.body.businessName) newPersona.businessName = req.body.businessName
  if (req.body.businessType) newPersona.businessType = req.body.businessType
  if (req.body.targetAudience) newPersona.targetAudience = req.body.targetAudience
  if (req.body.marketingGoals) newPersona.marketingGoals = req.body.marketingGoals

  personas.unshift(newPersona)

  res.status(201).json({
    data: newPersona,
    success: true,
    message: 'Campaign created successfully',
    timestamp: new Date().toISOString(),
  })
})

// Check content for bias
app.post('/api/bias', async (req, res) => {
  try {
    const { campaignId, content, language = 'en' } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
        timestamp: new Date().toISOString(),
      })
    }

    // If KOLOSAL_API_KEY is configured, try the live API and fallback to mock on error
    if (process.env.KOLOSAL_API_KEY && process.env.KOLOSAL_API_URL) {
      try {
        const url = `${process.env.KOLOSAL_API_URL.replace(/\/$/, '')}/bias-check`
        const response = await axios.post(
          url,
          { content, language, campaignId },
          {
            headers: { Authorization: `Bearer ${process.env.KOLOSAL_API_KEY}` },
            timeout: 10000,
          }
        )
        const normalized = normalizeBiasResponse(response.data, campaignId)
        return res.json({ data: normalized, success: true, timestamp: new Date().toISOString() })
      } catch (err) {
        console.warn('Kolosal bias API failed, falling back to mock:', err?.message)
        if (process.env.NODE_ENV !== 'production') {
          console.error(err?.response?.data || err)
        }
      }
    }

    const biasInsight = generateBiasInsight(campaignId || 'default')
    return res.json({ data: normalizeBiasResponse(biasInsight, campaignId), success: true, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Unhandled /api/bias error', err)
    return res.status(500).json({ success: false, message: 'Internal server error', timestamp: new Date().toISOString() })
  }
})

// Generate inclusive copy suggestions
app.post('/api/copy', async (req, res) => {
  try {
    const { campaignId, prompt, language = 'en', tone = 'friendly' } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
        timestamp: new Date().toISOString(),
      })
    }

    // Try live Kolosal if configured, otherwise use mock generator
    if (process.env.KOLOSAL_API_KEY && process.env.KOLOSAL_API_URL) {
      try {
        const url = `${process.env.KOLOSAL_API_URL.replace(/\/$/, '')}/generate-copy`
        const response = await axios.post(
          url,
          { prompt, language, tone, campaignId },
          {
            headers: { Authorization: `Bearer ${process.env.KOLOSAL_API_KEY}` },
            timeout: 15000,
          }
        )
        const normalized = normalizeCopyResponse(response.data, campaignId, language, tone)
        return res.json({ data: normalized, success: true, timestamp: new Date().toISOString() })
      } catch (err) {
        console.warn('Kolosal copy API failed, falling back to mock:', err?.message)
        if (process.env.NODE_ENV !== 'production') {
          console.error(err?.response?.data || err)
        }
      }
    }

    const copySuggestions = generateCopySuggestion(campaignId || 'default', language)

    // Filter suggestions by requested tone if specified
    if (tone && tone !== 'all') {
      copySuggestions.suggestions = copySuggestions.suggestions.filter((s) => s.tone === tone)
    }

    return res.json({ data: normalizeCopyResponse(copySuggestions, campaignId, language, tone), success: true, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Unhandled /api/copy error', err)
    return res.status(500).json({ success: false, message: 'Internal server error', timestamp: new Date().toISOString() })
  }
})

// Get campaign statistics
app.get('/api/stats', (req, res) => {
  const totalCampaigns = personas.length
  const businessTypeDistribution = personas.reduce((acc, p) => {
    acc[p.businessType] = (acc[p.businessType] || 0) + 1
    return acc
  }, {})

  const cityDistribution = personas.reduce((acc, p) => {
    acc[p.city] = (acc[p.city] || 0) + 1
    return acc
  }, {})

  res.json({
    data: {
      totalCampaigns,
      businessTypeDistribution,
      cityDistribution,
      averageInclusivityScore: 87.5,
      totalBiasesDetected: personas.length * 2.3,
    },
    success: true,
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Inclusive Marketing Hub API`)
  console.log(`📡 Server running on http://localhost:${PORT}`)
  console.log(`🔑 Kolosal API Key: ${process.env.KOLOSAL_API_KEY ? '✅ Configured' : '❌ Missing'}`)
  console.log(`📊 Mock personas loaded: ${personas.length}`)
  console.log(`\n📚 Available endpoints:`)
  console.log(`   GET  /health`)
  console.log(`   GET  /api/campaigns`)
  console.log(`   GET  /api/campaigns/:id`)
  console.log(`   POST /api/campaigns`)
  console.log(`   POST /api/bias`)
  console.log(`   POST /api/copy`)
  console.log(`   GET  /api/stats`)
  console.log(`\n💡 Press Ctrl+C to stop\n`)
})

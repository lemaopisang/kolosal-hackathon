// Kolosal.ai API integration service
import axios from 'axios'
import {
  generateCampaignPersona,
  generateBiasInsight,
  generateCopySuggestion,
} from './mockData.js'

const KOLOSAL_API_URL = process.env.KOLOSAL_API_URL || 'https://api.kolosal.ai/v1'
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY

// Check if API key is configured
const isApiKeyConfigured = () => {
  return KOLOSAL_API_KEY && KOLOSAL_API_KEY !== 'your_kolosal_api_key_here'
}

// Create axios instance with default config
const kolosalClient = axios.create({
  baseURL: KOLOSAL_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor
kolosalClient.interceptors.request.use((config) => {
  if (KOLOSAL_API_KEY) {
    config.headers.Authorization = `Bearer ${KOLOSAL_API_KEY}`
  }
  return config
})

// Add response interceptor for error handling
kolosalClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Kolosal API Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    throw error
  }
)

/**
 * Get MSME personas from Kolosal API or fallback to mock
 */
export async function getPersonas(options = {}) {
  const { page = 1, limit = 12, freeze = false } = options

  if (!isApiKeyConfigured()) {
    console.log('📦 Using mock data (no API key configured)')
    return getMockPersonas(page, limit)
  }

  try {
    // TODO: Update endpoint based on actual Kolosal API documentation
    const response = await kolosalClient.get('/msme-personas', {
      params: { page, limit, locale: 'id_ID' },
    })

    console.log('✅ Fetched personas from Kolosal API')
    return {
      data: response.data.personas || response.data.data || response.data,
      total: response.data.total || response.data.personas?.length || 50,
      page,
      limit,
    }
  } catch (error) {
    console.warn('⚠️  Kolosal API failed, falling back to mock data')
    return getMockPersonas(page, limit)
  }
}

/**
 * Check content for bias using Kolosal API
 */
export async function checkBias(content, options = {}) {
  const { campaignId, language = 'en' } = options

  if (!isApiKeyConfigured()) {
    console.log('📦 Using mock bias data (no API key configured)')
    return generateBiasInsight(campaignId || 'default')
  }

  try {
    const response = await kolosalClient.post('/bias-check', {
      content,
      language,
      campaignId,
      options: {
        detailed: true,
        includeRecommendations: true,
      },
    })

    console.log('✅ Bias check completed via Kolosal API')
    return formatBiasResponse(response.data)
  } catch (error) {
    console.warn('⚠️  Kolosal bias check failed, falling back to mock')
    return generateBiasInsight(campaignId || 'default')
  }
}

/**
 * Generate inclusive copy using Kolosal API
 */
export async function generateCopy(prompt, options = {}) {
  const { campaignId, language = 'en', tone = 'friendly', targetLength } = options

  if (!isApiKeyConfigured()) {
    console.log('📦 Using mock copy data (no API key configured)')
    return generateCopySuggestion(campaignId || 'default', language)
  }

  try {
    const response = await kolosalClient.post('/generate-copy', {
      prompt,
      language,
      tone,
      targetLength,
      campaignId,
      options: {
        variants: 5,
        includeAnalytics: true,
        biasCheck: true,
      },
    })

    console.log('✅ Copy generated via Kolosal API')
    return formatCopyResponse(response.data, language)
  } catch (error) {
    console.warn('⚠️  Kolosal copy generation failed, falling back to mock')
    return generateCopySuggestion(campaignId || 'default', language)
  }
}

/**
 * Get platform analytics from Kolosal API
 */
export async function getPlatformStats() {
  if (!isApiKeyConfigured()) {
    console.log('📦 Using mock stats (no API key configured)')
    return getMockStats()
  }

  try {
    const response = await kolosalClient.get('/analytics/platform', {
      params: { timeframe: '30d' },
    })

    console.log('✅ Fetched platform stats from Kolosal API')
    return formatStatsResponse(response.data)
  } catch (error) {
    console.warn('⚠️  Kolosal stats failed, falling back to mock')
    return getMockStats()
  }
}

// ============================================================================
// Helper functions for mock data fallback
// ============================================================================

function getMockPersonas(page, limit) {
  const startIdx = (page - 1) * limit
  const mockPersonas = []
  
  for (let i = 0; i < limit; i++) {
    mockPersonas.push(generateCampaignPersona())
  }

  return {
    data: mockPersonas,
    total: 100, // Mock total
    page,
    limit,
  }
}

function getMockStats() {
  return {
    totalCampaigns: 127,
    totalBiasChecks: 543,
    averageInclusivityScore: 87.5,
    totalBiasesDetected: 892,
    biasReduction: 34.2,
    topBiasTypes: [
      { type: 'gender', count: 234, percentage: 26.2 },
      { type: 'age', count: 187, percentage: 21.0 },
      { type: 'economic', count: 156, percentage: 17.5 },
      { type: 'appearance', count: 132, percentage: 14.8 },
      { type: 'disability', count: 98, percentage: 11.0 },
    ],
    languageDistribution: {
      en: 312,
      id: 231,
    },
    monthlyGrowth: 23.5,
  }
}

// ============================================================================
// Response formatters (adapt Kolosal API format to our internal types)
// ============================================================================

function formatBiasResponse(apiData) {
  // If API response already matches our format, return as-is
  if (apiData.overallScore !== undefined && apiData.biases) {
    return apiData
  }

  // Otherwise, map API fields to our format
  return {
    id: apiData.id || apiData.checkId,
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

function formatCopyResponse(apiData, language) {
  // If API response already matches our format, return as-is
  if (apiData.suggestions && Array.isArray(apiData.suggestions)) {
    return apiData
  }

  // Map API fields to our format
  return {
    id: apiData.id || apiData.generationId,
    campaignId: apiData.campaignId,
    language,
    original: apiData.original || apiData.prompt,
    suggestions: apiData.variants || apiData.suggestions || [],
    createdAt: apiData.timestamp || new Date().toISOString(),
    metadata: {
      targetAudience: apiData.targetAudience || 'general',
      tone: apiData.tone || 'friendly',
      inclusivityScore: apiData.inclusivityScore || 85,
    },
  }
}

function formatStatsResponse(apiData) {
  return {
    totalCampaigns: apiData.totalCampaigns || apiData.campaigns || 0,
    totalBiasChecks: apiData.totalChecks || apiData.biasChecks || 0,
    averageInclusivityScore: apiData.avgInclusivity || apiData.averageInclusivityScore || 0,
    totalBiasesDetected: apiData.totalBiases || apiData.biasesDetected || 0,
    biasReduction: apiData.biasReduction || 0,
    topBiasTypes: apiData.topBiases || apiData.topBiasTypes || [],
    languageDistribution: apiData.languages || apiData.languageDistribution || {},
    monthlyGrowth: apiData.growth || apiData.monthlyGrowth || 0,
  }
}

function calculateSeverity(score) {
  if (score < 30) return 'low'
  if (score < 60) return 'medium'
  if (score < 80) return 'high'
  return 'critical'
}

export default {
  getPersonas,
  checkBias,
  generateCopy,
  getPlatformStats,
  isApiKeyConfigured,
}

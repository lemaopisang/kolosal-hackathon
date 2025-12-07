// API client for Kolosal Inclusive Hub
import type {
  CampaignPersona,
  BiasInsight,
  CopySuggestion,
  ApiResponse,
  PaginatedResponse,
  BiasCheckRequest,
  CopyGenerationRequest,
} from '@/types'

const API_BASE = '/api'

// Generic API error class
export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(
    status: number,
    message: string,
    data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || 'API request failed',
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network error or server unavailable')
  }
}

// ============================================================================
// Campaign Personas
// ============================================================================

export async function fetchCampaigns(params?: {
  page?: number
  limit?: number
  freeze?: boolean
}): Promise<PaginatedResponse<CampaignPersona>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.freeze) searchParams.set('freeze', 'true')

  const query = searchParams.toString()
  const response = await apiFetch<PaginatedResponse<CampaignPersona>>(
    `/campaigns${query ? `?${query}` : ''}`
  )
  const normalized = (response as ApiResponse<PaginatedResponse<CampaignPersona>>)?.data
    ?? (response as unknown as PaginatedResponse<CampaignPersona>)

  return normalized ?? { data: [], page: 1, limit: 0, total: 0, hasMore: false }
}

export async function fetchCampaign(id: string): Promise<CampaignPersona> {
  const response = await apiFetch<CampaignPersona>(`/campaigns/${id}`)
  const normalized = (response as ApiResponse<CampaignPersona>)?.data ?? (response as unknown as CampaignPersona)
  return normalized
}

export async function createCampaign(data: {
  businessName: string
  businessType: string
  targetAudience: string
  marketingGoals: string[]
}): Promise<CampaignPersona> {
  const response = await apiFetch<CampaignPersona>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const normalized = (response as ApiResponse<CampaignPersona>)?.data ?? (response as unknown as CampaignPersona)
  return normalized
}

// ============================================================================
// Bias Detection
// ============================================================================

export async function checkBias(
  request: Partial<BiasCheckRequest>
): Promise<BiasInsight> {
  const response = await apiFetch<BiasInsight>('/bias', {
    method: 'POST',
    body: JSON.stringify(request),
  })
  const normalized = (response as ApiResponse<BiasInsight>)?.data ?? (response as unknown as BiasInsight)
  return normalized
}

// ============================================================================
// Copy Generation
// ============================================================================

export async function generateCopy(
  request: Partial<CopyGenerationRequest>
): Promise<CopySuggestion> {
  const response = await apiFetch<CopySuggestion>('/copy', {
    method: 'POST',
    body: JSON.stringify(request),
  })
  const normalized = (response as ApiResponse<CopySuggestion>)?.data ?? (response as unknown as CopySuggestion)
  return normalized
}

// ============================================================================
// Platform Statistics
// ============================================================================

export interface PlatformStats {
  totalCampaigns: number
  totalBiasChecks: number
  averageInclusivityScore: number
  totalBiasesDetected: number
  biasReduction?: number
  topBiasTypes?: Array<{
    type: string
    count: number
    percentage: number
  }>
  languageDistribution?: {
    en: number
    id: number
  }
  monthlyGrowth?: number
  businessTypeDistribution?: Record<string, number>
  cityDistribution?: Record<string, number>
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const response = await apiFetch<PlatformStats>('/stats')
  const normalized = (response as ApiResponse<PlatformStats>)?.data ?? (response as unknown as PlatformStats)
  return normalized
}

// ============================================================================
// Health Check
// ============================================================================

export interface HealthStatus {
  status: string
  timestamp: string
  kolosalApiKey: string
  mode: string
}

export async function checkHealth(): Promise<HealthStatus> {
  // Use the backend server directly on port 3001
  const response = await fetch('http://localhost:3001/health')
  return response.json()
}

export default {
  fetchCampaigns,
  fetchCampaign,
  createCampaign,
  checkBias,
  generateCopy,
  fetchPlatformStats,
  checkHealth,
}

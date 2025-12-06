// Core data types matching kolosal.ai API structure

export interface CampaignPersona {
  id: string
  name: string
  businessName: string
  businessType: BusinessType
  sector: string
  city: string
  province: string
  demographics: Demographics
  painPoints: string[]
  marketingGoals: string[]
  targetAudience: string
  monthlyRevenue: RevenueRange
  digitalPresence: DigitalPresence
  createdAt: string
}

export type BusinessType = 
  | 'Warung'
  | 'Toko Kelontong' 
  | 'UMKM Fashion'
  | 'F&B'
  | 'Tourism'
  | 'Handicrafts'
  | 'Tech/Digital Services'
  | 'Beauty/Salon'
  | 'Agriculture'
  | 'Education'

export type RevenueRange = 
  | '< 5 juta'
  | '5-15 juta'
  | '15-50 juta'
  | '> 50 juta'

export interface Demographics {
  age: number
  gender: 'Male' | 'Female' | 'Non-binary'
  education: string
  experience: string
}

export interface DigitalPresence {
  hasWebsite: boolean
  hasSocialMedia: boolean
  platforms: string[]
  monthlyPosts: number
}

export interface BiasInsight {
  id: string
  campaignId: string
  detectedAt: string
  overallScore: number // 0-100, higher = more biased
  severity: BiasSeverity
  biases: BiasDetection[]
  suggestions: string[]
  metadata: {
    modelVersion: string
    confidence: number
  }
}

export type BiasSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface BiasDetection {
  type: BiasType
  description: string
  affectedText: string
  score: number
  recommendation: string
  examples: string[]
}

export type BiasType = 
  | 'gender'
  | 'age'
  | 'economic'
  | 'religious'
  | 'ethnic'
  | 'disability'
  | 'appearance'

export interface CopySuggestion {
  id: string
  campaignId: string
  language: 'en' | 'id'
  original: string
  suggestions: CopyVariant[]
  createdAt: string
  metadata: {
    targetAudience: string
    tone: Tone
    inclusivityScore: number
  }
}

export interface CopyVariant {
  id: string
  text: string
  language: 'en' | 'id'
  tone: Tone
  inclusivityScore: number
  biasScore: number
  engagement: {
    predicted: number
    confidence: number
  }
  highlights: string[]
}

export type Tone = 
  | 'professional'
  | 'friendly'
  | 'casual'
  | 'formal'
  | 'enthusiastic'
  | 'empathetic'

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// Request types
export interface CreateCampaignRequest {
  personaId?: string
  businessName: string
  businessType: BusinessType
  targetAudience: string
  marketingGoals: string[]
}

export interface BiasCheckRequest {
  campaignId: string
  content: string
  language: 'en' | 'id'
}

export interface CopyGenerationRequest {
  campaignId: string
  prompt: string
  language: 'en' | 'id'
  tone: Tone
  targetLength?: number
}

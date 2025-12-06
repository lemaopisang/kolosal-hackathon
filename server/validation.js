// Request validation middleware

export const validateBiasCheck = (req, res, next) => {
  const { content, language } = req.body

  const errors = []

  if (!content) {
    errors.push('content is required')
  } else if (typeof content !== 'string') {
    errors.push('content must be a string')
  } else if (content.trim().length === 0) {
    errors.push('content cannot be empty')
  } else if (content.length > 10000) {
    errors.push('content must be less than 10,000 characters')
  }

  if (language && !['en', 'id'].includes(language)) {
    errors.push('language must be "en" or "id"')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

export const validateCopyGeneration = (req, res, next) => {
  const { prompt, language, tone } = req.body

  const errors = []

  if (!prompt) {
    errors.push('prompt is required')
  } else if (typeof prompt !== 'string') {
    errors.push('prompt must be a string')
  } else if (prompt.trim().length === 0) {
    errors.push('prompt cannot be empty')
  } else if (prompt.length > 5000) {
    errors.push('prompt must be less than 5,000 characters')
  }

  if (language && !['en', 'id'].includes(language)) {
    errors.push('language must be "en" or "id"')
  }

  const validTones = ['professional', 'friendly', 'casual', 'formal', 'enthusiastic', 'empathetic']
  if (tone && !validTones.includes(tone)) {
    errors.push(`tone must be one of: ${validTones.join(', ')}`)
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

export const validateCampaignCreation = (req, res, next) => {
  const { businessName, businessType, targetAudience, marketingGoals } = req.body

  const errors = []

  if (!businessName || typeof businessName !== 'string' || businessName.trim().length === 0) {
    errors.push('businessName is required and must be a non-empty string')
  }

  if (!businessType || typeof businessType !== 'string' || businessType.trim().length === 0) {
    errors.push('businessType is required and must be a non-empty string')
  }

  if (!targetAudience || typeof targetAudience !== 'string' || targetAudience.trim().length === 0) {
    errors.push('targetAudience is required and must be a non-empty string')
  }

  if (marketingGoals && !Array.isArray(marketingGoals)) {
    errors.push('marketingGoals must be an array')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const errors = []

  if (req.query.page && (isNaN(page) || page < 1)) {
    errors.push('page must be a positive integer')
  }

  if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    errors.push('limit must be between 1 and 100')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

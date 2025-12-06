// Mock data generators using faker with Indonesian locale
import { faker } from '@faker-js/faker'

// Set seed for deterministic data
const SEED = 42069
faker.seed(SEED)
// Note: faker v8+ uses locales directly; ID_id locale will be applied per-function if available

const businessTypes = [
  'Warung',
  'Toko Kelontong',
  'UMKM Fashion',
  'F&B',
  'Tourism',
  'Handicrafts',
  'Tech/Digital Services',
  'Beauty/Salon',
  'Agriculture',
  'Education',
]

const indonesianCities = [
  { name: 'Jakarta', province: 'DKI Jakarta' },
  { name: 'Surabaya', province: 'Jawa Timur' },
  { name: 'Bandung', province: 'Jawa Barat' },
  { name: 'Medan', province: 'Sumatera Utara' },
  { name: 'Semarang', province: 'Jawa Tengah' },
  { name: 'Makassar', province: 'Sulawesi Selatan' },
  { name: 'Palembang', province: 'Sumatera Selatan' },
  { name: 'Tangerang', province: 'Banten' },
  { name: 'Depok', province: 'Jawa Barat' },
  { name: 'Bekasi', province: 'Jawa Barat' },
  { name: 'Yogyakarta', province: 'DI Yogyakarta' },
  { name: 'Malang', province: 'Jawa Timur' },
  { name: 'Denpasar', province: 'Bali' },
  { name: 'Bogor', province: 'Jawa Barat' },
  { name: 'Batam', province: 'Kepulauan Riau' },
]

const painPoints = [
  'Limited digital presence and online visibility',
  'Difficulty reaching younger demographics',
  'Language barriers in marketing materials',
  'Budget constraints for advertising',
  'Lack of marketing expertise and resources',
  'Inconsistent brand messaging across channels',
  'Challenges with inclusive language',
  'Limited understanding of target audience',
  'Difficulty measuring marketing ROI',
  'Competition from larger businesses',
  'Seasonal revenue fluctuations',
  'Low social media engagement',
]

const marketingGoals = [
  'Increase brand awareness in local community',
  'Attract more customers through social media',
  'Build inclusive brand identity',
  'Expand to new customer segments',
  'Improve customer retention',
  'Launch new products/services',
  'Establish online presence',
  'Create engaging content consistently',
  'Connect with millennial and Gen Z audiences',
  'Develop sustainable marketing strategy',
]

const socialPlatforms = [
  'Instagram',
  'Facebook',
  'TikTok',
  'WhatsApp Business',
  'Tokopedia',
  'Shopee',
  'Twitter/X',
  'YouTube',
]

export function generateCampaignPersona() {
  const location = faker.helpers.arrayElement(indonesianCities)
  const businessType = faker.helpers.arrayElement(businessTypes)
  const hasDigital = faker.datatype.boolean({ probability: 0.6 })

  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    businessName: generateBusinessName(businessType),
    businessType,
    sector: generateSector(businessType),
    city: location.name,
    province: location.province,
    demographics: {
      age: faker.number.int({ min: 25, max: 65 }),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Non-binary']),
      education: faker.helpers.arrayElement([
        'High School',
        'Diploma',
        'Bachelor',
        'Master',
      ]),
      experience: `${faker.number.int({ min: 1, max: 20 })} years`,
    },
    painPoints: faker.helpers.arrayElements(painPoints, { min: 2, max: 4 }),
    marketingGoals: faker.helpers.arrayElements(marketingGoals, { min: 2, max: 3 }),
    targetAudience: generateTargetAudience(),
    monthlyRevenue: faker.helpers.arrayElement([
      '< 5 juta',
      '5-15 juta',
      '15-50 juta',
      '> 50 juta',
    ]),
    digitalPresence: {
      hasWebsite: hasDigital && faker.datatype.boolean({ probability: 0.3 }),
      hasSocialMedia: hasDigital,
      platforms: hasDigital
        ? faker.helpers.arrayElements(socialPlatforms, { min: 1, max: 4 })
        : [],
      monthlyPosts: hasDigital ? faker.number.int({ min: 0, max: 30 }) : 0,
    },
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}

function generateBusinessName(type) {
  const prefixes = {
    Warung: ['Warung', 'Kedai'],
    'Toko Kelontong': ['Toko', 'Swalayan'],
    'UMKM Fashion': ['Butik', 'Fashion'],
    'F&B': ['Kafe', 'Resto', 'Kedai Kopi'],
    Tourism: ['Tour', 'Wisata', 'Travel'],
    Handicrafts: ['Kerajinan', 'Handmade'],
    'Tech/Digital Services': ['Digital', 'Tech', 'Studio'],
    'Beauty/Salon': ['Salon', 'Beauty', 'Klinik Kecantikan'],
    Agriculture: ['Tani', 'Agro', 'Organik'],
    Education: ['Kursus', 'Les', 'Bimbel'],
  }

  const prefix = faker.helpers.arrayElement(prefixes[type] || [''])
  const name = faker.helpers.arrayElement([
    faker.person.firstName(),
    faker.location.city().split(' ')[0],
    faker.word.adjective(),
  ])

  return `${prefix} ${name}`.trim()
}

function generateSector(businessType) {
  const sectorMap = {
    Warung: 'Retail',
    'Toko Kelontong': 'Retail',
    'UMKM Fashion': 'Fashion & Apparel',
    'F&B': 'Food & Beverage',
    Tourism: 'Tourism & Hospitality',
    Handicrafts: 'Crafts & Artisan',
    'Tech/Digital Services': 'Technology',
    'Beauty/Salon': 'Beauty & Wellness',
    Agriculture: 'Agriculture',
    Education: 'Education',
  }
  return sectorMap[businessType] || 'Other'
}

function generateTargetAudience() {
  const ages = ['18-24', '25-34', '35-44', '45-54', '55+']
  const demographics = ['young professionals', 'families', 'students', 'locals', 'tourists']

  return `${faker.helpers.arrayElement(demographics)} aged ${faker.helpers.arrayElement(ages)}`
}

export function generateBiasInsight(campaignId) {
  const numBiases = faker.number.int({ min: 1, max: 4 })
  const biases = []

  for (let i = 0; i < numBiases; i++) {
    const type = faker.helpers.arrayElement([
      'gender',
      'age',
      'economic',
      'religious',
      'ethnic',
      'disability',
      'appearance',
    ])
    biases.push(generateBiasDetection(type))
  }

  const overallScore = Math.round(
    biases.reduce((sum, b) => sum + b.score, 0) / biases.length
  )

  let severity
  if (overallScore < 30) severity = 'low'
  else if (overallScore < 60) severity = 'medium'
  else if (overallScore < 80) severity = 'high'
  else severity = 'critical'

  return {
    id: faker.string.uuid(),
    campaignId,
    detectedAt: new Date().toISOString(),
    overallScore,
    severity,
    biases,
    suggestions: generateSuggestions(biases),
    metadata: {
      modelVersion: 'kolosal-bias-v2.1',
      confidence: faker.number.float({ min: 0.75, max: 0.99, fractionDigits: 2 }),
    },
  }
}

function generateBiasDetection(type) {
  const biasExamples = {
    gender: {
      description: 'Language reinforces traditional gender stereotypes',
      affectedText: 'Best for housewives and working men',
      recommendation: 'Use gender-neutral language like "homemakers" and "professionals"',
      examples: [
        'Replace "housewives" with "home managers" or "primary caregivers"',
        'Replace "working men" with "working professionals"',
      ],
    },
    age: {
      description: 'Content assumes specific age demographics',
      affectedText: 'Perfect for young people and tech-savvy millennials',
      recommendation: 'Avoid age-specific assumptions; focus on interests instead',
      examples: [
        'Replace "young people" with "active individuals"',
        'Replace "tech-savvy millennials" with "digital enthusiasts"',
      ],
    },
    economic: {
      description: 'Language excludes lower-income segments',
      affectedText: 'Affordable luxury for the discerning elite',
      recommendation: 'Use inclusive pricing language without class implications',
      examples: [
        'Replace "elite" with "everyone"',
        'Emphasize value rather than exclusivity',
      ],
    },
    religious: {
      description: 'Assumes specific religious practices',
      affectedText: 'Open every day including Sundays',
      recommendation: 'Use neutral time references',
      examples: [
        'Replace "including Sundays" with "7 days a week"',
        'Avoid religion-specific holiday references',
      ],
    },
    ethnic: {
      description: 'May perpetuate ethnic stereotypes',
      affectedText: 'Traditional authentic Indonesian experience',
      recommendation: 'Be specific about cultural elements without stereotyping',
      examples: [
        'Specify which regional culture is represented',
        'Avoid generalizations about "Indonesian" culture',
      ],
    },
    disability: {
      description: 'Language may exclude people with disabilities',
      affectedText: 'Walk in today! See our amazing displays',
      recommendation: 'Use inclusive action verbs',
      examples: [
        'Replace "walk in" with "visit us"',
        'Replace "see" with "explore" or "discover"',
      ],
    },
    appearance: {
      description: 'Promotes specific beauty standards',
      affectedText: 'Get slim and beautiful with our program',
      recommendation: 'Focus on health and wellbeing, not appearance',
      examples: [
        'Replace "slim and beautiful" with "healthy and confident"',
        'Emphasize feeling good rather than looking a certain way',
      ],
    },
  }

  const example = biasExamples[type]
  const score = faker.number.int({ min: 40, max: 95 })

  return {
    type,
    description: example.description,
    affectedText: example.affectedText,
    score,
    recommendation: example.recommendation,
    examples: example.examples,
  }
}

function generateSuggestions(biases) {
  const baseSuggestions = [
    'Review all marketing copy with an inclusive lens',
    'Test messaging with diverse focus groups',
    'Create a brand voice guide emphasizing inclusivity',
    'Train team on inclusive language best practices',
  ]

  const typeSuggestions = {
    gender: 'Implement gender-neutral language guidelines',
    age: 'Focus on lifestyle and interests rather than age',
    economic: 'Emphasize value accessibility for all income levels',
    religious: 'Use culturally neutral time and event references',
    ethnic: 'Celebrate specific cultures without stereotyping',
    disability: 'Ensure all calls-to-action are accessibility-focused',
    appearance: 'Promote health and confidence over specific looks',
  }

  const specific = biases.map((b) => typeSuggestions[b.type]).filter(Boolean)

  return [...new Set([...baseSuggestions.slice(0, 2), ...specific])]
}

export function generateCopySuggestion(campaignId, language = 'en') {
  const original =
    language === 'id'
      ? 'Kunjungi toko kami untuk penawaran spesial! Cocok untuk ibu rumah tangga dan pekerja kantoran.'
      : 'Visit our store for special offers! Perfect for housewives and office workers.'

  const tones = ['professional', 'friendly', 'casual', 'enthusiastic', 'empathetic']

  const suggestions = tones.map((tone) => generateCopyVariant(original, language, tone))

  return {
    id: faker.string.uuid(),
    campaignId,
    language,
    original,
    suggestions,
    createdAt: new Date().toISOString(),
    metadata: {
      targetAudience: generateTargetAudience(),
      tone: faker.helpers.arrayElement(tones),
      inclusivityScore: faker.number.int({ min: 75, max: 98 }),
    },
  }
}

function generateCopyVariant(original, language, tone) {
  const variants = {
    en: {
      professional:
        'We invite you to explore our exclusive offerings designed for busy professionals and home managers alike.',
      friendly:
        'Come check out our amazing deals! Great for anyone managing a household or career.',
      casual:
        "Stop by and see what we've got! Perfect for people juggling work and home life.",
      enthusiastic:
        "Don't miss our incredible special offers! Ideal for anyone balancing professional and personal commitments!",
      empathetic:
        'We understand your busy life. Discover solutions that work for professionals and caregivers.',
    },
    id: {
      professional:
        'Kami mengundang Anda untuk menjelajahi penawaran eksklusif kami yang dirancang untuk profesional dan pengelola rumah tangga.',
      friendly:
        'Yuk mampir dan lihat penawaran menarik kami! Cocok untuk siapa saja yang mengelola rumah tangga atau karier.',
      casual:
        'Mampir yuk, lihat apa yang kami punya! Pas banget buat yang sibuk dengan pekerjaan dan urusan rumah.',
      enthusiastic:
        'Jangan lewatkan penawaran spesial kami yang luar biasa! Ideal untuk siapa saja yang menyeimbangkan komitmen profesional dan pribadi!',
      empathetic:
        'Kami memahami kesibukan Anda. Temukan solusi yang cocok untuk profesional dan pengasuh.',
    },
  }

  return {
    id: faker.string.uuid(),
    text: variants[language][tone],
    language,
    tone,
    inclusivityScore: faker.number.int({ min: 80, max: 99 }),
    biasScore: faker.number.int({ min: 5, max: 25 }),
    engagement: {
      predicted: faker.number.float({ min: 2.5, max: 8.5, fractionDigits: 1 }),
      confidence: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
    },
    highlights: generateHighlights(tone),
  }
}

function generateHighlights(tone) {
  const highlights = {
    professional: [
      'Formal and respectful language',
      'Gender-neutral terminology',
      'Inclusive of all roles',
    ],
    friendly: [
      'Warm and approachable tone',
      'Casual without bias',
      'Welcoming to everyone',
    ],
    casual: [
      'Conversational and relatable',
      'Avoids stereotypes',
      'Appeals to diverse audiences',
    ],
    enthusiastic: [
      'Energetic and motivating',
      'Inclusive excitement',
      'Positive without exclusion',
    ],
    empathetic: [
      'Understanding and supportive',
      'Acknowledges diverse challenges',
      'Non-judgmental approach',
    ],
  }

  return highlights[tone] || []
}

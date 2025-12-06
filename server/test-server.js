#!/usr/bin/env node
/**
 * Basic integration tests for the server
 * Run with: node test-server.js
 */

const API_BASE = 'http://localhost:3001'
const PASS = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'

let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`${PASS} ${name}`)
    passed++
  } catch (err) {
    console.log(`${FAIL} ${name}`)
    console.log(`  Error: ${err.message}`)
    failed++
  }
}

async function get(path) {
  const response = await fetch(`${API_BASE}${path}`)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`)
  }
  return { response, data }
}

async function post(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  return { response, data }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

async function main() {
  console.log('\n🧪 Running Server Integration Tests\n')

  // Health Check
  await test('Health check returns OK', async () => {
    const { data } = await get('/health')
    assert(data.status === 'ok', 'Status should be ok')
    assert(data.kolosalApiKey, 'Should have API key status')
  })

  // Campaigns
  await test('GET /api/campaigns returns paginated data', async () => {
    const { data } = await get('/api/campaigns')
    assert(data.success === true, 'Should succeed')
    assert(Array.isArray(data.data), 'Should return array')
    assert(data.total > 0, 'Should have total count')
  })

  await test('GET /api/campaigns with pagination params', async () => {
    const { data } = await get('/api/campaigns?page=1&limit=5')
    assert(data.data.length <= 5, 'Should respect limit')
    assert(data.page === 1, 'Should return correct page')
  })

  await test('GET /api/campaigns rejects invalid page', async () => {
    const { response, data } = await post('/api/campaigns?page=-1', {})
    assert(response.status === 400, 'Should return 400')
    assert(data.success === false, 'Should fail')
  })

  await test('GET /api/campaigns/:id returns single campaign', async () => {
    const { data: list } = await get('/api/campaigns')
    const firstId = list.data[0].id
    const { data } = await get(`/api/campaigns/${firstId}`)
    assert(data.success === true, 'Should succeed')
    assert(data.data.id === firstId, 'Should return correct campaign')
  })

  await test('GET /api/campaigns/:id returns 404 for unknown ID', async () => {
    const { response } = await get('/api/campaigns/nonexistent-id')
    assert(response.status === 404, 'Should return 404')
  })

  await test('POST /api/campaigns creates new campaign', async () => {
    const { response, data } = await post('/api/campaigns', {
      businessName: 'Test Business',
      businessType: 'Tech/Digital Services',
      targetAudience: 'Young professionals',
      marketingGoals: ['Increase awareness'],
    })
    assert(response.status === 201, 'Should return 201')
    assert(data.success === true, 'Should succeed')
    assert(data.data.businessName === 'Test Business', 'Should set business name')
  })

  await test('POST /api/campaigns rejects missing fields', async () => {
    const { response, data } = await post('/api/campaigns', {
      businessName: 'Test',
    })
    assert(response.status === 400, 'Should return 400')
    assert(data.errors, 'Should include errors')
  })

  // Bias Detection
  await test('POST /api/bias checks content for bias', async () => {
    const { data } = await post('/api/bias', {
      content: 'Our salesman will help you choose the right product.',
      language: 'en',
    })
    assert(data.success === true, 'Should succeed')
    assert(data.data.overallScore !== undefined, 'Should have overall score')
    assert(data.data.severity, 'Should have severity')
    assert(Array.isArray(data.data.biases), 'Should have biases array')
  })

  await test('POST /api/bias rejects empty content', async () => {
    const { response, data } = await post('/api/bias', {
      content: '',
      language: 'en',
    })
    assert(response.status === 400, 'Should return 400')
    assert(data.success === false, 'Should fail')
  })

  await test('POST /api/bias rejects missing content', async () => {
    const { response, data } = await post('/api/bias', {
      language: 'en',
    })
    assert(response.status === 400, 'Should return 400')
    assert(data.errors, 'Should include errors')
  })

  await test('POST /api/bias rejects invalid language', async () => {
    const { response, data } = await post('/api/bias', {
      content: 'Test content',
      language: 'invalid',
    })
    assert(response.status === 400, 'Should return 400')
    assert(data.errors, 'Should include errors')
  })

  // Copy Generation
  await test('POST /api/copy generates inclusive copy', async () => {
    const { data } = await post('/api/copy', {
      prompt: 'Write a welcoming message for our diversity initiative',
      language: 'en',
      tone: 'friendly',
    })
    assert(data.success === true, 'Should succeed')
    assert(Array.isArray(data.data.suggestions), 'Should have suggestions')
    assert(data.data.suggestions.length > 0, 'Should have at least one suggestion')
  })

  await test('POST /api/copy rejects empty prompt', async () => {
    const { response, data } = await post('/api/copy', {
      prompt: '',
      language: 'en',
    })
    assert(response.status === 400, 'Should return 400')
    assert(data.success === false, 'Should fail')
  })

  await test('POST /api/copy rejects invalid tone', async () => {
    const { response, data } = await post('/api/copy', {
      prompt: 'Test prompt',
      tone: 'invalid-tone',
    })
    assert(response.status === 400, 'Should return 400')
    assert(data.errors, 'Should include errors')
  })

  // Platform Stats
  await test('GET /api/stats returns platform statistics', async () => {
    const { data } = await get('/api/stats')
    assert(data.success === true, 'Should succeed')
    assert(data.data.totalCampaigns !== undefined, 'Should have total campaigns')
  })

  // Summary
  console.log(`\n${'='.repeat(50)}`)
  console.log(`\nTests: ${passed + failed}`)
  console.log(`${PASS} Passed: ${passed}`)
  if (failed > 0) {
    console.log(`${FAIL} Failed: ${failed}`)
  }
  console.log('')

  process.exit(failed > 0 ? 1 : 0)
}

// Check if server is running
fetch(`${API_BASE}/health`)
  .then(() => main())
  .catch((err) => {
    console.error('❌ Server is not running on http://localhost:3001')
    console.error('   Start the server with: node server/index.js')
    process.exit(1)
  })

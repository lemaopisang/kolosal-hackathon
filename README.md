# Inclusive Marketing Hub

> AI-powered inclusive marketing platform for Indonesian MSMEs, built with Kolosal.ai

## TL;DR Run It Locally

```powershell
# 1) Install
cd inclusive-hub
npm ci
cd server
npm ci

# 2) Env (optional key for live Kolosal)
copy .env.example .env
# Edit .env to add KOLOSAL_API_KEY if you have one

# 3) Start backend (port 3001)
npm run dev

# 4) In a new terminal, start frontend (port 5173)
cd ..
npm run dev

# 5) Open the app
http://localhost:5173
```

API test examples (PowerShell):

```powershell
$bias = '{"content":"Inclusive promo for Jakarta moms","language":"en"}'
Invoke-RestMethod -Uri 'http://localhost:3001/api/bias' -Method Post -Body $bias -ContentType 'application/json'

$copy = '{"prompt":"Write an inclusive ad for batik","language":"en","tone":"friendly"}'
Invoke-RestMethod -Uri 'http://localhost:3001/api/copy' -Method Post -Body $copy -ContentType 'application/json'
```

A hackathon project showcasing how artificial intelligence can help local Indonesian businesses create bias-free, inclusive marketing campaigns that authentically connect with diverse audiences.

## 🎯 Project Overview

The Inclusive Marketing Hub demonstrates:

- **Bias Detection**: Real-time analysis of marketing copy to identify and eliminate gender, age, economic, and cultural biases
- **MSME Personas**: Authentic Indonesian small business profiles from across all sectors (warung, fashion, F&B, tourism, crafts, tech)
- **Multilingual Copy**: AI-generated marketing content in English and Bahasa Indonesia with multiple tone options
- **Freeze Mode**: Demo-ready data persistence for consistent presentations (toggle with `Ctrl+Shift+F`)

## 🏗️ Architecture

```text
inclusive-hub/
├── src/                        # React frontend (Vite + TypeScript)
│   ├── components/            # UI components (shadcn/ui + Tailwind)
│   │   ├── ui/               # Reusable UI primitives
│   │   ├── InclusiveHero.tsx # Landing hero section
│   │   ├── PersonaGrid.tsx   # MSME campaign cards
│   │   └── InsightsFooter.tsx# Stats and impact metrics
│   ├── store/                # Zustand state management
│   │   └── freeze.ts         # Freeze mode persistence
│   ├── types/                # TypeScript definitions
│   │   └── index.ts          # Shared API contracts
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities
│
└── server/                    # Express backend proxy
    ├── index.js              # API routes + proxy logic
    ├── mockData.js           # Faker.js generators (id_ID locale)
    └── .env                  # Environment configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Kolosal.ai API key (optional for mock mode)

### Installation

1. **Clone and setup**

  ```powershell
  cd inclusive-hub
  npm install
  cd server
  npm install
  ```

1. **Configure environment**

  ```powershell
  cd server
  cp .env.example .env
  # Edit .env and add your KOLOSAL_API_KEY (optional)
  ```

1. **Run development servers**

   **Terminal 1 - Backend:**

   ```powershell
   cd server
   npm run dev
   # Server runs on http://localhost:3001
   ```

   **Terminal 2 - Frontend:**

   ```powershell
   npm run dev
   # App runs on http://localhost:5173
   ```

1. **Open browser**
   Navigate to `http://localhost:5173`

## 🎮 Demo Controls

### Freeze Mode (Hidden Feature)

Press **`Ctrl+Shift+F`** to toggle between:

- **🔥 Live Mode**: Fetches fresh randomized data from the backend on every request
- **❄️ Demo Frozen**: Locks current data in localStorage for consistent presentations

A subtle yellow badge appears in the top-right when frozen. This ensures:

- No surprises during pitches (API errors won't derail demos)
- Consistent bias detection examples across multiple views
- Offline-capable presentations if WiFi fails

## 📊 Tech Stack

| Layer | Technology | Reasoning |
|-------|-----------|-----------|
| **Frontend** | React 19 + Vite | Instant HMR, modern DX |
| **Language** | TypeScript | Type safety for kolosal.ai API contracts |
| **Styling** | Tailwind + shadcn/ui | Professional polish + full control |
| **State** | Zustand | Lightweight freeze toggle management |
| **Data** | TanStack Query | Smart caching + freeze support |
| **Backend** | Express | Simple proxy for kolosal.ai authentication |
| **Mocking** | @faker-js/faker | Indonesian locale (`id_ID`) support |
| **Icons** | Lucide React | Consistent, accessible iconography |

## 🔌 API Endpoints

### Backend Proxy (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/campaigns` | List MSME personas (paginated) |
| `GET` | `/api/campaigns/:id` | Get single campaign |
| `POST` | `/api/campaigns` | Create new campaign |
| `POST` | `/api/bias` | Check content for bias |
| `POST` | `/api/copy` | Generate inclusive copy variants |
| `GET` | `/api/stats` | Overall platform statistics |

### Query Parameters

- `?freeze=true` - Return deterministic seeded data (for demos)
- `?page=1&limit=12` - Pagination controls

### Example Request

```javascript
// Check marketing copy for bias
const response = await fetch('/api/bias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'abc-123',
    content: 'Perfect for housewives and working men',
    language: 'en'
  })
})

const { data } = await response.json()
// data.overallScore: 0-100 (higher = more biased)
// data.severity: 'low' | 'medium' | 'high' | 'critical'
// data.biases: [{ type: 'gender', score: 85, recommendation: '...' }]
```

## 🇮🇩 Indonesian Mock Data

The backend generates realistic MSME personas using faker.js with Indonesian locale:

- **Names**: Authentic Indonesian names (e.g., "Budi Santoso", "Siti Rahmawati")
- **Locations**: 15 major cities across Java, Sumatra, Sulawesi, Bali, Kalimantan
- **Business Types**: Warung, Toko Kelontong, UMKM Fashion, F&B, Tourism, Handicrafts, Tech, Beauty, Agriculture, Education
- **Cultural Context**: Pain points, marketing goals, and demographics reflecting real Indonesian MSME challenges

### Seeding Strategy

```javascript
// server/mockData.js
const SEED = 42069 // Deterministic for freeze mode
faker.seed(SEED)
faker.setLocale('id_ID')
```

This ensures:

- Consistent frozen demos (same personas every time)
- Authentic Indonesian data (not translated from English)
- Randomized live mode (fresh data on each request)

## 🔄 Migrating to Live Kolosal.ai API

### Current State (Mock Mode)

```javascript
// server/index.js - Line 90
const biasInsight = generateBiasInsight(campaignId || 'default')
```

### Future State (Live API)

```javascript
import axios from 'axios'

// server/index.js - Line 90
const response = await axios.post(
  `${process.env.KOLOSAL_API_URL}/bias-check`,
  { content, language },
  {
    headers: {
      'Authorization': `Bearer ${process.env.KOLOSAL_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
)
const biasInsight = response.data
```

### Migration Checklist

1. ✅ TypeScript contracts already match expected kolosal.ai shape
2. ✅ Environment variable handling configured
3. ✅ Axios installed and ready
4. ⏳ Replace mock functions with real API calls
5. ⏳ Add error handling for rate limits (429)
6. ⏳ Implement retry logic with exponential backoff
7. ⏳ Add response caching (30-60 seconds)
8. ⏳ Test with real API key from kolosal.ai team

## 🎨 Customization

### Adding New Business Types

Edit `server/mockData.js`:

```javascript
const businessTypes = [
  'Warung',
  'Your New Type', // Add here
  // ...
]
```

### Changing Color Scheme

Edit `src/index.css` for global Tailwind theme:

```css
:root {
  --primary: 222.2 47.4% 11.2%; /* Your brand color */
  --accent: 210 40% 96.1%;
}
```

### Adjusting Persona Count

Edit `server/index.js`:

```javascript
// Generate initial dataset (line 18)
for (let i = 0; i < 100; i++) { // Change from 50 to 100
  personas.push(generateCampaignPersona())
}
```

## 📈 Hackathon Pitch Points

1. **Real Indonesian Context**: Not generic US-centric data—authentic warung, UMKM, and local business challenges
2. **Bias Detection**: Quantifiable inclusivity scores (gender, age, economic, religious, ethnic, disability, appearance)
3. **Multilingual**: English UI + Bahasa Indonesia copy generation for local audiences
4. **Demo-Ready**: Freeze mode ensures bulletproof presentations without API failures
5. **Scalable Architecture**: TypeScript contracts + modular components ready for production expansion

## 🛠️ Development

### Building for Production

```powershell
npm run build
# Output in dist/
```

### Running Tests (Future)

```powershell
npm test
```

### Linting

```powershell
npm run lint
```

## 🐛 Troubleshooting

### "Cannot find module '@/lib/utils'"

Restart the TypeScript server in VS Code:
- Press `Ctrl+Shift+P`
- Run "TypeScript: Restart TS Server"

### Backend won't start

```powershell
cd server
npm install # Reinstall dependencies
```

### Frozen mode not persisting

Clear localStorage:
```javascript
// Browser console
localStorage.clear()
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `KOLOSAL_API_KEY` | Kolosal.ai authentication | No (mock mode) | - |
| `KOLOSAL_API_URL` | API base URL | No | `https://api.kolosal.ai/v1` |
| `PORT` | Backend server port | No | `3001` |
| `NODE_ENV` | Environment | No | `development` |

## 🤝 Contributing

This is a hackathon prototype. For production use:

1. Add authentication/authorization
2. Implement database persistence (replace in-memory array)
3. Add comprehensive error handling
4. Set up CI/CD pipeline
5. Add E2E tests with Playwright
6. Implement rate limiting
7. Add analytics tracking

## 📄 License

MIT

## 🙏 Acknowledgments

- **Kolosal.ai** for inclusive AI partnership
- **shadcn/ui** for beautiful component primitives
- **@faker-js/faker** for Indonesian locale support
- Indonesian MSME community for inspiration

---

Built with ❤️ for Indonesian entrepreneurs. Press `Ctrl+Shift+F` to freeze the demo! ❄️

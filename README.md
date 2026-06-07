# League 247 Command Center
### The Breakroom 247 · St. Cloud, MN

> **League 247 — Built for Content. Wired for Growth.**

A Jarvis-style AI agency command dashboard for Rob and The Breakroom 247. BIG HOMIE orchestrates 12 AI agents across sales, content, ops, and growth from a single futuristic control room.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Agent Graph | React Force Graph 2D |
| Backend | FastAPI, Python, Pydantic, Uvicorn |
| AI | Anthropic Claude (claude-opus-4-8) + Tool Calling |
| Voice | Whisper STT + ElevenLabs TTS |
| Real-Time | WebSockets |
| Database | PostgreSQL (Supabase/Neon) + Redis (Upstash) |
| Deployment | Vercel (frontend) + Render/Railway (backend) |

---

## Agents

| Agent | Role |
|-------|------|
| BIG HOMIE | Master Orchestrator — center of the network |
| PLUG | Partnerships & Opportunities |
| HUNTER | Lead Generation |
| CLOSER | Sales |
| SAUCE | Creative Strategy |
| CUTTY | Content & Media |
| HUSTLE | Advertising & Growth |
| LOOKOUT | Market Intelligence |
| GEAR | Development & Automation |
| OG | Operations & Compliance |
| BAGMAN | Finance |
| RILEY | Riley Stone Influencer Division |

---

## Project Structure

```
league-247-command-center/
├── frontend/                    # Next.js 14 App
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Main dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CommandHeader.tsx
│   │   │   ├── AgentNetworkGraph.tsx    # Force graph — BIG HOMIE centered
│   │   │   ├── AgentStatusCards.tsx
│   │   │   ├── DailyBriefPanel.tsx      # BIG HOMIE brief (10 sections)
│   │   │   ├── RevenueTracker.tsx       # BAGMAN panel
│   │   │   ├── SalesPipeline.tsx        # CLOSER/HUNTER GHL pipeline
│   │   │   ├── ProductionQueue.tsx      # All agents task queue
│   │   │   ├── AgentLogs.tsx            # Live terminal log
│   │   │   └── RileyContentPanel.tsx    # Riley Stone content
│   │   └── voice/
│   │       └── VoiceAssistant.tsx       # Whisper + ElevenLabs
│   ├── lib/
│   │   ├── types.ts             # All TypeScript types
│   │   ├── mockData.ts          # Mock data for MVP
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Helpers + color utilities
│   ├── hooks/
│   │   ├── useCommandCenter.ts  # Central state hook
│   │   └── useWebSocket.ts      # WebSocket with reconnect
│   └── package.json
│
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic settings
│   │   │   └── websocket_manager.py
│   │   ├── models/
│   │   │   ├── agents.py
│   │   │   ├── brief.py
│   │   │   └── revenue.py
│   │   ├── routes/
│   │   │   ├── agents.py        # GET /agents/status, POST /agents/{id}/activate
│   │   │   ├── brief.py         # GET /brief/daily, POST /brief/generate
│   │   │   ├── command_center.py # GET /command-center/summary
│   │   │   ├── bighomie.py      # POST /bighomie/run
│   │   │   ├── voice.py         # POST /voice/transcribe, /voice/speak
│   │   │   └── websocket.py     # WS /ws/events
│   │   └── services/
│   │       ├── mock_data.py     # MVP mock data
│   │       └── claude_service.py # BIG HOMIE Claude integration
│   └── requirements.txt
│
└── .env.example
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- (Optional) API keys for full functionality

### 1. Clone & Setup

```bash
git clone <repo>
cd league-247-command-center
```

### 2. Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
# Edit .env.local with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | System status |
| GET | `/health` | Health check |
| GET | `/agents/status` | All 12 agent statuses |
| POST | `/agents/{id}/activate` | Activate an agent |
| GET | `/agents/logs` | Agent log feed |
| GET | `/brief/daily` | Today's Command Brief (mock) |
| POST | `/brief/generate` | Generate brief via Claude |
| POST | `/bighomie/run` | Send command to BIG HOMIE |
| POST | `/bighomie/brief` | Generate AI brief |
| GET | `/command-center/summary` | Dashboard summary stats |
| GET | `/command-center/revenue` | Revenue data |
| POST | `/voice/transcribe` | Whisper STT |
| POST | `/voice/speak` | ElevenLabs TTS |
| WS | `/ws/events` | Real-time event stream |

---

## Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `.env` (backend).

Required for full functionality:
- `ANTHROPIC_API_KEY` — Claude AI (BIG HOMIE brain)
- `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` — BIG HOMIE voice
- `OPENAI_API_KEY` — Whisper STT
- `GHL_API_KEY` + `GHL_LOCATION_ID` — GoHighLevel CRM
- `GOOGLE_SHEETS_SPREADSHEET_ID` — Command Center data

Dashboard runs on **mock data** without any API keys — fully functional MVP.

---

## Dashboard Views

| View | Panels |
|------|--------|
| Overview | Agent Network Graph, Agent Status Cards, Daily Brief, Revenue, Logs |
| Sales | Pipeline (GHL), Revenue Chart, Agent Logs |
| Riley / Content | Riley Stone Content Board, Production Queue |
| Ops | Production Queue, Agent Logs |

---

## BIG HOMIE Commands

| Command | Response |
|---------|----------|
| "Run BIG HOMIE" | Activates + generates Daily Command Brief |
| "What's the pipeline?" | Pipeline summary |
| "What should Rob do first?" | Today's priorities |
| Any natural language | BIG HOMIE responds via Claude |

---

## Build Order (Next Steps)

Phase 2 — Real API Integrations:
1. Google Sheets → Pull data into mock_data service
2. GoHighLevel → Replace LEADS/CLIENTS with real GHL contacts + opportunities
3. Claude tool calling → BIG HOMIE generates real briefs with live data
4. ElevenLabs + Whisper → Voice loop fully operational
5. WebSocket live events → Agent status updates push to dashboard
6. Supabase/Neon → Persist agent logs, tasks, brief history
7. Redis → Rate limiting + WebSocket session state

Phase 3 — Polish:
- BIG HOMIE boot sequence animation
- Agent activation glow effects (WebSocket triggered)
- Mobile responsive layout
- Google Calendar integration (OG panel)
- Email digest (BIG HOMIE sends Rob a brief via Gmail)

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel deploy
```

### Backend → Render
1. Connect GitHub repo
2. Set build: `pip install -r requirements.txt`
3. Set start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

---

*League 247 Command Center — The Breakroom 247 · St. Cloud, MN*

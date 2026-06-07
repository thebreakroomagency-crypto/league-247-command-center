import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.websocket_manager import ws_manager
from .routes import agents, brief, command_center, websocket, voice, bighomie, supabase_routes

app = FastAPI(
    title="League 247 Command Center API",
    description="The Breakroom 247 · BIG HOMIE Orchestration Layer",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router)
app.include_router(brief.router)
app.include_router(command_center.router)
app.include_router(websocket.router)
app.include_router(voice.router)
app.include_router(bighomie.router)
app.include_router(supabase_routes.router)


@app.on_event("startup")
async def startup():
    asyncio.create_task(ws_manager.heartbeat(30.0))


@app.get("/")
async def root():
    return {
        "system": "League 247 Command Center",
        "slogan": "Built for Content. Wired for Growth.",
        "status": "nominal",
        "agents": 12,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

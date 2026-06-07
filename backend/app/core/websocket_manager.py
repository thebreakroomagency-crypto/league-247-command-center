import json
from typing import Dict, Set
from fastapi import WebSocket
import asyncio
from datetime import datetime


class WebSocketManager:
    def __init__(self):
        self.connections: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.add(ws)

    def disconnect(self, ws: WebSocket):
        self.connections.discard(ws)

    async def broadcast(self, event_type: str, payload: dict):
        if not self.connections:
            return
        message = json.dumps({
            "type": event_type,
            "payload": payload,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
        dead = set()
        for ws in set(self.connections):
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.connections.discard(ws)

    async def send_to(self, ws: WebSocket, event_type: str, payload: dict):
        try:
            await ws.send_text(json.dumps({
                "type": event_type,
                "payload": payload,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }))
        except Exception:
            self.connections.discard(ws)

    async def heartbeat(self, interval: float = 30.0):
        while True:
            await asyncio.sleep(interval)
            await self.broadcast("heartbeat", {"status": "nominal", "connections": len(self.connections)})


ws_manager = WebSocketManager()

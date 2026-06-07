import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..core.websocket_manager import ws_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/events")
async def websocket_events(ws: WebSocket):
    await ws_manager.connect(ws)
    try:
        await ws_manager.send_to(ws, "system", {"message": "League 247 Command Center — Connected", "status": "nominal"})
        while True:
            data = await ws.receive_text()
            # Echo commands back and broadcast to all clients
            await ws_manager.broadcast("command", {"input": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)


@router.websocket("/ws/voice")
async def websocket_voice(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_bytes()
            # Pass audio chunks to Whisper STT — placeholder
            await ws.send_text('{"status": "received"}')
    except WebSocketDisconnect:
        pass

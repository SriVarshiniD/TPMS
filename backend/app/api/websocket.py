import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..simulation.engine import engine

ws_router = APIRouter()


@ws_router.websocket("/ws/simulation")
async def websocket_simulation_endpoint(websocket: WebSocket):
    await websocket.accept()
    queue = engine.subscribe()
    
    # Send immediate snapshot upon connect
    try:
        immediate_snapshot = engine.tick(0.0).model_dump_json()
        await websocket.send_text(immediate_snapshot)
    except Exception as e:
        print(f"Error sending initial snapshot: {e}")
        engine.unsubscribe(queue)
        return

    async def client_receiver():
        """Listen for two-way control commands from the frontend."""
        try:
            while True:
                text = await websocket.receive_text()
                data = json.loads(text)
                action = data.get("action")
                
                if action == "start":
                    engine.start()
                elif action == "pause":
                    engine.pause()
                elif action == "reset":
                    engine.reset()
                elif action == "scenario":
                    scenario = data.get("scenario", "slow_leak_rr")
                    rate = data.get("leak_rate")
                    engine.set_scenario(scenario, custom_rate=rate)
                elif action == "config":
                    config_data = data.get("config", {})
                    engine.update_settings(config_data)
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"Error receiving ws command: {e}")

    async def broadcast_sender():
        """Stream real-time simulation updates from engine queue to websocket."""
        try:
            while True:
                payload = await queue.get()
                await websocket.send_text(payload)
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"Error sending ws frame: {e}")

    receiver_task = asyncio.create_task(client_receiver())
    sender_task = asyncio.create_task(broadcast_sender())

    try:
        done, pending = await asyncio.wait(
            [receiver_task, sender_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()
    finally:
        engine.unsubscribe(queue)

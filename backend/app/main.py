import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as api_router
from .api.websocket import ws_router
from .simulation.engine import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch background simulation ticker
    loop_task = asyncio.create_task(engine.run_loop())
    yield
    # Shutdown: Cleanly cancel loop task
    loop_task.cancel()
    try:
        await loop_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="TPMS Digital Twin — Software-Defined Vehicle Tire Monitoring System",
    description="Real-Time Tire Pressure Simulation & Predictive Monitoring Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(ws_router)


@app.get("/")
def read_root():
    return {
        "system": "TPMS Digital Twin",
        "description": "Software-Defined Vehicle Tire Monitoring System",
        "version": "1.0.0",
        "status": "ONLINE",
        "endpoints": {
            "status": "/api/status",
            "tires": "/api/tires",
            "simulation": "/api/simulation",
            "alerts": "/api/alerts",
            "websocket": "/ws/simulation"
        }
    }

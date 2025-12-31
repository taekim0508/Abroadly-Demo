# Contributors:
# Lucas Slater: Setup and app creation (.5 hr)
# Trey Fisher: Enhancements and route inclusion (.5 hr)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .ai.routes import router as ai_router
from .auth.routes import router as auth_router
from .bookmarks.routes import router as bookmarks_router
from .db import init_db
from .messages.routes import router as messages_router
from .places.routes import router as places_router
from .programs.routes import router as programs_router
from .trips.routes import router as trips_router


def create_app() -> FastAPI:
    app = FastAPI(title="Abroadly API")

    # Add CORS middleware for frontend integration
    # Use wildcard for development to avoid CORS issues with error responses
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(programs_router)
    app.include_router(places_router)
    app.include_router(trips_router)
    app.include_router(bookmarks_router)
    app.include_router(messages_router)
    app.include_router(ai_router)

    @app.get("/")
    def root() -> dict:
        return {"ok": True}

    return app


app = create_app()
# Ensure tables are created on import (dev convenience)
init_db()

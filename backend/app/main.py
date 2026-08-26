from fastapi import FastAPI

from app.api.v1.auth import router as auth_router


app = FastAPI(
    title="AI Support Hub API",
    description="Universal AI Assistant Platform API",
    version="0.1.0",
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Support Hub API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
    }
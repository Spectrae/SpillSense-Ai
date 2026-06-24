import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import engine, Base
import models
from routers import auth_router, roi_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SpillSense-Ai Live API")

# Configure CORS so Next.js can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the new modular routers
app.include_router(auth_router.router)
app.include_router(roi_router.router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
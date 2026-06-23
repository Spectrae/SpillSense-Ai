import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uvicorn

# Database imports
from database import engine, Base, get_db
import models

# Import routers
from routers import auth_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SpillSense-Ai Live API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the auth router
app.include_router(auth_router.router)

# --- Security Dependency ---
# We need to extract the user ID from the token sent by Next.js to link the ROI to them
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = "your-super-secret-key-change-this" # IMPORTANT: Make sure this matches the key in your auth.py!
ALGORITHM = "HS256"

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

class RoiPayload(BaseModel):
    wkt: str

@app.post("/api/trigger-pipeline")
async def trigger_pipeline(
    payload: RoiPayload, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    wkt_string = payload.wkt
    
    if not wkt_string.startswith("POLYGON"):
        raise HTTPException(status_code=400, detail="Invalid WKT geometry format.")
        
    print(f"\n[SERVER] 📥 Received target coordinates from User ID {user_id}: {wkt_string}")
    
    try:
        # 1. Save Target to the Database (The Mailbox)
        # We generate a unique name using the current timestamp
        roi_name = f"ROI_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        new_roi = models.RegionOfInterest(
            name=roi_name,
            wkt_polygon=wkt_string,
            is_monitoring=True,
            owner_id=user_id
        )
        
        db.add(new_roi)
        db.commit()
        db.refresh(new_roi)
        
        print(f"[SERVER] ✅ Target securely planted in database! ROI ID: {new_roi.id}")
        
        # 2. Immediately return success to the frontend so it doesn't freeze
        return {
            "status": "success",
            "message": "Target planted successfully! The background AI engine is now monitoring this region.",
            "data_found": True,
            "scene_name": "Pending Poller Scan...",
            "storage_path": "Database Saved"
        }
        
    except Exception as e:
        print(f"\n[SERVER] ❌ CRITICAL FAILURE: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
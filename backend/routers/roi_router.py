from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models
from jose import jwt
from auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/rois", tags=["Regions of Interest"])

class RoiCreate(BaseModel):
    name: str
    wkt_polygon: str

def get_current_user_id(authorization: str = Header(...)):
    """Extracts and verifies the user ID from the JWT string."""
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.post("", status_code=status.HTTP_201_CREATED)
def save_user_roi(roi: RoiCreate, current_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Saves a newly drawn polygon to the database."""
    if not roi.wkt_polygon.startswith("POLYGON"):
        raise HTTPException(status_code=400, detail="Invalid WKT geometry standard.")
        
    new_roi = models.RegionOfInterest(
        name=roi.name,
        wkt_polygon=roi.wkt_polygon,
        owner_id=current_user_id
    )
    db.add(new_roi)
    db.commit()
    db.refresh(new_roi)
    return {"status": "success", "message": "ROI successfully registered.", "roi_id": new_roi.id}

@router.get("", status_code=status.HTTP_200_OK)
def get_user_rois(current_user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Fetches all monitoring regions associated with the authenticated user."""
    # Query the database for ROIs matching the extracted JWT user ID
    user_rois = db.query(models.RegionOfInterest).filter(models.RegionOfInterest.owner_id == current_user_id).all()
    
    # SQLAlchemy objects need to be formatted into a serializable list
    roi_list = [
        {
            "id": roi.id,
            "name": roi.name,
            "is_monitoring": roi.is_monitoring,
            "wkt_polygon": roi.wkt_polygon
        }
        for roi in user_rois
    ]
    
    return {"status": "success", "data": roi_list}
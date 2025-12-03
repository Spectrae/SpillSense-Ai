# backend/api/main.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ..core.model_inference import get_prediction_results

app = FastAPI(title="Oil Spill Detection API")

# --- CORS CONFIGURATION ---
# List the development URL of your Vite frontend (default 5173)
origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"], # Allow necessary HTTP methods
    allow_headers=["*"],
)

# --- API Endpoint to handle file upload ---
@app.post("/api/detect_oil_spill")
async def detect_oil_spill(file: UploadFile = File(...)):
    # Validate file type (basic check)
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tif', '.tiff')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        # 1. Read file content as bytes (async)
        image_bytes = await file.read()

        # 2. Call the Deep Learning logic
        results = get_prediction_results(image_bytes)

        # 3. Return structured response to React
        return {
            # Format Base64 data into a Data URI for React's <img> tag
            "image_url": "data:image/png;base64," + results["image_data"], 
            "spill_area_pixels": results["spill_area_pixels"],
            "confidence": results["confidence"],
        }

    except Exception as e:
        # Catch any inference or processing errors
        print(f"Prediction or processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# --- Health Check ---
@app.get("/")
def read_root():
    return {"status": "Oil Spill Detection API is running and ready."}
import time
import os
import shutil
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler

from database import SessionLocal
import models
from utils.cdse_api import get_access_token, build_search_query, execute_search
from utils.downloader import download_image_chunked, extract_safe_zip
from utils.s1_parser import parse_sentinel1_filename, validate_for_ml_pipeline
from utils.notifications import send_whatsapp_alert

# Global set to remember processed images to prevent infinite loops (in production, move this to the DB)
PROCESSED_IDS = set()

def process_single_roi(db_session, roi):
    """Handles the CDSE pipeline for a single database ROI."""
    print(f"   🔍 Scanning ROI: {roi.name} (Owner ID: {roi.owner_id})")
    
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    token = get_access_token()
    
    # Use the WKT string directly from the database
    query_url = build_search_query(roi.wkt_polygon, hours_back=24)
    found_images = execute_search(token, query_url)
    
    if not found_images:
        print(f"   ⏸️ No new images for {roi.name}.")
        return
        
    target_scene = found_images[0]
    image_id = target_scene['id']
    
    if image_id in PROCESSED_IDS:
        return
        
    metadata = parse_sentinel1_filename(target_scene['name'])
    is_valid, validation_msg = validate_for_ml_pipeline(metadata)
    
    if not is_valid:
        print(f"   ❌ Scene rejected: {validation_msg}")
        PROCESSED_IDS.add(image_id)
        return
        
    print(f"   📦 TARGET ACQUIRED! Processing {target_scene['name']}")
    
    # Download and Extract
    zip_path = download_image_chunked(image_id, target_scene['name'], token, output_dir=data_dir)
    safe_path = extract_safe_zip(zip_path, extract_to=data_dir)
    
    # [ML Inference will go here in the future]
    
    # Cleanup heavy files
    shutil.rmtree(safe_path)
    PROCESSED_IDS.add(image_id)
    
    # 📱 ALERT THE USER
    user_phone = roi.owner.whatsapp_number
    if user_phone:
        send_whatsapp_alert(user_phone, roi.name, target_scene['name'])

def oil_spill_pipeline_job():
    """The main scheduled job that loops through all active database ROIs."""
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
    print(f"\n[{current_time}] ⚙️ SYSTEM WAKE! Fetching active regions from database...")
    
    # Open a clean database session for this polling cycle
    db = SessionLocal()
    try:
        active_rois = db.query(models.RegionOfInterest).filter(models.RegionOfInterest.is_monitoring == True).all()
        
        if not active_rois:
            print("STANDBY: No active ROIs found in the database.")
            return

        for roi in active_rois:
            try:
                process_single_roi(db, roi)
            except Exception as e:
                print(f"   ⚠️ Error processing ROI {roi.name}: {e}")
                
    finally:
        db.close() # Always close the session to prevent memory leaks

    print(f"[{datetime.utcnow().strftime('%H:%M:%S UTC')}] ✅ Cycle complete. Going back to sleep.\n")

def start_system():
    print("🚀 Initializing DB-Aware Sentinel-1 Polling System...")
    scheduler = BlockingScheduler(timezone="UTC")
    scheduler.add_job(
        oil_spill_pipeline_job, 
        trigger='interval', 
        minutes=15, 
        id='sar_polling_job',
        max_instances=1 
    )
    try:
        oil_spill_pipeline_job() # Initial run
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("\n🛑 Scheduler stopped gracefully.")

if __name__ == "__main__":
    start_system()
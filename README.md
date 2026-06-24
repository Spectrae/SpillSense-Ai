# 🌊 SpillSense-Ai | Automated Near Real-Time Oil Spill Detection Platform



SpillSense-Ai is a fully automated, full-stack environmental monitoring platform. It is designed to autonomously ingest, process, and prepare Sentinel-1 Synthetic Aperture Radar (SAR) imagery for coastal oil spill detection. 



Moving beyond a simple processing script, SpillSense-Ai is now a multi-user SaaS architecture featuring secure authentication, a graphical bounding-box mapping interface, a relational database, and real-time WhatsApp mobile alerting.



## ✨ Core Features

* **Decoupled Architecture:** A modular Next.js (React) frontend communicating securely with a high-performance FastAPI (Python) backend via JWT authentication.

* **Interactive ROI Dashboard:** An integrated Leaflet graphical map allowing users to draw and save custom Regions of Interest (ROIs) directly to a database.

* **Database-Aware Polling:** A background APScheduler job (`main.py`) that loops through all active user ROIs and autonomously queries the Copernicus Data Space Ecosystem (CDSE) every 15 minutes for new satellite passes.

* **Automated Preprocessing Pipeline:** On-the-fly 1GB+ `.SAFE` chunked downloading, VV-polarization TIFF extraction, median filter noise scrubbing, and automated landmass masking.

* **Mobile Notifications:** Twilio API integration to instantly ping users via WhatsApp the moment new satellite data is acquired and preprocessed for their specific regions.



---



## 📁 Project Structure



The project has been refactored into a standard monorepo containing both the frontend and backend ecosystems.



    /SpillSense-Ai

    ├── install.sh                  # Master executable for one-click environment setup

    ├── frontend/                   # Next.js 14 React Application

    │   ├── package.json            

    │   └── src/

    │       ├── app/                # Login, Register, and Dashboard routing

    │       └── components/         # Interactive MapInterface and UI components

    └── backend/                    # Python FastAPI & Pipeline Engine

        ├── .env                    # Hidden credentials (API keys, DB secrets)

        ├── app.py                  # Main FastAPI server and routing entry point

        ├── main.py                 # The autonomous, DB-aware APScheduler poller

        ├── database.py             # SQLite connection and session engine

        ├── models.py               # Database schemas (Users, ROIs)

        ├── requirements.txt        

        ├── routers/                # Modular API endpoints (Auth, ROIs)

        └── utils/                  # The Data Processing Engine

            ├── cdse_api.py         # CDSE Auth & Spatial OData querying

            ├── downloader.py       # Chunked streaming and zip extraction

            ├── land_mask.py        # Geographic boundary fetching and array masking

            ├── preprocessor.py     # TIFF extraction, median filtering, and normalization

            ├── s1_parser.py        # Metadata validation (GRD/IW enforcement)

            └── notifications.py    # Twilio WhatsApp alert integration



---



## 🚀 Execution Instructions



Follow these steps to spin up the entire full-stack ecosystem on your local machine.



### 1. Prerequisites

You will need the following accounts and credentials to run the full pipeline:

* **Copernicus Data Space (CDSE):** Account for satellite data access.

* **Twilio:** Sandbox account for WhatsApp messaging.

* **System:** Python 3.10+ and Node.js 18+ installed.



### 2. Initial Setup (One-Click Install)

Clone the repository. We have provided a master bash script that automatically creates the Python virtual environment, installs backend dependencies, and securely locks and installs all Next.js frontend node modules.



```bash

git clone [https://github.com/Spectrae/SpillSense-Ai.git](https://github.com/Spectrae/SpillSense-Ai.git)

cd SpillSense-Ai

chmod +x install.sh

./install.sh

```



### 3. Configure Credentials



Navigate into the `backend/` directory and create a hidden `.env` file. The system uses `python-dotenv` to securely load these. **Never commit this file to version control.**



```bash

cd backend

nano .env

```



Paste your exact credentials:



```env

# CDSE Satellite Credentials

CDSE_USERNAME=your_registered_email@example.com

CDSE_PASSWORD=your_super_secret_password



# Twilio WhatsApp Credentials

TWILIO_ACCOUNT_SID=your_twilio_sid

TWILIO_AUTH_TOKEN=your_twilio_auth_token

TWILIO_WHATSAPP_SENDER=whatsapp:+14155238886



# Authentication Security

JWT_SECRET=super-secret-spillsense-key-change-me

```



---



## ⚙️ Running the Platform



The platform requires three separate processes to run simultaneously: the API backend, the Web frontend, and the Autonomous Poller. Open three separate terminal windows.



### Terminal 1: Boot the FastAPI Server



This initializes the SQLite database and opens the API endpoints for user authentication and ROI saving.



```bash

cd backend

source .venv/bin/activate

uvicorn app:app --reload

```



*Wait until you see `Application startup complete`.*



### Terminal 2: Boot the Next.js Dashboard



This serves the graphical user interface.



```bash

cd frontend

npm run dev

```



*The UI will now be accessible at `http://localhost:3000`.*



### Terminal 3: Start the Autonomous Poller (Production Engine)



This script wakes up every 15 minutes, reads the database for active user ROIs, queries the satellites, downloads/processes the data, and fires WhatsApp alerts.



```bash

cd backend

source .venv/bin/activate

python main.py

```



---



## 🖥️ Usage Guide



1. **Register:** Go to `http://localhost:3000`. You will be redirected to the login screen. Click "Register here" to create an operator account. Include your WhatsApp number (with country code).

2. **Login:** Authenticate with your new credentials. A secure JWT token will be generated and stored.

3. **Define a Region:** On the dashboard, use the interactive map to draw a bounding box over a coastal region (e.g., the Mumbai coastline).

4. **Deploy Target:** Name your region and click **Save Monitoring Bound**. It will appear in your active pipeline monitors table.

5. **Standby for Alerts:** The `main.py` poller will detect your new database entry on its next cycle. If the satellite has passed over that region recently, it will process the data and send a notification directly to your phone.



---



## 🗺️ Roadmap: The Final Stage



The data ingestion, processing, and alerting plumbing is complete. The next development phase focuses on **AI Integration**:



* Integrating a trained U-Net Convolutional Neural Network into the pipeline immediately following the land-masking stage.

* Passing the AI-ready NumPy arrays through the model to output binary spill detection masks.

* Creating a `GET /api/reports` endpoint and a dashboard visualizer to display the detected oil slicks over the original SAR imagery.
import os
import time
import schedule
import threading
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, BackgroundTasks
from dotenv import load_dotenv
from generator import generate_contest

load_dotenv()

app = FastAPI(title="Orbit Contest Generator Service")

# Configuration
ORBIT_BACKEND_URL = os.getenv("ORBIT_BACKEND_URL", "http://localhost:4000/api")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

def get_next_contest_number():
    """Fetches all contests and returns the next available contest number."""
    if not ADMIN_TOKEN:
        return 1
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    try:
        res = requests.get(f"{ORBIT_BACKEND_URL}/contests", headers=headers)
        res.raise_for_status()
        contests = res.json().get("contests", [])
        if not contests:
            return 1
        max_num = max([c.get("contestNumber", 0) for c in contests])
        return max_num + 1
    except Exception as e:
        print(f"Error fetching contest number: {e}")
        return int(time.time()) # Fallback to timestamp

def create_contest_in_orbit(contest_data):
    """Pushes the generated contest to the Orbit backend."""
    if not ADMIN_TOKEN:
        print("Error: ADMIN_TOKEN not set. Cannot push contest.")
        return False

    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }

    # Prepare the payload for Orbit backend
    start_time = datetime.now() + timedelta(days=1) # Start tomorrow
    end_time = start_time + timedelta(hours=3)      # 3-hour contest
    contest_num = get_next_contest_number()

    payload = {
        "contestNumber": contest_num,
        "title": contest_data.title,
        "startTime": start_time.isoformat(),
        "endTime": end_time.isoformat(),
        "type": "weekly",
        "difficulty": "medium",
        "problems": [] 
    }

    try:
        # 1. Create the contest
        print(f"Creating contest {contest_num}: {contest_data.title}...")
        res = requests.post(f"{ORBIT_BACKEND_URL}/contests", json=payload, headers=headers)
        res.raise_for_status()
        contest_id = res.json().get("contest", {}).get("_id")
        if not contest_id:
            contest_id = res.json().get("_id") # Fallback
            
        print(f"Contest created with ID: {contest_id}")

        # 2. Add problems to the contest
        for prob in contest_data.problems:
            prob_payload = prob.dict()
            # The backend route is POST /api/contests/:contestId/problems
            p_res = requests.post(f"{ORBIT_BACKEND_URL}/contests/{contest_id}/problems", json=prob_payload, headers=headers)
            p_res.raise_for_status()
            print(f"Added problem: {prob.title}")

        return True
    except Exception as e:
        print(f"Failed to push contest to Orbit: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return False

def weekly_task():
    """The task that runs every week."""
    print(f"Starting weekly contest generation at {datetime.now()}")
    subjects = ["Physics", "Chemistry", "Mathematics"]
    
    for subject in subjects:
        try:
            # Generate a small contest for each subject or one big mixed one
            contest = generate_contest(subject, "General Revision", num_questions=5)
            create_contest_in_orbit(contest)
        except Exception as e:
            print(f"Error in weekly task for {subject}: {e}")

def run_scheduler():
    # Schedule for every Sunday at 00:00
    schedule.every().sunday.at("00:00").do(weekly_task)
    while True:
        schedule.run_pending()
        time.sleep(60)

@app.on_event("startup")
def startup_event():
    # Start the scheduler in a background thread
    thread = threading.Thread(target=run_scheduler, daemon=True)
    thread.start()

@app.get("/")
def read_root():
    return {"status": "Orbit Generator Service is running"}

@app.post("/generate-now")
def trigger_generation(background_tasks: BackgroundTasks, subject: str = "Physics", topic: str = "General"):
    """Manually trigger a contest generation."""
    background_tasks.add_task(weekly_task)
    return {"message": "Contest generation triggered in background"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

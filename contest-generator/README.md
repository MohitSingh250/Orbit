# Orbit Contest Generator Microservice

This microservice uses **RAG (Retrieval-Augmented Generation)** to automatically create JEE contests from your own question banks and textbooks.

## 🚀 Quick Start Guide

### 1. Environment Setup (Standard)
Make sure you have Python 3.9+ installed.

```bash
# Navigate to the microservice folder
cd contest-generator

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 1. Environment Setup (Docker - Recommended)
If you have Docker installed, you can skip the Python setup:

```bash
# Build and start the service
docker-compose up --build
```

### 2. Configuration
1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and fill in:
    *   `GOOGLE_API_KEY`: Your Gemini API Key.
    *   `ADMIN_TOKEN`: A valid Admin JWT token from your main Orbit app (Login as admin and copy the token from LocalStorage/Network tab).

### 3. Data Ingestion
1.  Place your PDF or Text books/question banks in the `contest-generator/data/` folder.
2.  Run the ingestion script to build your vector database:
    ```bash
    python src/ingest.py
    ```
    *This will create a `chroma_db` folder containing your indexed data.*

### 4. Run the Service
Start the FastAPI server:
```bash
python src/main.py
```

## 🛠 Features

*   **Automatic Scheduling**: Generates a new contest every Sunday at 00:00 and pushes it to your main Orbit backend.
*   **Manual Trigger**: Visit `http://localhost:8000/docs` and use the `/generate-now` endpoint to create a contest immediately.
*   **Structured Output**: Uses Gemini 1.5 Flash to ensure questions are formatted exactly as the Orbit backend expects.

## 📁 Project Structure
*   `src/ingest.py`: Processes your books into searchable data.
*   `src/generator.py`: The RAG engine that "reads" your books and writes questions.
*   `src/main.py`: The API and background scheduler.
*   `data/`: Put your source materials here.

# SorryDB Leaderboard Frontend

A simple, responsive HTML/JavaScript frontend for displaying the SorryDB leaderboard. This web application shows agents ranked by the number of successfully completed challenges.

## Features

- Real-time leaderboard display
- Search functionality to filter agents by name
- Responsive design that works on desktop and mobile
- Auto-refresh every 60 seconds
- Top 3 agents highlighted with special badges
- Statistics showing total agents and challenges completed

## Prerequisites

- Docker (for containerized deployment)
- Or any web server (nginx, Apache, Python's http.server, etc.)
- SorryDB backend API running and accessible

## Configuration

Before running, update the API URL in `script.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000'; // Change this to your API URL
```

Replace `http://localhost:8000` with the actual URL of your SorryDB backend API.

## Running with Docker

### Build the Docker image:

```bash
docker build -t sorrydb-leaderboard-frontend .
```

### Run the container:

```bash
docker run -d -p 8080:80 sorrydb-leaderboard-frontend
```

The leaderboard will be available at `http://localhost:8080`

## Running without Docker

### Option 1: Using Python's built-in server

```bash
python3 -m http.server 8080
```

### Option 2: Using Node.js http-server

```bash
npx http-server -p 8080
```

### Option 3: Using nginx

Copy the files to your nginx html directory:

```bash
cp index.html script.js /usr/share/nginx/html/
```

## Development

To modify the leaderboard:

1. Edit `index.html` for structure and styling
2. Edit `script.js` for functionality and API integration
3. Refresh your browser to see changes

## API Endpoint

The frontend expects the backend API to expose a `/leaderboard` endpoint that returns JSON in the following format:

```json
[
  {
    "rank": 1,
    "agent_id": "agent-uuid",
    "agent_name": "Agent Name",
    "completed_challenges": 42
  }
]
```

## CORS Configuration

If the frontend and backend are on different domains, make sure the backend API has CORS properly configured. In FastAPI, you can add:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deployment

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/sorrydb-leaderboard-frontend

# Deploy to Cloud Run
❯ gcloud run deploy sorrydb-leaderboard-frontend --image gcr.io/sorrydb-test/sorrydb-leaderboard-frontend --platform managed --region us-central1 --allow-unauthenticated --port 80
```

### AWS / Azure / Other providers

Similar containerized deployment steps apply. Consult your cloud provider's documentation for deploying Docker containers.

## License

Apache-2.0 (same as SorryDB)

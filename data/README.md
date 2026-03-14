# AI Bug Triage Assistant

An AI-powered system that automatically predicts GitHub issue labels and priorities.

## Features
- Predict issue label: `bug`, `feature`, `docs`
- Predict priority: `low`, `medium`, `high`
- REST API with FastAPI
- Simple rule-based + ML models

## Setup

### 1. Clone and setup
```bash
git clone <your-repo>
cd ai-bug-triage-assistant
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
# or
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Run API
```bash
python app.py
```

API runs at: `http://localhost:8000`

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```
Response:
```json
{"status": "ok", "message": "API is running"}
```

### Predict Issue
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"title": "Login page crash", "body": "App crashes when user clicks login"}'
```

Response:
```json
{"label": "bug", "priority": "high", "confidence": 0.75}
```

## Project Structure
```
├── app.py              # Main API
├── predict.py          # Prediction logic
├── train.py            # Model training
├── data/
│   └── training_data.csv
└── models/
    └── model.pkl
```

## Next Steps
- Train ML model: `python train.py`
- Integrate with GitHub webhooks
- Add frontend dashboard
- Deploy to Render/Vercel

## Author
GaneshSarode

## License
MIT
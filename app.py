from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from predict import predict_issue_label
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv

# Load environment variables if running locally (e.g. from a .env file)
# In production (Railway), variables are loaded directly from the system environment
load_dotenv()

app = FastAPI(title="AI Bug Triage Assistant")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory prediction history
prediction_history: List[dict] = []

# ── Models ────────────────────────────────────────────────────────────────────

class IssueRequest(BaseModel):
    title: str
    body: str

class IssueResponse(BaseModel):
    id: str
    label: str
    priority: str
    confidence: float
    timestamp: str

class BatchIssueRequest(BaseModel):
    issues: List[IssueRequest]

class FeedbackRequest(BaseModel):
    id: str
    correct: bool

class FeedbackResponse(BaseModel):
    message: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Check if API is running"""
    gemini_key_status = "configured" if os.environ.get("GEMINI_API_KEY") else "missing"
    return {
        "status": "ok", 
        "message": "API is running",
        "ai_status": f"Gemini API is {gemini_key_status}"
    }


@app.post("/predict", response_model=IssueResponse)
def predict(issue: IssueRequest):
    """Predict label and priority for a GitHub issue"""
    label, priority, confidence = predict_issue_label(issue.title, issue.body)
    record = {
        "id": str(uuid.uuid4()),
        "title": issue.title,
        "body": issue.body,
        "label": label,
        "priority": priority,
        "confidence": confidence,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "feedback": None,
    }
    prediction_history.append(record)
    return IssueResponse(
        id=record["id"],
        label=label,
        priority=priority,
        confidence=confidence,
        timestamp=record["timestamp"],
    )


@app.post("/batch-predict")
def batch_predict(request: BatchIssueRequest):
    """Predict labels and priorities for multiple GitHub issues"""
    results = []
    for issue in request.issues:
        label, priority, confidence = predict_issue_label(issue.title, issue.body)
        record = {
            "id": str(uuid.uuid4()),
            "title": issue.title,
            "body": issue.body,
            "label": label,
            "priority": priority,
            "confidence": confidence,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "feedback": None,
        }
        prediction_history.append(record)
        results.append(IssueResponse(
            id=record["id"],
            label=label,
            priority=priority,
            confidence=confidence,
            timestamp=record["timestamp"],
        ))
    return {"results": results, "count": len(results)}


@app.get("/history")
def get_history(limit: int = 50):
    """Get recent prediction history"""
    recent = prediction_history[-limit:]
    recent_sorted = sorted(recent, key=lambda x: x["timestamp"], reverse=True)
    return {"history": recent_sorted, "total": len(prediction_history)}


@app.get("/stats")
def get_stats():
    """Get prediction statistics"""
    if not prediction_history:
        return {
            "total": 0,
            "label_distribution": {"bug": 0, "feature": 0, "docs": 0},
            "priority_distribution": {"low": 0, "medium": 0, "high": 0},
            "avg_confidence": 0,
        }

    label_counts = {"bug": 0, "feature": 0, "docs": 0}
    priority_counts = {"low": 0, "medium": 0, "high": 0}
    total_confidence = 0.0

    for record in prediction_history:
        label = record.get("label", "docs")
        priority = record.get("priority", "low")
        label_counts[label] = label_counts.get(label, 0) + 1
        priority_counts[priority] = priority_counts.get(priority, 0) + 1
        total_confidence += record.get("confidence", 0)

    total = len(prediction_history)
    avg_confidence = round(total_confidence / total, 4) if total else 0

    return {
        "total": total,
        "label_distribution": label_counts,
        "priority_distribution": priority_counts,
        "avg_confidence": avg_confidence,
    }


@app.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback: FeedbackRequest):
    """Submit feedback on a prediction"""
    for record in prediction_history:
        if record["id"] == feedback.id:
            record["feedback"] = feedback.correct
            return FeedbackResponse(message="Feedback recorded. Thank you!")
    return FeedbackResponse(message="Prediction not found.")


@app.get("/")
def root():
    """API info"""
    return {
        "name": "AI Bug Triage Assistant (Powered by Gemini)",
        "version": "2.0.0",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict",
            "batch_predict": "POST /batch-predict",
            "history": "GET /history",
            "stats": "GET /stats",
            "feedback": "POST /feedback",
        },
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

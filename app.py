from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from predict import predict_issue_label

app = FastAPI(title="AI Bug Triage Assistant")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health():
    """Check if API is running"""
    return {"status": "ok", "message": "API is running"}

# Prediction endpoint
class IssueRequest(BaseModel):
    title: str
    body: str

class IssueResponse(BaseModel):
    label: str
    priority: str
    confidence: float

@app.post("/predict")
def predict(issue: IssueRequest):
    """Predict label and priority for GitHub issue"""
    label, priority, confidence = predict_issue_label(issue.title, issue.body)
    return IssueResponse(label=label, priority=priority, confidence=confidence)

# Root endpoint
@app.get("/")
def root():
    """API info"""
    return {
        "name": "AI Bug Triage Assistant",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
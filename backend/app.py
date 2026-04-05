from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from predict import predict_issue_label
from datetime import datetime, timezone
import uuid
import os
import re
import httpx
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
class RepoTriageRequest(BaseModel):
    repo_url: str
    github_token: Optional[str] = None
    max_issues: int = 50
 
class ApplyLabelsRequest(BaseModel):
    repo_url: str
    github_token: str
    predictions: List[dict] 
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
    return {"status": "ok", "message": "API is running"}


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
        "name": "AI Bug Triage Assistant",
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
def _parse_repo_url(url: str):
    """Extract owner and repo name from a GitHub URL."""
    match = re.search(r"github\.com/([^/]+)/([^/?\s]+?)(?:\.git)?(?:/|$)", url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub repo URL. Example: https://github.com/owner/repo")
    return match.group(1), match.group(2)
 
 
@app.post("/triage-repo")
async def triage_repo(request: RepoTriageRequest):
    """
    Fetch all open issues from a public (or private, with token) GitHub repo
    and predict label + priority for each one.
    """
    owner, repo = _parse_repo_url(request.repo_url)
 
    headers = {"Accept": "application/vnd.github.v3+json"}
    if request.github_token:
        headers["Authorization"] = f"token {request.github_token}"
 
    # GitHub returns PRs mixed in with issues – we filter them out below.
    params = {
        "state": "open",
        "per_page": min(request.max_issues, 100),
        "page": 1,
    }
 
    async with httpx.AsyncClient(timeout=15) as client:
        gh_response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/issues",
            headers=headers,
            params=params,
        )
 
    if gh_response.status_code == 404:
        raise HTTPException(status_code=404, detail="Repo not found. Make sure it's public or provide a valid token.")
    if gh_response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid GitHub token.")
    if gh_response.status_code != 200:
        raise HTTPException(status_code=gh_response.status_code, detail="Failed to fetch issues from GitHub.")
 
    raw_issues = gh_response.json()
 
    # Filter out pull requests (GitHub API returns PRs under /issues too)
    issues = [i for i in raw_issues if "pull_request" not in i]
 
    results = []
    for issue in issues[: request.max_issues]:
        label, priority, confidence = predict_issue_label(
            issue.get("title", ""),
            issue.get("body", "") or "",
        )
        record = {
            "id": str(uuid.uuid4()),
            "github_issue_number": issue["number"],
            "github_issue_url": issue["html_url"],
            "title": issue["title"],
            "body": (issue.get("body") or "")[:500],   # truncate for storage
            "label": label,
            "priority": priority,
            "confidence": confidence,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "feedback": None,
        }
        prediction_history.append(record)
        results.append(record)
 
    return {
        "repo": f"{owner}/{repo}",
        "repo_url": f"https://github.com/{owner}/{repo}",
        "total_triaged": len(results),
        "results": results,
    }
 
 
@app.post("/apply-labels")
async def apply_labels(request: ApplyLabelsRequest):
    """
    Apply the AI-predicted labels back to the actual GitHub issues.
    Requires a GitHub personal access token with `repo` scope.
    """
    owner, repo = _parse_repo_url(request.repo_url)
 
    headers = {
        "Authorization": f"token {request.github_token}",
        "Accept": "application/vnd.github.v3+json",
    }
 
    applied = 0
    failed = 0
 
    async with httpx.AsyncClient(timeout=15) as client:
        for pred in request.predictions:
            issue_number = pred.get("github_issue_number")
            if not issue_number:
                continue
 
            # Build labels list e.g. ["bug", "priority:high"]
            labels_to_apply = [pred["label"], f"priority:{pred['priority']}"]
 
            resp = await client.post(
                f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/labels",
                headers=headers,
                json={"labels": labels_to_apply},
            )
            if resp.status_code in (200, 201):
                applied += 1
            else:
                failed += 1
 
    return {
        "applied": applied,
        "failed": failed,
        "total": len(request.predictions),
        "message": f"Applied labels to {applied} of {len(request.predictions)} issues.",
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

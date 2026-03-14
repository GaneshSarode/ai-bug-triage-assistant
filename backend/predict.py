import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pandas as pd

# Dummy model for now (we'll train later)
class DummyPredictor:
    def __init__(self):
        self.labels = ["bug", "feature", "docs"]
        self.priorities = ["low", "medium", "high"]
    
    def predict(self, text):
        """Simple rule-based prediction"""
        text_lower = text.lower()
        
        # Predict label
        if "bug" in text_lower or "error" in text_lower or "crash" in text_lower:
            label = "bug"
        elif "feature" in text_lower or "add" in text_lower or "new" in text_lower:
            label = "feature"
        else:
            label = "docs"
        
        # Predict priority
        if "urgent" in text_lower or "critical" in text_lower or "asap" in text_lower:
            priority = "high"
        elif "important" in text_lower:
            priority = "medium"
        else:
            priority = "low"
        
        confidence = 0.75  # dummy confidence
        
        return label, priority, confidence

# Initialize predictor
predictor = DummyPredictor()

def predict_issue_label(title: str, body: str):
    """Predict issue label and priority"""
    combined_text = f"{title} {body}"
    label, priority, confidence = predictor.predict(combined_text)
    return label, priority, confidence
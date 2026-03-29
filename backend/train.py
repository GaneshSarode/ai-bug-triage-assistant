# import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle

def train_model():
    """Train AI model from training data"""
    
    # Load sample data
    df = pd.read_csv("data/training_data.csv")
    
    # Prepare text
    X = df["title"] + " " + df["body"]
    y_label = df["label"]
    
    # Train label model
    model = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=1000)),
        ("classifier", MultinomialNB())
    ])
    
    model.fit(X, y_label)
    
    # Save model
    with open("models/model.pkl", "wb") as f:
        pickle.dump(model, f)
    
    print("✅ Model trained and saved!")

if __name__ == "__main__":
    train_model()

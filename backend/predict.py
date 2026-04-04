import os
import json
import google.generativeai as genai

# Configure the Gemini API key from environment variables
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# We use the faster, cost-effective flash model
model = genai.GenerativeModel('gemini-1.5-flash')

def predict_issue_label(title: str, body: str):
    """
    Predict issue label and priority using Google Gemini API.
    Returns: label, priority, confidence
    """
    # If no API key is provided, gracefully fallback so the app doesn't crash
    if not api_key:
        print("WARNING: No GEMINI_API_KEY found. Using fallback prediction.")
        return fallback_predict(title, body)

    prompt = f"""
    You are an expert Senior QA Engineer and Product Manager. 
    Your job is to analyze a newly submitted software issue and categorize it.
    
    Issue Title: {title}
    Issue Body: {body}
    
    You must respond ONLY with a valid JSON object. Do not include markdown formatting, backticks, or any other text.
    The JSON must have exactly these three keys:
    "label": MUST be exactly one of: ["bug", "feature", "docs"]
    "priority": MUST be exactly one of: ["low", "medium", "high"]
    "confidence": MUST be a float between 0.0 and 1.0 representing how confident you are in this classification.
    """

    try:
        # Call the Gemini API
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1, # Low temperature for more deterministic output
                response_mime_type="application/json", # Force JSON output if supported
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text.strip())
        
        # Ensure the outputs are within our strict bounds
        label = result.get("label", "bug").lower()
        if label not in ["bug", "feature", "docs"]:
            label = "bug"
            
        priority = result.get("priority", "medium").lower()
        if priority not in ["low", "medium", "high"]:
            priority = "medium"
            
        confidence = float(result.get("confidence", 0.85))
        
        return label, priority, confidence
        
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Fallback if the API fails, timeouts, or returns bad JSON
        return fallback_predict(title, body)

def fallback_predict(title: str, body: str):
    """Simple rule-based fallback prediction if Gemini is unavailable"""
    combined_text = f"{title} {body}".lower()
    
    if "bug" in combined_text or "error" in combined_text or "crash" in combined_text:
        label = "bug"
    elif "feature" in combined_text or "add" in combined_text or "new" in combined_text:
        label = "feature"
    else:
        label = "docs"
        
    if "urgent" in combined_text or "critical" in combined_text or "crash" in combined_text:
        priority = "high"
    elif "important" in combined_text:
        priority = "medium"
    else:
        priority = "low"
        
    return label, priority, 0.5 # Low confidence to indicate fallback was used
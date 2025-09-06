from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date, datetime
from dateutil import parser
import joblib
import os

# Import offline AI with fallback
try:
    from offline_ai import offline_ai
    OFFLINE_AI_AVAILABLE = True
    print("Using full offline AI")
except ImportError as e:
    print(f"Full offline_ai not available: {e}")
    try:
        from simple_offline_ai import simple_offline_ai as offline_ai
        OFFLINE_AI_AVAILABLE = True
        print("Using simple offline AI")
    except ImportError as e2:
        OFFLINE_AI_AVAILABLE = False
        print(f"Simple offline_ai not available: {e2}")
        offline_ai = None

# Optional transformers import for fallback
try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: transformers not available, using offline AI only")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models and utilities
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model_store')

def get_summarizer():
    if TRANSFORMERS_AVAILABLE:
        return pipeline("summarization", model="facebook/bart-large-cnn")
    else:
        return None

def get_priority_model():
    model_path = os.path.join(MODEL_DIR, 'priority_model.joblib')
    if not os.path.exists(model_path):
        # Return a dummy model for testing
        from sklearn.dummy import DummyClassifier
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.pipeline import Pipeline
        
        dummy = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', DummyClassifier(strategy='constant', constant='medium'))
        ])
        return dummy
    return joblib.load(model_path)

# Request models
class SummarizeRequest(BaseModel):
    text: str
    max_len: Optional[int] = 60
    min_len: Optional[int] = 20

class DeadlineRequest(BaseModel):
    due_date: str
    task_complexity: Optional[str] = "medium"

class PriorityRequest(BaseModel):
    title: str
    description: Optional[str] = ""

class TaskInsightsRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[str] = None
    complexity: Optional[str] = "medium"

# API endpoints
@app.post('/api/deadline-risk')
async def deadline_risk(req: DeadlineRequest):
    """Enhanced offline deadline risk analysis"""
    if not OFFLINE_AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Offline AI not available")
    
    try:
        result = offline_ai.analyze_deadline(req.due_date, req.task_complexity)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/summarize')
async def summarize(req: SummarizeRequest):
    """Offline text summarization"""
    if not OFFLINE_AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Offline AI not available")
    
    try:
        result = offline_ai.summarize_text(req.text, max_sentences=3)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/priority')
async def priority(req: PriorityRequest):
    """Enhanced offline priority classification"""
    if not OFFLINE_AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Offline AI not available")
    
    try:
        result = offline_ai.classify_priority(req.title, req.description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/ai-insights')
async def get_ai_insights(req: TaskInsightsRequest):
    """Get comprehensive AI insights for a task"""
    if not OFFLINE_AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Offline AI not available")
    
    try:
        task_data = {
            "title": req.title,
            "description": req.description,
            "due_date": req.due_date,
            "complexity": req.complexity
        }
        result = offline_ai.get_ai_insights(task_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/health')
async def health():
    return {
        "status": "ok", 
        "offline_ai": "enabled" if OFFLINE_AI_AVAILABLE else "disabled",
        "transformers": "enabled" if TRANSFORMERS_AVAILABLE else "disabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
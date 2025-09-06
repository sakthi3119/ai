import os
import json
from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

# Constants
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

# File paths
VEC_PATH = os.path.join(MODEL_DIR, 'tfidf_vec.joblib')
CLF_PATH = os.path.join(MODEL_DIR, 'clf.joblib')
SEED_DATA_PATH = os.path.join(os.path.dirname(__file__), 'classifier_seed_data.json')

def _load_seed_data() -> List[Dict[str, Any]]:
    """Load seed data from JSON file.
    
    Returns:
        List[Dict]: List of training examples with 'title', 'description', and 'priority' keys.
    """
    try:
        with open(SEED_DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Seed data file not found at {SEED_DATA_PATH}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {SEED_DATA_PATH}: {e}")
        return []

def get_priority_pipeline() -> Pipeline:
    """Get or create a text classification pipeline for priority prediction.
    
    Returns:
        Pipeline: A scikit-learn pipeline with TF-IDF vectorizer and classifier.
    """
    # Try to load existing models
    if os.path.exists(VEC_PATH) and os.path.exists(CLF_PATH):
        try:
            vec = joblib.load(VEC_PATH)
            clf = joblib.load(CLF_PATH)
            return Pipeline([('tfidf', vec), ('clf', clf)])
        except Exception as e:
            print(f"Error loading models: {e}. Retraining...")
    
    # Load and prepare training data
    data = _load_seed_data()
    if not data:
        raise ValueError("No training data available. Please check classifier_seed_data.json")
    
    texts = [f"{t.get('title', '')} {t.get('description', '')}".strip() for t in data]
    y = [t.get('priority', 'medium') for t in data]  # default to 'medium' if priority not specified
    
    # Create and train new models
    vec = TfidfVectorizer(max_features=2000)
    X = vec.fit_transform(texts)
    
    clf = LogisticRegression(max_iter=1000, random_state=42)
    clf.fit(X, y)
    
    # Save models
    try:
        joblib.dump(vec, VEC_PATH)
        joblib.dump(clf, CLF_PATH)
    except Exception as e:
        print(f"Warning: Could not save models: {e}")
    
    return Pipeline([('tfidf', vec), ('clf', clf)])

if __name__ == '__main__':
    # Quick test
    try:
        pipeline = get_priority_pipeline()
        print('Pipeline ready')
        print(f'Pipeline steps: {[name for name, _ in pipeline.steps]}')
    except Exception as e:
        print(f'Error initializing pipeline: {e}')
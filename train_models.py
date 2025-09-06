"""
Model Training Script for Offline AI Features
Trains and saves models for priority classification
"""

import os
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import numpy as np

def load_training_data():
    """Load and expand training data"""
    # Load existing seed data
    seed_data_path = os.path.join(os.path.dirname(__file__), 'classifier_seed_data.json')
    
    try:
        with open(seed_data_path, 'r', encoding='utf-8') as f:
            seed_data = json.load(f)
    except FileNotFoundError:
        print("No seed data found, creating basic training data")
        seed_data = []
    
    # Expand training data with more examples
    expanded_data = seed_data + [
        # High priority examples
        {"title": "Server down", "description": "Production server is not responding", "priority": "high"},
        {"title": "Security vulnerability", "description": "Critical security issue found", "priority": "high"},
        {"title": "Payment system error", "description": "Users cannot complete payments", "priority": "high"},
        {"title": "Database corruption", "description": "Data integrity compromised", "priority": "high"},
        {"title": "User data breach", "description": "Potential data exposure detected", "priority": "high"},
        {"title": "API rate limit exceeded", "description": "Service unavailable due to rate limits", "priority": "high"},
        {"title": "Memory leak", "description": "Application consuming excessive memory", "priority": "high"},
        {"title": "Authentication failure", "description": "Users cannot log in", "priority": "high"},
        
        # Medium priority examples
        {"title": "Performance optimization", "description": "Improve application response time", "priority": "medium"},
        {"title": "Code review", "description": "Review pull request for new feature", "priority": "medium"},
        {"title": "UI improvements", "description": "Enhance user interface design", "priority": "medium"},
        {"title": "Testing", "description": "Add unit tests for new functionality", "priority": "medium"},
        {"title": "Refactoring", "description": "Clean up legacy code", "priority": "medium"},
        {"title": "Feature enhancement", "description": "Add new functionality to existing feature", "priority": "medium"},
        {"title": "Bug investigation", "description": "Investigate reported issue", "priority": "medium"},
        {"title": "Integration testing", "description": "Test integration with external service", "priority": "medium"},
        
        # Low priority examples
        {"title": "Documentation update", "description": "Update API documentation", "priority": "low"},
        {"title": "Code cleanup", "description": "Remove unused imports and variables", "priority": "low"},
        {"title": "Style improvements", "description": "Improve code formatting and style", "priority": "low"},
        {"title": "Feature request", "description": "Nice to have feature for future", "priority": "low"},
        {"title": "Research task", "description": "Investigate new technology options", "priority": "low"},
        {"title": "Meeting preparation", "description": "Prepare slides for team meeting", "priority": "low"},
        {"title": "Training material", "description": "Create training documentation", "priority": "low"},
        {"title": "Logo design", "description": "Design new company logo", "priority": "low"},
    ]
    
    return expanded_data

def prepare_training_data(data):
    """Prepare training data for ML model"""
    texts = []
    labels = []
    
    for item in data:
        # Combine title and description
        text = f"{item.get('title', '')} {item.get('description', '')}".strip()
        priority = item.get('priority', 'medium')
        
        if text and priority in ['high', 'medium', 'low']:
            texts.append(text)
            labels.append(priority)
    
    return texts, labels

def train_priority_model():
    """Train priority classification model"""
    print("Loading training data...")
    data = load_training_data()
    texts, labels = prepare_training_data(data)
    
    if len(texts) < 10:
        print("Not enough training data. Need at least 10 examples.")
        return None
    
    print(f"Training with {len(texts)} examples")
    print(f"Class distribution: {dict(zip(*np.unique(labels, return_counts=True)))}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # Create pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.8
        )),
        ('classifier', LogisticRegression(
            random_state=42,
            max_iter=1000,
            class_weight='balanced'
        ))
    ])
    
    # Train model
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'priority_model.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")
    
    return pipeline

def test_model(pipeline):
    """Test the trained model with sample inputs"""
    if pipeline is None:
        print("No model to test")
        return
    
    test_cases = [
        "Fix critical bug in payment system",
        "Update documentation for new API",
        "Design new user interface",
        "Server is down and users cannot access the application",
        "Add unit tests for authentication module",
        "Create presentation for client meeting"
    ]
    
    print("\nTesting model with sample inputs:")
    for text in test_cases:
        prediction = pipeline.predict([text])[0]
        confidence = pipeline.predict_proba([text])[0].max()
        print(f"'{text}' -> {prediction} (confidence: {confidence:.3f})")

if __name__ == "__main__":
    print("Training Offline AI Models for SynergySphere")
    print("=" * 50)
    
    # Train priority classification model
    model = train_priority_model()
    
    # Test the model
    test_model(model)
    
    print("\nTraining completed!")

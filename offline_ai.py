"""
Offline AI Module for SynergySphere
Provides AI features that work without internet connection
"""

import os
import re
import json
import nltk
import joblib
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from dateutil import parser
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import textstat

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

class OfflineSummarizer:
    """Lightweight offline text summarization using extractive methods"""
    
    def __init__(self, language='english'):
        self.language = language
        self.stemmer = Stemmer(language)
        self.stop_words = get_stop_words(language)
        
        # Initialize summarizers
        self.lsa_summarizer = LsaSummarizer(self.stemmer)
        self.lsa_summarizer.stop_words = self.stop_words
        
        self.textrank_summarizer = TextRankSummarizer(self.stemmer)
        self.textrank_summarizer.stop_words = self.stop_words
    
    def summarize(self, text: str, max_sentences: int = 3, method: str = 'lsa') -> str:
        """
        Summarize text using extractive methods
        
        Args:
            text: Input text to summarize
            max_sentences: Maximum number of sentences in summary
            method: 'lsa' or 'textrank'
        
        Returns:
            Summarized text
        """
        if not text or len(text.strip()) < 50:
            return text
        
        try:
            # Parse text
            parser = PlaintextParser.from_string(text, Tokenizer(self.language))
            
            # Choose summarizer
            summarizer = self.lsa_summarizer if method == 'lsa' else self.textrank_summarizer
            
            # Generate summary
            summary_sentences = summarizer(parser.document, max_sentences)
            summary = ' '.join([str(sentence) for sentence in summary_sentences])
            
            return summary if summary else text[:200] + "..."
            
        except Exception as e:
            # Fallback to simple truncation
            return self._simple_summary(text, max_sentences)
    
    def _simple_summary(self, text: str, max_sentences: int) -> str:
        """Fallback summarization using sentence splitting"""
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) <= max_sentences:
            return text
        
        # Score sentences by length and position
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            score = len(sentence) * (1 - i * 0.1)  # Prefer longer, earlier sentences
            scored_sentences.append((score, sentence))
        
        # Select top sentences
        scored_sentences.sort(reverse=True)
        selected = [s[1] for s in scored_sentences[:max_sentences]]
        
        return '. '.join(selected) + '.'

class OfflinePriorityClassifier:
    """Offline priority classification using rule-based and ML approaches"""
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.priority_keywords = {
            'high': ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'bug', 'error', 'down', 'broken', 'fix', 'hotfix'],
            'medium': ['important', 'review', 'update', 'improve', 'enhance', 'refactor', 'optimize'],
            'low': ['nice', 'feature', 'enhancement', 'documentation', 'readme', 'cleanup', 'style']
        }
        self.urgency_indicators = ['deadline', 'due', 'expired', 'overdue', 'late', 'rush']
    
    def predict_priority(self, title: str, description: str = "") -> Dict[str, Any]:
        """
        Predict task priority using rule-based and ML methods
        
        Args:
            title: Task title
            description: Task description
        
        Returns:
            Dictionary with priority, confidence, and reasoning
        """
        text = f"{title} {description}".lower()
        
        # Rule-based classification
        rule_priority, rule_confidence = self._rule_based_classification(text)
        
        # ML-based classification (if model available)
        ml_priority, ml_confidence = self._ml_classification(text)
        
        # Combine results
        if ml_confidence > rule_confidence:
            priority = ml_priority
            confidence = ml_confidence
            method = "ML"
        else:
            priority = rule_priority
            confidence = rule_confidence
            method = "Rule-based"
        
        return {
            "priority": priority,
            "confidence": confidence,
            "method": method,
            "reasoning": self._get_reasoning(text, priority)
        }
    
    def _rule_based_classification(self, text: str) -> tuple:
        """Rule-based priority classification"""
        high_score = sum(1 for keyword in self.priority_keywords['high'] if keyword in text)
        medium_score = sum(1 for keyword in self.priority_keywords['medium'] if keyword in text)
        low_score = sum(1 for keyword in self.priority_keywords['low'] if keyword in text)
        
        # Check for urgency indicators
        urgency_score = sum(1 for indicator in self.urgency_indicators if indicator in text)
        
        # Calculate scores
        scores = {
            'high': high_score + urgency_score * 2,
            'medium': medium_score,
            'low': low_score
        }
        
        if scores['high'] > 0:
            return 'high', min(0.9, 0.6 + scores['high'] * 0.1)
        elif scores['medium'] > scores['low']:
            return 'medium', min(0.8, 0.5 + scores['medium'] * 0.1)
        else:
            return 'low', min(0.7, 0.4 + scores['low'] * 0.1)
    
    def _ml_classification(self, text: str) -> tuple:
        """ML-based classification using trained model"""
        if self.model is None:
            return 'medium', 0.3  # Default fallback
        
        try:
            prediction = self.model.predict([text])[0]
            confidence = 0.7  # Default confidence for ML
            return prediction, confidence
        except Exception:
            return 'medium', 0.3
    
    def _get_reasoning(self, text: str, priority: str) -> str:
        """Generate reasoning for priority classification"""
        found_keywords = []
        for priority_level, keywords in self.priority_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_keywords.append(f"{keyword} ({priority_level})")
        
        if found_keywords:
            return f"Keywords found: {', '.join(found_keywords[:3])}"
        else:
            return f"Default classification based on content analysis"

class OfflineDeadlineAnalyzer:
    """Enhanced offline deadline risk analysis"""
    
    def __init__(self):
        self.risk_thresholds = {
            'overdue': 0,
            'critical': 1,
            'high': 3,
            'medium': 7,
            'low': 14
        }
    
    def analyze_deadline_risk(self, due_date: str, task_complexity: str = "medium") -> Dict[str, Any]:
        """
        Analyze deadline risk with enhanced features
        
        Args:
            due_date: Due date in ISO format
            task_complexity: Task complexity level
        
        Returns:
            Dictionary with risk analysis
        """
        try:
            due = parser.isoparse(due_date).date()
        except Exception:
            return {"error": "Invalid date format"}
        
        today = date.today()
        days_left = (due - today).days
        
        # Base risk assessment
        risk_level = self._get_risk_level(days_left)
        
        # Adjust for task complexity
        complexity_multiplier = {
            'low': 1.2,
            'medium': 1.0,
            'high': 0.8
        }
        
        adjusted_days = days_left * complexity_multiplier.get(task_complexity, 1.0)
        adjusted_risk = self._get_risk_level(int(adjusted_days))
        
        # Generate recommendations
        recommendations = self._get_recommendations(risk_level, days_left, task_complexity)
        
        return {
            "due_date": str(due),
            "days_left": days_left,
            "risk_level": risk_level,
            "adjusted_risk": adjusted_risk,
            "confidence": self._calculate_confidence(days_left, task_complexity),
            "recommendations": recommendations,
            "urgency_score": self._calculate_urgency_score(days_left, task_complexity)
        }
    
    def _get_risk_level(self, days_left: int) -> str:
        """Determine risk level based on days left"""
        if days_left < 0:
            return "overdue"
        elif days_left <= self.risk_thresholds['critical']:
            return "critical"
        elif days_left <= self.risk_thresholds['high']:
            return "high"
        elif days_left <= self.risk_thresholds['medium']:
            return "medium"
        else:
            return "low"
    
    def _get_recommendations(self, risk_level: str, days_left: int, complexity: str) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if risk_level == "overdue":
            recommendations.extend([
                "Task is overdue - immediate attention required",
                "Consider breaking down into smaller tasks",
                "Communicate with stakeholders about delay"
            ])
        elif risk_level == "critical":
            recommendations.extend([
                "Critical deadline approaching - prioritize this task",
                "Consider additional resources or help",
                "Daily check-ins recommended"
            ])
        elif risk_level == "high":
            recommendations.extend([
                "High priority - focus on this task",
                "Consider potential blockers",
                "Plan for potential delays"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Monitor progress regularly",
                "Ensure all dependencies are clear"
            ])
        else:
            recommendations.extend([
                "On track - maintain current pace",
                "Good time for thorough planning"
            ])
        
        if complexity == "high":
            recommendations.append("High complexity task - consider breaking down further")
        
        return recommendations
    
    def _calculate_confidence(self, days_left: int, complexity: str) -> float:
        """Calculate confidence in risk assessment"""
        base_confidence = 0.8
        
        # Adjust based on time proximity
        if days_left < 0:
            confidence = 0.95  # Very confident about overdue
        elif days_left <= 3:
            confidence = 0.9   # High confidence for near deadlines
        elif days_left <= 7:
            confidence = 0.8   # Good confidence
        else:
            confidence = 0.7   # Lower confidence for distant deadlines
        
        # Adjust for complexity
        if complexity == "high":
            confidence *= 0.9  # Slightly less confident for complex tasks
        
        return min(0.95, confidence)
    
    def _calculate_urgency_score(self, days_left: int, complexity: str) -> float:
        """Calculate urgency score (0-1)"""
        if days_left < 0:
            return 1.0
        elif days_left == 0:
            return 0.95
        elif days_left <= 1:
            return 0.9
        elif days_left <= 3:
            return 0.8
        elif days_left <= 7:
            return 0.6
        elif days_left <= 14:
            return 0.4
        else:
            return 0.2

class OfflineAIManager:
    """Main manager for offline AI features"""
    
    def __init__(self):
        self.summarizer = OfflineSummarizer()
        self.priority_classifier = OfflinePriorityClassifier()
        self.deadline_analyzer = OfflineDeadlineAnalyzer()
        
        # Load or create ML models
        self._load_models()
    
    def _load_models(self):
        """Load pre-trained models if available"""
        model_dir = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(model_dir, exist_ok=True)
        
        # Try to load priority classification model
        model_path = os.path.join(model_dir, 'priority_model.joblib')
        if os.path.exists(model_path):
            try:
                self.priority_classifier.model = joblib.load(model_path)
            except Exception as e:
                print(f"Could not load priority model: {e}")
    
    def summarize_text(self, text: str, max_sentences: int = 3) -> Dict[str, Any]:
        """Summarize text using offline methods"""
        summary = self.summarizer.summarize(text, max_sentences)
        
        return {
            "summary": summary,
            "original_length": len(text.split()),
            "summary_length": len(summary.split()),
            "compression_ratio": len(summary.split()) / max(1, len(text.split())),
            "method": "offline_extractive"
        }
    
    def classify_priority(self, title: str, description: str = "") -> Dict[str, Any]:
        """Classify task priority using offline methods"""
        return self.priority_classifier.predict_priority(title, description)
    
    def analyze_deadline(self, due_date: str, task_complexity: str = "medium") -> Dict[str, Any]:
        """Analyze deadline risk using offline methods"""
        return self.deadline_analyzer.analyze_deadline_risk(due_date, task_complexity)
    
    def get_ai_insights(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get comprehensive AI insights for a task"""
        insights = {}
        
        # Priority classification
        if 'title' in task_data:
            priority_result = self.classify_priority(
                task_data.get('title', ''),
                task_data.get('description', '')
            )
            insights['priority'] = priority_result
        
        # Deadline analysis
        if 'due_date' in task_data:
            deadline_result = self.analyze_deadline(
                task_data['due_date'],
                task_data.get('complexity', 'medium')
            )
            insights['deadline'] = deadline_result
        
        # Text summarization
        if 'description' in task_data and len(task_data['description']) > 100:
            summary_result = self.summarize_text(task_data['description'])
            insights['summary'] = summary_result
        
        return insights

# Global instance
offline_ai = OfflineAIManager()

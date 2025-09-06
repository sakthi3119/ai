"""
Simplified Offline AI Module for SynergySphere
Provides basic AI features without heavy dependencies
"""

import os
import re
import json
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from dateutil import parser
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

class SimpleSummarizer:
    """Simple text summarization using sentence extraction"""
    
    def summarize(self, text: str, max_sentences: int = 3) -> str:
        """Simple extractive summarization"""
        if not text or len(text.strip()) < 50:
            return text
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) <= max_sentences:
            return text
        
        # Score sentences by length and position
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            # Simple scoring: longer sentences and earlier sentences get higher scores
            score = len(sentence) * (1 - i * 0.1)
            scored_sentences.append((score, sentence))
        
        # Select top sentences
        scored_sentences.sort(reverse=True)
        selected = [s[1] for s in scored_sentences[:max_sentences]]
        
        return '. '.join(selected) + '.'

class SimplePriorityClassifier:
    """Simple priority classification using keyword matching"""
    
    def __init__(self):
        self.priority_keywords = {
            'high': ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'bug', 'error', 'down', 'broken', 'fix', 'hotfix', 'security', 'vulnerability'],
            'medium': ['important', 'review', 'update', 'improve', 'enhance', 'refactor', 'optimize', 'performance'],
            'low': ['nice', 'feature', 'enhancement', 'documentation', 'readme', 'cleanup', 'style', 'design']
        }
        self.urgency_indicators = ['deadline', 'due', 'expired', 'overdue', 'late', 'rush']
    
    def predict_priority(self, title: str, description: str = "") -> Dict[str, Any]:
        """Predict task priority using keyword matching"""
        text = f"{title} {description}".lower()
        
        # Count keyword matches
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
        
        # Determine priority
        if scores['high'] > 0:
            priority = 'high'
            confidence = min(0.9, 0.6 + scores['high'] * 0.1)
        elif scores['medium'] > scores['low']:
            priority = 'medium'
            confidence = min(0.8, 0.5 + scores['medium'] * 0.1)
        else:
            priority = 'low'
            confidence = min(0.7, 0.4 + scores['low'] * 0.1)
        
        # Generate reasoning
        found_keywords = []
        for priority_level, keywords in self.priority_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_keywords.append(f"{keyword} ({priority_level})")
        
        reasoning = f"Keywords found: {', '.join(found_keywords[:3])}" if found_keywords else "Default classification based on content analysis"
        
        return {
            "priority": priority,
            "confidence": confidence,
            "method": "Rule-based",
            "reasoning": reasoning
        }

class SimpleDeadlineAnalyzer:
    """Simple deadline risk analysis"""
    
    def __init__(self):
        self.risk_thresholds = {
            'overdue': 0,
            'critical': 1,
            'high': 3,
            'medium': 7,
            'low': 14
        }
    
    def analyze_deadline_risk(self, due_date: str, task_complexity: str = "medium") -> Dict[str, Any]:
        """Analyze deadline risk"""
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
        
        if days_left < 0:
            confidence = 0.95
        elif days_left <= 3:
            confidence = 0.9
        elif days_left <= 7:
            confidence = 0.8
        else:
            confidence = 0.7
        
        if complexity == "high":
            confidence *= 0.9
        
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

class SimpleAIManager:
    """Main manager for simple offline AI features"""
    
    def __init__(self):
        self.summarizer = SimpleSummarizer()
        self.priority_classifier = SimplePriorityClassifier()
        self.deadline_analyzer = SimpleDeadlineAnalyzer()
    
    def summarize_text(self, text: str, max_sentences: int = 3) -> Dict[str, Any]:
        """Summarize text using simple methods"""
        summary = self.summarizer.summarize(text, max_sentences)
        
        return {
            "summary": summary,
            "original_length": len(text.split()),
            "summary_length": len(summary.split()),
            "compression_ratio": len(summary.split()) / max(1, len(text.split())),
            "method": "simple_extractive"
        }
    
    def classify_priority(self, title: str, description: str = "") -> Dict[str, Any]:
        """Classify task priority using simple methods"""
        return self.priority_classifier.predict_priority(title, description)
    
    def analyze_deadline(self, due_date: str, task_complexity: str = "medium") -> Dict[str, Any]:
        """Analyze deadline risk using simple methods"""
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
simple_offline_ai = SimpleAIManager()

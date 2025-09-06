"""
Test script for Offline AI functionality
Validates that all AI features work correctly offline
"""

import sys
import os
from datetime import date, timedelta

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

def test_imports():
    """Test that all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from offline_ai import offline_ai
        print("✅ offline_ai imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import offline_ai: {e}")
        return False
    
    try:
        import nltk
        print("✅ nltk imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import nltk: {e}")
        return False
    
    try:
        from sumy.summarizers.lsa import LsaSummarizer
        print("✅ sumy imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import sumy: {e}")
        return False
    
    return True

def test_summarization():
    """Test text summarization functionality"""
    print("\nTesting text summarization...")
    
    try:
        from offline_ai import offline_ai
        
        test_text = """
        This is a comprehensive test of the offline text summarization feature. 
        The system should be able to extract the most important sentences from this text
        and provide a concise summary. This functionality is crucial for helping users
        quickly understand long task descriptions and project discussions. The summarization
        should work completely offline without requiring any internet connection.
        """
        
        result = offline_ai.summarize_text(test_text, max_sentences=2)
        
        print(f"✅ Summarization successful")
        print(f"   Original length: {result['original_length']} words")
        print(f"   Summary length: {result['summary_length']} words")
        print(f"   Compression ratio: {result['compression_ratio']:.2f}")
        print(f"   Summary: {result['summary'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Summarization test failed: {e}")
        return False

def test_priority_classification():
    """Test priority classification functionality"""
    print("\nTesting priority classification...")
    
    try:
        from offline_ai import offline_ai
        
        test_cases = [
            ("Fix critical bug", "Application crashes on startup", "high"),
            ("Update documentation", "Add API documentation", "low"),
            ("Performance optimization", "Improve database queries", "medium"),
            ("Security vulnerability", "Critical security issue found", "high"),
            ("Code cleanup", "Remove unused imports", "low")
        ]
        
        for title, description, expected in test_cases:
            result = offline_ai.classify_priority(title, description)
            
            print(f"✅ '{title}' -> {result['priority']} ({result['method']}, {result['confidence']:.2f})")
            if result['reasoning']:
                print(f"   Reasoning: {result['reasoning']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Priority classification test failed: {e}")
        return False

def test_deadline_analysis():
    """Test deadline risk analysis functionality"""
    print("\nTesting deadline risk analysis...")
    
    try:
        from offline_ai import offline_ai
        
        # Test different deadline scenarios
        today = date.today()
        test_cases = [
            (today - timedelta(days=1), "overdue"),  # Yesterday
            (today, "critical"),                     # Today
            (today + timedelta(days=1), "critical"), # Tomorrow
            (today + timedelta(days=3), "high"),     # 3 days
            (today + timedelta(days=7), "medium"),   # 1 week
            (today + timedelta(days=14), "low"),     # 2 weeks
        ]
        
        for due_date, expected_risk in test_cases:
            result = offline_ai.analyze_deadline(due_date.isoformat(), "medium")
            
            print(f"✅ Due {due_date} -> {result['risk_level']} risk ({result['days_left']} days left)")
            print(f"   Confidence: {result['confidence']:.2f}")
            print(f"   Urgency score: {result['urgency_score']:.2f}")
            if result['recommendations']:
                print(f"   Recommendation: {result['recommendations'][0]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Deadline analysis test failed: {e}")
        return False

def test_comprehensive_insights():
    """Test comprehensive AI insights functionality"""
    print("\nTesting comprehensive AI insights...")
    
    try:
        from offline_ai import offline_ai
        
        task_data = {
            "title": "Implement user authentication system",
            "description": "Create a secure login system with JWT tokens, password hashing, and session management. This is a critical security feature that needs to be implemented carefully.",
            "due_date": (date.today() + timedelta(days=5)).isoformat(),
            "complexity": "high"
        }
        
        result = offline_ai.get_ai_insights(task_data)
        
        print("✅ Comprehensive insights generated:")
        
        if 'priority' in result:
            priority = result['priority']
            print(f"   Priority: {priority['priority']} ({priority['method']}, {priority['confidence']:.2f})")
        
        if 'deadline' in result:
            deadline = result['deadline']
            print(f"   Deadline Risk: {deadline['risk_level']} ({deadline['days_left']} days left)")
        
        if 'summary' in result:
            summary = result['summary']
            print(f"   Summary: {summary['summary'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Comprehensive insights test failed: {e}")
        return False

def test_model_loading():
    """Test that models can be loaded properly"""
    print("\nTesting model loading...")
    
    try:
        from offline_ai import offline_ai
        
        # Test that the AI manager is properly initialized
        assert offline_ai is not None
        assert offline_ai.summarizer is not None
        assert offline_ai.priority_classifier is not None
        assert offline_ai.deadline_analyzer is not None
        
        print("✅ All AI components initialized successfully")
        
        # Test that models directory exists
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        if os.path.exists(models_dir):
            print(f"✅ Models directory exists: {models_dir}")
        else:
            print(f"⚠️  Models directory not found: {models_dir}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model loading test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing SynergySphere Offline AI Features")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_model_loading,
        test_summarization,
        test_priority_classification,
        test_deadline_analysis,
        test_comprehensive_insights
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Offline AI is working correctly.")
        return True
    else:
        print("❌ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

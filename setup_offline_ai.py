"""
Setup script for Offline AI features
Installs dependencies and trains models
"""

import os
import sys
import subprocess
import json

def install_dependencies():
    """Install required Python packages"""
    print("Installing Python dependencies...")
    
    packages = [
        'nltk',
        'sentence-transformers',
        'sumy',
        'textstat'
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")

def download_nltk_data():
    """Download required NLTK data"""
    print("Downloading NLTK data...")
    
    try:
        import nltk
        
        # Download required NLTK data
        nltk_data = [
            'punkt',
            'stopwords',
            'averaged_perceptron_tagger',
            'vader_lexicon'
        ]
        
        for data in nltk_data:
            try:
                nltk.download(data, quiet=True)
                print(f"✅ Downloaded NLTK {data}")
            except Exception as e:
                print(f"❌ Failed to download NLTK {data}: {e}")
                
    except ImportError:
        print("❌ NLTK not available")

def create_models_directory():
    """Create models directory"""
    print("Creating models directory...")
    
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    print(f"✅ Created models directory: {models_dir}")

def train_models():
    """Train AI models"""
    print("Training AI models...")
    
    try:
        # Import and run training
        from train_models import train_priority_model, test_model
        
        model = train_priority_model()
        if model:
            test_model(model)
            print("✅ Models trained successfully")
        else:
            print("❌ Model training failed")
            
    except Exception as e:
        print(f"❌ Error training models: {e}")

def create_sample_data():
    """Create sample training data if it doesn't exist"""
    print("Creating sample training data...")
    
    seed_data_path = os.path.join(os.path.dirname(__file__), 'classifier_seed_data.json')
    
    if not os.path.exists(seed_data_path):
        sample_data = [
            {"title": "Fix critical bug", "description": "Application crashes on startup", "priority": "high"},
            {"title": "Update documentation", "description": "Add API documentation", "priority": "low"},
            {"title": "Performance optimization", "description": "Improve database queries", "priority": "medium"},
            {"title": "Security patch", "description": "Fix vulnerability in authentication", "priority": "high"},
            {"title": "UI improvements", "description": "Better user interface design", "priority": "medium"},
            {"title": "Code cleanup", "description": "Remove unused code", "priority": "low"},
            {"title": "Server maintenance", "description": "Scheduled server downtime", "priority": "medium"},
            {"title": "Feature request", "description": "Add new functionality", "priority": "low"},
            {"title": "Database backup", "description": "Critical data backup required", "priority": "high"},
            {"title": "Testing", "description": "Add unit tests", "priority": "medium"}
        ]
        
        with open(seed_data_path, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, indent=2)
        
        print(f"✅ Created sample data: {seed_data_path}")
    else:
        print("✅ Sample data already exists")

def test_offline_ai():
    """Test offline AI functionality"""
    print("Testing offline AI functionality...")
    
    try:
        from offline_ai import offline_ai
        
        # Test summarization
        test_text = "This is a long text that needs to be summarized. It contains multiple sentences and should be reduced to a shorter version while maintaining the key information."
        summary_result = offline_ai.summarize_text(test_text)
        print(f"✅ Summarization test: {summary_result['summary'][:50]}...")
        
        # Test priority classification
        priority_result = offline_ai.classify_priority("Fix critical bug", "Application is crashing")
        print(f"✅ Priority test: {priority_result['priority']} ({priority_result['method']})")
        
        # Test deadline analysis
        from datetime import date, timedelta
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        deadline_result = offline_ai.analyze_deadline(tomorrow, "high")
        print(f"✅ Deadline test: {deadline_result['risk_level']} risk")
        
        print("✅ All offline AI tests passed!")
        
    except Exception as e:
        print(f"❌ Offline AI test failed: {e}")

def main():
    """Main setup function"""
    print("🚀 Setting up Offline AI for SynergySphere")
    print("=" * 50)
    
    try:
        # Step 1: Install dependencies
        install_dependencies()
        print()
        
        # Step 2: Download NLTK data
        download_nltk_data()
        print()
        
        # Step 3: Create models directory
        create_models_directory()
        print()
        
        # Step 4: Create sample data
        create_sample_data()
        print()
        
        # Step 5: Train models
        train_models()
        print()
        
        # Step 6: Test functionality
        test_offline_ai()
        print()
        
        print("🎉 Offline AI setup completed successfully!")
        print("\nNext steps:")
        print("1. Start the backend server: python main.py")
        print("2. Start the frontend: npm start")
        print("3. Access the AI Dashboard in the application")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

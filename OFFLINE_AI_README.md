# SynergySphere Offline AI Features

This document explains the offline AI capabilities implemented in SynergySphere, which work without internet connection.

## 🤖 AI Features

### 1. Smart Deadline Risk Alerts
- **Offline Rule-Based Analysis**: Analyzes task deadlines using local algorithms
- **Risk Levels**: Overdue, Critical, High, Medium, Low
- **Task Complexity Adjustment**: Considers task complexity in risk assessment
- **Actionable Recommendations**: Provides specific suggestions for each risk level

### 2. Task Priority Classification
- **Hybrid Approach**: Combines rule-based and ML classification
- **Keyword Analysis**: Identifies priority indicators in task titles/descriptions
- **Confidence Scoring**: Provides confidence levels for predictions
- **Reasoning**: Explains why a priority was assigned

### 3. Text Summarization
- **Extractive Methods**: Uses LSA and TextRank algorithms
- **Offline Processing**: No external API calls required
- **Fallback Mechanisms**: Multiple summarization strategies
- **Compression Metrics**: Shows summarization effectiveness

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- Virtual environment (recommended)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Activate virtual environment**:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Run setup script**:
   ```bash
   python setup_offline_ai.py
   ```

4. **Start the server**:
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

## 📊 API Endpoints

### Enhanced Deadline Risk Analysis
```http
POST /api/deadline-risk
Content-Type: application/json

{
  "due_date": "2025-01-15",
  "task_complexity": "high"
}
```

**Response**:
```json
{
  "due_date": "2025-01-15",
  "days_left": 5,
  "risk_level": "high",
  "adjusted_risk": "critical",
  "confidence": 0.85,
  "recommendations": [
    "High priority - focus on this task",
    "Consider potential blockers"
  ],
  "urgency_score": 0.8
}
```

### Enhanced Priority Classification
```http
POST /api/priority
Content-Type: application/json

{
  "title": "Fix critical payment bug",
  "description": "Users cannot complete transactions"
}
```

**Response**:
```json
{
  "priority": "high",
  "confidence": 0.9,
  "method": "Rule-based",
  "reasoning": "Keywords found: critical (high), bug (high)"
}
```

### Comprehensive AI Insights
```http
POST /api/ai-insights
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add secure login system with JWT tokens",
  "due_date": "2025-01-20",
  "complexity": "high"
}
```

**Response**:
```json
{
  "priority": {
    "priority": "medium",
    "confidence": 0.7,
    "method": "ML",
    "reasoning": "Default classification based on content analysis"
  },
  "deadline": {
    "due_date": "2025-01-20",
    "days_left": 10,
    "risk_level": "medium",
    "confidence": 0.8,
    "recommendations": ["Monitor progress regularly"],
    "urgency_score": 0.4
  },
  "summary": {
    "summary": "Add secure login system with JWT tokens.",
    "original_length": 8,
    "summary_length": 8,
    "compression_ratio": 1.0,
    "method": "offline_extractive"
  }
}
```

## 🎯 Usage Examples

### Frontend Integration

```javascript
import { getAIInsights, getDeadlineRisk, suggestPriority } from './api'

// Get comprehensive AI insights for a task
const insights = await getAIInsights(
  "Fix critical bug",
  "Application crashes on startup",
  "2025-01-15",
  "high"
)

// Check deadline risk
const risk = await getDeadlineRisk("2025-01-15", "high")

// Get priority suggestion
const priority = await suggestPriority("Fix critical bug", "App crashes")
```

### AI-Enhanced Task Component

```jsx
import AITaskCard from './components/AITaskCard'

<AITaskCard 
  task={task}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
/>
```

## 🔧 Model Training

### Training Priority Classification Model

```bash
python train_models.py
```

This will:
- Load and expand training data
- Train a TF-IDF + Logistic Regression model
- Save the model for offline use
- Test the model with sample inputs

### Custom Training Data

Add your own training examples to `classifier_seed_data.json`:

```json
[
  {
    "title": "Your task title",
    "description": "Task description",
    "priority": "high|medium|low"
  }
]
```

## 🏗️ Architecture

### Offline AI Components

1. **OfflineSummarizer**: Text summarization using extractive methods
2. **OfflinePriorityClassifier**: Hybrid priority classification
3. **OfflineDeadlineAnalyzer**: Enhanced deadline risk analysis
4. **OfflineAIManager**: Main coordinator for all AI features

### Model Storage

- Models are stored in `backend/models/` directory
- Priority model: `priority_model.joblib`
- Models are loaded once and cached in memory

### Performance Optimizations

- **Lazy Loading**: Models loaded only when needed
- **Caching**: Results cached to avoid recomputation
- **Fallback Mechanisms**: Multiple strategies for each feature
- **Memory Efficient**: Lightweight models for offline use

## 🧪 Testing

### Test Offline AI Features

```bash
python -c "
from offline_ai import offline_ai
print('Testing summarization...')
result = offline_ai.summarize_text('This is a test text for summarization.')
print('Summary:', result['summary'])
"
```

### Health Check

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "offline_ai": "enabled"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **NLTK Data Missing**:
   ```bash
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
   ```

2. **Model Loading Errors**:
   - Check if `models/` directory exists
   - Run `python train_models.py` to retrain models

3. **Import Errors**:
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python version compatibility

4. **Performance Issues**:
   - Models are loaded on first use (may take a few seconds)
   - Consider reducing training data size for faster startup

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG=1
python main.py
```

## 🔮 Future Enhancements

- **Sentiment Analysis**: Analyze task descriptions for sentiment
- **Workload Prediction**: Predict team capacity based on task complexity
- **Smart Notifications**: Intelligent notification timing
- **Pattern Recognition**: Learn from user behavior patterns
- **Multi-language Support**: Support for multiple languages

## 📝 Notes

- All AI features work completely offline
- No external API keys or internet connection required
- Models are lightweight and fast
- Suitable for both development and production use
- Extensible architecture for adding new AI features

## 🤝 Contributing

To add new offline AI features:

1. Create new class in `offline_ai.py`
2. Add API endpoint in `main.py`
3. Update frontend components
4. Add tests and documentation
5. Update this README

---

**SynergySphere Offline AI** - Making teams smarter, even without internet! 🚀

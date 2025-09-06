import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

// Enhanced deadline risk analysis with task complexity
export async function getDeadlineRisk(dueDate, taskComplexity = 'medium') {
    const res = await axios.post(`${API_BASE}/deadline-risk`, {
        due_date: dueDate,
        task_complexity: taskComplexity
    })
    return res.data
}

// Offline text summarization
export async function summarizeText(text) {
    const res = await axios.post(`${API_BASE}/summarize`, {
        text,
        max_len: 60,
        min_len: 10
    })
    return res.data
}

// Enhanced priority classification with reasoning
export async function suggestPriority(title, description = '') {
    const res = await axios.post(`${API_BASE}/priority`, {
        title,
        description
    })
    return res.data
}

// Comprehensive AI insights for tasks
export async function getAIInsights(title, description = '', dueDate = null, complexity = 'medium') {
    const res = await axios.post(`${API_BASE}/ai-insights`, {
        title,
        description,
        due_date: dueDate,
        complexity
    })
    return res.data
}

// Health check to verify offline AI is working
export async function checkAIHealth() {
    const res = await axios.get(`${API_BASE}/health`)
    return res.data
}
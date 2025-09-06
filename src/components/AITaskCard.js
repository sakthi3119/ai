import React, { useState, useEffect } from 'react'
import { getAIInsights, getDeadlineRisk, suggestPriority } from '../api'

const AITaskCard = ({ task, onUpdate, onDelete }) => {
    const [aiInsights, setAiInsights] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showInsights, setShowInsights] = useState(false)

    // Load AI insights when task changes
    useEffect(() => {
        if (task.title) {
            loadAIInsights()
        }
    }, [task.title, task.description, task.due])

    const loadAIInsights = async () => {
        setLoading(true)
        try {
            const insights = await getAIInsights(
                task.title,
                task.description || '',
                task.due,
                task.complexity || 'medium'
            )
            setAiInsights(insights)
        } catch (error) {
            console.error('Failed to load AI insights:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#ef4444'
            case 'medium': return '#f59e0b'
            case 'low': return '#10b981'
            default: return '#6b7280'
        }
    }

    const getRiskColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'overdue': return '#dc2626'
            case 'critical': return '#ea580c'
            case 'high': return '#d97706'
            case 'medium': return '#ca8a04'
            case 'low': return '#16a34a'
            default: return '#6b7280'
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date'
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    const getDaysLeft = (dueDate) => {
        if (!dueDate) return null
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <div className="task-card" style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            margin: '8px 0',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
            {/* Task Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    {task.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* AI Priority Badge */}
                    {aiInsights?.priority && (
                        <span style={{
                            backgroundColor: getPriorityColor(aiInsights.priority.priority),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            {aiInsights.priority.priority.toUpperCase()}
                        </span>
                    )}

                    {/* AI Insights Toggle */}
                    <button
                        onClick={() => setShowInsights(!showInsights)}
                        style={{
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? '⏳' : '🤖'} AI
                    </button>
                </div>
            </div>

            {/* Task Description */}
            {task.description && (
                <p style={{
                    margin: '0 0 12px 0',
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: '1.4'
                }}>
                    {task.description}
                </p>
            )}

            {/* Task Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                    <span>👤 {task.assignee}</span>
                    <span>📅 {formatDate(task.due)}</span>
                    <span style={{
                        backgroundColor: task.status === 'Done' ? '#dcfce7' :
                            task.status === 'In Progress' ? '#fef3c7' : '#f3f4f6',
                        color: task.status === 'Done' ? '#166534' :
                            task.status === 'In Progress' ? '#92400e' : '#374151',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        {task.status}
                    </span>
                </div>
            </div>

            {/* AI Insights Panel */}
            {showInsights && aiInsights && (
                <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    marginTop: '12px'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>
                        🤖 AI Insights
                    </h4>

                    {/* Priority Analysis */}
                    {aiInsights.priority && (
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Priority:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: getPriorityColor(aiInsights.priority.priority),
                                fontWeight: '500'
                            }}>
                                {aiInsights.priority.priority}
                                ({aiInsights.priority.method}, {Math.round(aiInsights.priority.confidence * 100)}% confidence)
                            </span>
                            {aiInsights.priority.reasoning && (
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                    {aiInsights.priority.reasoning}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Deadline Analysis */}
                    {aiInsights.deadline && (
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Deadline Risk:</strong>
                            <span style={{
                                marginLeft: '8px',
                                color: getRiskColor(aiInsights.deadline.risk_level),
                                fontWeight: '500'
                            }}>
                                {aiInsights.deadline.risk_level} ({aiInsights.deadline.days_left} days left)
                            </span>
                            {aiInsights.deadline.recommendations && aiInsights.deadline.recommendations.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                    💡 {aiInsights.deadline.recommendations[0]}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    {aiInsights.summary && (
                        <div>
                            <strong style={{ fontSize: '12px', color: '#6b7280' }}>Summary:</strong>
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                {aiInsights.summary.summary}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Task Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <select
                    value={task.status}
                    onChange={(e) => onUpdate({ ...task, status: e.target.value })}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}
                >
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <button
                    onClick={() => onDelete(task.id)}
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default AITaskCard

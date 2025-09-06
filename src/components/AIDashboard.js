import React, { useState, useEffect } from 'react'
import { getAIInsights, checkAIHealth, getDeadlineRisk, suggestPriority } from '../api'

const AIDashboard = ({ projects }) => {
    const [aiHealth, setAiHealth] = useState(null)
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(false)
    const [aiRecommendations, setAiRecommendations] = useState([])
    const [riskAlerts, setRiskAlerts] = useState([])
    const [productivityInsights, setProductivityInsights] = useState(null)
    const [teamInsights, setTeamInsights] = useState(null)

    useEffect(() => {
        checkAIStatus()
        generateProjectInsights()
        generateAdvancedAIInsights()
    }, [projects])

    const checkAIStatus = async () => {
        try {
            const health = await checkAIHealth()
            setAiHealth(health)
        } catch (error) {
            console.error('AI health check failed:', error)
            setAiHealth({ status: 'error', offline_ai: 'disabled' })
        }
    }

    const generateProjectInsights = async () => {
        setLoading(true)
        try {
            // Collect all tasks from all projects
            const allTasks = projects.flatMap(project =>
                project.tasks.map(task => ({
                    ...task,
                    projectName: project.name
                }))
            )

            // Analyze tasks for insights
            const taskInsights = await Promise.all(
                allTasks.map(async (task) => {
                    try {
                        const insight = await getAIInsights(
                            task.title,
                            task.description || '',
                            task.due,
                            task.complexity || 'medium'
                        )
                        return { task, insight }
                    } catch (error) {
                        console.error(`Failed to get insights for task ${task.title}:`, error)
                        return { task, insight: null }
                    }
                })
            )

            // Generate summary insights
            const summary = generateSummaryInsights(taskInsights)
            setInsights({ taskInsights, summary })
        } catch (error) {
            console.error('Failed to generate insights:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateAdvancedAIInsights = async () => {
        try {
            const allTasks = projects.flatMap(project =>
                project.tasks.map(task => ({
                    ...task,
                    projectName: project.name,
                    projectId: project.id
                }))
            )

            // Generate AI-powered recommendations
            const recommendations = await generateAIRecommendations(allTasks)
            setAiRecommendations(recommendations)

            // Generate risk alerts
            const alerts = await generateRiskAlerts(allTasks)
            setRiskAlerts(alerts)

            // Generate productivity insights
            const productivity = generateProductivityInsights(allTasks)
            setProductivityInsights(productivity)

            // Generate team insights
            const team = generateTeamInsights(projects)
            setTeamInsights(team)

        } catch (error) {
            console.error('Failed to generate advanced AI insights:', error)
        }
    }

    const generateAIRecommendations = async (tasks) => {
        const recommendations = []

        // Analyze task patterns
        const highPriorityTasks = tasks.filter(t => t.status !== 'Done').length
        const overdueTasks = tasks.filter(t => {
            if (!t.due) return false
            const dueDate = new Date(t.due)
            const today = new Date()
            return dueDate < today && t.status !== 'Done'
        }).length

        // AI-powered recommendations based on data analysis
        if (overdueTasks > 0) {
            recommendations.push({
                type: 'urgent',
                icon: '🚨',
                title: 'Overdue Tasks Detected',
                description: `${overdueTasks} tasks are overdue. AI suggests immediate attention and stakeholder communication.`,
                action: 'Review overdue tasks and update timelines',
                priority: 'high'
            })
        }

        if (highPriorityTasks > 5) {
            recommendations.push({
                type: 'workload',
                icon: '⚖️',
                title: 'Workload Distribution Alert',
                description: 'High number of active tasks detected. AI recommends task prioritization and resource allocation.',
                action: 'Consider breaking down large tasks or adding team members',
                priority: 'medium'
            })
        }

        // Analyze completion patterns
        const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'Done').length / tasks.length) * 100 : 0

        if (completionRate < 30) {
            recommendations.push({
                type: 'productivity',
                icon: '📈',
                title: 'Productivity Optimization',
                description: 'Low completion rate detected. AI suggests implementing daily standups and task breakdown.',
                action: 'Break down complex tasks into smaller, manageable pieces',
                priority: 'medium'
            })
        }

        // Analyze deadline patterns
        const tasksWithDeadlines = tasks.filter(t => t.due && t.status !== 'Done')
        const upcomingDeadlines = tasksWithDeadlines.filter(t => {
            const dueDate = new Date(t.due)
            const today = new Date()
            const daysLeft = (dueDate - today) / (1000 * 60 * 60 * 24)
            return daysLeft <= 3 && daysLeft >= 0
        }).length

        if (upcomingDeadlines > 0) {
            recommendations.push({
                type: 'deadline',
                icon: '⏰',
                title: 'Upcoming Deadlines',
                description: `${upcomingDeadlines} tasks have deadlines within 3 days. AI recommends focused attention.`,
                action: 'Prioritize tasks with imminent deadlines',
                priority: 'high'
            })
        }

        // Team collaboration insights
        const uniqueAssignees = new Set(tasks.map(t => t.assignee).filter(Boolean))
        if (uniqueAssignees.size > 0) {
            const avgTasksPerPerson = tasks.length / uniqueAssignees.size
            if (avgTasksPerPerson > 3) {
                recommendations.push({
                    type: 'collaboration',
                    icon: '👥',
                    title: 'Team Collaboration Opportunity',
                    description: 'AI detects potential for better task distribution and cross-team collaboration.',
                    action: 'Consider redistributing tasks or adding more team members',
                    priority: 'low'
                })
            }
        }

        // Add some intelligent default recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'success',
                icon: '🎉',
                title: 'Excellent Project Management',
                description: 'AI analysis shows healthy project metrics. Keep up the great work!',
                action: 'Continue current practices and consider expanding the project scope',
                priority: 'low'
            })
        }

        return recommendations
    }

    const generateRiskAlerts = async (tasks) => {
        const alerts = []

        // Analyze each task for risks
        for (const task of tasks) {
            if (task.status === 'Done') continue

            try {
                // Get AI insights for this task
                const insight = await getAIInsights(
                    task.title,
                    task.description || '',
                    task.due,
                    'medium'
                )

                // Check for high-risk scenarios
                if (insight?.deadline?.risk_level === 'overdue') {
                    alerts.push({
                        type: 'overdue',
                        severity: 'critical',
                        task: task,
                        message: `Task "${task.title}" is overdue`,
                        recommendation: insight.deadline?.recommendations?.[0] || 'Immediate action required'
                    })
                } else if (insight?.deadline?.risk_level === 'critical') {
                    alerts.push({
                        type: 'critical',
                        severity: 'high',
                        task: task,
                        message: `Task "${task.title}" has critical deadline risk`,
                        recommendation: insight.deadline?.recommendations?.[0] || 'Urgent attention needed'
                    })
                }

                if (insight?.priority?.priority === 'high') {
                    alerts.push({
                        type: 'priority',
                        severity: 'medium',
                        task: task,
                        message: `High priority task "${task.title}" needs attention`,
                        recommendation: 'Focus resources on this high-impact task'
                    })
                }
            } catch (error) {
                console.error(`Failed to analyze task ${task.title}:`, error)
            }
        }

        return alerts
    }

    const generateProductivityInsights = (tasks) => {
        const completedTasks = tasks.filter(t => t.status === 'Done')
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress')
        const todoTasks = tasks.filter(t => t.status === 'To-Do')

        // Calculate productivity metrics
        const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0
        const progressRate = tasks.length > 0 ? ((completedTasks.length + inProgressTasks.length) / tasks.length) * 100 : 0

        // Analyze task complexity (based on description length and keywords)
        const complexTasks = tasks.filter(t => {
            const desc = t.description || ''
            return desc.length > 100 ||
                desc.toLowerCase().includes('complex') ||
                desc.toLowerCase().includes('difficult') ||
                desc.toLowerCase().includes('challenging')
        })

        return {
            completionRate: completionRate.toFixed(1),
            progressRate: progressRate.toFixed(1),
            complexTasks: complexTasks.length,
            avgTaskComplexity: tasks.length > 0 ? (complexTasks.length / tasks.length * 100).toFixed(1) : 0,
            productivityScore: Math.min(100, (completionRate + progressRate) / 2).toFixed(1)
        }
    }

    const generateTeamInsights = (projects) => {
        const allMembers = new Set()
        const memberTaskCounts = {}
        const projectCounts = {}

        projects.forEach(project => {
            project.members.forEach(member => {
                allMembers.add(member)
                memberTaskCounts[member] = (memberTaskCounts[member] || 0) +
                    project.tasks.filter(t => t.assignee === member).length
            })
            projectCounts[project.name] = project.tasks.length
        })

        const totalMembers = allMembers.size
        const avgTasksPerMember = totalMembers > 0 ?
            Object.values(memberTaskCounts).reduce((a, b) => a + b, 0) / totalMembers : 0

        return {
            totalMembers,
            avgTasksPerMember: avgTasksPerMember.toFixed(1),
            mostActiveMember: Object.keys(memberTaskCounts).reduce((a, b) =>
                memberTaskCounts[a] > memberTaskCounts[b] ? a : b, 'None'),
            projectDistribution: projectCounts
        }
    }

    const generateSummaryInsights = (taskInsights) => {
        const totalTasks = taskInsights.length
        const completedTasks = taskInsights.filter(t => t.task.status === 'Done').length
        const inProgressTasks = taskInsights.filter(t => t.task.status === 'In Progress').length
        const todoTasks = taskInsights.filter(t => t.task.status === 'To-Do').length

        // Priority distribution
        const priorityCounts = { high: 0, medium: 0, low: 0 }
        taskInsights.forEach(({ insight }) => {
            if (insight?.priority?.priority) {
                priorityCounts[insight.priority.priority]++
            }
        })

        // Risk distribution
        const riskCounts = { overdue: 0, critical: 0, high: 0, medium: 0, low: 0 }
        taskInsights.forEach(({ insight }) => {
            if (insight?.deadline?.risk_level) {
                riskCounts[insight.deadline.risk_level]++
            }
        })

        // Find high-risk tasks
        const highRiskTasks = taskInsights.filter(({ insight }) =>
            insight?.deadline?.risk_level === 'overdue' ||
            insight?.deadline?.risk_level === 'critical'
        )

        // Find high-priority tasks
        const highPriorityTasks = taskInsights.filter(({ insight }) =>
            insight?.priority?.priority === 'high'
        )

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
            priorityCounts,
            riskCounts,
            highRiskTasks: highRiskTasks.length,
            highPriorityTasks: highPriorityTasks.length,
            urgentTasks: highRiskTasks.length + highPriorityTasks.length
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

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#ef4444'
            case 'medium': return '#f59e0b'
            case 'low': return '#10b981'
            default: return '#6b7280'
        }
    }

    if (loading) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                margin: '20px'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>🤖</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Generating Advanced AI Insights...</div>
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
                    Analyzing tasks, predicting risks, and optimizing productivity
                </div>
            </div>
        )
    }

    return (
        <div style={{
            padding: '0',
            background: '#0f172a',
            minHeight: '100vh',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Professional Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                borderBottom: '1px solid #334155',
                padding: '32px 40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(50%, -50%)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, 50%)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <h1 style={{
                                margin: '0 0 8px 0',
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#f8fafc',
                                letterSpacing: '-0.025em'
                            }}>
                                AI Intelligence Hub
                            </h1>
                            <p style={{
                                margin: 0,
                                fontSize: '16px',
                                color: '#94a3b8',
                                fontWeight: '400'
                            }}>
                                Enterprise-grade project analytics and predictive insights
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: aiHealth?.offline_ai === 'enabled' ? '#10b981' : '#ef4444',
                                animation: aiHealth?.offline_ai === 'enabled' ? 'pulse 2s infinite' : 'none'
                            }}></div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#f8fafc'
                            }}>
                                {aiHealth?.offline_ai === 'enabled' ? 'AI ACTIVE' : 'AI OFFLINE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div style={{ padding: '40px' }}>
                {/* System Status Bar */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    border: '1px solid #475569',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        transform: 'translate(30%, -30%)'
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{
                                    margin: '0 0 4px 0',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#f8fafc'
                                }}>
                                    System Status
                                </h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    color: '#94a3b8'
                                }}>
                                    AI engine performance and connectivity
                                </p>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: aiHealth?.offline_ai === 'enabled'
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: `1px solid ${aiHealth?.offline_ai === 'enabled' ? '#10b981' : '#ef4444'}`
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: aiHealth?.offline_ai === 'enabled' ? '#10b981' : '#ef4444'
                                }}></div>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: aiHealth?.offline_ai === 'enabled' ? '#10b981' : '#ef4444'
                                }}>
                                    {aiHealth?.offline_ai === 'enabled' ? 'OPERATIONAL' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px'
                        }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>AI Engine</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                                    {aiHealth?.offline_ai === 'enabled' ? 'Online' : 'Offline'}
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Processing Mode</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                                    {aiHealth?.offline_ai === 'enabled' ? 'Local' : 'Remote'}
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Response Time</div>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                                    {aiHealth?.offline_ai === 'enabled' ? '< 50ms' : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Critical Alerts Section */}
                {riskAlerts.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        border: '1px solid #ef4444',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '32px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '2px',
                            background: 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #ef4444 100%)'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    <span style={{ fontSize: '20px' }}>⚠️</span>
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#f8fafc'
                                    }}>
                                        Critical Risk Alerts
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        color: '#94a3b8'
                                    }}>
                                        Immediate attention required for {riskAlerts.length} issue{riskAlerts.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {riskAlerts.map((alert, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: '600',
                                                color: '#f8fafc',
                                                fontSize: '14px',
                                                marginBottom: '4px'
                                            }}>
                                                {alert.message}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#94a3b8',
                                                lineHeight: '1.4'
                                            }}>
                                                {alert.recommendation}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: alert.severity === 'critical'
                                                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                                                : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px',
                                            textTransform: 'uppercase',
                                            marginLeft: '16px'
                                        }}>
                                            {alert.severity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Executive Metrics Dashboard */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Project Performance Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        border: '1px solid #475569',
                        borderRadius: '16px',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '80px',
                            height: '80px',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                            transform: 'translate(30%, -30%)'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}>
                                    <span style={{ fontSize: '20px' }}>📊</span>
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#f8fafc'
                                    }}>
                                        Project Performance
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        color: '#94a3b8'
                                    }}>
                                        Real-time project metrics
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
                                        {insights?.summary.totalTasks || 0}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Total Tasks
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                                        {insights?.summary.completionRate || 0}%
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Completion
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
                                        {insights?.summary.inProgressTasks || 0}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        In Progress
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                                        {insights?.summary.urgentTasks || 0}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Urgent
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Productivity Analytics Card */}
                    {productivityInsights && (
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            border: '1px solid #475569',
                            borderRadius: '16px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '80px',
                                height: '80px',
                                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)'
                            }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        <span style={{ fontSize: '20px' }}>📈</span>
                                    </div>
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#f8fafc'
                                        }}>
                                            Productivity Analytics
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '12px',
                                            color: '#94a3b8'
                                        }}>
                                            Performance insights
                                        </p>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{
                                        fontSize: '48px',
                                        fontWeight: '700',
                                        color: '#10b981',
                                        marginBottom: '8px',
                                        textShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                                    }}>
                                        {productivityInsights.productivityScore}%
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Overall Performance Score
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '500' }}>
                                            Progress Rate
                                        </div>
                                        <div style={{ fontSize: '20px', color: '#10b981', fontWeight: '600' }}>
                                            {productivityInsights.progressRate}%
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '500' }}>
                                            Complex Tasks
                                        </div>
                                        <div style={{ fontSize: '20px', color: '#f59e0b', fontWeight: '600' }}>
                                            {productivityInsights.complexTasks}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Performance Card */}
                    {teamInsights && (
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            border: '1px solid #475569',
                            borderRadius: '16px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '80px',
                                height: '80px',
                                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)'
                            }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(245, 158, 11, 0.2)'
                                    }}>
                                        <span style={{ fontSize: '20px' }}>👥</span>
                                    </div>
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#f8fafc'
                                        }}>
                                            Team Performance
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '12px',
                                            color: '#94a3b8'
                                        }}>
                                            Team analytics & distribution
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Team Members</span>
                                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>
                                                {teamInsights.totalMembers}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Avg Tasks/Member</span>
                                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#f59e0b' }}>
                                                {teamInsights.avgTasksPerMember}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', color: '#94a3b8' }}>Most Active</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                                                {teamInsights.mostActiveMember.split('@')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Executive AI Recommendations */}
                {aiRecommendations.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        border: '1px solid #475569',
                        borderRadius: '16px',
                        padding: '32px',
                        marginBottom: '32px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '120px',
                            height: '120px',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                            transform: 'translate(40%, -40%)'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}>
                                    <span style={{ fontSize: '24px' }}>🧠</span>
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: '#f8fafc'
                                    }}>
                                        AI Strategic Recommendations
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        color: '#94a3b8'
                                    }}>
                                        Data-driven insights for optimal project execution
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                {aiRecommendations.map((rec, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: rec.priority === 'high'
                                                    ? 'rgba(239, 68, 68, 0.1)'
                                                    : rec.priority === 'medium'
                                                        ? 'rgba(245, 158, 11, 0.1)'
                                                        : 'rgba(59, 130, 246, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${rec.priority === 'high'
                                                    ? 'rgba(239, 68, 68, 0.2)'
                                                    : rec.priority === 'medium'
                                                        ? 'rgba(245, 158, 11, 0.2)'
                                                        : 'rgba(59, 130, 246, 0.2)'}`,
                                                flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '20px' }}>{rec.icon}</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                    <h4 style={{
                                                        margin: 0,
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#f8fafc'
                                                    }}>
                                                        {rec.title}
                                                    </h4>
                                                    <div style={{
                                                        background: rec.priority === 'high'
                                                            ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                                                            : rec.priority === 'medium'
                                                                ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                                                                : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        letterSpacing: '0.5px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {rec.priority}
                                                    </div>
                                                </div>
                                                <p style={{
                                                    margin: '0 0 12px 0',
                                                    fontSize: '14px',
                                                    color: '#94a3b8',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {rec.description}
                                                </p>
                                                <div style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <span style={{ fontSize: '16px' }}>💡</span>
                                                    <span style={{
                                                        fontSize: '13px',
                                                        color: '#f8fafc',
                                                        fontWeight: '500'
                                                    }}>
                                                        {rec.action}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Executive Summary */}
                {insights?.summary.highRiskTasks === 0 && insights?.summary.urgentTasks === 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        border: '1px solid #10b981',
                        borderRadius: '16px',
                        padding: '32px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '2px',
                            background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '150px',
                            height: '150px',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                            transform: 'translate(50%, -50%)'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                fontSize: '64px',
                                marginBottom: '20px',
                                filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))'
                            }}>
                                🎉
                            </div>
                            <h3 style={{
                                margin: '0 0 12px 0',
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#f8fafc'
                            }}>
                                Exceptional Project Performance
                            </h3>
                            <p style={{
                                margin: 0,
                                fontSize: '16px',
                                color: '#94a3b8',
                                maxWidth: '600px',
                                margin: '0 auto',
                                lineHeight: '1.6'
                            }}>
                                AI analysis confirms optimal project health with zero critical risks or urgent issues.
                                Your team demonstrates exceptional execution and strategic planning capabilities.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIDashboard

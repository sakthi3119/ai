import React, { useState } from 'react'
import AITaskCard from './AITaskCard'

const ProjectDetail = ({ projectId, projects, updateProject }) => {
    const project = projects.find(p => p.id === projectId)

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignee: '',
        due: '',
        status: 'To-Do'
    })
    const [showAddTask, setShowAddTask] = useState(false)

    if (!project) {
        return (
            <div className="card" style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                textAlign: 'center',
                color: '#6b7280'
            }}>
                Project not found
            </div>
        )
    }

    const addTask = () => {
        if (!newTask.title.trim()) return

        const task = {
            id: Math.max(0, ...project.tasks.map(t => t.id)) + 1,
            ...newTask,
            due: newTask.due || null
        }

        const updatedProject = {
            ...project,
            tasks: [...project.tasks, task]
        }

        updateProject(updatedProject)
        setNewTask({ title: '', description: '', assignee: '', due: '', status: 'To-Do' })
        setShowAddTask(false)
    }

    const updateTask = (updatedTask) => {
        const updatedProject = {
            ...project,
            tasks: project.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        }
        updateProject(updatedProject)
    }

    const deleteTask = (taskId) => {
        const updatedProject = {
            ...project,
            tasks: project.tasks.filter(t => t.id !== taskId)
        }
        updateProject(updatedProject)
    }

    const addMember = () => {
        const email = prompt('Enter member email:')
        if (email && !project.members.includes(email)) {
            const updatedProject = {
                ...project,
                members: [...project.members, email]
            }
            updateProject(updatedProject)
        }
    }

    return (
        <div className="project-detail" style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#ffffff'
        }}>
            {/* Project Header */}
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#374151' }}>
                    {project.name}
                </h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                    <span>👥 {project.members.length} members</span>
                    <span>📝 {project.tasks.length} tasks</span>
                    <span>✅ {project.tasks.filter(t => t.status === 'Done').length} completed</span>
                </div>
            </div>

            {/* Members Section */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
                    Team Members
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {project.members.map((member, index) => (
                        <span
                            key={index}
                            style={{
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}
                        >
                            {member}
                        </span>
                    ))}
                </div>
                <button
                    onClick={addMember}
                    style={{
                        background: 'none',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#6b7280'
                    }}
                >
                    + Add Member
                </button>
            </div>

            {/* Tasks Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#374151' }}>
                        Tasks
                    </h3>
                    <button
                        onClick={() => setShowAddTask(!showAddTask)}
                        style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        + Add Task
                    </button>
                </div>

                {/* Add Task Form */}
                {showAddTask && (
                    <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '16px',
                        marginBottom: '16px',
                        backgroundColor: '#f9fafb'
                    }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151' }}>
                            Add New Task
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                style={{
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                            <textarea
                                placeholder="Task description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                style={{
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    minHeight: '60px',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Assignee email"
                                    value={newTask.assignee}
                                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        flex: 1
                                    }}
                                />
                                <input
                                    type="date"
                                    value={newTask.due}
                                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowAddTask(false)}
                                    style={{
                                        background: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addTask}
                                    style={{
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                {project.tasks.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        padding: '20px',
                        fontStyle: 'italic'
                    }}>
                        No tasks yet. Add your first task!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {project.tasks.map(task => (
                            <AITaskCard
                                key={task.id}
                                task={task}
                                onUpdate={updateTask}
                                onDelete={deleteTask}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProjectDetail

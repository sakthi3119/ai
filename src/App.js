import React, { useState } from 'react'
import ProjectList from './components/ProjectList'
import ProjectDetail from './components/ProjectDetail'
import AIDashboard from './components/AIDashboard'
import AITaskCard from './components/AITaskCard'


function App() {
    // simple in-memory projects for prototype
    const [projects, setProjects] = useState([
        {
            id: 1, name: 'Website Redesign', members: ['alice@example.com', 'bob@example.com'], tasks: [
                { id: 1, title: 'Create hero image', description: 'Design a hero banner', assignee: 'alice@example.com', due: '2025-09-15', status: 'To-Do' },
                { id: 2, title: 'Fix nav bug', description: 'Resolve sticky nav overlap', assignee: 'bob@example.com', due: '2025-09-09', status: 'In Progress' }
            ]
        },
    ])


    const [activeProjectId, setActiveProjectId] = useState(null)
    const [currentView, setCurrentView] = useState('projects') // 'projects' or 'ai-dashboard'


    function addProject(name) {
        const id = Math.max(0, ...projects.map(p => p.id)) + 1
        setProjects([...projects, { id, name, members: [], tasks: [] }])
    }


    function updateProject(updated) {
        setProjects(projects.map(p => p.id === updated.id ? updated : p))
    }


    return (
        <div className="app">
            <div className="header">
                <h2>SynergySphere — AI-Powered MVP</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => addProject('New Project')}
                        style={{ marginRight: '8px' }}
                    >
                        + New Project
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentView(currentView === 'projects' ? 'ai-dashboard' : 'projects')}
                        style={{
                            backgroundColor: currentView === 'ai-dashboard' ? '#3b82f6' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {currentView === 'projects' ? '🤖 AI Dashboard' : '📋 Projects'}
                    </button>
                </div>
            </div>

            {currentView === 'projects' ? (
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    <div style={{ flex: 1 }}>
                        <ProjectList projects={projects} openProject={setActiveProjectId} />
                    </div>
                    <div style={{ flex: 1 }}>
                        {activeProjectId ? (
                            <ProjectDetail projectId={activeProjectId} projects={projects} updateProject={updateProject} />
                        ) : (
                            <div className="card">Select a project to view details</div>
                        )}
                    </div>
                </div>
            ) : (
                <AIDashboard projects={projects} />
            )}
        </div>
    )
}

export default App 
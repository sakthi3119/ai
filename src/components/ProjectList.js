import React from 'react'

const ProjectList = ({ projects, openProject }) => {
    return (
        <div className="project-list" style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#ffffff'
        }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#374151' }}>
                📋 Projects
            </h3>

            {projects.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    padding: '20px',
                    fontStyle: 'italic'
                }}>
                    No projects yet. Create your first project!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => openProject(project.id)}
                            style={{
                                padding: '12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: '#f9fafb',
                                transition: 'all 0.2s ease',
                                ':hover': {
                                    backgroundColor: '#f3f4f6'
                                }
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f9fafb'
                            }}
                        >
                            <div style={{
                                fontWeight: '500',
                                fontSize: '16px',
                                color: '#374151',
                                marginBottom: '4px'
                            }}>
                                {project.name}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                display: 'flex',
                                gap: '16px'
                            }}>
                                <span>👥 {project.members.length} members</span>
                                <span>📝 {project.tasks.length} tasks</span>
                                <span>✅ {project.tasks.filter(t => t.status === 'Done').length} completed</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectList

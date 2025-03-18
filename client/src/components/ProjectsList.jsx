import React, { useState, useEffect } from 'react';

function ProjectsList({ searchQuery, onSelect, selectedProject, refreshTrigger }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.artist && project.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.genre && project.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.year && project.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {filteredProjects.length > 0 ? (
        filteredProjects.map(project => (
          <div 
            key={project.id} 
            className="project-item" 
            onClick={() => onSelect(project)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: selectedProject && selectedProject.id === project.id ? 'rgba(255,255,255,0.3)' : 'transparent'
            }}
          >
            <img 
              src={project.project_pic ? `http://127.0.0.1:5555${project.project_pic}` : '/assets/default-project.png'} 
              alt={project.project_name} 
              style={{ 
                width: '60px',       // Doubled from 30px
                height: '60px',      // Doubled from 30px
                objectFit: 'cover', 
                marginRight: '10px' 
              }}
            />
            <div style={{ flex: 1 }}>
              <p><strong>{project.project_name}</strong></p>
              <p>Artist: {project.artist}</p>
              <p>Genre: {project.genre}</p>
              <p>Year: {project.year}</p>
              <p>Description: {project.description}</p>
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <p>No Matches</p>
        </div>
      )}
    </div>
  );
}

export default ProjectsList;
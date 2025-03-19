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
    <>
      <span className="projects-count">: {filteredProjects.length}</span>
      <div className="projects-container">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div 
              key={project.id} 
              className={`project-item ${selectedProject && selectedProject.id === project.id ? 'selected' : ''}`}
              onClick={() => onSelect(project)}
            >
              <img 
                src={project.project_pic ? `http://127.0.0.1:5555${project.project_pic}` : '/assets/default-project.png'} 
                alt={project.project_name} 
                className="project-image"
              />
              <div className="project-info">
                <p className="project-name"><strong>{project.project_name}</strong></p>
                <p className="project-detail">Artist: {project.artist}</p>
                <p className="project-detail">Genre: {project.genre}</p>
                <p className="project-detail">Year: {project.year}</p>
                <p className="project-detail">Description: {project.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-matches">
            <p>No Matches</p>
          </div>
        )}
      </div>
    </>
  );
}

export default ProjectsList;
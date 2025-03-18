import React, { useState, useEffect } from 'react';

function ProjectModal({ project, onClose, onSave, user }) {  // Added user prop
  // If project exists, we're editing; otherwise, adding a new project.
  const [formData, setFormData] = useState({
    project_name: project ? project.project_name : '',
    artist: project ? project.artist : '',
    genre: project ? project.genre : '',
    year: project ? project.year : '',
    description: project ? project.description : '',
    project_pic: null
  });

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name,
        artist: project.artist,
        genre: project.genre,
        year: project.year,
        description: project.description,
        project_pic: null
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'project_pic' && files.length > 0) {
      setFormData(prev => ({ ...prev, project_pic: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload;
      let response;
      if (formData.project_pic) {
        const formPayload = new FormData();
        formPayload.append('project_name', formData.project_name);
        formPayload.append('artist', formData.artist);
        formPayload.append('genre', formData.genre);
        formPayload.append('year', formData.year);
        formPayload.append('description', formData.description);
        formPayload.append('project_pic', formData.project_pic);
        if (!project) { // If adding a new project, include user_id
          formPayload.append('user_id', user.id);
        }
        payload = formPayload;
      } else {
        if (!project) { // Add mode: include user_id
          payload = JSON.stringify({ ...formData, user_id: user.id });
        } else {
          payload = JSON.stringify(formData);
        }
      }
      
      if (project) {
        // Edit mode: PATCH request
        response = await fetch(`/projects/${project.id}`, {
          method: 'PATCH',
          headers: formData.project_pic ? {} : { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: payload
        });
      } else {
        // Add mode: POST request
        response = await fetch('/projects', {
          method: 'POST',
          headers: formData.project_pic ? {} : { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: payload
        });
      }
      if (!response.ok) {
        throw new Error('Failed to save project');
      }
      const savedProject = await response.json();
      onSave(savedProject);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="project-modal" style={{ fontFamily: 'Inter, sans-serif' }}>
        <h2 style={{ textAlign: 'center', marginTop: '-0.5em', marginBottom: '1em' }}>
          {project ? 'Edit Project' : 'Add Project'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name:</label>
            <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Artist:</label>
            <input type="text" name="artist" value={formData.artist} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Genre:</label>
            <input type="text" name="genre" value={formData.genre} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Year:</label>
            <input type="text" name="year" value={formData.year} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Project Picture:</label>
            <input type="file" name="project_pic" onChange={handleChange} accept="image/*" />
            {(formData.project_pic || (project && project.project_pic)) && (
              <div style={{ marginTop: '1em', textAlign: 'center' }}>
                <img 
                  src={
                    formData.project_pic instanceof File 
                      ? URL.createObjectURL(formData.project_pic)
                      : `http://127.0.0.1:5555${project.project_pic}`
                  }
                  alt="Project Preview" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover', border: '1px solid #ccc', marginTop: '0.5em' }}
                />
              </div>
            )}
          </div>
          <div className="button-group" style={{ display: 'flex', justifyContent: 'center', marginTop: '1em', gap: '1em' }}>
            <button type="button" onClick={onClose} className="cancel-button" style={{ fontSize: '1.30em', padding: '0.30em 2em' }}>Cancel</button>
            <button type="submit" className="save-button" style={{ fontSize: '1.30em', padding: '0.30em 2em' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectModal;
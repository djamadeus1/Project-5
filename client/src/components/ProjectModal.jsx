import React, { useState, useEffect, useRef } from 'react';

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
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState([]);
  const mediaFileInputRef = useRef(null);
  const [projectTracks, setProjectTracks] = useState([]);

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

  useEffect(() => {
    if (project) {
      fetch(`/project_media?project_id=${project.id}`, { credentials: 'include' })
        .then(response => response.ok ? response.json() : [])
        .then(data => {
          const tracks = data.map(assoc => assoc.media_file);
          setProjectTracks(tracks);
        })
        .catch(error => console.error('Error fetching project tracks:', error));
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
      // Change URL and method based on whether we're editing or creating
      const url = project ? `/projects/${project.id}` : '/projects';
      const method = project ? 'PATCH' : 'POST';

      const metadataResponse = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,  // Add user_id to the payload
          project_name: formData.project_name,
          artist: formData.artist,
          genre: formData.genre,
          year: formData.year,
          description: formData.description
        })
      });

      if (!metadataResponse.ok) {
        const error = await metadataResponse.json();
        throw new Error(error.error || 'Failed to save project');
      }

      let savedProject = await metadataResponse.json();

      // Then if there's a picture, send it separately
      if (formData.project_pic) {
        const picFormData = new FormData();
        picFormData.append('project_pic', formData.project_pic);

        const picResponse = await fetch(`/update_project_pic/${savedProject.id}`, {
          method: 'PATCH',
          credentials: 'include',
          body: picFormData
        });

        if (!picResponse.ok) {
          const error = await picResponse.json();
          throw new Error(error.error || 'Failed to upload picture');
        }
        savedProject = await picResponse.json();
      }
      
      // If there are selected media IDs, associate them with the project
      if (selectedMediaIds.length > 0) {
        for (const mediaId of selectedMediaIds) {
          await fetch('/project_media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              project_id: savedProject.id,
              media_file_id: mediaId
            })
          });
        }
      }

      // Add this after processing project picture and before onSave
      if (selectedMediaFiles.length > 0) {
        for (const file of selectedMediaFiles) {
          const mediaFormData = new FormData();
          mediaFormData.append('media', file);
          const mediaResponse = await fetch('/upload_media', {
            method: 'POST',
            body: mediaFormData,
            credentials: 'include'
          });
          if (mediaResponse.ok) {
            const newMedia = await mediaResponse.json();
            await fetch('/project_media', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                project_id: savedProject.id,
                media_file_id: newMedia.id
              })
            });
          }
        }
      }

      onSave(savedProject);
      onClose();
    } catch (error) {
      console.error('Error details:', error);
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <h2 className="modal-title">
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
              <div className="preview-container">
                <img 
                  src={
                    formData.project_pic instanceof File 
                      ? URL.createObjectURL(formData.project_pic)
                      : `http://127.0.0.1:5555${project.project_pic}`
                  }
                  alt="Project Preview" 
                  className="preview-image"
                />
              </div>
            )}
          </div>
          <div className="form-group media-files-button-group">
            <button
              type="button"
              className="add-media-btn"
              onClick={() => mediaFileInputRef.current.click()}
            >
              Add Media Files
            </button>
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              ref={mediaFileInputRef}
              onChange={(e) => {
                const filesArray = Array.from(e.target.files);
                setSelectedMediaFiles(filesArray);
              }}
            />
            {selectedMediaFiles.length > 0 && (
              <div className="selected-media-list">
                <p>Selected Files:</p>
                <ul>
                  {selectedMediaFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="save-button">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectModal;
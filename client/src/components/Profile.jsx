import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import EditMediaForm from "./EditMediaForm";
import '../styles/shared.css';
import '../styles/Profile.css';
import ProjectsList from './ProjectsList';
import ProjectModal from './ProjectModal';
// import stopIcon from '../assets/gold-stop.svg';

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentContacts, setCurrentContacts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const profilePicInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const contactPicInputRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const skipHoldThreshold = 300; // milliseconds
  const skipForwardTimeoutRef = useRef(null);
  const skipForwardIntervalRef = useRef(null);
  const skipForwardScrubTriggeredRef = useRef(false);
  const skipBackwardTimeoutRef = useRef(null);
  const skipBackwardIntervalRef = useRef(null);
  const skipBackwardScrubTriggeredRef = useRef(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectsRefreshTrigger, setProjectsRefreshTrigger] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // Protect the route based on user session/business mode
  useEffect(() => {
    if (!localStorage.getItem('businessMode')) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch media files from the backend
  useEffect(() => {
    const fetchMediaFiles = async () => {
      try {
        const response = await fetch("/media_files", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setMediaFiles(data);
        }
      } catch (error) {
        console.error("Error fetching media files:", error);
      }
    };
    fetchMediaFiles();
  }, []);

  // New useEffect to re-fetch media details (including contacts) when currentMedia changes
  useEffect(() => {
    if (currentMedia) {
      const fetchMediaDetails = async () => {
        try {
          const response = await fetch(`/media_files/${currentMedia.id}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentContacts(data.contacts || []);
          } else {
            console.error("Failed to fetch media details");
          }
        } catch (error) {
          console.error("Error fetching media details:", error);
        }
      };
      fetchMediaDetails();
    }
  }, [currentMedia]);

  useEffect(() => {
    const savedMediaId = localStorage.getItem("currentMediaId");
    if (savedMediaId) {
      const fetchSavedMedia = async () => {
        try {
          const response = await fetch(`/media_files/${savedMediaId}`, { credentials: "include" });
          if (response.ok) {
            const mediaData = await response.json();
            setCurrentMedia(mediaData);
            setCurrentContacts(mediaData.contacts || []);
          } else {
            console.error("Failed to fetch saved media");
          }
        } catch (error) {
          console.error("Error fetching saved media:", error);
        }
      };
      fetchSavedMedia();
    }
  }, []);

  // Function to handle deletion of a project:
  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to Delete Project ${project.project_name}?`)) {
      try {
        const response = await fetch(`/projects/${project.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to delete project');
        }
        // Trigger refresh
        setProjectsRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(error.message);
      }
    }
  };

  // Utility: Construct an image URL from a given path
  const getImageUrl = (path) => {
    if (!path) return "/assets/default-banner.png";
    return `http://127.0.0.1:5555${path}`;
  };

  // Update profile picture
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profile_pic', file);
    try {
      const response = await fetch('/update_profile_pic', {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  // Update banner image
  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('banner', file);
    try {
      const response = await fetch('/update_banner', {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle adding a new media file
  const handleAddMedia = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('media', file);
    try {
      const response = await fetch('/upload_media', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        const newMedia = await response.json();
        setMediaFiles([...mediaFiles, newMedia]);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  // When a media file is selected, update current media and fetch its contacts
  const handleMediaSelect = async (media) => {
    setCurrentMedia(media);
    localStorage.setItem("currentMediaId", media.id);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
    try {
      const response = await fetch(`/media_files/${media.id}`, { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCurrentContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching media details:", error);
    }
  };

  // Audio controls
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };
  
  const handlePause = () => {
    if (audioRef.current) {
      // If the track is playing, pause it.
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPaused(true);
        setIsPlaying(false);
      } else {
        // If the track is already paused, only resume if it's not stopped (i.e. currentTime > 0)
        if (audioRef.current.currentTime > 0) {
          audioRef.current.play();
          setIsPaused(false);
          setIsPlaying(true);
        }
        // Otherwise, do nothing (track is stopped)
      }
    }
  };
  
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  };
  // Single-click skip-forward (10 seconds)
const handleSkipForwardClick = () => {
  if (!skipForwardScrubTriggeredRef.current && audioRef.current) {
    audioRef.current.currentTime += 10;
  }
};

// Start continuous scrubbing forward
const startScrubForward = () => {
  if (audioRef.current) {
    skipForwardIntervalRef.current = setInterval(() => {
      audioRef.current.currentTime += 0.5; // adjust increment as needed
    }, 100); // adjust interval as needed
  }
};

const handleSkipForwardMouseDown = (e) => {
  // Reset flag
  skipForwardScrubTriggeredRef.current = false;
  // Set a timeout that starts scrubbing after the threshold
  skipForwardTimeoutRef.current = setTimeout(() => {
    skipForwardScrubTriggeredRef.current = true;
    startScrubForward();
  }, skipHoldThreshold);
};

const handleSkipForwardMouseUp = (e) => {
  if (skipForwardTimeoutRef.current) {
    clearTimeout(skipForwardTimeoutRef.current);
    skipForwardTimeoutRef.current = null;
  }
  if (skipForwardIntervalRef.current) {
    clearInterval(skipForwardIntervalRef.current);
    skipForwardIntervalRef.current = null;
  }
};
  
/// Single-click skip-backward (10 seconds)
const handleSkipBackwardClick = () => {
  if (!skipBackwardScrubTriggeredRef.current && audioRef.current) {
    audioRef.current.currentTime -= 10;
    if (audioRef.current.currentTime < 0) {
      audioRef.current.currentTime = 0;
    }
  }
};

// Start continuous scrubbing backward
const startScrubBackward = () => {
  if (audioRef.current) {
    skipBackwardIntervalRef.current = setInterval(() => {
      audioRef.current.currentTime -= 0.5; // adjust increment as needed
      if (audioRef.current.currentTime < 0) {
        audioRef.current.currentTime = 0;
      }
    }, 100);
  }
};

const handleSkipBackwardMouseDown = (e) => {
  skipBackwardScrubTriggeredRef.current = false;
  skipBackwardTimeoutRef.current = setTimeout(() => {
    skipBackwardScrubTriggeredRef.current = true;
    startScrubBackward();
  }, skipHoldThreshold);
};

const handleSkipBackwardMouseUp = (e) => {
  if (skipBackwardTimeoutRef.current) {
    clearTimeout(skipBackwardTimeoutRef.current);
    skipBackwardTimeoutRef.current = null;
  }
  if (skipBackwardIntervalRef.current) {
    clearInterval(skipBackwardIntervalRef.current);
    skipBackwardIntervalRef.current = null;
  }
};

  // Utility: Construct media URL
  const getMediaUrl = (media) => {
    if (!media || !media.file_url) return '';
    return `http://127.0.0.1:5555${media.file_url}`;
  };

  // Delete a media file
  const handleDeleteMedia = async () => {
    if (!currentMedia) return;
    try {
      const response = await fetch(`/media_files/${currentMedia.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setMediaFiles(mediaFiles.filter(media => media.id !== currentMedia.id));
        setCurrentMedia(null);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  // Open edit form for media
  const handleEditMedia = async () => {
    if (!currentMedia) return;
    setShowEditForm(true);
  };

  // Update media info
  const handleUpdateMedia = async (updatedMedia) => {
    try {
      const response = await fetch(`/media_files/${updatedMedia.id}`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setMediaFiles(mediaFiles.map(media => 
          media.id === data.id ? data : media
        ));
        setCurrentMedia(data);
      }
    } catch (error) {
      console.error("Error updating media:", error);
      alert(error.message);
    }
  };

  // Update the contact picture for the first contact associated with the selected media
  const handleContactPicChange = async (e) => {
    if (!currentMedia || !currentContacts || !currentContacts[0]) {
      alert("Please select a media file first");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('contact_pic', file);
    formData.append('contact_id', currentContacts[0].id);
    formData.append('media_id', currentMedia.id);
  
    try {
      const response = await fetch('/update_contact_pic', {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      });
      if (response.ok) {
        const updatedContact = await response.json();
        setCurrentContacts(prev =>
          prev.map(contact =>
            contact.id === updatedContact.id ? updatedContact : contact
          )
        );
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact picture');
      }
    } catch (error) {
      console.error('Error updating contact picture:', error);
      alert(error.message);
    }
  };

  // Update the useEffect for media files
  useEffect(() => {
    if (selectedProject) {
      fetch(`/projects/${selectedProject.id}/media_files`, { credentials: "include" })
        .then(response => response.ok ? response.json() : [])
        .then(data => setMediaFiles(data))
        .catch(error => console.error("Error fetching project media files:", error));
    } else {
      // If no project is selected, fetch all media files
      fetch("/media_files", { credentials: "include" })
        .then(response => response.ok ? response.json() : [])
        .then(data => setMediaFiles(data))
        .catch(error => console.error("Error fetching all media files:", error));
    }
  }, [selectedProject]);

  if (!user) return <p>Loading...</p>;

  const handleButtonClick = (e, callback) => {
    const button = e.currentTarget;
    button.classList.add('pressed');
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 300);
    if (callback) callback(e);
  };

  // const startScrubForward = () => {
  //   if (audioRef.current) {
  //     skipIntervalRef.current = setInterval(() => {
  //       audioRef.current.currentTime += 0.5; // Increase currentTime by 0.5 seconds; adjust as needed
  //     }, 100); // Every 100ms; adjust interval if needed
  //   }
  // };
  
  // const startScrubBackward = () => {
  //   if (audioRef.current) {
  //     skipIntervalRef.current = setInterval(() => {
  //       audioRef.current.currentTime -= 0.5; // Decrease currentTime by 0.5 seconds; adjust as needed
  //       if (audioRef.current.currentTime < 0) {
  //         audioRef.current.currentTime = 0;
  //       }
  //     }, 100);
  //   }
  // };
  
  // const stopScrub = () => {
  //   if (skipIntervalRef.current) {
  //     clearInterval(skipIntervalRef.current);
  //     skipIntervalRef.current = null;
  //   }
  // };

  return (
    <div className="page-wrapper">
      {/* Logo and Banner */}
      <div className="purple-logo-circle" onClick={() => navigate("/business-mode-2")}>
        Exit Profile
      </div>
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={getImageUrl(user.logo)} />
          <button 
            className={`edit-button ${isUploading ? 'uploading' : ''}`} 
            onClick={() => bannerInputRef.current.click()}
          >
            {isUploading ? 'Uploading...' : 'Edit'}
          </button>
          <input type="file" ref={bannerInputRef} onChange={handleBannerChange} style={{ display: 'none' }} accept="image/*" />
        </div>
      </div>

      {/* Projects Section */}
      <div className="project-list-square">
        <div className="projects-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="projects-title" style={{ margin: 0 }}>Projects</h3>
            <button 
              className="all-button" 
              onClick={() => { setSelectedProject(null); setProjectSearch(''); }}
            >
              All
            </button>
          </div>
          <input 
            type="text" 
            placeholder="Search Projects" 
            value={projectSearch} 
            onChange={(e) => setProjectSearch(e.target.value)} 
            style={{ width: '150px', padding: '5px' }}
          />
        </div>
        <ProjectsList 
          searchQuery={projectSearch} 
          onSelect={setSelectedProject}
          selectedProject={selectedProject}
          refreshTrigger={projectsRefreshTrigger}
        />
      </div>

      {/* Conditionally render the ProjectModal */}
      {showProjectModal && (
        <ProjectModal 
          project={editingProject} 
          onClose={() => { setShowProjectModal(false); setEditingProject(null); }} 
          onSave={(savedProject) => {
            setProjectsRefreshTrigger(prev => prev + 1);
          }}
          user={user}
        />
      )}

      {/* Profile Picture */}
      <div className="profile-pic-container">
        <div className="purple-pic-square">
          <img
            src={user.picture_icon || "/assets/default-avatar.png"}
            alt="Profile"
            className="profile-picture"
          />
          <button className="edit-button" onClick={() => profilePicInputRef.current.click()}>
            Edit
          </button>
          <input type="file" ref={profilePicInputRef} onChange={handleProfilePicChange} style={{ display: 'none' }} accept="image/*" />
        </div>
        <div className="username-container">
          <h2 className="home-username">{user.username}</h2>
        </div>
      </div>

      {/* Track Contact Info */}
      <div className="track-contact-info-square">
        <div className="contact-info">
          <h3>Contact Info</h3>
          {currentContacts.length > 0 ? (
            currentContacts.map(contact => (
              <div key={contact.id} className="contact-item">
                <p><strong>{contact.name}</strong></p>
                <p>{contact.email}</p>
                <p>{contact.phone}</p>
                <p>{contact.company}</p>
                <p>{contact.discipline}</p>
                <br />
                {contact.bio && <p><strong>Bio:</strong> {contact.bio}</p>}
              </div>
            ))
          ) : (
            <p>No contacts associated with this track</p>
          )}
        </div>
      </div>

      {/* Contact Picture Section */}
      <div className="contact-pic-square">
        {currentContacts && currentContacts[0] && (
          <>
            {currentContacts[0].contact_pic ? (
              <img 
                src={`http://127.0.0.1:5555${currentContacts[0].contact_pic}?t=${Date.now()}`}
                alt={currentContacts[0].name}
                className="contact-picture"
                onError={(e) => {
                  e.target.src = "/assets/default-contact.png";
                }}
              />
            ) : (
              <div className="default-contact-pic">
                <span>No Contact Image</span>
              </div>
            )}
            <button className="edit-button" onClick={() => contactPicInputRef.current.click()}>
              Edit
            </button>
            <input type="file" ref={contactPicInputRef} onChange={handleContactPicChange} style={{ display: 'none' }} accept="image/*" />
          </>
        )}
      </div>

      {/* Contact Background */}
      <div className="contact-background"></div>

      {/* Media Player */}
      <div className="media-player-square">
        {currentMedia && currentMedia.artwork_url ? (
          <img 
            src={`http://127.0.0.1:5555${currentMedia.artwork_url}?t=${Date.now()}`}
            alt={currentMedia.title}
            className="media-artwork"
          />
        ) : (
          <div className="default-media-artwork">
            <span>MUSIC - ONE</span>
          </div>
        )}
        {currentMedia && (
          <audio ref={audioRef} controls key={currentMedia.id}>
            <source src={getMediaUrl(currentMedia)} type={currentMedia.file_type || 'audio/mpeg'} />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>

      {/* Track List and Upload Controls */}
      <div className="track-list-square">
        <button className="upload-button" onClick={() => mediaInputRef.current.click()}>Add</button>
        <input type="file" ref={mediaInputRef} onChange={handleAddMedia} style={{ display: 'none' }} accept="audio/*" />
        <button className="edit-track-button" onClick={handleEditMedia} disabled={!currentMedia}>Edit</button>
        <button className="delete-button" onClick={handleDeleteMedia} disabled={!currentMedia}>Delete</button>
        {showEditForm && currentMedia && (
          <EditMediaForm 
            media={currentMedia}
            onClose={() => setShowEditForm(false)}
            onUpdate={(updatedMedia) => {
              handleUpdateMedia(updatedMedia);
              setShowEditForm(false);
            }}
          />
        )}
        <MediaList mediaFiles={mediaFiles} onMediaSelect={handleMediaSelect} currentMedia={currentMedia} />
      </div>

      {/* Labels */}
      <div className="tracks-label">Tracks</div>
      <div className="projects-label" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', marginRight: '0px', marginLeft: '-240px' }}>
          <button 
            className="upload-button"  
            style={{
              position: 'relative',
              top: '10px',
              left: '10px',
              zIndex: 1
            }}
            onClick={() => { setShowProjectModal(true); setEditingProject(null); }}
          >
            Add
          </button>
          <button 
            className="edit-track-button"  
            style={{
              position: 'relative',
              top: '10px',
              left: '10px',
              zIndex: 1
            }}
            onClick={() => { 
              if (selectedProject) { 
                setEditingProject(selectedProject); 
                setShowProjectModal(true); 
              } else { 
                alert('Please select a project'); 
              } 
            }}
          >
            Edit
          </button>
          <button 
            className="delete-button" 
            style={{
              position: 'relative',
              top: '10px',
              left: '280px',
              zIndex: 1
            }}
            onClick={() => { 
              if (selectedProject) { 
                handleDeleteProject(selectedProject); 
              } else { 
                alert('Please select a project'); 
              } 
            }}
          >
            Delete
          </button>
        </div>
        <span className="projects-title">Projects</span>
      </div>
      <div className="projects-label">
        <span className="projects-label-text">Projects</span>
      </div>

      {/* Transport Controls */}
      <div
        className="transport-controls"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/assets/chromegold-background.svg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '10px',
          position: 'absolute',
          top: '85vh',
          left: '37%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0px'
        }}
      >
        <button
          onClick={handleSkipBackwardClick}
          onMouseDown={(e) => handleButtonClick(e, handleSkipBackwardMouseDown)}
          onMouseUp={handleSkipBackwardMouseUp}
          onMouseLeave={handleSkipBackwardMouseUp}
          className="skip-backward-button"
        >
          <img src="/assets/rounded-skipback.svg" alt="Skip Backward" />
        </button>
        <button className={`pause-button ${isPaused ? 'lit' : ''}`} onClick={(e) => handleButtonClick(e, handlePause)}>
          <img src="/assets/rounded-pause.svg" alt="Pause" />
        </button>

        <button className={`play-button ${isPlaying ? 'lit' : ''}`} onClick={(e) => handleButtonClick(e, handlePlay)}>
          <img src="/assets/rounded-play.svg" alt="Play" />
        </button>
        <button
          onClick={handleSkipForwardClick}
          onMouseDown={(e) => handleButtonClick(e, handleSkipForwardMouseDown)}
          onMouseUp={handleSkipForwardMouseUp}
          onMouseLeave={handleSkipForwardMouseUp}
          className="skip-forward-button"
        >
          <img src="/assets/rounded-skipforward.svg" alt="Skip Forward" />
        </button>
        <button onClick={(e) => handleButtonClick(e, handleStop)} className="stop-button">
          <img src="/assets/rounded-stop.svg" alt="Stop" />
        </button>
      </div>
    </div>
  );
}

export default Profile;
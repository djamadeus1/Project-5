import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import '../styles/shared.css';
import '../styles/Profile.css';

function Profile({ user, setUser }) {
  console.log("User data:", user);
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    return `http://127.0.0.1:5555${path}`;
  }
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  // const [editMode, setEditMode] = useState(false);
  const audioRef = useRef(null);
  const profilePicInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentContacts, setCurrentContacts] = useState([]);
  // const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('businessMode')) {
      navigate('/');
    }
  }, [navigate]);

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

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
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
      }
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

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

  const handleMediaSelect = async (media) => {
    console.log("Selected media:", media);
    console.log("Audio URL:", getMediaUrl(media));
    setCurrentMedia(media);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
    
  // Fetch contacts for selected media
  try {
    const response = await fetch(`/media_files/${media.id}`, { 
      credentials: "include" 
    });
    if (response.ok) {
      const data = await response.json();
      setCurrentContacts(data.contacts || []);
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
};

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const getMediaUrl = (media) => {
    if (!media || !media.file_url) return '';
    return `http://127.0.0.1:5555${media.file_url}`;
  };

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

  const handleEditMedia = async () => {
    if (!currentMedia) return;
    const newTitle = prompt("Enter new name for track:", currentMedia.title);
    if (!newTitle) return;
  
    try {
      const response = await fetch(`/media_files/${currentMedia.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle })
      });
      
      if (response.ok) {
        const updatedMedia = await response.json();
        setMediaFiles(mediaFiles.map(media => 
          media.id === currentMedia.id ? updatedMedia : media
        ));
        setCurrentMedia(updatedMedia);
      }
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  if (!user) return <p>Loading...</p>;


  return (
    <div className="page-wrapper">
      {/* Add Logo Circle */}
      <div className="purple-logo-circle">
        Profile
      </div>
      
      {/* Banner */}
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={getImageUrl(user.logo)} />
          <button 
            className={`edit-button ${isUploading ? 'uploading' : ''}`} 
            onClick={() => bannerInputRef.current.click()}
          >
            {isUploading ? 'Uploading...' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="profile-pic-container">
        <div className="purple-pic-square">
          <img
            src={getImageUrl(user.picture_icon || user.profile_pic)}
            alt={`${user.username}'s profile`}
            className="profile-picture"
          />
          <button className="edit-button" onClick={() => profilePicInputRef.current.click()}>
            Edit
          </button>
          <input
            type="file"
            ref={profilePicInputRef}
            onChange={handleProfilePicChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>
        <h2 className="home-username">{user.username}</h2>
      </div>

      {/* Contact Picture Section */}
      {/* <div className="contact-pic-square">
        <img 
          src={contact.contact_pic ? `http://127.0.0.1:5555${contact.contact_pic}` : "https://via.placeholder.com/150"}
          alt={contact.name}
          className="contact-picture"
        />
      </div> */}

      {/* Project List Square */}
      <div className="project-list-square">
        <div className="project-list">
          <h3>Projects</h3>
        </div>
      </div>

      {/* Track Contact Info Square */}
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
          <img 
            src={currentContacts[0].contact_pic ? 
              `http://127.0.0.1:5555${currentContacts[0].contact_pic}` : 
              "https://via.placeholder.com/150"
            }
            alt={currentContacts[0].name}
            className="contact-picture"
          />
        )}
      </div>

      {/* Contact Background */}
      <div className="contact-background"></div>

      {/* MP Background */}
      <div className="mp-background">
      </div>

      {/* Media Player */}
      <div className="media-player-square">
        {currentMedia && (
          <audio 
            ref={audioRef} 
            controls
            key={currentMedia.id} // Force reload when media changes
          >
            <source 
              src={getMediaUrl(currentMedia)} 
              type={currentMedia.file_type || 'audio/mpeg'} 
            />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>

      {/* Track List with Upload Button */}
      <div className="track-list-square">
        {/* Upload Controls */}
        <button className="upload-button" onClick={() => mediaInputRef.current.click()}>
          Add
        </button>
        <input
          type="file"
          ref={mediaInputRef}
          onChange={handleAddMedia}
          style={{ display: 'none' }}
          accept="audio/*"
        />
        
        {/* Edit and Delete Controls */}
        <button 
          className="edit-track-button" 
          onClick={handleEditMedia}
          disabled={!currentMedia}
        >
          Edit
        </button>
        <button 
          className="delete-button" 
          onClick={handleDeleteMedia}
          disabled={!currentMedia}
        >
          Delete
        </button>

        {/* Media List */}
        <MediaList
          mediaFiles={mediaFiles}
          onMediaSelect={handleMediaSelect}
          currentMedia={currentMedia}
        />
      </div>

      {/* Labels */}
      <div className="tracks-label">Tracks</div>
      <div className="projects-label">Projects</div>

      {/* Transport Controls */}
      <div className="transport-control-square">
        <div className="transport-buttons">
          <button onClick={handleSkipBackward}>⏪</button>
          <button onClick={handlePlayPause}>⏯️</button>
          <button onClick={handleSkipForward}>⏩</button>
          <button onClick={handleStop}>⏹️</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
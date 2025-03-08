// client/src/components/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import EditMediaForm from "./EditMediaForm";
import '../styles/shared.css';
import '../styles/Profile.css';

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
      console.error("Error fetching contacts:", error);
    }
  };

  // Audio controls
  const handlePlayPause = () => {
    if (audioRef.current) {
      audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
    }
  };
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  const handleSkipForward = () => { if (audioRef.current) audioRef.current.currentTime += 10; };
  const handleSkipBackward = () => { if (audioRef.current) audioRef.current.currentTime -= 10; };

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

  if (!user) return <p>Loading...</p>;

  return (
    <div className="page-wrapper">
      {/* Logo and Banner */}
      <div className="purple-logo-circle">Profile</div>
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
        <h2 className="home-username">{user.username}</h2>
      </div>

      {/* Projects Section */}
      <div className="project-list-square">
        <div className="project-list">
          <h3>Projects</h3>
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
                {/* You can put a default image or icon here */}
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
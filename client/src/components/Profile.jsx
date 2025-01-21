import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import '../styles/shared.css';
import '../styles/Profile.css';

function Profile({ user, setUser }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const audioRef = useRef(null);
  const profilePicInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const navigate = useNavigate();

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

  const handleMediaSelect = (media) => {
    setCurrentMedia(media);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
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

  if (!user) return <p>Loading...</p>;

  return (
    <div className="page-wrapper">
      {/* Banner Container with Edit Button */}
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={user.banner_url} />
          <button className="edit-button" onClick={() => bannerInputRef.current.click()}>
            Edit
          </button>
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>
        
        <div className="purple-logo-circle">
          Profile
        </div>
      </div>

      {/* Profile Section with Edit Button */}
      <div className="profile-pic-container">
        <div className="purple-pic-square">
          <img
            src={user.profilePic || "https://via.placeholder.com/150"}
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
      <div className="contact-pic-square">
        <img 
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt="Contact"
          className="contact-picture"
        />
      </div>

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
        </div>
      </div>

      {/* MP Background */}
      <div className="mp-background">
      </div>

      {/* Media Player */}
      <div className="media-player-square">
        {currentMedia && (
          <audio ref={audioRef} controls>
            <source src={currentMedia.url} type="audio/mpeg" />
          </audio>
        )}
      </div>

      {/* Track List with Upload Button */}
      <div className="track-list-square">
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
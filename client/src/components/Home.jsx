import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import PasswordPopup from "./PasswordPopup";
// import '../styles/index.css';
import '../styles/Home.css';
import '../styles/shared.css';

function Home({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMediaFiles = async () => {
      try {
        const response = await fetch("/media_files", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setMediaFiles(data);
        } else {
          console.error("Failed to fetch media files");
        }
      } catch (error) {
        console.error("Error fetching media files:", error);
      }
    };
    fetchMediaFiles();
  }, [navigate]);

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

  const handlePasswordVerified = async () => {
    try {
      const response = await fetch("http://localhost:5555/check_business_auth", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        setShowPopup(false);
        localStorage.setItem('businessMode', 'true');
        navigate('/business-mode-2');
      } else {
        console.error("Business mode access denied");
      }
    } catch (error) {
      console.error("Error verifying business access:", error);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="page-wrapper">
      {/* Banner Container */}
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={user.banner_url} />
        </div>
        
        {/* Logo Button */}
        <div 
          className="purple-logo-circle"
          onClick={() => setShowPopup(true)}
        >
          LOGO
        </div>
      </div>

      {/* Profile Section */}
      <div className="profile-pic-container">
        <div className="purple-pic-square">
          <img
            src={user.profilePic || "https://via.placeholder.com/150"}
            alt={`${user.username}'s profile`}
            className="profile-picture"
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
        {/* Project list items will go here */}
      </div>
    </div>

    {/* Track Contact Info Square */}
    <div className="track-contact-info-square">
      <div className="contact-info">
        <h3>Contact Info</h3>
        {/* Contact info details will go here */}
      </div>
    </div>

      {/* MP Background */}
    <div className="mp-background">
      {/* Purple background for media player */}
    </div>

      {/* Media Player */}
      <div className="media-player-square">
        {currentMedia && (
          <audio ref={audioRef} controls>
            <source src={currentMedia.url} type="audio/mpeg" />
          </audio>
        )}
      </div>

      {/* Track List */}
      <div className="track-list-square">
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

      {/* Password Popup */}
      {showPopup && (
        <PasswordPopup 
          user={user} 
          onClose={() => setShowPopup(false)}
          onVerified={handlePasswordVerified}
        />
      )}
    </div>
  );
}

export default Home;
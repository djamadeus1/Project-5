import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import '../styles/BusinessMode_2.css';
import '../styles/index.css';

function BusinessMode_2({ user }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Verify business mode access is authorized
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await fetch("http://localhost:5555/check_business_auth", { 
          credentials: "include" 
        });
        if (!response.ok) {
          navigate('/');
        }
      } catch (error) {
        console.error("Authorization check failed:", error);
        navigate('/');
      }
    };
    
    checkAuthorization();
  }, [navigate]);

  // Fetch media files
  useEffect(() => {
    const fetchMediaFiles = async () => {
      try {
        const response = await fetch("/media_files", { 
          credentials: "include" 
        });
        if (response.ok) {
          const data = await response.json();
          setMediaFiles(data);
        } else {
          console.error("Failed to fetch media files");
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching media files:", error);
        navigate('/login');
      }
    };

    fetchMediaFiles();
  }, [navigate]);

  // Media control handlers
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
    <div className="business-mode-2-wrapper">
      {/* Banner Container */}
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={user.banner_url} />
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

      {/* Media Player */}
      <div className="media-player-square">
        {currentMedia && (
          <audio ref={audioRef} controls>
            <source src={currentMedia.url} type="audio/mpeg" />
          </audio>
        )}
      </div>

      {/* Track List */}
      <div className="final-track-list-square">
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

export default BusinessMode_2;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import PasswordPopup from "./PasswordPopup";
import '../styles/BusinessMode.css';

function BusinessMode({ user }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

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
  }, []);

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

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="business-mode-wrapper">
      {/* Banner Container */}
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={user.banner_url} />
        </div>
        <div className="purple-logo-circle" onClick={() => setShowPopup(true)}>
          LOGO
        </div>
      </div>

      {showPopup && <PasswordPopup user={user} onClose={() => setShowPopup(false)} />}

      {/* Profile Section */}
      <div className="profile-pic-container">
        <div className="purple-pic-square">
          <img
            src={user.profilePic || "https://via.placeholder.com/150.png"}
            alt={`${user.username}'s profile`}
            className="user-picture"
            onError={(e) => {
              e.target.src = "https://placehold.co/150";
              e.target.alt = "Default Profile Picture";
            }}
          />
        </div>
        <h2 className="home-username">{user.username}</h2>
      </div>

      {/* Contact Section */}
      <div className="contact-pic-container">
        <div className="contact-pic-square">
          {currentMedia && currentMedia.contacts?.length > 0 ? (
            <img
              src={currentMedia.contacts[0].picture || "https://via.placeholder.com/100"}
              alt={`${currentMedia.contacts[0].name}'s Profile`}
              className="contact-picture"
              width="100"
            />
          ) : (
            <p>No Contact Picture</p>
          )}
        </div>
        <div className="track-contact-info-square">
          {currentMedia && currentMedia.contacts?.length > 0 ? (
            <>
              <p><strong>Name:</strong> {currentMedia.contacts[0].name}</p>
              <p><strong>Email:</strong> {currentMedia.contacts[0].email}</p>
              <p><strong>Phone:</strong> {currentMedia.contacts[0].phone}</p>
              <p><strong>Company:</strong> {currentMedia.contacts[0].company}</p>
              <p><strong>Discipline:</strong> {currentMedia.contacts[0].discipline}</p>
            </>
          ) : (
            <p>No Contact Info Available</p>
          )}
        </div>
      </div>

      {/* Media Player Container */}
      <div className="media-player-container">
        <div className="media-player-square">
          {currentMedia ? (
            <>
              <p>Now Playing: {currentMedia.title}</p>
              {currentMedia.file_type === "audio" ? (
                <audio ref={audioRef} controls>
                  <source src={currentMedia.file_url} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              ) : currentMedia.file_type === "video" ? (
                <video ref={audioRef} controls width="100%">
                  <source src={currentMedia.file_url} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              ) : (
                <p>Unsupported media format</p>
              )}
            </>
          ) : (
            <p>Select a media file to play</p>
          )}
        </div>

        {/* Artwork Square */}
        <div className="artwork-square"></div>

        {/* Project List Square */}
        <div className="project-list-square"></div>

        {/* Track List Square */}
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

        {/* Transport Control Square */}
        <div className="transport-control-square">
          <div className="transport-buttons">
            <button onClick={handleSkipBackward}>⏪</button>
            <button onClick={handlePlayPause}>⏯️</button>
            <button onClick={handleSkipForward}>⏩</button>
            <button onClick={handleStop}>⏹️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessMode;
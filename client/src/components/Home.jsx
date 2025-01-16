import React, { useState, useEffect, useRef } from "react";
import MediaList from "./MediaList";
// import './Home.css';


function Home({ user }) {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [currentMedia, setCurrentMedia] = useState(null);
    const audioRef = useRef(null); // Reference for controlling audio playback

    useEffect(() => {
        // Fetch media files when the component loads
        const fetchMediaFiles = async () => {
        try {
            const response = await fetch("/media_files", { credentials: "include" });
            if (response.ok) {
            const data = await response.json();
            setMediaFiles(data);
            console.log("Fetched media files:", data); // ✅ Debugging log
            } else {
            console.error("Failed to fetch media files");
            }
        } catch (error) {
            console.error("Error fetching media files:", error);
        }
        };

        fetchMediaFiles();
  }, []);

  // Handle media selection
  const handleMediaSelect = (media) => {
    setCurrentMedia(media);
    if (audioRef.current) {
        audioRef.current.load(); // Reloads the media source
        audioRef.current.play(); // Auto-plays the selected media
    }
  };

  // Transport Controls
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
      audioRef.current.currentTime += 10; // Skip forward by 10 seconds
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10; // Skip backward by 10 seconds
    }
  };

    
    if (!user) {
      return <p>Loading...</p>;
    }
  
    return (
        <div className="home-page-wrapper">
        <h2 className="home-username">{user.username}!</h2>

            {/* Purple square frame with user picture */}
            <div className="purple-pic-square">
                <img
                    src={user.picture_icon || "https://via.placeholder.com/150.png"} // Original line
                    alt={`${user.username}'s profile`}
                    className="user-picture"
                    onError={(e) => {
                    e.target.src = "https://placehold.co/150"; // Fallback if the image fails to load
                    e.target.alt = "Default Profile Picture"; // Update alt text for clarity
                    }}
                />
            </div>

            {/* User Banner */}
            <div className="user-banner-square"></div>

            {/* Purple Logo Circle */}
            <div className="purple-logo-circle">
                <span>Logo</span>
            </div>

            {/* Track List */}
            <div className="track-list-square">
                
            </div>

            {/* Contact Picture Square */}
            <div className="contact-pic-square"></div>

            {/* Track Contact Info Square */}
            <div className="track-contact-info-square"></div>

            {/* Media Player Square */}
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
                    onMediaSelect={(media) => setCurrentMedia(media)}
                    currentMedia={currentMedia}
                />
            </div>

            {/* Tracks Label */}
            <div className="tracks-label">Tracks</div>

            {/* Projects Label */}
            <div className="projects-label">Projects</div>

            {/* Transport Control Square */}
            <div className="transport-control-square"></div>

            {/* Transport Buttons */}
            <div className="transport-buttons">
                <button onClick={handleSkipBackward}>⏪</button>
                <button onClick={handlePlayPause}>⏯️</button>
                <button onClick={handleSkipForward}>⏩</button>
                <button onClick={handleStop}>⏹️</button>
            </div>



        
            <p></p>
        </div>
      );
    }
  

  
  export default Home;
import React, { useState, useEffect } from "react";
import MediaList from "./MediaList";
// import './Home.css';


function Home({ user }) {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [currentMedia, setCurrentMedia] = useState(null);

    useEffect(() => {
        // Fetch media files when the component loads
        const fetchMediaFiles = async () => {
        try {
            const response = await fetch("/media_files", { credentials: "include" });
            if (response.ok) {
            const data = await response.json();
            console.log("Fetched media files:", data); // Debugging log
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
            <div className="media-player-square"></div>

             {/* Artwork Square */}
            <div className="artwork-square"></div>

            {/* Project List Square */}
            <div className="project-list-square"></div>

            {/* Track List Square */}
            <div className="final-track-list-square"></div>
                {/* Add MediaList here */}
                <MediaList
                    mediaFiles={mediaFiles}
                    onMediaSelect={(media) => setCurrentMedia(media)}
                    currentMedia={currentMedia}
                />

            {/* Tracks Label */}
            <div className="tracks-label">Tracks</div>

            {/* Projects Label */}
            <div className="projects-label">Projects</div>

            {/* Transport Control Square */}
            <div className="transport-control-square"></div>

            {/* Transport Buttons */}
            <div className="transport-buttons">
                ⏪ ⏯️ ⏩ ⏹️ ⏮️ ⏭️
            </div>



        
            <p></p>
        </div>
      );
    }
  

  
  export default Home;
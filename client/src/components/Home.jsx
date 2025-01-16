import React from "react";
// import './Home.css';

function Home({ user }) {
    if (!user) {
      return <p>Loading...</p>;
    }
  
    return (
        <div className="home-page-wrapper">
        <h2 className="home-username">{user.username}!</h2>

            {/* Purple square frame with user picture */}
            <div className="purple-pic-square">
                <img
                src={user.picture_icon || "https://via.placeholder.com/150.png"}
                alt={`${user.username}'s profile`}
                className="user-picture"
                />
            </div>

            {/* User Banner */}
            <div className="user-banner-square"></div>

            {/* Purple Logo Circle */}
            <div className="purple-logo-circle">
                <span>Logo</span>
            </div>

            {/* Track List */}
            <div className="track-list-square"></div>

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
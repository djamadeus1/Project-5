import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MediaList from "./MediaList";
import Banner from "./Banner";
import ProjectsList from './ProjectsList';
import '../styles/Profile.css';
import '../styles/shared.css';

const defaultImage = "/assets/default-image.png";

function BusinessMode_2({ user, businessMode = true }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [currentContacts, setCurrentContacts] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const skipHoldThreshold = 300;
  const skipForwardTimeoutRef = useRef(null);
  const skipForwardIntervalRef = useRef(null);
  const skipForwardScrubTriggeredRef = useRef(false);
  const skipBackwardTimeoutRef = useRef(null);
  const skipBackwardIntervalRef = useRef(null);
  const skipBackwardScrubTriggeredRef = useRef(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5555/check_business_auth", { credentials: "include" });
        if (!res.ok) navigate('/');
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch("/media_files", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setMediaFiles(data);
        }
      } catch (err) {
        console.error("Error fetching media files:", err);
      }
    };
    fetchMedia();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetch(`/projects/${selectedProject.id}/media_files`, { credentials: "include" })
        .then(res => res.ok ? res.json() : [])
        .then(data => setMediaFiles(data))
        .catch(err => console.error("Error fetching project media:", err));
    } else {
      fetch("/media_files", { credentials: "include" })
        .then(res => res.ok ? res.json() : [])
        .then(data => setMediaFiles(data))
        .catch(err => console.error("Error fetching all media:", err));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (currentMedia) {
      fetch(`/media_files/${currentMedia.id}`, { credentials: "include" })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCurrentContacts(data.contacts || []);
        })
        .catch(err => console.error("Error fetching contacts:", err));
    }
  }, [currentMedia]);

  useEffect(() => {
    const savedMediaId = localStorage.getItem("currentMediaId");
    if (savedMediaId) {
      fetch(`/media_files/${savedMediaId}`, { credentials: "include" })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setCurrentMedia(data);
            setCurrentContacts(data.contacts || []);
          }
        })
        .catch(err => console.error("Error fetching saved media:", err));
    }
  }, []);

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    return `http://127.0.0.1:5555${path}?t=${Date.now()}`;
  };

  const getMediaUrl = (media) => {
    if (!media || !media.file_url) return '';
    return `http://127.0.0.1:5555${media.file_url}`;
  };

  const handleMediaSelect = (media) => {
    setCurrentMedia(media);
    localStorage.setItem("currentMediaId", media.id);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback error:", e));
    }
  };

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
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPaused(true);
        setIsPlaying(false);
      } else if (audioRef.current.currentTime > 0) {
        audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
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

  const handleSkipForwardClick = () => {
    if (!skipForwardScrubTriggeredRef.current && audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const handleSkipBackwardClick = () => {
    if (!skipBackwardScrubTriggeredRef.current && audioRef.current) {
      audioRef.current.currentTime -= 10;
      if (audioRef.current.currentTime < 0) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const startScrubForward = () => {
    if (audioRef.current) {
      skipForwardIntervalRef.current = setInterval(() => {
        audioRef.current.currentTime += 0.5;
      }, 100);
    }
  };

  const startScrubBackward = () => {
    if (audioRef.current) {
      skipBackwardIntervalRef.current = setInterval(() => {
        audioRef.current.currentTime -= 0.5;
        if (audioRef.current.currentTime < 0) audioRef.current.currentTime = 0;
      }, 100);
    }
  };

  const handleSkipForwardMouseDown = () => {
    skipForwardScrubTriggeredRef.current = false;
    skipForwardTimeoutRef.current = setTimeout(() => {
      skipForwardScrubTriggeredRef.current = true;
      startScrubForward();
    }, skipHoldThreshold);
  };

  const handleSkipBackwardMouseDown = () => {
    skipBackwardScrubTriggeredRef.current = false;
    skipBackwardTimeoutRef.current = setTimeout(() => {
      skipBackwardScrubTriggeredRef.current = true;
      startScrubBackward();
    }, skipHoldThreshold);
  };

  const handleSkipForwardMouseUp = () => {
    clearTimeout(skipForwardTimeoutRef.current);
    clearInterval(skipForwardIntervalRef.current);
  };

  const handleSkipBackwardMouseUp = () => {
    clearTimeout(skipBackwardTimeoutRef.current);
    clearInterval(skipBackwardIntervalRef.current);
  };

  const handleButtonClick = (e, callback) => {
    const button = e.currentTarget;
    button.classList.add('pressed');
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 300);
    if (callback) callback(e);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="page-wrapper">
      <div className="banner-container">
        <div className="user-banner-square">
          <Banner bannerUrl={getImageUrl(user.logo)} />
        </div>
        <div className="purple-logo-circle">Business Mode</div>
      </div>

      <div className="project-list-square">
        <div className="projects-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="projects-title" style={{ margin: 0 }}>Projects</h3>
            <button className="all-button" onClick={() => { setSelectedProject(null); setProjectSearch(''); }}>All</button>
          </div>
          <input type="text" placeholder="Search Projects" value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} style={{ width: '150px', padding: '5px' }} />
        </div>
        <ProjectsList searchQuery={projectSearch} onSelect={setSelectedProject} selectedProject={selectedProject} refreshTrigger={0} />
      </div>

      <div className="profile-pic-container">
        <div className="purple-pic-square">
          <img src={getImageUrl(user.picture_icon || user.profile_pic) || defaultImage} alt="Profile" className="profile-picture" />
        </div>
        <h2 className="home-username">{user.username}</h2>
      </div>

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

      <div className="contact-pic-square">
        {currentContacts[0] && (
          <img src={currentContacts[0].contact_pic ? getImageUrl(currentContacts[0].contact_pic) : defaultImage} alt={currentContacts[0].name} className="contact-picture" />
        )}
      </div>

      <div className="contact-background"></div>

      <div className="media-player-square">
        {currentMedia && currentMedia.artwork_url ? (
          <img src={`http://127.0.0.1:5555${currentMedia.artwork_url}?t=${Date.now()}`} alt={currentMedia.title} className="media-artwork" />
        ) : (
          <div className="default-media-artwork"><span>MUSIC - ONE</span></div>
        )}
        {currentMedia && (
          <audio ref={audioRef} controls key={currentMedia.id}>
            <source src={getMediaUrl(currentMedia)} type={currentMedia.file_type || 'audio/mpeg'} />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>

      <div className="track-list-square">
        <MediaList mediaFiles={mediaFiles} onMediaSelect={handleMediaSelect} currentMedia={currentMedia} />
      </div>

      <div className="tracks-label">Tracks</div>
      <div className="projects-label">Projects</div>

      <div className="transport-controls" style={{
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
      }}>
        <button onClick={handleSkipBackwardClick} onMouseDown={(e) => handleButtonClick(e, handleSkipBackwardMouseDown)} onMouseUp={handleSkipBackwardMouseUp} onMouseLeave={handleSkipBackwardMouseUp} className="skip-backward-button">
          <img src="/assets/rounded-skipback.svg" alt="Skip Backward" />
        </button>
        <button className={`pause-button ${isPaused ? 'lit' : ''}`} onClick={(e) => handleButtonClick(e, handlePause)}>
          <img src="/assets/rounded-pause.svg" alt="Pause" />
        </button>
        <button className={`play-button ${isPlaying ? 'lit' : ''}`} onClick={(e) => handleButtonClick(e, handlePlay)}>
          <img src="/assets/rounded-play.svg" alt="Play" />
        </button>
        <button onClick={handleSkipForwardClick} onMouseDown={(e) => handleButtonClick(e, handleSkipForwardMouseDown)} onMouseUp={handleSkipForwardMouseUp} onMouseLeave={handleSkipForwardMouseUp} className="skip-forward-button">
          <img src="/assets/rounded-skipforward.svg" alt="Skip Forward" />
        </button>
        <button onClick={(e) => handleButtonClick(e, handleStop)} className="stop-button">
          <img src="/assets/rounded-stop.svg" alt="Stop" />
        </button>
      </div>
    </div>
  );
}

export default BusinessMode_2;
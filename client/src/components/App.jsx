import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Header from './Header';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ContactsList from './ContactsList';
import Home from './Home';
import BusinessMode_2 from "./BusinessMode_2"; // Revert to original name
import Profile from './Profile';
import MediaList from './MediaList'; // Import MediaList component
// import '../styles/index.css';

function App() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]); // Add state for media files
  const [currentMedia, setCurrentMedia] = useState(null); // Add state for current media
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Add business mode detection
  useEffect(() => {
    setIsBusinessMode(location.pathname.includes('/business'));
  }, [location.pathname]);

  useEffect(() => {
    const checkSession = async () => {
      if (isLoggedOut) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/check_session", {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          fetchContacts();
          fetchMediaFiles(); // Fetch media files
        } else if (response.status === 401) {
          setUser(null);
          navigate("/login");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate, isLoggedOut]);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/contacts", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch("/media_files", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      });
      
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

  const handleMediaSelect = (media) => {
    setCurrentMedia(media);
  };

  async function handleLogout() {
    try {
      const response = await fetch("/logout", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setUser(null);
        setIsLoggedOut(true);
        localStorage.removeItem("user_id");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const ProtectedRoute = ({ children }) => {
    if (isLoading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  const BusinessProtectedRoute = ({ children }) => {
    const isInBusinessMode = localStorage.getItem('businessMode') === 'true';
    const navigate = useNavigate();
  
    useEffect(() => {
      const verifyBusinessAccess = async () => {
        try {
          const response = await fetch("http://localhost:5555/check_business_auth", {
            credentials: "include"
          });
          if (!response.ok) {
            navigate('/');
          }
        } catch (error) {
          console.error("Business mode verification failed:", error);
          navigate('/');
        }
      };
  
      if (!isInBusinessMode) {
        navigate('/');
      }
    }, [navigate, isInBusinessMode]);
  
    if (isLoading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" replace />;
    if (!isInBusinessMode) return <Navigate to="/" replace />;
    
    return children;
  };

  return (
    <div>
      <Header user={user} handleLogout={handleLogout} isBusinessMode={isBusinessMode} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm onLogin={setUser} />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected Home Route */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home user={user} />
          </ProtectedRoute>
        } />

        {/* Business Protected Routes */}
        <Route path="/business-mode-2" element={
          <BusinessProtectedRoute>
            <BusinessMode_2 user={user} />
          </BusinessProtectedRoute>
        } />
        <Route path="/profile" element={
          <BusinessProtectedRoute>
            <Profile user={user} setUser={setUser} />
          </BusinessProtectedRoute>
        } />
        <Route path="/contacts" element={
          <BusinessProtectedRoute>
            <ContactsList contacts={contacts} />
          </BusinessProtectedRoute>
        } />

        {/* Media List Route */}
        <Route path="/media" element={
          <ProtectedRoute>
            <MediaList mediaFiles={mediaFiles} onMediaSelect={handleMediaSelect} currentMedia={currentMedia} />
          </ProtectedRoute>
        } />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation, } from 'react-router-dom';
import Header from './Header';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ContactsList from './ContactsList';
import ContactForm from './ContactForm';
import Home from './Home';

function App() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        setIsLoggedOut(true);  // Add this line
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

  return (
    <div>
      <Header user={user} handleLogout={handleLogout} currentPage={location.pathname} />
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={setUser} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/" element={<ProtectedRoute><Home user={user} /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><ContactsList contacts={contacts} /></ProtectedRoute>} />
        <Route path="/create-contact" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
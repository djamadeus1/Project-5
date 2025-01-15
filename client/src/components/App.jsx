import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Header from './Header';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ContactsList from './ContactsList';
import ContactForm from './ContactForm';
import Home from './Home';

function App() {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  // const [logout, setLogout] = useState(false); // New state to track logout
  const navigate = useNavigate();
  const location = useLocation();


  // Auto-login logic
  useEffect(() => {
    // if (logout) return; // Prevent auto-login if the user has logged out

    const autoLogin = async () => {
      const storedUserId = localStorage.getItem("user_id");
      if (!storedUserId) {
        console.log("No user ID found in local storage. Skipping auto-login.");
        return;
      }
  
      try {
        const response = await fetch("/check_session", {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          fetchContacts();
          navigate("/");
        } else {
          throw new Error("Failed to auto-login");
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        navigate("/login");
      }
    };
  
    autoLogin();
  }, [navigate]);

  // Fetch contacts from the backend
  const fetchContacts = () => {
    fetch("/contacts", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        return response.json();
      })
      .then((data) => setContacts(data))
      .catch((error) => console.error("Error:", error));
  };

  // function handleLogin(userData) {
  //   console.log("User data before setting state:", userData);
  //   setUser(userData);
  //   localStorage.setItem('user_id', userData.id); // Store user ID in localStorage
  //   fetchContacts(); // Fetch contacts after successful login
  //   navigate("/"); // Redirect to Home page after successful login
  // }

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
        localStorage.removeItem("user_id");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div>
      {/* Pass user and handleLogout to Header */}
      <Header user={user} handleLogout={handleLogout} currentPage={location.pathname} />

      <Routes>
      <Route path="/login" element={<LoginForm onLogin={setUser} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><ContactsList contacts={contacts} /></ProtectedRoute>} />
        <Route path="/create-contact" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
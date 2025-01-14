import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import ContactForm from './ContactForm';
import ContactsList from './ContactsList';
import Home from './Home';

function App() {
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(null);
  const [logout, setLogout] = useState(false); // New state to track logout
  const navigate = useNavigate();

  // Auto-login logic
  useEffect(() => {
    if (logout) return; // Prevent auto-login if the user has logged out

    const autoLogin = async () => {
      try {
        const response = await fetch("/check_session", {
          method: "GET",
          credentials: "include", // Add this to include cookies
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
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
  }, [logout, navigate]);

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

  function handleLogin(userData) {
    console.log("User data before setting state:", userData);
    setUser(userData);
    localStorage.setItem('user_id', userData.id); // Store user ID in localStorage
    fetchContacts(); // Fetch contacts after successful login
    navigate("/"); // Redirect to Home page after successful login
  }

  async function handleLogout() {
    try {
      const response = await fetch("/logout", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setUser(null);
        localStorage.removeItem('user_id'); // Clear the stored user ID
        setLogout(true); // Set logout state to true to prevent auto-login
        navigate("/login"); // Redirect to login page after logout
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function ProtectedRoute({ children }) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  return (
    <div>
      <h1>Project Client</h1>
      {user ? (
        <>
          <p>{user.username}</p>
          <button onClick={handleLogout}>Logout</button>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><ContactsList contacts={contacts} /></ProtectedRoute>} />
            <Route path="/create-contact" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </>
      ) : (
        <>
          <p>Please log in.</p>
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
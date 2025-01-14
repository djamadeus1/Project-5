import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import ContactForm from './ContactForm';

// Home component
function Home() {
  return <h2>Welcome to the Home Page</h2>;
}

// ContactsList component
function ContactsList({ contacts }) {
  return (
    <div>
      <h2>Contacts:</h2>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>{contact.name}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [contacts, setContacts] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check localStorage on initial load and fetch contacts only if auto-login is successful
  useEffect(() => {
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
  }, [navigate]);

  // Fetch contacts from the backend
  const fetchContacts = () => {
    fetch("/contacts", {
      
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
    setUser(userData);
    localStorage.setItem('user_id', userData.id); // Store user ID in localStorage
    fetchContacts(); // Fetch contacts after successful login
    navigate("/"); // Redirect to Home page after successful login
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user_id'); // Clear the stored user ID
    navigate("/login"); // Redirect to login after logout
  }

  return (
    <div>
      <h1>Project Client</h1>
      {user ? (
  <>
    <p>Welcome, {user.username}!</p>
    <button onClick={handleLogout}>Logout</button>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contacts" element={<ContactsList contacts={contacts} />} />
      <Route path="/create-contact" element={<ContactForm />} />
      <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignupForm />} /> {/* Signup route */}
      <Route path="*" element={<LoginForm onLogin={handleLogin} />} /> {/* Catch-all route */}
    </Routes>
  </>
) : (
  <>
    <p>Please log in.</p>
    <Routes>
      <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
      <Route path="*" element={<LoginForm onLogin={handleLogin} />} /> {/* Catch-all route */}
    </Routes>
  </>
)}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/index.css';

function PasswordPopup({ user, onClose, onVerified }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/verify_password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username, password }),
      });

      if (response.ok) {
        localStorage.setItem('businessMode', 'true');
        onVerified && onVerified();
        navigate("/business-mode-2");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="password-popup">
      <div className="popup-content">
        <h2>Enter Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Enter</button>
        </form>
        {error && <p className="error">{error}</p>}
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default PasswordPopup;
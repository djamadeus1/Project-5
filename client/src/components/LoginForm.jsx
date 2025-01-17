import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/index.css';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Invalid username or password");
      })
      .then((userData) => {
        console.log("User data:", userData); // Debug log
        onLogin(userData); // Call onLogin prop to update the app state
        navigate("/"); // Redirect to the home page
      })
      .catch((error) => {
        setError(error.message); // Displays specific error messages
      });
  }

  return (
    <div className="login-form-wrapper form-wrapper">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if present */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {/* Signup link */}
      <div className="signup-link">
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
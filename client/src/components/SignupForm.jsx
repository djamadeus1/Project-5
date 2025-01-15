import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../index.css'; // Ensure global styles are imported

function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        navigate("/login"); // On success, redirect to login
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="signup-form-wrapper form-wrapper">
      <h2>Signup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Signup</button>
      </form>

      <div className="login-link">
        <p>Already have an account? <Link to="/login">Log in here</Link></p>
      </div>
    </div>
  );
}

export default SignupForm;
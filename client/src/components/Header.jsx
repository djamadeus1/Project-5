import React from "react";
import { Link, useLocation } from "react-router-dom";
import '../styles/index.css';

function Header({ user, handleLogout }) {
  const isAuthenticated = localStorage.getItem('businessMode') === 'true';
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="header-container">
      <h1 className="app-title">MUSIC - ONE</h1>
      
      {user && (
        <nav className="nav-links">
          {/* Show navigation only when authenticated AND not on home page */}
          {isAuthenticated && !isHomePage && (
            <>
              <Link to="/">Home</Link>
              <Link to="/business-mode-2/profile">Profile</Link>
              <Link to="/business-mode-2/phonebook">Phone Book</Link>
              <Link to="/business-mode-2/production">Production</Link>
              <Link to="/business-mode-2/timers">Timers</Link>
            </>
          )}

          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
      )}
    </header>
  );
}

export default Header;
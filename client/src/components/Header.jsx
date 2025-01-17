import React from "react";
import { Link } from "react-router-dom";
import '../styles/index.css';

function Header({ user, handleLogout, isBusinessMode }) {
  return (
    <header className="header-container">
      <h1 className="app-title">MUSIC - ONE</h1>
      
      {user && (
        <nav className="nav-links">
          {/* Only show Home link in Business Mode */}
          {isBusinessMode && <Link to="/">Home</Link>}

          {/* Business Mode Navigation - only show when in business mode */}
          {isBusinessMode && (
            <>
              <Link to="/business-mode-2/profile">Profile</Link>
              <Link to="/business-mode-2/contacts">Contacts</Link>
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
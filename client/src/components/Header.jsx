import React from 'react';
import { Link } from 'react-router-dom';

function Header({ user, handleLogout, currentPage }) {
    return (
      <header>
        <h1>MUSIC - ONE</h1>
        <nav>
          {user ? (
            <>
              <span>Welcome, {user.username}!</span>
              <button onClick={handleLogout}>Logout</button>
              <Link to="/">Home</Link>
              <Link to="/contacts">Contacts</Link>
              <Link to="/create-contact">New Contact</Link>
              {currentPage === "/" && <p>You are on the Home page</p>}
              {currentPage === "/contacts" && <p>You are on the Contacts page</p>}
            </>
          ) : (
            <>
              
            </>
          )}
        </nav>
      </header>
    );
  }

  export default Header;
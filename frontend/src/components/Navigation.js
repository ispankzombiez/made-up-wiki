import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Made-Up Wiki
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">{user.email}</span>
              {user.is_contributor && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              <button onClick={onLogout} className="nav-link logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

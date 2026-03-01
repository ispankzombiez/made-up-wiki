import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Made-Up Wiki
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              {user.is_contributor && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              <div className="settings-menu" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="settings-button"
                  title="Settings"
                >
                  ⚙️
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <div className="menu-user-info">
                      <div className="menu-username">{user.username || 'Set username'}</div>
                      <div className="menu-email">{user.email}</div>
                    </div>
                    <div className="menu-divider"></div>
                    <Link
                      to="/profile"
                      className="menu-item"
                      onClick={() => setShowMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={onLogout}
                      className="menu-item logout-item"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

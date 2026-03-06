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
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            Made-Up Wiki
          </Link>
          <a 
            href="https://github.com/ispankzombiez/made-up-wiki" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link-nav"
            title="View on GitHub"
            aria-label="View project on GitHub"
          >
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
        <div className="navbar-links">
          {user ? (
            <>
              {user.is_admin && (
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
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
                    <Link
                      to="/submissions"
                      className="menu-item"
                      onClick={() => setShowMenu(false)}
                    >
                      My Submissions
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

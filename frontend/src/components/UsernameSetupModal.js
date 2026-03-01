import React, { useState } from 'react';
import { authAPI } from '../api';
import './UsernameSetupModal.css';

function UsernameSetupModal({ isOpen, user, onUsernameSet }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authAPI.updateUsername(username);
      const updatedUser = { ...user, username: res.data.user.username };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUsernameSet(updatedUser);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set username. Please try another one.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Welcome to Made-Up Wiki!</h2>
        </div>

        <div className="setup-form">
          <p className="setup-text">
            Choose a username for your profile. This is how other contributors will see you in the wiki.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., wordsmith_pro"
                disabled={loading}
                maxLength="50"
              />
              <small className="helper-text">3-50 characters: letters, numbers, hyphens, underscores</small>
            </div>

            {error && <div className="error">{error}</div>}

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="btn-submit"
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UsernameSetupModal;

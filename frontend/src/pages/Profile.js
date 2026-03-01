import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './Profile.css';

function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleChangeUsername = async (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      setError('Please enter a new username');
      return;
    }

    if (newUsername === username) {
      setError('New username must be different from current one');
      return;
    }

    if (newUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authAPI.updateUsername(newUsername);
      const updatedUser = { ...user, username: res.data.user.username };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUsername(res.data.user.username);
      setNewUsername('');
      setSuccess('Username updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update username. Please try another one.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  return (
    <div className="container">
      <div className="profile-page">
        <h1>Profile Settings</h1>

        <div className="profile-card">
          <div className="profile-section">
            <h2>Account Information</h2>
            
            <div className="info-group">
              <label>Email</label>
              <p className="info-value">{user?.email}</p>
            </div>

            <div className="info-group">
              <label>Current Username</label>
              <p className="info-value username-display">{username || 'Not set'}</p>
            </div>

            <div className="divider"></div>

            <h2>Change Username</h2>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit Username
              </button>
            ) : (
              <form onSubmit={handleChangeUsername}>
                <div className="form-group">
                  <label htmlFor="new-username">New Username</label>
                  <input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    disabled={loading}
                    maxLength="50"
                  />
                  <small className="helper-text">3-50 characters: letters, numbers, hyphens, underscores</small>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-save"
                  >
                    {loading ? 'Saving...' : 'Save Username'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setNewUsername('');
                      setError('');
                    }}
                    disabled={loading}
                    className="btn btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="divider"></div>

          <div className="profile-section">
            <h2>Logout</h2>
            <p>You will be logged out of the application.</p>
            <button
              onClick={handleLogout}
              className="btn btn-logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

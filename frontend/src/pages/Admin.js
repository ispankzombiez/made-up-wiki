import React, { useState, useEffect } from 'react';
import { inviteAPI, adminAPI } from '../api';
import './Admin.css';

function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inviteCodes, setInviteCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      handleLoadStats();
    } else if (activeTab === 'invites') {
      handleLoadInviteCodes();
    }
  }, [activeTab]);

  const handleLoadStats = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInviteCode = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await inviteAPI.create();
      setInviteCodes([res.data, ...inviteCodes]);
      setMessage('Invite code created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadInviteCodes = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await inviteAPI.getCodes();
      setInviteCodes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadUsers = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await inviteAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleContributor = async (userId, currentStatus) => {
    setError('');
    setLoading(true);

    try {
      const res = await inviteAPI.updateUserContributor(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? res.data : u));
      setMessage(`User ${!currentStatus ? 'made' : 'removed as'} contributor successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <h1>Admin Panel</h1>

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          {user?.is_admin && (
            <>
              <button
                className={`tab-button ${activeTab === 'invites' ? 'active' : ''}`}
                onClick={() => { setActiveTab('invites'); handleLoadInviteCodes(); }}
              >
                Manage Invites
              </button>
              <button
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => { setActiveTab('users'); handleLoadUsers(); }}
              >
                Manage Users
              </button>
            </>
          )}
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {activeTab === 'dashboard' && (
          <div className="tab-content dashboard-content">
            <h2>Dashboard</h2>
            {loading ? (
              <p className="loading">Loading statistics...</p>
            ) : stats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalWords}</div>
                    <div className="stat-label">Total Words</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.totalContributors}</div>
                    <div className="stat-label">Contributors</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{stats.wordsThisMonth}</div>
                    <div className="stat-label">Words This Month</div>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h3>Words by Part of Speech</h3>
                  <div className="chart-container">
                    {Object.keys(stats.partOfSpeechCounts || {}).length > 0 ? (
                      <div className="bar-chart">
                        {stats.partOfSpeechCounts.map((item, idx) => (
                          <div key={idx} className="bar-item">
                            <div className="bar-label">{item.pos}</div>
                            <div className="bar" style={{ width: `${(item.count / Math.max(...stats.partOfSpeechCounts.map(x => x.count))) * 100}%` }}>
                              <span className="bar-value">{item.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No data available</p>
                    )}
                  </div>
                </div>

                <div className="dashboard-section">
                  <h3>Top Categories</h3>
                  <div className="chart-container">
                    {stats.categoryCounts && stats.categoryCounts.length > 0 ? (
                      <div className="tag-list">
                        {stats.categoryCounts.map((item, idx) => (
                          <span key={idx} className="category-badge">
                            {item.name} <strong>{item.count}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>No categories yet</p>
                    )}
                  </div>
                </div>

                <div className="dashboard-section">
                  <h3>Top Contributors</h3>
                  <table className="contributors-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Words Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topContributors && stats.topContributors.map(contributor => (
                        <tr key={contributor.created_by}>
                          <td>{contributor.created_by_username || `User #${contributor.created_by}`}</td>
                          <td>{contributor.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dashboard-section">
                  <h3>Recent Entries</h3>
                  <table className="recent-entries-table">
                    <thead>
                      <tr>
                        <th>Word</th>
                        <th>Created By</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentEntries && stats.recentEntries.map(entry => (
                        <tr key={entry.id}>
                          <td>{entry.word}</td>
                          <td>{entry.created_by_username || `User #${entry.created_by}`}</td>
                          <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>Failed to load statistics</p>
            )}
          </div>
        )}

        {message && <div className="success">{message}</div>}

        {activeTab === 'invites' && (
          <div className="tab-content">
            <h2>Invite Codes</h2>
            <button
              onClick={handleCreateInviteCode}
              disabled={loading}
              className="btn"
            >
              {loading ? 'Creating...' : 'Generate New Code'}
            </button>

            {inviteCodes.length > 0 && (
              <table className="invites-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Created</th>
                    <th>Used</th>
                    <th>Used By</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteCodes.map(code => (
                    <tr key={code.id}>
                      <td className="code">{code.code}</td>
                      <td>{new Date(code.created_at).toLocaleDateString()}</td>
                      <td>{code.used_at ? 'Yes' : 'No'}</td>
                      <td>{code.used_by ? `User #${code.used_by}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>Manage Users</h2>
            {users.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Contributor</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.is_contributor ? '✓ Yes' : '✗ No'}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={`toggle-btn ${u.is_contributor ? 'revoke' : 'grant'}`}
                          onClick={() => handleToggleContributor(u.id, u.is_contributor)}
                          disabled={loading}
                        >
                          {u.is_contributor ? 'Revoke' : 'Make'} Contributor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No users yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;

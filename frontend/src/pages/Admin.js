import React, { useState } from 'react';
import { entriesAPI, inviteAPI } from '../api';
import './Admin.css';

function Admin({ user }) {
  const [activeTab, setActiveTab] = useState('entries');
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [inviteCodes, setInviteCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await entriesAPI.create(word, definition);
      setMessage('Entry created successfully!');
      setWord('');
      setDefinition('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create entry');
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
            className={`tab-button ${activeTab === 'entries' ? 'active' : ''}`}
            onClick={() => setActiveTab('entries')}
          >
            Create Entry
          </button>
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
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {activeTab === 'entries' && (
          <div className="tab-content">
            <h2>Create New Entry</h2>
            <form onSubmit={handleCreateEntry} className="entry-form">
              <div className="form-group">
                <label htmlFor="word">Word</label>
                <input
                  type="text"
                  id="word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter the word"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="definition">Definition</label>
                <textarea
                  id="definition"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  placeholder="Enter the definition"
                  rows="6"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} className="btn">
                {loading ? 'Creating...' : 'Create Entry'}
              </button>
            </form>
          </div>
        )}

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
                    <th>Email</th>
                    <th>Contributor</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
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

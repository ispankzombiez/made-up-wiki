import React, { useState, useEffect } from 'react';
import { entriesAPI } from '../api';
import './Home.css';

function Home({ user }) {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editWord, setEditWord] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await entriesAPI.getAll(searchTerm);
      const data = Array.isArray(res.data) ? res.data : [];
      setEntries(data);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to fetch entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEntries();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditWord(entry.word);
    setEditDefinition(entry.definition);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditWord('');
    setEditDefinition('');
    setEditError('');
  };

  const handleSaveEdit = async (entryId) => {
    if (!editWord.trim() || !editDefinition.trim()) {
      setEditError('Both word and definition are required');
      return;
    }

    setEditLoading(true);
    setEditError('');
    try {
      const res = await entriesAPI.update(entryId, editWord, editDefinition);
      setEntries(entries.map(e => e.id === entryId ? res.data : e));
      setEditingId(null);
      setEditWord('');
      setEditDefinition('');
    } catch (err) {
      console.error('Error updating entry:', err);
      setEditError(err.response?.data?.error || 'Failed to update entry');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await entriesAPI.delete(entryId);
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err.response?.data?.error || 'Failed to delete entry');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchEntries();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="container">
      <div className="home">
        <h1>Made-Up Wiki</h1>
        <p className="subtitle">Explore all the made-up words and their definitions</p>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search words and definitions..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <p className="loading">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="no-results">No entries found. {!user && 'Sign up to contribute!'}</p>
        ) : (
          <div className="entries-list">
            {entries.map(entry => (
              <div key={entry.id} className="entry-card">
                {editingId === entry.id ? (
                  <div className="edit-form">
                    <h3>Edit Entry</h3>
                    {editError && <div className="error">{editError}</div>}
                    <div className="form-group">
                      <label htmlFor="edit-word">Word</label>
                      <input
                        id="edit-word"
                        type="text"
                        value={editWord}
                        onChange={(e) => setEditWord(e.target.value)}
                        placeholder="Enter word"
                        disabled={editLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-definition">Definition</label>
                      <textarea
                        id="edit-definition"
                        value={editDefinition}
                        onChange={(e) => setEditDefinition(e.target.value)}
                        placeholder="Enter definition"
                        rows="4"
                        disabled={editLoading}
                      />
                    </div>
                    <div className="edit-actions">
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        disabled={editLoading}
                        className="btn-save"
                      >
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={editLoading}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{entry.word}</h2>
                    <p>{entry.definition}</p>
                    <small className="entry-meta">
                      Created: {new Date(entry.created_at).toLocaleDateString()}
                      {entry.updated_at !== entry.created_at && ` • Updated: ${new Date(entry.updated_at).toLocaleDateString()}`}
                    </small>
                    {user && user.is_contributor && user.id === entry.created_by && (
                      <div className="entry-actions">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

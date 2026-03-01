import React, { useState, useEffect } from 'react';
import { entriesAPI } from '../api';
import './Home.css';

function Home({ user }) {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await entriesAPI.getAll(searchTerm);
      setEntries(res.data);
    } catch (err) {
      setError('Failed to fetch entries');
      console.error(err);
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
                <h2>{entry.word}</h2>
                <p>{entry.definition}</p>
                <small className="entry-meta">
                  Created: {new Date(entry.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

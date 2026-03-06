import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { entriesAPI } from '../api';
import './ViewLeaderboard.css';

export default function ViewLeaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await entriesAPI.getAllViewed();
      setEntries(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="leaderboard-page">
        <Link to="/admin" className="back-link">← Back to Admin Dashboard</Link>
        
        <h1>Most Viewed Words</h1>
        <p className="leaderboard-subtitle">Complete ranking of all words by number of views</p>

        {loading && <p className="loading">Loading leaderboard...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && entries.length === 0 && (
          <p className="empty-message">No entries found</p>
        )}

        {!loading && entries.length > 0 && (
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <div className="rank-col">Rank</div>
              <div className="word-col">Word</div>
              <div className="views-col">Views</div>
              <div className="action-col">Action</div>
            </div>
            {entries.map((entry, index) => (
              <div key={entry.id} className="leaderboard-row">
                <div className="rank-col">
                  <span className={`rank-badge rank-${Math.min(index + 1, 3)}`}>
                    #{index + 1}
                  </span>
                </div>
                <div className="word-col">
                  <div className="word-name">{entry.word}</div>
                  <div className="word-preview">{entry.definition?.substring(0, 80)}...</div>
                </div>
                <div className="views-col">
                  <span className="view-count">{entry.views}</span>
                </div>
                <div className="action-col">
                  <Link to={`/word/${encodeURIComponent(entry.word)}`} className="view-btn">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

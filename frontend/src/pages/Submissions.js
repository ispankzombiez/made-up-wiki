import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entriesAPI } from '../api';
import './Submissions.css';

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await entriesAPI.getPendingSubmissions();
      setSubmissions(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const handleApprovedWordClick = (word) => {
    if (word.status === 'approved') {
      navigate(`/word/${encodeURIComponent(word.word)}`);
    }
  };

  return (
    <div className="submissions-container">
      <div className="submissions-header">
        <h1>My Submissions</h1>
        <p className="submissions-subtitle">Track the status of your word submissions</p>
      </div>

      {loading ? (
        <div className="loading">Loading submissions...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          <p>You haven't submitted any words yet.</p>
          <p>Submit a word to see it appear here!</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={`submission-item status-${getStatusColor(submission.status)}`}
            >
              <div className="submission-header">
                <div className="submission-word-container">
                  <h3
                    className={`submission-word ${submission.status === 'approved' ? 'clickable' : ''}`}
                    onClick={() => handleApprovedWordClick(submission)}
                  >
                    {submission.word}
                  </h3>
                </div>
                <span className={`status-badge status-${submission.status}`}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                </span>
              </div>

              <div className="submission-content">
                <div className="submission-field">
                  <span className="field-label">Definition:</span>
                  <p className="field-value">{submission.definition}</p>
                </div>

                {submission.part_of_speech && (
                  <div className="submission-field">
                    <span className="field-label">Part of Speech:</span>
                    <p className="field-value">{submission.part_of_speech}</p>
                  </div>
                )}

                {submission.pronunciation && (
                  <div className="submission-field">
                    <span className="field-label">Pronunciation:</span>
                    <p className="field-value">{submission.pronunciation}</p>
                  </div>
                )}

                {submission.example && (
                  <div className="submission-field">
                    <span className="field-label">Example:</span>
                    <p className="field-value italic">"{submission.example}"</p>
                  </div>
                )}

                {submission.categories && submission.categories.length > 0 && (
                  <div className="submission-field">
                    <span className="field-label">Categories:</span>
                    <div className="categories-list">
                      {submission.categories.map((cat, idx) => (
                        <span key={idx} className="category-tag">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="submission-footer">
                <p className="submission-date">
                  Submitted: {new Date(submission.created_at).toLocaleDateString()}
                </p>
                {submission.status === 'approved' && (
                  <button
                    onClick={() => handleApprovedWordClick(submission)}
                    className="btn btn-view"
                  >
                    View Word
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Submissions;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entriesAPI } from '../api';
import './Submissions.css';

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    word: '',
    definition: '',
    partOfSpeech: '',
    pronunciation: '',
    example: '',
    categories: [],
  });
  const [editError, setEditError] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
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

  const handleEdit = (submission) => {
    setEditingId(submission.id);
    setEditFormData({
      word: submission.word,
      definition: submission.definition,
      partOfSpeech: submission.part_of_speech || '',
      pronunciation: submission.pronunciation || '',
      example: submission.example || '',
      categories: submission.categories || [],
    });
    setEditError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditCategoriesChange = (e) => {
    const value = e.target.value;
    setEditFormData(prev => ({
      ...prev,
      categories: value ? value.split(',').map(cat => cat.trim()).filter(cat => cat !== '') : [],
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setEditError(null);
      setEditSaving(true);
      
      if (!editFormData.word.trim() || !editFormData.definition.trim()) {
        setEditError('Word and definition are required');
        return;
      }

      await entriesAPI.update(
        editingId,
        editFormData.word,
        editFormData.partOfSpeech || null,
        editFormData.pronunciation || null,
        editFormData.definition,
        editFormData.example || null,
        editFormData.categories.length > 0 ? editFormData.categories : null
      );

      // Update the local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === editingId ? {
          ...sub,
          word: editFormData.word,
          part_of_speech: editFormData.partOfSpeech,
          pronunciation: editFormData.pronunciation,
          definition: editFormData.definition,
          example: editFormData.example,
          categories: editFormData.categories,
        } : sub
      ));

      setEditingId(null);
    } catch (err) {
      console.error('Error saving edit:', err);
      setEditError('Failed to save changes: ' + (err.response?.data?.error || err.message));
    } finally {
      setEditSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  }

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
                <div className="submission-actions">
                  {submission.status === 'approved' && (
                    <button
                      onClick={() => handleApprovedWordClick(submission)}
                      className="btn btn-view"
                    >
                      View Word
                    </button>
                  )}
                  {submission.status === 'pending' && (
                    <button
                      onClick={() => handleEdit(submission)}
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="edit-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Edit Submission</h2>
              <button className="close-btn" onClick={handleCancelEdit}>✕</button>
            </div>

            {editError && <div className="edit-error">{editError}</div>}

            <div className="edit-form">
              <div className="form-group">
                <label>Word *</label>
                <input
                  type="text"
                  name="word"
                  value={editFormData.word}
                  onChange={handleEditChange}
                  placeholder="Enter word"
                />
              </div>

              <div className="form-group">
                <label>Definition *</label>
                <textarea
                  name="definition"
                  value={editFormData.definition}
                  onChange={handleEditChange}
                  placeholder="Enter definition"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Part of Speech</label>
                  <input
                    type="text"
                    name="partOfSpeech"
                    value={editFormData.partOfSpeech}
                    onChange={handleEditChange}
                    placeholder="e.g., noun, verb"
                  />
                </div>

                <div className="form-group">
                  <label>Pronunciation</label>
                  <input
                    type="text"
                    name="pronunciation"
                    value={editFormData.pronunciation}
                    onChange={handleEditChange}
                    placeholder="e.g., /həˈloʊ/"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Example</label>
                <textarea
                  name="example"
                  value={editFormData.example}
                  onChange={handleEditChange}
                  placeholder="Enter example usage"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Categories</label>
                <input
                  type="text"
                  value={editFormData.categories.join(', ')}
                  onChange={handleEditCategoriesChange}
                  placeholder="e.g., programming, tech (comma-separated)"
                />
              </div>
            </div>

            <div className="edit-modal-footer">
              <button
                onClick={handleCancelEdit}
                className="btn btn-cancel"
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-save"
                disabled={editSaving}
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Submissions;

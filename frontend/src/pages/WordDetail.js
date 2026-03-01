import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { entriesAPI } from '../api';
import './WordDetail.css';

function WordDetail({ user }) {
  const { wordName } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    word: '',
    partOfSpeech: '',
    pronunciation: '',
    definition: '',
    example: '',
    relatedWords: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchEntry();
  }, [wordName]);

  const fetchEntry = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await entriesAPI.getByWord(wordName);
      setEntry(response.data);
      setEditingId(null);
    } catch (err) {
      setError('Word not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({
      word: entry.word || '',
      partOfSpeech: entry.part_of_speech || '',
      pronunciation: entry.pronunciation || '',
      definition: entry.definition || '',
      example: entry.example || '',
      relatedWords: entry.related_words || ''
    });
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (entryId) => {
    if (!editForm.word.trim() || !editForm.definition.trim()) {
      setEditError('Word and definition are required');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      await entriesAPI.update(
        entryId,
        editForm.word,
        editForm.partOfSpeech,
        editForm.pronunciation,
        editForm.definition,
        editForm.example,
        editForm.relatedWords
      );

      fetchEntry();
    } catch (err) {
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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete entry');
    }
  };

  const renderRelatedWords = (relatedWords) => {
    if (!relatedWords) return null;
    
    const words = relatedWords.split(',').map(w => w.trim()).filter(w => w);
    if (words.length === 0) return null;

    return (
      <div className="related-words">
        <strong>Related words:</strong>{' '}
        {words.map((word, index) => (
          <React.Fragment key={index}>
            <Link to={`/word/${encodeURIComponent(word)}`} className="related-word-link">
              {word}
            </Link>
            {index < words.length - 1 && ', '}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="word-detail-page">
          <div className="error-message">{error}</div>
          <Link to="/" className="back-link">← Back to all words</Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container">
        <div className="word-detail-page">
          <p>Word not found</p>
          <Link to="/" className="back-link">← Back to all words</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="word-detail-page">
        <Link to="/" className="back-link">← Back to all words</Link>

        {editingId === entry.id ? (
          <div className="edit-form">
            <h2>Edit Entry</h2>
            {editError && <div className="error">{editError}</div>}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-word">Word</label>
                <input
                  id="edit-word"
                  type="text"
                  value={editForm.word}
                  onChange={(e) => setEditForm({ ...editForm, word: e.target.value })}
                  placeholder="Enter word"
                  disabled={editLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-pos">Part of Speech</label>
                <input
                  id="edit-pos"
                  type="text"
                  value={editForm.partOfSpeech}
                  onChange={(e) => setEditForm({ ...editForm, partOfSpeech: e.target.value })}
                  placeholder="noun, adj, verb, etc."
                  disabled={editLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-pronunciation">Pronunciation</label>
              <input
                id="edit-pronunciation"
                type="text"
                value={editForm.pronunciation}
                onChange={(e) => setEditForm({ ...editForm, pronunciation: e.target.value })}
                placeholder="e.g., /ɪɡˈzæmpəl/"
                disabled={editLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-definition">Definition</label>
              <textarea
                id="edit-definition"
                value={editForm.definition}
                onChange={(e) => setEditForm({ ...editForm, definition: e.target.value })}
                placeholder="Enter definition"
                rows="3"
                disabled={editLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-example">Example</label>
              <textarea
                id="edit-example"
                value={editForm.example}
                onChange={(e) => setEditForm({ ...editForm, example: e.target.value })}
                placeholder="e.g., 'This is an example sentence.'"
                rows="2"
                disabled={editLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-related">Related Words</label>
              <input
                id="edit-related"
                type="text"
                value={editForm.relatedWords}
                onChange={(e) => setEditForm({ ...editForm, relatedWords: e.target.value })}
                placeholder="word1, word2, word3"
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
          <div className="entry-detail">
            <div className="entry-header">
              <div className="entry-title">
                <h1>{entry.word}</h1>
                {entry.part_of_speech && <span className="part-of-speech">{entry.part_of_speech}</span>}
              </div>
              
              {user && user.is_contributor && user.id === entry.created_by && (
                <div className="entry-actions">
                  <button onClick={() => handleEdit(entry)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              )}
            </div>

            {entry.pronunciation && (
              <p className="pronunciation">{entry.pronunciation}</p>
            )}

            <p className="definition">{entry.definition}</p>

            {entry.example && (
              <p className="example">
                <em>Example:</em> "{entry.example}"
              </p>
            )}

            {renderRelatedWords(entry.related_words)}

            <div className="entry-footer">
              <small className="entry-meta">
                Created by: <strong>{user?.id === entry.created_by ? 'You' : entry.created_by_username || 'Unknown'}</strong> • {new Date(entry.created_at).toLocaleDateString()}
                {entry.updated_at !== entry.created_at && ` • Updated: ${new Date(entry.updated_at).toLocaleDateString()}`}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WordDetail;

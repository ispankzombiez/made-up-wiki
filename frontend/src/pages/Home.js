import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { entriesAPI } from '../api';
import CreateEntryModal from '../components/CreateEntryModal';
import './Home.css';

function Home({ user }) {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
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
    setEditForm({
      word: entry.word || '',
      partOfSpeech: entry.part_of_speech || '',
      pronunciation: entry.pronunciation || '',
      definition: entry.definition || '',
      example: entry.example || '',
      relatedWords: entry.related_words || ''
    });
    setEditError('');
    setOpenDropdown(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      word: '',
      partOfSpeech: '',
      pronunciation: '',
      definition: '',
      example: '',
      relatedWords: ''
    });
    setEditError('');
  };

  const handleSaveEdit = async (entryId) => {
    if (!editForm.word.trim() || !editForm.definition.trim()) {
      setEditError('Word and definition are required');
      return;
    }

    setEditLoading(true);
    setEditError('');
    try {
      const res = await entriesAPI.update(
        entryId,
        editForm.word,
        editForm.partOfSpeech,
        editForm.pronunciation,
        editForm.definition,
        editForm.example,
        editForm.relatedWords
      );
      setEntries(entries.map(e => e.id === entryId ? res.data : e));
      setEditingId(null);
      setEditForm({
        word: '',
        partOfSpeech: '',
        pronunciation: '',
        definition: '',
        example: '',
        relatedWords: ''
      });
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
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err.response?.data?.error || 'Failed to delete entry');
    }
  };

  const handleRelatedWordClick = (word) => {
    setSearchTerm(word);
  };

  const handleEntryCreated = (newEntry) => {
    setEntries([newEntry, ...entries]);
    setSearchTerm('');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchEntries();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  return (
    <div className="container">
      <div className="home">
        <h1>Made-Up Wiki</h1>
        <p className="subtitle">Explore all the made-up words and their definitions</p>

        <div className="header-controls">
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
          {user && user.is_contributor && (
            <button onClick={() => setShowModal(true)} className="new-button">
              New
            </button>
          )}
        </div>

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
                  <>
                    <div className="entry-header">
                      <div className="entry-title">
                        <h2>{entry.word}</h2>
                        {entry.part_of_speech && <span className="part-of-speech">{entry.part_of_speech}</span>}
                      </div>
                      
                      {user && user.is_contributor && user.id === entry.created_by && (
                        <div className="dropdown-container">
                          <button
                            className="pencil-icon"
                            onClick={() => setOpenDropdown(openDropdown === entry.id ? null : entry.id)}
                          >
                            ✏️
                          </button>
                          {openDropdown === entry.id && (
                            <div className="dropdown-menu">
                              <button onClick={() => handleEdit(entry)} className="dropdown-item edit">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(entry.id)} className="dropdown-item delete">
                                Delete
                              </button>
                            </div>
                          )}
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

                    <div className="entry-footer">
                      <small className="entry-meta">
                        Created by: <strong>{user?.id === entry.created_by ? 'You' : entry.created_by_username || 'Unknown'}</strong> • {new Date(entry.created_at).toLocaleDateString()}
                        {entry.updated_at !== entry.created_at && ` • Updated: ${new Date(entry.updated_at).toLocaleDateString()}`}
                      </small>
                    </div>

                    {renderRelatedWords(entry.related_words)}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        <CreateEntryModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onEntryCreated={handleEntryCreated}
        />
      </div>
    </div>
  );
}

export default Home;

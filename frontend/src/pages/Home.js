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
    relatedWords: '',
    categories: ''
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
      relatedWords: entry.related_words || '',
      categories: entry.categories || ''
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
      relatedWords: '',
      categories: ''
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
        editForm.relatedWords,
        editForm.categories
      );
      setEntries(entries.map(e => e.id === entryId ? res.data : e));
      setEditingId(null);
      setEditForm({
        word: '',
        partOfSpeech: '',
        pronunciation: '',
        definition: '',
        example: '',
        relatedWords: '',
        categories: ''
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

  const renderCategories = (categories) => {
    if (!categories) return null;
    const cats = categories.split(',').map(c => c.trim()).filter(c => c);
    if (cats.length === 0) return null;
    return (
      <div className="categories">
        {cats.map((cat, index) => (
          <span key={index} className="category-tag">
            {cat}
          </span>
        ))}
      </div>
    );
  };

  const getAvailableLetters = () => {
    if (entries.length === 0) return [];
    const letters = new Set();
    entries.forEach(entry => {
      const firstChar = entry.word.charAt(0).toLowerCase();
      if (firstChar.match(/[a-z]/)) {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  };

  const groupEntriesByLetter = () => {
    const grouped = {};
    entries.forEach(entry => {
      const firstChar = entry.word.charAt(0).toLowerCase();
      if (firstChar.match(/[a-z]/)) {
        if (!grouped[firstChar]) {
          grouped[firstChar] = [];
        }
        grouped[firstChar].push(entry);
      }
    });
    return grouped;
  };

  const scrollToLetter = (letter) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
          <>
            {(() => {
              const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
              const availableLetters = getAvailableLetters();
              const groupedEntries = groupEntriesByLetter();
              
              return (
                <>
                  <div className="alphabet-index">
                    {allLetters.map(letter => (
                      <button
                        key={letter}
                        className={`letter-btn ${availableLetters.includes(letter) ? 'available' : 'disabled'}`}
                        onClick={() => scrollToLetter(letter)}
                        disabled={!availableLetters.includes(letter)}
                      >
                        {letter.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="entries-list">
                    {availableLetters.map(letter => (
                      <div key={letter} id={`letter-${letter}`} className="letter-section">
                        <h3 className="letter-heading">{letter.toUpperCase()}</h3>
                        {groupedEntries[letter].map(entry => (
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

                    <div className="form-group">
                      <label htmlFor="edit-categories">Categories</label>
                      <input
                        id="edit-categories"
                        type="text"
                        value={editForm.categories}
                        onChange={(e) => setEditForm({ ...editForm, categories: e.target.value })}
                        placeholder="nature, tech, food, etc."
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
                        <Link to={`/word/${encodeURIComponent(entry.word)}`} className="entry-title-link">
                          <h2>{entry.word}</h2>
                        </Link>
                        {entry.part_of_speech && <span className="part-of-speech">{entry.part_of_speech}</span>}
                      </div>
                      {renderCategories(entry.categories)}
                      
                      {user && user.is_contributor && user.id === entry.created_by && (
                        <div className="dropdown-container">
                          <button
                            className="pencil-icon"
                            onClick={() => setOpenDropdown(openDropdown === entry.id ? null : entry.id)}
                            title="Edit entry"
                            aria-label="Edit entry"
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          {openDropdown === entry.id && (
                            <div className="dropdown-menu">
                              <button onClick={() => handleEdit(entry)} className="dropdown-item edit">
                                Edit
                              </button>
                              {user.is_admin && (
                                <button onClick={() => handleDelete(entry.id)} className="dropdown-item delete">
                                  Delete
                                </button>
                              )}
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
                    ))}
                  </div>
                </>
              );
            })()}
          </>
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

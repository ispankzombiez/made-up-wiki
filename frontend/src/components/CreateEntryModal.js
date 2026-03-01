import React, { useState } from 'react';
import { entriesAPI } from '../api';
import './CreateEntryModal.css';

function CreateEntryModal({ isOpen, onClose, onEntryCreated }) {
  const [formData, setFormData] = useState({
    word: '',
    partOfSpeech: '',
    pronunciation: '',
    definition: '',
    example: '',
    relatedWords: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.word.trim() || !formData.definition.trim()) {
      setError('Word and definition are required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await entriesAPI.create(
        formData.word,
        formData.partOfSpeech,
        formData.pronunciation,
        formData.definition,
        formData.example,
        formData.relatedWords
      );

      setMessage('Entry created successfully!');
      setFormData({
        word: '',
        partOfSpeech: '',
        pronunciation: '',
        definition: '',
        example: '',
        relatedWords: ''
      });

      setTimeout(() => {
        onEntryCreated(res.data);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Word</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-entry-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="word">Word *</label>
              <input
                id="word"
                type="text"
                name="word"
                value={formData.word}
                onChange={handleChange}
                placeholder="Enter the word"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="partOfSpeech">Part of Speech</label>
              <input
                id="partOfSpeech"
                type="text"
                name="partOfSpeech"
                value={formData.partOfSpeech}
                onChange={handleChange}
                placeholder="noun, verb, adj, etc."
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pronunciation">Pronunciation</label>
            <input
              id="pronunciation"
              type="text"
              name="pronunciation"
              value={formData.pronunciation}
              onChange={handleChange}
              placeholder="e.g., /ɪɡˈzæmpəl/"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="definition">Definition *</label>
            <textarea
              id="definition"
              name="definition"
              value={formData.definition}
              onChange={handleChange}
              placeholder="Enter the definition"
              rows="4"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="example">Example</label>
            <textarea
              id="example"
              name="example"
              value={formData.example}
              onChange={handleChange}
              placeholder="e.g., 'This is an example sentence.'"
              rows="2"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="relatedWords">Related Words</label>
            <input
              id="relatedWords"
              type="text"
              name="relatedWords"
              value={formData.relatedWords}
              onChange={handleChange}
              placeholder="word1, word2, word3"
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEntryModal;

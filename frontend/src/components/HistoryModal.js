import React, { useState, useEffect } from 'react';
import { entriesAPI } from '../api';
import './HistoryModal.css';

export default function HistoryModal({ entryId, isOpen, onClose, user, onRevertSuccess }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    if (isOpen && entryId) {
      loadHistory();
    }
  }, [isOpen, entryId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await entriesAPI.getHistory(entryId);
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (historyId) => {
    if (!window.confirm('Are you sure you want to revert to this version?')) {
      return;
    }

    setReverting(true);
    try {
      await entriesAPI.revertToHistory(entryId, historyId);
      setHistory([]);
      onClose();
      if (onRevertSuccess) {
        onRevertSuccess();
      }
    } catch (err) {
      setError('Failed to revert to this version');
      console.error(err);
    } finally {
      setReverting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal">
        <div className="history-modal-header">
          <h2>Version History</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="history-modal-content">
          {loading && <p className="loading">Loading history...</p>}
          {error && <p className="error-message">{error}</p>}
          
          {!loading && history.length === 0 && (
            <p className="empty-message">No history available for this entry.</p>
          )}

          {!loading && history.length > 0 && (
            <div className="history-list">
              {history.map((record, index) => (
                <div key={record.id} className="history-item">
                  <div 
                    className="history-item-header"
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                  >
                    <div className="history-date-info">
                      <span className="history-number">Version {history.length - index}</span>
                      <span className="history-date">
                        {new Date(record.created_at).toLocaleString()}
                      </span>
                      <span className="history-user">by {record.changed_by_username}</span>
                    </div>
                    <div className="history-action">
                      <span className="history-description">{record.change_description}</span>
                      <span className="expand-icon">{expandedId === record.id ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {expandedId === record.id && (
                    <div className="history-item-details">
                      <div className="history-field">
                        <label>Word:</label>
                        <span>{record.word}</span>
                      </div>
                      <div className="history-field">
                        <label>Definition:</label>
                        <span>{record.definition}</span>
                      </div>
                      {record.part_of_speech && (
                        <div className="history-field">
                          <label>Part of Speech:</label>
                          <span>{record.part_of_speech}</span>
                        </div>
                      )}
                      {record.pronunciation && (
                        <div className="history-field">
                          <label>Pronunciation:</label>
                          <span>{record.pronunciation}</span>
                        </div>
                      )}
                      {record.example && (
                        <div className="history-field">
                          <label>Example:</label>
                          <span>{record.example}</span>
                        </div>
                      )}
                      {record.categories && (
                        <div className="history-field">
                          <label>Categories:</label>
                          <span>{record.categories}</span>
                        </div>
                      )}

                      {user?.is_admin && index !== 0 && (
                        <button 
                          className="btn-revert"
                          onClick={() => handleRevert(record.id)}
                          disabled={reverting}
                        >
                          {reverting ? 'Reverting...' : 'Revert to This Version'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

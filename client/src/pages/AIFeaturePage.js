import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:4001/api';

function AIFeaturePage({ title, icon, description, endpoint, inputFields }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => {
    const initial = {};
    inputFields.forEach((field) => {
      initial[field.key] = '';
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentResponse, setCurrentResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [liveContext, setLiveContext] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ep = endpoint.startsWith('/api')
        ? endpoint.replace('/api', '')
        : endpoint;
      const res = await axios.post(`${API_BASE}${ep}`, formData, getAuthHeaders());

      // Capture live context if returned by backend
      if (res.data && res.data.live_context) {
        setLiveContext(res.data.live_context);
      }

      const responseData = {
        inputs: { ...formData },
        response: res.data,
        timestamp: new Date().toLocaleString(),
      };

      setCurrentResponse(responseData);
      setHistory((prev) => [responseData, ...prev]);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (err.response?.status === 429) {
        setError('Rate limit reached: Max 20 AI requests per hour. Please wait before trying again.');
        return;
      }
      setError(err.response?.data?.error || 'AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value, depth = 0) => {
    if (value === null || value === undefined) return <span className="ai-paragraph">N/A</span>;

    if (typeof value === 'string') {
      return <p className="ai-paragraph">{value}</p>;
    }

    if (typeof value === 'number') {
      return <span className="ai-metric-value">{value}</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="ai-tag">{value ? 'Yes' : 'No'}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <p className="ai-paragraph">No items</p>;

      if (typeof value[0] === 'string' || typeof value[0] === 'number') {
        return (
          <ul className="ai-list">
            {value.map((item, i) => (
              <li key={i}>{String(item)}</li>
            ))}
          </ul>
        );
      }

      return (
        <div>
          {value.map((item, i) => (
            <div key={i} style={{ marginBottom: '12px', paddingLeft: depth > 0 ? '16px' : '0' }}>
              {typeof item === 'object' && item !== null
                ? renderObject(item, depth + 1)
                : <p className="ai-paragraph">{String(item)}</p>
              }
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return renderObject(value, depth);
    }

    return <p className="ai-paragraph">{String(value)}</p>;
  };

  const renderObject = (obj, depth = 0) => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return <p className="ai-paragraph">No data</p>;

    const numericEntries = entries.filter(([, v]) => typeof v === 'number');
    const stringEntries = entries.filter(([, v]) => typeof v === 'string');
    const arrayEntries = entries.filter(([, v]) => Array.isArray(v));
    const objectEntries = entries.filter(([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v));
    const boolEntries = entries.filter(([, v]) => typeof v === 'boolean');

    return (
      <div>
        {/* Render numeric values as a metric grid */}
        {numericEntries.length > 0 && numericEntries.length <= 8 && depth < 2 && (
          <div className="ai-metric-grid">
            {numericEntries.map(([key, val]) => (
              <div className="ai-metric" key={key}>
                <span className="ai-metric-value">
                  {typeof val === 'number' && key.toLowerCase().includes('price')
                    ? `$${val.toFixed(2)}`
                    : typeof val === 'number' && key.toLowerCase().includes('percent')
                      ? `${val}%`
                      : val}
                </span>
                <div className="ai-metric-label">
                  {formatLabel(key)}
                </div>
              </div>
            ))}
          </div>
        )}

        {numericEntries.length > 8 && (
          <div className="ai-section">
            {numericEntries.map(([key, val]) => (
              <div className="ai-highlight" key={key}>
                <div className="ai-highlight-label">{formatLabel(key)}</div>
                <div className="ai-highlight-value">{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Render string values */}
        {stringEntries.map(([key, val]) => (
          <div className="ai-section" key={key}>
            {depth < 2 && <div className="ai-section-title">{formatLabel(key)}</div>}
            {depth >= 2 && <strong style={{ color: '#4c1d95', fontSize: '13px' }}>{formatLabel(key)}: </strong>}
            <p className="ai-paragraph">{val}</p>
          </div>
        ))}

        {/* Render boolean values */}
        {boolEntries.map(([key, val]) => (
          <div key={key} style={{ marginBottom: '8px' }}>
            <span className="ai-tag">{formatLabel(key)}: {val ? 'Yes' : 'No'}</span>
          </div>
        ))}

        {/* Render arrays */}
        {arrayEntries.map(([key, val]) => (
          <div className="ai-section" key={key}>
            <div className="ai-section-title">{formatLabel(key)}</div>
            {renderValue(val, depth + 1)}
          </div>
        ))}

        {/* Render nested objects */}
        {objectEntries.map(([key, val]) => (
          <div className="ai-section" key={key}>
            <div className="ai-section-title">{formatLabel(key)}</div>
            {renderValue(val, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  const formatLabel = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const parseAIContent = (response) => {
    if (!response) return null;
    // The backend returns { recommendation: "...", report: "...", analysis: "...", etc. }
    // Get the first non-null value from the response object
    let raw = response;
    if (typeof response === 'object' && !Array.isArray(response)) {
      const keys = Object.keys(response);
      for (const key of keys) {
        if (response[key] && typeof response[key] === 'string') {
          raw = response[key];
          break;
        }
        if (response[key] && typeof response[key] === 'object') {
          raw = response[key];
          break;
        }
      }
    }
    // If the raw content is a string, try to parse it as JSON
    if (typeof raw === 'string') {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch (e) { /* fall through */ }
      }
      // Try direct JSON parse
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Return as formatted text
        return raw;
      }
    }
    return raw;
  };

  const renderTextContent = (text) => {
    if (!text) return null;
    // Split by double newlines for paragraphs, render markdown-like formatting
    const sections = text.split(/\n\n+/);
    return (
      <div className="ai-text-content">
        {sections.map((section, i) => {
          const trimmed = section.trim();
          if (!trimmed) return null;
          // Check if it's a heading (starts with # or **)
          if (trimmed.startsWith('# ')) {
            return <h3 key={i} className="ai-section-title">{trimmed.replace(/^#+\s*/, '')}</h3>;
          }
          if (trimmed.startsWith('## ')) {
            return <h4 key={i} className="ai-section-title">{trimmed.replace(/^#+\s*/, '')}</h4>;
          }
          // Check if it's a list
          const lines = trimmed.split('\n');
          const isList = lines.every(l => /^\s*[-*•]\s/.test(l) || /^\s*\d+[.)]\s/.test(l));
          if (isList) {
            return (
              <ul key={i} className="ai-list">
                {lines.map((line, j) => (
                  <li key={j}>{line.replace(/^\s*[-*•]\s*/, '').replace(/^\s*\d+[.)]\s*/, '')}</li>
                ))}
              </ul>
            );
          }
          // Bold text handling
          const formatted = trimmed.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });
          return <p key={i} className="ai-paragraph">{formatted}</p>;
        })}
      </div>
    );
  };

  const renderResponse = (responseData) => {
    if (!responseData) return null;

    const { response, timestamp } = responseData;
    const content = parseAIContent(response);

    return (
      <div className="ai-response-card">
        <div className="ai-response-header">
          <span>{icon}</span>
          <h3>{title} Results</h3>
          <span className="timestamp">{timestamp}</span>
        </div>
        <div className="ai-response-body">
          {typeof content === 'string' ? renderTextContent(content) : renderValue(content)}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-page">
      <header className="ai-page-header">
        <div className="feature-page-header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            &larr; Back
          </button>
          <span className="page-icon">{icon}</span>
          <h1>
            {title}
            <span className="ai-header-badge">AI Powered</span>
          </h1>
        </div>
      </header>

      <div className="ai-page-content">
        <p className="ai-description">{description}</p>

        {error && (
          <div className="error-banner">
            <span>&#9888;</span> {error}
          </div>
        )}

        {liveContext && (
          <div className="ai-context-card" style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #e8f5e9 100%)',
            border: '1px solid #7dd3fc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            <strong style={{ color: '#0369a1' }}>&#128202; Live Data Context (sent to AI)</strong>
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(liveContext).map(([key, value]) => (
                <span key={key} style={{
                  background: '#fff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: '#0c4a6e',
                }}>
                  {key.replace(/_/g, ' ')}: <strong>{String(value)}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="ai-input-card">
          <h3>Input Parameters</h3>
          <form className="ai-input-form" onSubmit={handleSubmit}>
            {inputFields.map((field) => (
              <div className="form-group" key={field.key}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, field.type === 'number' ? e.target.value : e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    step={field.type === 'number' ? 'any' : undefined}
                  />
                )}
              </div>
            ))}
            <button type="submit" className="btn-ai-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>&#9889;</span> Run AI Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>AI is analyzing your data...</p>
          </div>
        )}

        {currentResponse && !loading && renderResponse(currentResponse)}

        {history.length > 1 && (
          <div className="ai-history-section">
            <h3>Previous Analyses</h3>
            {history.slice(1).map((item, index) => (
              <div
                key={index}
                className="ai-history-item"
                onClick={() => setCurrentResponse(item)}
              >
                <div className="history-meta">
                  <span>{icon}</span>
                  <span className="history-time">{item.timestamp}</span>
                </div>
                <div className="history-inputs">
                  {Object.entries(item.inputs)
                    .filter(([, v]) => v)
                    .map(([key, val]) => (
                      <span className="ai-tag" key={key}>
                        {formatLabel(key)}: {String(val).substring(0, 30)}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFeaturePage;

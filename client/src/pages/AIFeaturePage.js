import CompleteAIExamples, { AIRequiredButton } from "../components/CompleteAIExamples";
import AIReport from "../components/AIReport";
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = '/api';

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

  const formatLabel = (key) => key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();

  const renderResponse = (responseData) => {
    if (!responseData) return null;
    return (
      <div className="ai-response-card">
        <div className="ai-response-header">
          <span>{icon}</span>
          <h3>{title} Results</h3>
          <span className="timestamp">{responseData.timestamp}</span>
        </div>
        <div className="ai-response-body">
          <AIReport response={responseData.response} title={`${title} report`} />
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
          <CompleteAIExamples busy={loading} context="Golf operations planning"><form className="ai-input-form" onSubmit={handleSubmit}>
            {inputFields.map((field) => (
              <div className="form-group" key={field.key}>
                <label>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea data-ai-field={field.key}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : field.type === 'select' ? (
                  <select data-ai-field={field.key}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input data-ai-field={field.key}
                    type={field.type || 'text'}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, field.type === 'number' ? e.target.value : e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    step={field.type === 'number' ? 'any' : undefined}
                  />
                )}
              </div>
            ))}
            <AIRequiredButton data-ai-generate type="submit" className="btn-ai-submit" disabled={loading}>
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
            </AIRequiredButton>
          </form></CompleteAIExamples>
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

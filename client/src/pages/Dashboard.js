import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { featureConfigs, aiFeatureConfigs } from './features';

const API_BASE = 'http://localhost:4001/api';

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts = {};
      for (const config of featureConfigs) {
        try {
          const res = await axios.get(`${API_BASE}${config.apiEndpoint.replace('/api', '')}`, getAuthHeaders());
          const data = res.data;
          if (Array.isArray(data)) {
            newCounts[config.path] = data.length;
          } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
            newCounts[config.path] = data.data.length;
          } else if (data && typeof data.count === 'number') {
            newCounts[config.path] = data.count;
          }
        } catch (err) {
          newCounts[config.path] = 0;
        }
      }
      setCounts(newCounts);
    };

    fetchCounts();
  }, [getAuthHeaders]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <span className="header-icon">&#9971;</span>
          <div className="header-gold-bar"></div>
          <h1>Golf Course Operations Manager</h1>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-section-title">
          <span>Operations Management</span>
          <span className="section-line"></span>
        </div>

        <div className="feature-grid">
          {featureConfigs.map((config) => (
            <div
              key={config.path}
              className="feature-card"
              onClick={() => navigate(`/${config.path}`)}
            >
              <span className="feature-card-icon">{config.icon}</span>
              <h3>{config.title}</h3>
              <p>{config.description}</p>
              {typeof counts[config.path] === 'number' && (
                <span className="feature-card-count">
                  {counts[config.path]} {counts[config.path] === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="dashboard-section-title">
          <span>AI-Powered Features</span>
          <span className="section-line"></span>
        </div>

        <div className="ai-feature-grid">
          {aiFeatureConfigs.map((config) => (
            <div
              key={config.path}
              className="ai-feature-card"
              onClick={() => navigate(`/${config.path}`)}
            >
              <span className="ai-badge">AI Powered</span>
              <span className="feature-card-icon">{config.icon}</span>
              <h3>{config.title}</h3>
              <p>{config.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

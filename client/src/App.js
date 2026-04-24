import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIFeaturePage from './pages/AIFeaturePage';
import { featureConfigs, aiFeatureConfigs } from './pages/features';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {featureConfigs.map((config) => (
          <Route
            key={config.path}
            path={`/${config.path}`}
            element={
              <ProtectedRoute>
                <FeaturePage
                  title={config.title}
                  icon={config.icon}
                  apiEndpoint={config.apiEndpoint}
                  columns={config.columns}
                  formFields={config.formFields}
                />
              </ProtectedRoute>
            }
          />
        ))}
        {aiFeatureConfigs.map((config) => (
          <Route
            key={config.path}
            path={`/${config.path}`}
            element={
              <ProtectedRoute>
                <AIFeaturePage
                  title={config.title}
                  icon={config.icon}
                  description={config.description}
                  endpoint={config.endpoint}
                  inputFields={config.inputFields}
                />
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIFeaturePage from './pages/AIFeaturePage';
import { featureConfigs, aiFeatureConfigs } from './pages/features';

// === Batch 04 Gaps & Frontend Mounts ===
import CfAgenticCourseMarshalMonitoringPaceA from './pages/CfAgenticCourseMarshalMonitoringPaceA';
import CfDynamicPricingEngineAdjustingBySeas from './pages/CfDynamicPricingEngineAdjustingBySeas';
import CfMemberLtvChurnPredictionWithTargete from './pages/CfMemberLtvChurnPredictionWithTargete';
import CfPersonalizedSwingAnalysisFromMember from './pages/CfPersonalizedSwingAnalysisFromMember';
import CfCourseConditionFeedbackLoopUsingCou from './pages/CfCourseConditionFeedbackLoopUsingCou';
import CfStatisticalLeaderboardAddOnForTourn from './pages/CfStatisticalLeaderboardAddOnForTourn';
import GapNoRoundPairingOptimizationForFourso from './pages/GapNoRoundPairingOptimizationForFourso';
import GapNoFacilityUtilizationForecasting from './pages/GapNoFacilityUtilizationForecasting';
import GapNoMemberRetentionInterventionAi from './pages/GapNoMemberRetentionInterventionAi';
import GapNoTournamentFormatRecommender from './pages/GapNoTournamentFormatRecommender';
import GapNoSwingAnalysisVisionAi from './pages/GapNoSwingAnalysisVisionAi';
import GapNoPaymentProcessingSurface from './pages/GapNoPaymentProcessingSurface';
import GapNoWebhookIntegrationWithUsgaGhin from './pages/GapNoWebhookIntegrationWithUsgaGhin';
import GapNoRealTimeCourseStatusFeed from './pages/GapNoRealTimeCourseStatusFeed';
import GapNoOnCourseMobileMessaging from './pages/GapNoOnCourseMobileMessaging';
import GapNoFileUploadForSwingVideos from './pages/GapNoFileUploadForSwingVideos';
import GapNoAuditLog from './pages/GapNoAuditLog';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';
import TurfStressIrrigationPlanner from './pages/TurfStressIrrigationPlanner';

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
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

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
          {/* // === Batch 04 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-course-marshal-monitoring-pace-a" element={<CfAgenticCourseMarshalMonitoringPaceA />} />
          <Route path="/cf-dynamic-pricing-engine-adjusting-by-seas" element={<CfDynamicPricingEngineAdjustingBySeas />} />
          <Route path="/cf-member-ltv-churn-prediction-with-targete" element={<CfMemberLtvChurnPredictionWithTargete />} />
          <Route path="/cf-personalized-swing-analysis-from-member-" element={<CfPersonalizedSwingAnalysisFromMember />} />
          <Route path="/cf-course-condition-feedback-loop-using-cou" element={<CfCourseConditionFeedbackLoopUsingCou />} />
          <Route path="/cf-statistical-leaderboard-add-on-for-tourn" element={<CfStatisticalLeaderboardAddOnForTourn />} />
          <Route path="/gap-no-round-pairing-optimization-for-fourso" element={<GapNoRoundPairingOptimizationForFourso />} />
          <Route path="/gap-no-facility-utilization-forecasting" element={<GapNoFacilityUtilizationForecasting />} />
          <Route path="/gap-no-member-retention-intervention-ai" element={<GapNoMemberRetentionInterventionAi />} />
          <Route path="/gap-no-tournament-format-recommender" element={<GapNoTournamentFormatRecommender />} />
          <Route path="/gap-no-swing-analysis-vision-ai" element={<GapNoSwingAnalysisVisionAi />} />
          <Route path="/gap-no-payment-processing-surface" element={<GapNoPaymentProcessingSurface />} />
          <Route path="/gap-no-webhook-integration-with-usga-ghin" element={<GapNoWebhookIntegrationWithUsgaGhin />} />
          <Route path="/gap-no-real-time-course-status-feed" element={<GapNoRealTimeCourseStatusFeed />} />
          <Route path="/gap-no-on-course-mobile-messaging" element={<GapNoOnCourseMobileMessaging />} />
          <Route path="/gap-no-file-upload-for-swing-videos" element={<GapNoFileUploadForSwingVideos />} />
          <Route path="/gap-no-audit-log" element={<GapNoAuditLog />} />
          <Route path="/turf-stress-irrigation-planner" element={<ProtectedRoute><TurfStressIrrigationPlanner /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

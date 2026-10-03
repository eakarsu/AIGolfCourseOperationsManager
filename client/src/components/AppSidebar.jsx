import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { featureConfigs, aiFeatureConfigs } from '../pages/features';
import './AppSidebar.css';

const STATIC_LINKS = [
  ...featureConfigs.map(feature => ({ to: `/${feature.path}`, label: feature.title, group: 'Workspace' })),
  ...aiFeatureConfigs.map(feature => ({ to: `/${feature.path}`, label: feature.title, group: 'AI tools' })),
  { to: '/insights/timeline', label: 'Timeline View', group: 'Insights' },
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/dashboard', label: 'Dashboard', group: 'Workspace' },
  { to: '/cf-agentic-course-marshal-monitoring-pace-a', label: 'Cf Agentic Course Marshal Monitoring Pace A', group: 'Workspace' },
  { to: '/cf-dynamic-pricing-engine-adjusting-by-seas', label: 'Cf Dynamic Pricing Engine Adjusting By Seas', group: 'Workspace' },
  { to: '/cf-member-ltv-churn-prediction-with-targete', label: 'Cf Member Ltv Churn Prediction With Targete', group: 'Workspace' },
  { to: '/cf-personalized-swing-analysis-from-member-', label: 'Cf Personalized Swing Analysis From Member', group: 'Workspace' },
  { to: '/cf-course-condition-feedback-loop-using-cou', label: 'Cf Course Condition Feedback Loop Using Cou', group: 'Workspace' },
  { to: '/cf-statistical-leaderboard-add-on-for-tourn', label: 'Cf Statistical Leaderboard Add On For Tourn', group: 'Workspace' },
  { to: '/gap-no-round-pairing-optimization-for-fourso', label: 'Gap No Round Pairing Optimization For Fourso', group: 'Workspace' },
  { to: '/gap-no-facility-utilization-forecasting', label: 'Gap No Facility Utilization Forecasting', group: 'Workspace' },
  { to: '/gap-no-member-retention-intervention-ai', label: 'Gap No Member Retention Intervention Ai', group: 'Workspace' },
  { to: '/gap-no-tournament-format-recommender', label: 'Gap No Tournament Format Recommender', group: 'Workspace' },
  { to: '/gap-no-swing-analysis-vision-ai', label: 'Gap No Swing Analysis Vision Ai', group: 'Workspace' },
  { to: '/gap-no-payment-processing-surface', label: 'Gap No Payment Processing Surface', group: 'Workspace' },
  { to: '/gap-no-webhook-integration-with-usga-ghin', label: 'Gap No Webhook Integration With Usga Ghin', group: 'Workspace' },
  { to: '/gap-no-real-time-course-status-feed', label: 'Gap No Real Time Course Status Feed', group: 'Workspace' },
  { to: '/gap-no-on-course-mobile-messaging', label: 'Gap No On Course Mobile Messaging', group: 'Workspace' },
  { to: '/gap-no-file-upload-for-swing-videos', label: 'Gap No File Upload For Swing Videos', group: 'Workspace' },
  { to: '/gap-no-audit-log', label: 'Gap No Audit Log', group: 'Workspace' },
  { to: '/turf-stress-irrigation-planner', label: 'Turf Stress Irrigation Planner', group: 'Workspace' },
];

export default function AppSidebar({ extraLinks = [] }) {
  const LINKS = [...STATIC_LINKS, ...extraLinks];
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AIGolf Course Operations Manager</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}

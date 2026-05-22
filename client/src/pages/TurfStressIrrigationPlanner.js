import React, { useEffect, useState } from 'react';

export default function TurfStressIrrigationPlanner() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem('token');
  useEffect(() => {
    fetch('/api/turf-stress-irrigation-planner', { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => r.json()).then(setData).catch(() => {});
  }, [token]);
  return (
    <div style={{ padding: 24 }}>
      <h1>Turf Stress Irrigation Planner</h1>
      <p>Ranks greens by moisture, canopy temperature, traffic, and recommended watering window.</p>
      {data?.windows?.map((w) => (
        <div key={w.hole} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 12 }}>
          <h3>Hole {w.hole}: {w.priority}</h3>
          <p>Stress {w.stress_score}. Irrigate {w.irrigation_minutes} minutes.</p>
        </div>
      ))}
    </div>
  );
}

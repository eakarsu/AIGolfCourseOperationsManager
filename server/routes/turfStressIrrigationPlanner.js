const express = require('express');

const router = express.Router();

function plan(input = {}) {
  const greens = input.greens || [
    { hole: 2, moisture_pct: 17, canopy_temp_f: 91, foot_traffic: 'high' },
    { hole: 8, moisture_pct: 24, canopy_temp_f: 86, foot_traffic: 'medium' },
    { hole: 15, moisture_pct: 13, canopy_temp_f: 94, foot_traffic: 'high' },
  ];
  return {
    windows: greens.map((g) => {
      const stress = Math.min(100, Math.round((30 - Number(g.moisture_pct)) * 2.4 + (Number(g.canopy_temp_f) - 80) * 2 + (g.foot_traffic === 'high' ? 15 : 6)));
      return { ...g, stress_score: stress, irrigation_minutes: Math.max(4, Math.round(stress / 5)), priority: stress >= 70 ? 'night_cycle' : stress >= 45 ? 'syringe_cycle' : 'monitor' };
    }),
  };
}

router.get('/', (req, res) => res.json(plan()));
router.post('/plan', (req, res) => res.json(plan(req.body || {})));

module.exports = router;

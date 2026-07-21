// Member LTV + churn prediction with targeted retention offers.
// Audit: batch_04.md / AIGolfCourseOperationsManager / Custom Feature Suggestions #3
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
router.use(authMiddleware);

async function callAI(systemPrompt, userPrompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
  const { data: d } = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3, max_tokens: 2500
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'Golf Course - Member LTV / Churn'
    }
  });
  if (d.error) throw new Error(d.error.message || 'AI failed');
  return d.choices[0].message.content;
}

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/member-ltv/score { member_id? }
router.post('/score', async (req, res) => {
  try {
    const { member_id } = req.body || {};

    let members = { rows: [] };
    try {
      if (member_id) {
        members = await pool.query(`SELECT * FROM memberships WHERE id = $1`, [member_id]);
      } else {
        members = await pool.query(
          `SELECT id, member_name, tier, join_date, last_visit_at, annual_spend, satisfaction_score
           FROM memberships ORDER BY annual_spend DESC NULLS LAST LIMIT 30`
        );
      }
    } catch (_) {}

    const systemPrompt = `You are a member lifecycle analyst for a private golf club. Score members on
predicted LTV and 12-month churn probability. Recommend targeted retention offers per segment. Return STRICT JSON.`;

    const userPrompt = `Members: ${JSON.stringify(members.rows)}

Return JSON:
{
  "summary": "...",
  "scored": [
    {
      "member_id": 0,
      "predicted_ltv_usd": 0,
      "churn_probability_pct": 0,
      "risk_tier": "low|medium|high",
      "key_signals": ["..."],
      "recommended_retention_offer": "string",
      "offer_estimated_uplift_pct": 0
    }
  ],
  "portfolio_actions": ["..."],
  "disclaimer": "Predictions heuristic; calibrate with historical retention data."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    res.json({ member_count: members.rows.length, scoring: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/at-risk', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, member_name, tier, last_visit_at FROM memberships
       WHERE last_visit_at < NOW() - INTERVAL '60 days' ORDER BY annual_spend DESC NULLS LAST LIMIT 50`
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

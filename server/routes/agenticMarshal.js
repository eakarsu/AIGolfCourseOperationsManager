// Agentic course marshal monitoring pace and nudging slow groups in real-time.
// Audit: batch_04.md / AIGolfCourseOperationsManager / Custom Feature Suggestions #1
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
    temperature: 0.3, max_tokens: 2000
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'Golf Course - Agentic Marshal'
    }
  });
  if (d.error) throw new Error(d.error.message || 'AI failed');
  return d.choices[0].message.content;
}

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/agentic-marshal/scan { course_id?, target_pace_minutes? }
router.post('/scan', async (req, res) => {
  try {
    const { course_id, target_pace_minutes = 14 } = req.body || {};

    let paceRecords = { rows: [] };
    let teeTimes = { rows: [] };
    try {
      paceRecords = await pool.query(
        `SELECT * FROM pace_of_play WHERE recorded_at > NOW() - INTERVAL '4 hours' ORDER BY recorded_at DESC LIMIT 100`
      );
    } catch (_) {}
    try {
      teeTimes = await pool.query(
        `SELECT id, group_size, scheduled_at, status FROM tee_times
         WHERE scheduled_at::date = CURRENT_DATE ORDER BY scheduled_at LIMIT 100`
      );
    } catch (_) {}

    const systemPrompt = `You are an agentic golf-course marshal. Detect slow groups exceeding the target hole
pace, prioritize nudges, and recommend marshal actions (radio nudge, in-person visit, hole-skip suggestion).
Return STRICT JSON only.`;

    const userPrompt = `Course: ${course_id || 'main'}
Target pace per hole (minutes): ${target_pace_minutes}
Recent pace records: ${JSON.stringify(paceRecords.rows.slice(0, 30))}
Today's tee times: ${JSON.stringify(teeTimes.rows.slice(0, 30))}

Return JSON:
{
  "summary": "...",
  "slow_groups": [{ "tee_time_id": 0, "current_hole": 0, "minutes_behind": 0, "severity": "low|medium|high" }],
  "recommended_actions": [{ "tee_time_id": 0, "action": "radio_nudge|in_person|skip_hole|alert_pro_shop", "message_template": "string" }],
  "overall_pace_health": "good|stretched|backed_up",
  "next_check_in_minutes": 0,
  "disclaimer": "Recommendations advisory; marshal retains discretion."
}`;

    const raw = await callAI(systemPrompt, userPrompt);
    res.json({ course_id: course_id || null, target_pace_minutes, scan: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active-groups', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, group_size, scheduled_at, status FROM tee_times WHERE status = 'on_course' LIMIT 50`
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

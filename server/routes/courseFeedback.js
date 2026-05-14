/*
 * routes/courseFeedback.js — Course-condition member feedback loop.
 *
 * Pass 5 mechanical addition: closes custom-features backlog "Course-
 * condition feedback loop (post-round member ratings)". Mechanical CRUD +
 * aggregate scoring; no AI calls. Uses existing pool + JWT auth (mounted
 * under `/api`).
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

const DIMENSIONS = ['greens_speed', 'greens_smoothness', 'fairways', 'tee_boxes', 'rough', 'bunkers', 'pace_of_play', 'overall'];

let _ensured = false;
async function ensureTable() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS course_feedback (
      id SERIAL PRIMARY KEY,
      member_id INTEGER,
      tee_time_id INTEGER,
      played_on DATE,
      greens_speed INTEGER,
      greens_smoothness INTEGER,
      fairways INTEGER,
      tee_boxes INTEGER,
      rough INTEGER,
      bunkers INTEGER,
      pace_of_play INTEGER,
      overall INTEGER,
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_played_on ON course_feedback(played_on);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTable(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });

router.get('/dimensions', (req, res) => res.json({ dimensions: DIMENSIONS }));

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM course_feedback ORDER BY played_on DESC NULLS LAST, created_at DESC LIMIT 100`);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const cols = ['member_id','tee_time_id','played_on','greens_speed','greens_smoothness','fairways','tee_boxes','rough','bunkers','pace_of_play','overall','comments'];
    const vals = cols.map((c) => b[c] ?? null);
    // Validate ratings 1-5
    for (const dim of DIMENSIONS) {
      if (b[dim] != null && (Number(b[dim]) < 1 || Number(b[dim]) > 5)) return res.status(400).json({ error: `${dim} must be 1-5` });
    }
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
    const r = await pool.query(`INSERT INTO course_feedback (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`, vals);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Aggregates for the last 30 days (or any window)
router.get('/aggregate', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30', 10);
    const r = await pool.query(`
      SELECT
        COUNT(*)::int AS responses,
        AVG(greens_speed)::numeric(3,2) AS greens_speed,
        AVG(greens_smoothness)::numeric(3,2) AS greens_smoothness,
        AVG(fairways)::numeric(3,2) AS fairways,
        AVG(tee_boxes)::numeric(3,2) AS tee_boxes,
        AVG(rough)::numeric(3,2) AS rough,
        AVG(bunkers)::numeric(3,2) AS bunkers,
        AVG(pace_of_play)::numeric(3,2) AS pace_of_play,
        AVG(overall)::numeric(3,2) AS overall
      FROM course_feedback
      WHERE COALESCE(played_on, created_at::date) >= CURRENT_DATE - ($1 || ' days')::interval
    `, [days]);
    const agg = r.rows[0];
    // Maintenance priority: dimensions with avg < 3.5 ranked ascending
    const priorities = DIMENSIONS
      .map((d) => ({ dimension: d, avg: agg[d] != null ? Number(agg[d]) : null }))
      .filter((x) => x.avg != null && x.avg < 3.5)
      .sort((a, b) => a.avg - b.avg);
    res.json({ window_days: days, aggregate: agg, maintenance_priorities: priorities });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

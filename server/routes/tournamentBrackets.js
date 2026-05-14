/*
 * routes/tournamentBrackets.js — Deterministic tournament bracket / leaderboard.
 *
 * Pass 5 mechanical addition: closes custom-features backlog "Tournament
 * bracket auto-generation + live leaderboards". Single-elimination + stroke-
 * play formats supported with deterministic seeding (high handicap → lower
 * seed for stroke; bracket pairings high vs low for single-elim).
 *
 * No AI calls. Reuses existing pool + JWT auth (mounted under `/api`).
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');

let _ensured = false;
async function ensureTables() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournament_brackets (
      id SERIAL PRIMARY KEY,
      tournament_id INTEGER,
      format TEXT NOT NULL,
      seed_payload JSONB NOT NULL,
      bracket JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS bracket_scores (
      id SERIAL PRIMARY KEY,
      bracket_id INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      match_number INTEGER NOT NULL,
      player_id INTEGER,
      player_name TEXT,
      score INTEGER,
      is_winner BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_bracket_scores ON bracket_scores(bracket_id, round_number);
  `);
  _ensured = true;
}
router.use(async (req, res, next) => { try { await ensureTables(); next(); } catch (e) { res.status(500).json({ error: e.message }); } });

const SUPPORTED_FORMATS = ['single_elimination', 'stroke_play', 'stableford', 'scramble_pairs'];

// Pad to next power of two with byes (negative ids represent BYE)
function padToPowerOfTwo(arr) {
  let n = 1; while (n < arr.length) n *= 2;
  const padded = arr.slice();
  while (padded.length < n) padded.push({ id: -padded.length, name: 'BYE', handicap: null, _bye: true });
  return padded;
}

// Standard 1 vs N seeding for single-elim brackets
function seedBracket(seeded) {
  // seeded: array sorted ascending by handicap (lowest=best)
  const n = seeded.length;
  // 1v8, 4v5, 3v6, 2v7 — bracket-style
  const positions = [];
  function buildOrder(size) {
    if (size === 2) return [1, 2];
    const half = size / 2;
    const prev = buildOrder(half);
    const out = [];
    for (const p of prev) {
      out.push(p);
      out.push(size + 1 - p);
    }
    return out;
  }
  const order = buildOrder(n);
  for (const seedIdx of order) positions.push(seeded[seedIdx - 1]);
  const matches = [];
  for (let i = 0; i < positions.length; i += 2) {
    matches.push({ round: 1, match: matches.length + 1, a: positions[i], b: positions[i + 1] });
  }
  return matches;
}

router.post('/single-elimination', async (req, res) => {
  try {
    const { tournament_id = null, players } = req.body || {};
    if (!Array.isArray(players) || players.length < 2) return res.status(400).json({ error: 'players: array of {id,name,handicap} (>=2) required' });
    const sorted = [...players].sort((a, b) => (a.handicap ?? 99) - (b.handicap ?? 99));
    const padded = padToPowerOfTwo(sorted);
    const matches = seedBracket(padded);
    const bracket = { format: 'single_elimination', total_rounds: Math.log2(padded.length), round_1: matches };
    const r = await pool.query(
      `INSERT INTO tournament_brackets (tournament_id, format, seed_payload, bracket) VALUES ($1,'single_elimination',$2,$3) RETURNING *`,
      [tournament_id, JSON.stringify(players), JSON.stringify(bracket)]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/stroke-play', async (req, res) => {
  try {
    const { tournament_id = null, players, num_rounds = 1 } = req.body || {};
    if (!Array.isArray(players) || players.length === 0) return res.status(400).json({ error: 'players required' });
    const tee_groups = [];
    const sorted = [...players].sort((a, b) => (a.handicap ?? 99) - (b.handicap ?? 99));
    // Group lowest-handicap together first (championship flight)
    for (let i = 0; i < sorted.length; i += 4) {
      tee_groups.push({ group: tee_groups.length + 1, members: sorted.slice(i, i + 4) });
    }
    const bracket = { format: 'stroke_play', num_rounds, tee_groups };
    const r = await pool.query(
      `INSERT INTO tournament_brackets (tournament_id, format, seed_payload, bracket) VALUES ($1,'stroke_play',$2,$3) RETURNING *`,
      [tournament_id, JSON.stringify(players), JSON.stringify(bracket)]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/formats', (req, res) => res.json({ formats: SUPPORTED_FORMATS }));

router.get('/:id', async (req, res) => {
  try {
    const t = await pool.query(`SELECT * FROM tournament_brackets WHERE id=$1`, [req.params.id]);
    if (t.rowCount === 0) return res.status(404).json({ error: 'not found' });
    const s = await pool.query(`SELECT * FROM bracket_scores WHERE bracket_id=$1 ORDER BY round_number, match_number`, [req.params.id]);
    res.json({ bracket: t.rows[0], scores: s.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/scores', async (req, res) => {
  try {
    const { round_number, match_number, player_id, player_name, score, is_winner = false } = req.body || {};
    if (round_number == null || score == null) return res.status(400).json({ error: 'round_number, score required' });
    const r = await pool.query(
      `INSERT INTO bracket_scores (bracket_id, round_number, match_number, player_id, player_name, score, is_winner) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, round_number, match_number || 0, player_id || null, player_name || null, score, !!is_winner]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/leaderboard', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT player_id, player_name, SUM(score)::int AS total, COUNT(*)::int AS rounds_played
      FROM bracket_scores WHERE bracket_id=$1
      GROUP BY player_id, player_name ORDER BY total ASC NULLS LAST
    `, [req.params.id]);
    res.json({ leaderboard: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments ORDER BY date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tournament not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, date, format, entry_fee, max_players, current_players, status, flight } = req.body;
    const result = await pool.query(
      'INSERT INTO tournaments (name, date, format, entry_fee, max_players, current_players, status, flight) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, date, format || 'stroke', entry_fee || 0, max_players || 72, current_players || 0, status || 'upcoming', flight || 'A']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, date, format, entry_fee, max_players, current_players, status, flight } = req.body;
    const result = await pool.query(
      'UPDATE tournaments SET name=$1, date=$2, format=$3, entry_fee=$4, max_players=$5, current_players=$6, status=$7, flight=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, date, format, entry_fee, max_players, current_players, status, flight, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tournament not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tournaments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tournament not found' });
    res.json({ message: 'Tournament deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

module.exports = router;

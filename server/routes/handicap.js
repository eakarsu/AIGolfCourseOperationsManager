const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM handicaps ORDER BY player_name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch handicaps' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM handicaps WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Handicap record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch handicap' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { player_name, handicap_index, rounds_played, last_round_date, trend } = req.body;
    const result = await pool.query(
      'INSERT INTO handicaps (player_name, handicap_index, rounds_played, last_round_date, trend) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [player_name, handicap_index, rounds_played || 0, last_round_date, trend || 'stable']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create handicap record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { player_name, handicap_index, rounds_played, last_round_date, trend } = req.body;
    const result = await pool.query(
      'UPDATE handicaps SET player_name=$1, handicap_index=$2, rounds_played=$3, last_round_date=$4, trend=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [player_name, handicap_index, rounds_played, last_round_date, trend, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Handicap record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update handicap' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM handicaps WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Handicap record not found' });
    res.json({ message: 'Handicap record deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete handicap' });
  }
});

module.exports = router;

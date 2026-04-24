const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pace_of_play ORDER BY date DESC, hole_number');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pace of play records' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pace_of_play WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, hole_number, group_id, time_minutes, status, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO pace_of_play (date, hole_number, group_id, time_minutes, status, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [date, hole_number, group_id, time_minutes, status || 'on_pace', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { date, hole_number, group_id, time_minutes, status, notes } = req.body;
    const result = await pool.query(
      'UPDATE pace_of_play SET date=$1, hole_number=$2, group_id=$3, time_minutes=$4, status=$5, notes=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [date, hole_number, group_id, time_minutes, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pace_of_play WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;

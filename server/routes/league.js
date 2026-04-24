const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leagues ORDER BY start_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leagues WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'League not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch league' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, format, start_date, end_date, members_count, day_of_week, status, fee } = req.body;
    const result = await pool.query(
      'INSERT INTO leagues (name, format, start_date, end_date, members_count, day_of_week, status, fee) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, format, start_date, end_date, members_count || 0, day_of_week, status || 'active', fee || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create league' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, format, start_date, end_date, members_count, day_of_week, status, fee } = req.body;
    const result = await pool.query(
      'UPDATE leagues SET name=$1, format=$2, start_date=$3, end_date=$4, members_count=$5, day_of_week=$6, status=$7, fee=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, format, start_date, end_date, members_count, day_of_week, status, fee, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'League not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update league' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM leagues WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'League not found' });
    res.json({ message: 'League deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete league' });
  }
});

module.exports = router;

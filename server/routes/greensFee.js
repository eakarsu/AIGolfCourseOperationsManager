const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM greens_fees ORDER BY fee_type, day_type');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch greens fees' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM greens_fees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Greens fee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch greens fee' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { fee_type, rate, day_type, season, cart_included, holes } = req.body;
    const result = await pool.query(
      'INSERT INTO greens_fees (fee_type, rate, day_type, season, cart_included, holes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [fee_type, rate, day_type || 'weekday', season || 'regular', cart_included || false, holes || 18]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create greens fee' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { fee_type, rate, day_type, season, cart_included, holes } = req.body;
    const result = await pool.query(
      'UPDATE greens_fees SET fee_type=$1, rate=$2, day_type=$3, season=$4, cart_included=$5, holes=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [fee_type, rate, day_type, season, cart_included, holes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Greens fee not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update greens fee' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM greens_fees WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Greens fee not found' });
    res.json({ message: 'Greens fee deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete greens fee' });
  }
});

module.exports = router;

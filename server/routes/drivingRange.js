const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM driving_range ORDER BY bucket_type');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch driving range data' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM driving_range WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { bucket_type, price, balls_count, inventory, session_date } = req.body;
    const result = await pool.query(
      'INSERT INTO driving_range (bucket_type, price, balls_count, inventory, session_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [bucket_type, price, balls_count, inventory || 0, session_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { bucket_type, price, balls_count, inventory, session_date } = req.body;
    const result = await pool.query(
      'UPDATE driving_range SET bucket_type=$1, price=$2, balls_count=$3, inventory=$4, session_date=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [bucket_type, price, balls_count, inventory, session_date, req.params.id]
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
    const result = await pool.query('DELETE FROM driving_range WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM practice_facilities ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch practice facilities' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM practice_facilities WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Facility not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, status, capacity, operating_hours, equipment } = req.body;
    const result = await pool.query(
      'INSERT INTO practice_facilities (name, type, status, capacity, operating_hours, equipment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, type, status || 'open', capacity || 20, operating_hours || '6:00 AM - 8:00 PM', equipment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, status, capacity, operating_hours, equipment } = req.body;
    const result = await pool.query(
      'UPDATE practice_facilities SET name=$1, type=$2, status=$3, capacity=$4, operating_hours=$5, equipment=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, type, status, capacity, operating_hours, equipment, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Facility not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update facility' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM practice_facilities WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Facility not found' });
    res.json({ message: 'Facility deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete facility' });
  }
});

module.exports = router;

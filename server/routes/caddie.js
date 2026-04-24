const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM caddies ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch caddies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM caddies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Caddie not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch caddie' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, experience_years, rating, availability, certifications, hourly_rate } = req.body;
    const result = await pool.query(
      'INSERT INTO caddies (name, experience_years, rating, availability, certifications, hourly_rate) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, experience_years || 0, rating || 5.0, availability || 'available', certifications, hourly_rate || 25]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create caddie' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, experience_years, rating, availability, certifications, hourly_rate } = req.body;
    const result = await pool.query(
      'UPDATE caddies SET name=$1, experience_years=$2, rating=$3, availability=$4, certifications=$5, hourly_rate=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, experience_years, rating, availability, certifications, hourly_rate, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Caddie not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update caddie' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM caddies WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Caddie not found' });
    res.json({ message: 'Caddie deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete caddie' });
  }
});

module.exports = router;

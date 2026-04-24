const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM marshals ORDER BY date, shift');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch marshals' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM marshals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marshal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch marshal' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, shift, date, area, status, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO marshals (name, shift, date, area, status, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, shift || 'morning', date, area, status || 'scheduled', phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create marshal' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, shift, date, area, status, phone } = req.body;
    const result = await pool.query(
      'UPDATE marshals SET name=$1, shift=$2, date=$3, area=$4, status=$5, phone=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, shift, date, area, status, phone, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marshal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update marshal' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM marshals WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marshal not found' });
    res.json({ message: 'Marshal deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete marshal' });
  }
});

module.exports = router;

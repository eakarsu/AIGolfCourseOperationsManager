const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons ORDER BY date, time');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { student_name, pro_name, date, time, duration, type, status, price } = req.body;
    const result = await pool.query(
      'INSERT INTO lessons (student_name, pro_name, date, time, duration, type, status, price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [student_name, pro_name, date, time, duration || 60, type || 'individual', status || 'scheduled', price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { student_name, pro_name, date, time, duration, type, status, price } = req.body;
    const result = await pool.query(
      'UPDATE lessons SET student_name=$1, pro_name=$2, date=$3, time=$4, duration=$5, type=$6, status=$7, price=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [student_name, pro_name, date, time, duration, type, status, price, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lessons WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

module.exports = router;

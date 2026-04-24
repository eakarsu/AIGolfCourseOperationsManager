const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lockers ORDER BY locker_number');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lockers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lockers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Locker not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch locker' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { locker_number, member_name, size, status, annual_fee, expiry_date } = req.body;
    const result = await pool.query(
      'INSERT INTO lockers (locker_number, member_name, size, status, annual_fee, expiry_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [locker_number, member_name, size || 'standard', status || 'available', annual_fee || 200, expiry_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create locker' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { locker_number, member_name, size, status, annual_fee, expiry_date } = req.body;
    const result = await pool.query(
      'UPDATE lockers SET locker_number=$1, member_name=$2, size=$3, status=$4, annual_fee=$5, expiry_date=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [locker_number, member_name, size, status, annual_fee, expiry_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Locker not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update locker' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lockers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Locker not found' });
    res.json({ message: 'Locker deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete locker' });
  }
});

module.exports = router;

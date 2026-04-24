const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bag_storage ORDER BY member_name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bag storage records' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bag_storage WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_name, bag_brand, storage_location, monthly_fee, start_date, status } = req.body;
    const result = await pool.query(
      'INSERT INTO bag_storage (member_name, bag_brand, storage_location, monthly_fee, start_date, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [member_name, bag_brand, storage_location, monthly_fee || 25, start_date, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { member_name, bag_brand, storage_location, monthly_fee, start_date, status } = req.body;
    const result = await pool.query(
      'UPDATE bag_storage SET member_name=$1, bag_brand=$2, storage_location=$3, monthly_fee=$4, start_date=$5, status=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [member_name, bag_brand, storage_location, monthly_fee, start_date, status, req.params.id]
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
    const result = await pool.query('DELETE FROM bag_storage WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM golf_carts ORDER BY cart_number');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch golf carts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM golf_carts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Golf cart not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch golf cart' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cart_number, status, last_maintenance, next_maintenance, gps_enabled, battery_level, mileage } = req.body;
    const result = await pool.query(
      'INSERT INTO golf_carts (cart_number, status, last_maintenance, next_maintenance, gps_enabled, battery_level, mileage) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [cart_number, status || 'available', last_maintenance, next_maintenance, gps_enabled !== false, battery_level || 100, mileage || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create golf cart' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { cart_number, status, last_maintenance, next_maintenance, gps_enabled, battery_level, mileage } = req.body;
    const result = await pool.query(
      'UPDATE golf_carts SET cart_number=$1, status=$2, last_maintenance=$3, next_maintenance=$4, gps_enabled=$5, battery_level=$6, mileage=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [cart_number, status, last_maintenance, next_maintenance, gps_enabled, battery_level, mileage, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Golf cart not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update golf cart' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM golf_carts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Golf cart not found' });
    res.json({ message: 'Golf cart deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete golf cart' });
  }
});

module.exports = router;

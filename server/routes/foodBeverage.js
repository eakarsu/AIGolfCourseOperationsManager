const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_beverage ORDER BY category, item_name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch food & beverage items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_beverage WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { item_name, category, price, available, description, calories } = req.body;
    const result = await pool.query(
      'INSERT INTO food_beverage (item_name, category, price, available, description, calories) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [item_name, category, price, available !== false, description, calories]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { item_name, category, price, available, description, calories } = req.body;
    const result = await pool.query(
      'UPDATE food_beverage SET item_name=$1, category=$2, price=$3, available=$4, description=$5, calories=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [item_name, category, price, available, description, calories, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM food_beverage WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;

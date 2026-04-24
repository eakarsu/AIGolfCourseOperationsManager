const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pro_shop_items ORDER BY category, name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pro shop items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pro_shop_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, category, brand, price, stock, sku } = req.body;
    const result = await pool.query(
      'INSERT INTO pro_shop_items (name, category, brand, price, stock, sku) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, category, brand, price, stock || 0, sku]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, category, brand, price, stock, sku } = req.body;
    const result = await pool.query(
      'UPDATE pro_shop_items SET name=$1, category=$2, brand=$3, price=$4, stock=$5, sku=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [name, category, brand, price, stock, sku, req.params.id]
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
    const result = await pool.query('DELETE FROM pro_shop_items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;

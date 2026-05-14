const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/tee-times
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tee_times'),
      pool.query('SELECT * FROM tee_times ORDER BY date, time LIMIT $1 OFFSET $2', [limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tee times' });
  }
});

// GET /api/tee-times/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tee_times WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tee time not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tee time' });
  }
});

// POST /api/tee-times
router.post('/', async (req, res) => {
  try {
    const { player_name, date, time, holes, players, status, cart_required } = req.body;

    // Double-booking prevention
    const existing = await pool.query(
      'SELECT id FROM tee_times WHERE date = $1 AND time = $2',
      [date, time]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This tee time slot is already booked.' });
    }

    const result = await pool.query(
      'INSERT INTO tee_times (player_name, date, time, holes, players, status, cart_required) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [player_name, date, time, holes || 18, players || 1, status || 'confirmed', cart_required || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tee time' });
  }
});

// PUT /api/tee-times/:id
router.put('/:id', async (req, res) => {
  try {
    const { player_name, date, time, holes, players, status, cart_required } = req.body;
    const result = await pool.query(
      'UPDATE tee_times SET player_name=$1, date=$2, time=$3, holes=$4, players=$5, status=$6, cart_required=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [player_name, date, time, holes, players, status, cart_required, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tee time not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tee time' });
  }
});

// DELETE /api/tee-times/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tee_times WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tee time not found' });
    res.json({ message: 'Tee time deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tee time' });
  }
});

module.exports = router;

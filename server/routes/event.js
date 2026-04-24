const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, date, time, attendees, venue, status, contact, price } = req.body;
    const result = await pool.query(
      'INSERT INTO events (name, type, date, time, attendees, venue, status, contact, price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [name, type, date, time, attendees || 0, venue, status || 'planned', contact, price || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, date, time, attendees, venue, status, contact, price } = req.body;
    const result = await pool.query(
      'UPDATE events SET name=$1, type=$2, date=$3, time=$4, attendees=$5, venue=$6, status=$7, contact=$8, price=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [name, type, date, time, attendees, venue, status, contact, price, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;

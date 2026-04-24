const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM member_directory ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM member_directory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, membership_tier, join_date, handicap, status } = req.body;
    const result = await pool.query(
      'INSERT INTO member_directory (name, email, phone, membership_tier, join_date, handicap, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, email, phone, membership_tier || 'Silver', join_date, handicap, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, membership_tier, join_date, handicap, status } = req.body;
    const result = await pool.query(
      'UPDATE member_directory SET name=$1, email=$2, phone=$3, membership_tier=$4, join_date=$5, handicap=$6, status=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, email, phone, membership_tier, join_date, handicap, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM member_directory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;

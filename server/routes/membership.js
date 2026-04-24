const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memberships ORDER BY member_name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch memberships' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memberships WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Membership not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch membership' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_name, email, tier, dues_amount, billing_cycle, start_date, end_date, status } = req.body;
    const result = await pool.query(
      'INSERT INTO memberships (member_name, email, tier, dues_amount, billing_cycle, start_date, end_date, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [member_name, email, tier || 'Silver', dues_amount, billing_cycle || 'monthly', start_date, end_date, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create membership' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { member_name, email, tier, dues_amount, billing_cycle, start_date, end_date, status } = req.body;
    const result = await pool.query(
      'UPDATE memberships SET member_name=$1, email=$2, tier=$3, dues_amount=$4, billing_cycle=$5, start_date=$6, end_date=$7, status=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [member_name, email, tier, dues_amount, billing_cycle, start_date, end_date, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Membership not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update membership' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM memberships WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Membership not found' });
    res.json({ message: 'Membership deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete membership' });
  }
});

module.exports = router;

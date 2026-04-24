const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_tasks ORDER BY scheduled_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch maintenance tasks' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_tasks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { task_name, area, type, scheduled_date, status, assigned_to, priority, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO maintenance_tasks (task_name, area, type, scheduled_date, status, assigned_to, priority, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [task_name, area, type, scheduled_date, status || 'pending', assigned_to, priority || 'medium', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { task_name, area, type, scheduled_date, status, assigned_to, priority, notes } = req.body;
    const result = await pool.query(
      'UPDATE maintenance_tasks SET task_name=$1, area=$2, type=$3, scheduled_date=$4, status=$5, assigned_to=$6, priority=$7, notes=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [task_name, area, type, scheduled_date, status, assigned_to, priority, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;

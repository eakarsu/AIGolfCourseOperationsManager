const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM weather_records ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather records' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM weather_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Weather record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather record' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, temperature, humidity, wind_speed, wind_direction, conditions, precipitation, forecast } = req.body;
    const result = await pool.query(
      'INSERT INTO weather_records (date, temperature, humidity, wind_speed, wind_direction, conditions, precipitation, forecast) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [date, temperature, humidity, wind_speed, wind_direction, conditions || 'clear', precipitation || 0, forecast]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create weather record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { date, temperature, humidity, wind_speed, wind_direction, conditions, precipitation, forecast } = req.body;
    const result = await pool.query(
      'UPDATE weather_records SET date=$1, temperature=$2, humidity=$3, wind_speed=$4, wind_direction=$5, conditions=$6, precipitation=$7, forecast=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [date, temperature, humidity, wind_speed, wind_direction, conditions, precipitation, forecast, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Weather record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update weather record' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM weather_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Weather record not found' });
    res.json({ message: 'Weather record deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete weather record' });
  }
});

module.exports = router;

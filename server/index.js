require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tee-times', require('./routes/teeTime'));
app.use('/api/memberships', require('./routes/membership'));
app.use('/api/handicaps', require('./routes/handicap'));
app.use('/api/tournaments', require('./routes/tournament'));
app.use('/api/pro-shop', require('./routes/proShop'));
app.use('/api/golf-carts', require('./routes/golfCart'));
app.use('/api/driving-range', require('./routes/drivingRange'));
app.use('/api/lessons', require('./routes/lesson'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/food-beverage', require('./routes/foodBeverage'));
app.use('/api/events', require('./routes/event'));
app.use('/api/leagues', require('./routes/league'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/member-directory', require('./routes/memberDirectory'));
app.use('/api/caddies', require('./routes/caddie'));
app.use('/api/lockers', require('./routes/locker'));
app.use('/api/bag-storage', require('./routes/bagStorage'));
app.use('/api/marshals', require('./routes/marshal'));
app.use('/api/pace-of-play', require('./routes/paceOfPlay'));
app.use('/api/practice-facilities', require('./routes/practiceFacility'));
app.use('/api/greens-fees', require('./routes/greensFee'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Golf Course Operations Manager API running on port ${PORT}`);
});

module.exports = app;

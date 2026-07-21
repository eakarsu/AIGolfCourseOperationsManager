require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const authenticateToken = require('./middleware/auth');
const pool = require('./db');

// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_round_pairing_optimization_for_fourso = require('./routes/gap-no-round-pairing-optimization-for-fourso');
const route_gap_no_facility_utilization_forecasting = require('./routes/gap-no-facility-utilization-forecasting');
const route_gap_no_member_retention_intervention_ai = require('./routes/gap-no-member-retention-intervention-ai');
const route_gap_no_tournament_format_recommender = require('./routes/gap-no-tournament-format-recommender');
const route_gap_no_swing_analysis_vision_ai = require('./routes/gap-no-swing-analysis-vision-ai');
const route_gap_no_payment_processing_surface = require('./routes/gap-no-payment-processing-surface');
const route_gap_no_webhook_integration_with_usga_ghin = require('./routes/gap-no-webhook-integration-with-usga-ghin');
const route_gap_no_real_time_course_status_feed = require('./routes/gap-no-real-time-course-status-feed');
const route_gap_no_on_course_mobile_messaging = require('./routes/gap-no-on-course-mobile-messaging');
const route_gap_no_file_upload_for_swing_videos = require('./routes/gap-no-file-upload-for-swing-videos');
const route_gap_no_audit_log = require('./routes/gap-no-audit-log');
const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// AI rate limiter: 20 requests per hour, keyed by user id
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? `user:${req.user.id}` : ipKeyGenerator(req.ip),
  message: { error: 'AI rate limit exceeded. Max 20 requests/hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Note: keyGenerator uses req.user which is set by authenticateToken,
  // so this limiter must be applied after auth middleware.
});

// Create tables if they don't exist
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        tool_name TEXT,
        result TEXT,
        model TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // Add unique constraint for tee times (no double booking)
    await pool.query(`
      ALTER TABLE tee_times ADD CONSTRAINT IF NOT EXISTS no_double_booking UNIQUE (date, time);
    `).catch(() => {
      // Constraint may already exist or use different column names; ignore gracefully
    });
    console.log('DB init complete');
  } catch (err) {
    console.error('DB init error (non-fatal):', err.message);
  }
}

if (process.env.AUTO_INIT_SCHEMA === 'true') initDb();

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply auth middleware to all other /api/* routes
app.use('/api', authenticateToken);

// Apply AI rate limiter to all /api/ai/* routes (after auth)
app.use('/api/ai', aiRateLimiter);

// Routes (protected)
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

// Apply pass 5 — additive mechanical routes
app.use('/api/tournament-brackets', require('./routes/tournamentBrackets'));
app.use('/api/course-feedback', require('./routes/courseFeedback'));
app.use('/api/agentic-marshal', require('./routes/agenticMarshal'));
app.use('/api/member-ltv', require('./routes/memberLTVChurn'));
app.use('/api/turf-stress-irrigation-planner', require('./routes/turfStressIrrigationPlanner'));

// AI results routes
app.get('/api/ai-results', async (req, res) => {
  try {
    const { tool_name } = req.query;
    let query = 'SELECT * FROM ai_results WHERE user_id = $1';
    const params = [req.user.id];
    if (tool_name) {
      query += ' AND tool_name = $2';
      params.push(tool_name);
    }
    query += ' ORDER BY created_at DESC LIMIT 20';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AI results' });
  }
});

app.use('/api/governed-course-operations', require('./governance'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use('/api/gap-no-round-pairing-optimization-for-fourso', route_gap_no_round_pairing_optimization_for_fourso);
app.use('/api/gap-no-facility-utilization-forecasting', route_gap_no_facility_utilization_forecasting);
app.use('/api/gap-no-member-retention-intervention-ai', route_gap_no_member_retention_intervention_ai);
app.use('/api/gap-no-tournament-format-recommender', route_gap_no_tournament_format_recommender);
app.use('/api/gap-no-swing-analysis-vision-ai', route_gap_no_swing_analysis_vision_ai);
app.use('/api/gap-no-payment-processing-surface', route_gap_no_payment_processing_surface);
app.use('/api/gap-no-webhook-integration-with-usga-ghin', route_gap_no_webhook_integration_with_usga_ghin);
app.use('/api/gap-no-real-time-course-status-feed', route_gap_no_real_time_course_status_feed);
app.use('/api/gap-no-on-course-mobile-messaging', route_gap_no_on_course_mobile_messaging);
app.use('/api/gap-no-file-upload-for-swing-videos', route_gap_no_file_upload_for_swing_videos);
app.use('/api/gap-no-audit-log', route_gap_no_audit_log);

app.listen(PORT, () => {
  console.log(`Golf Course Operations Manager API running on port ${PORT}`);
});

module.exports = app;

const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3-5-sonnet-20241022';

async function callOpenRouter(systemPrompt, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://golf-course-ops.com',
        'X-Title': 'AI Golf Course Operations Manager',
      },
    }
  );

  return response.data.choices[0].message.content;
}

async function saveAiResult(userId, toolName, result) {
  try {
    await pool.query(
      'INSERT INTO ai_results (user_id, tool_name, result, model) VALUES ($1, $2, $3, $4)',
      [userId, toolName, result, MODEL]
    );
  } catch (err) {
    console.error('Failed to save AI result:', err.message);
  }
}

// POST /api/ai/dynamic-pricing
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { weather, demand, date, time, day_of_week, current_rate, historical_data } = req.body;

    // Fetch live DB context
    const today = new Date().toISOString().split('T')[0];
    const bookingsResult = await pool.query(
      "SELECT COUNT(*) as count FROM tee_times WHERE date = $1",
      [today]
    ).catch(() => ({ rows: [{ count: 0 }] }));
    const todayBookings = parseInt(bookingsResult.rows[0].count);

    const weatherResult = await pool.query(
      'SELECT * FROM weather ORDER BY created_at DESC LIMIT 1'
    ).catch(() => ({ rows: [] }));
    const latestWeather = weatherResult.rows[0];

    const systemPrompt = `You are an AI pricing analyst for a premium golf course. Your job is to recommend dynamic tee time pricing based on weather conditions, historical demand patterns, day of week, and time of day. Consider factors like:
- Weather impact on player willingness to play
- Peak vs off-peak hours
- Weekend vs weekday demand
- Seasonal trends
- Special events or holidays
Provide specific price recommendations with reasoning. Return your response as JSON with fields: recommended_rate, adjustment_percentage, confidence, reasoning, and factors_considered (array).`;

    const userMessage = JSON.stringify({
      live_db_context: {
        todays_bookings: todayBookings,
        current_weather_db: latestWeather ? `${latestWeather.condition || 'N/A'}, ${latestWeather.temperature || 'N/A'}°F` : 'No weather data',
      },
      weather: weather || (latestWeather ? `${latestWeather.condition}, ${latestWeather.temperature}F` : 'clear, 75F'),
      demand: demand || (todayBookings > 15 ? 'high' : todayBookings > 8 ? 'moderate' : 'low'),
      date: date || today,
      time: time || '10:00 AM',
      day_of_week: day_of_week || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      current_rate: current_rate || 89,
      historical_data: historical_data || 'Average weekend occupancy: 85%',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);

    // Save AI result
    await saveAiResult(req.user?.id, 'dynamic-pricing', result);

    // Dynamic pricing writeback: parse recommended_rate from response and write to greens_fees
    try {
      let parsed;
      const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(result);
      const recommended = parseFloat(parsed.recommended_rate);
      if (!isNaN(recommended) && recommended > 0) {
        await pool.query(
          'INSERT INTO greens_fees (fee_type, suggested_rate, notes, effective_date) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          ['dynamic', recommended, `AI suggested rate for ${date || today} ${time || ''}`, date || today]
        ).catch(() => {
          // Try simpler insert if schema differs
          pool.query(
            'INSERT INTO greens_fees (suggested_rate, notes) VALUES ($1, $2)',
            [recommended, `AI dynamic pricing: ${date || today}`]
          ).catch(() => {});
        });
      }
    } catch (parseErr) {
      // If we can't parse the rate, just skip the writeback
    }

    res.json({
      recommendation: result,
      live_context: { todays_bookings: todayBookings, weather_db: latestWeather?.condition || 'N/A' }
    });
  } catch (err) {
    console.error('Dynamic pricing error:', err.message);
    res.status(500).json({ error: 'Failed to generate pricing recommendation', message: err.message });
  }
});

// POST /api/ai/course-conditions
router.post('/course-conditions', async (req, res) => {
  try {
    const { weather_data, maintenance_history, recent_rainfall, temperature, humidity, season } = req.body;

    const systemPrompt = `You are an AI course conditions analyst for a golf course. Generate a detailed course condition report based on weather data, maintenance history, and environmental factors. Include assessments for:
- Fairway conditions (firmness, moisture)
- Green speed and condition (Stimpmeter reading estimate)
- Rough height and playability
- Bunker conditions
- Overall course rating
Return your response as JSON with fields: overall_rating (1-10), fairways, greens, rough, bunkers, cart_path_only (boolean), recommendations (array), and summary.`;

    const userMessage = JSON.stringify({
      weather_data: weather_data || 'Sunny, 78F, 45% humidity',
      maintenance_history: maintenance_history || 'Greens mowed yesterday, fairways mowed 2 days ago',
      recent_rainfall: recent_rainfall || '0.5 inches in last 48 hours',
      temperature: temperature || 78,
      humidity: humidity || 45,
      season: season || 'spring',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'course-conditions', result);
    res.json({ report: result });
  } catch (err) {
    console.error('Course conditions error:', err.message);
    res.status(500).json({ error: 'Failed to generate course condition report', message: err.message });
  }
});

// POST /api/ai/handicap-analysis
router.post('/handicap-analysis', async (req, res) => {
  try {
    const { players, tournament_format, course_rating, slope_rating, handicap_data } = req.body;

    // Fetch live DB: top 10 members by handicap_index
    const handicapsResult = await pool.query(
      'SELECT player_name, handicap_index, rounds_played, trend FROM handicaps ORDER BY handicap_index ASC LIMIT 10'
    ).catch(() => ({ rows: [] }));
    const topHandicaps = handicapsResult.rows;

    const systemPrompt = `You are an AI handicap analyst for golf tournaments. Analyze player handicaps for tournament flight assignments, net scoring calculations, and competitive balance. Consider:
- USGA handicap calculation methodology
- Flight assignments based on handicap ranges
- Net score projections
- Competitive balance between flights
Return your response as JSON with fields: flights (array of flight objects with name, handicap_range, players), recommendations, competitive_balance_score (1-10), and notes.`;

    const userMessage = JSON.stringify({
      live_members_top10: topHandicaps,
      players: players || topHandicaps.map(h => h.player_name),
      tournament_format: tournament_format || 'stroke play',
      course_rating: course_rating || 72.1,
      slope_rating: slope_rating || 131,
      handicap_data: handicap_data || (topHandicaps.length > 0
        ? `${topHandicaps.length} members, lowest HCP: ${topHandicaps[0]?.handicap_index}, highest: ${topHandicaps[topHandicaps.length - 1]?.handicap_index}`
        : 'Mixed field, handicaps ranging from 2 to 28'),
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'handicap-analysis', result);
    res.json({
      analysis: result,
      live_context: { members_analyzed: topHandicaps.length }
    });
  } catch (err) {
    console.error('Handicap analysis error:', err.message);
    res.status(500).json({ error: 'Failed to generate handicap analysis', message: err.message });
  }
});

// POST /api/ai/product-recommendations
router.post('/product-recommendations', async (req, res) => {
  try {
    const { inventory, sales_history, season, member_demographics, trending_brands } = req.body;

    const systemPrompt = `You are an AI product recommendation engine for a golf course pro shop. Analyze current inventory, sales trends, seasonality, and member demographics to recommend:
- Products to restock or reorder
- New products to add to inventory
- Pricing adjustments for slow-moving inventory
- Promotional bundle suggestions
- Seasonal merchandise planning
Return your response as JSON with fields: restock_recommendations (array), new_products (array), pricing_adjustments (array), promotions (array), and seasonal_plan.`;

    const userMessage = JSON.stringify({
      inventory: inventory || 'Standard pro shop inventory with golf clubs, apparel, accessories',
      sales_history: sales_history || 'Strong glove and ball sales, slow apparel movement',
      season: season || 'spring',
      member_demographics: member_demographics || 'Average age 52, 70% male, upper-middle income',
      trending_brands: trending_brands || 'Titleist, TaylorMade, Callaway, Nike',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'product-recommendations', result);
    res.json({ recommendations: result });
  } catch (err) {
    console.error('Product recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to generate product recommendations', message: err.message });
  }
});

// POST /api/ai/member-communication
router.post('/member-communication', async (req, res) => {
  try {
    const { communication_type, topic, audience, tone, key_points, event_details } = req.body;

    const systemPrompt = `You are an AI communication specialist for a prestigious golf club. Draft professional member communications including:
- Email newsletters
- Event announcements
- Policy updates
- Seasonal greetings
- Tournament invitations
- Maintenance notifications
Write in a tone appropriate for a premium golf club. Be professional yet warm. Include clear calls to action when appropriate.
Return your response as JSON with fields: subject, body, call_to_action, suggested_send_time, and audience_segment.`;

    const userMessage = JSON.stringify({
      communication_type: communication_type || 'newsletter',
      topic: topic || 'Monthly club update',
      audience: audience || 'all members',
      tone: tone || 'professional and warm',
      key_points: key_points || [],
      event_details: event_details || null,
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'member-communication', result);
    res.json({ communication: result });
  } catch (err) {
    console.error('Member communication error:', err.message);
    res.status(500).json({ error: 'Failed to generate communication', message: err.message });
  }
});

// POST /api/ai/maintenance-optimization
router.post('/maintenance-optimization', async (req, res) => {
  try {
    const { weather_forecast, current_tasks, equipment_availability, staff_schedule, course_areas, budget } = req.body;

    // Fetch live DB: open maintenance tasks + latest weather
    const maintenanceResult = await pool.query(
      "SELECT * FROM maintenance WHERE status != 'completed' ORDER BY priority DESC, created_at ASC LIMIT 20"
    ).catch(() => ({ rows: [] }));
    const openTasks = maintenanceResult.rows;

    const weatherResult = await pool.query(
      'SELECT * FROM weather ORDER BY created_at DESC LIMIT 3'
    ).catch(() => ({ rows: [] }));
    const recentWeather = weatherResult.rows;

    const systemPrompt = `You are an AI maintenance optimization specialist for a golf course. Create optimized maintenance schedules based on:
- Weather forecasts (avoid mowing before rain, schedule aeration during dry periods)
- Staff availability and workload balancing
- Equipment maintenance windows
- Course area priorities (greens > tees > fairways > rough)
- Tournament and event schedules
- Budget constraints
Return your response as JSON with fields: optimized_schedule (array of tasks with date, time, area, task, assigned_to, priority), weather_considerations (array), cost_estimate, efficiency_score (1-10), and recommendations (array).`;

    const userMessage = JSON.stringify({
      live_db_context: {
        open_maintenance_tasks: openTasks.length,
        tasks_summary: openTasks.slice(0, 5).map(t => ({ area: t.area, task: t.task || t.description, priority: t.priority })),
        recent_weather_readings: recentWeather.map(w => ({ condition: w.condition, temp: w.temperature })),
      },
      weather_forecast: weather_forecast || (recentWeather.length > 0
        ? `Recent: ${recentWeather[0].condition}, ${recentWeather[0].temperature}°F`
        : '5-day forecast: Mon-sunny, Tue-cloudy, Wed-rain, Thu-partly cloudy, Fri-sunny'),
      current_tasks: current_tasks || openTasks.map(t => t.task || t.description || 'maintenance task'),
      equipment_availability: equipment_availability || 'All equipment operational',
      staff_schedule: staff_schedule || '6 maintenance crew members available Mon-Sat',
      course_areas: course_areas || '18 holes, practice facility, clubhouse grounds',
      budget: budget || 'Standard weekly maintenance budget of $8,500',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'maintenance-optimization', result);
    res.json({
      optimization: result,
      live_context: { open_tasks: openTasks.length, weather_readings: recentWeather.length }
    });
  } catch (err) {
    console.error('Maintenance optimization error:', err.message);
    res.status(500).json({ error: 'Failed to generate maintenance optimization', message: err.message });
  }
});

// POST /api/ai/member-concierge — pulls member's data from DB
router.post('/member-concierge', async (req, res) => {
  try {
    const { member_name, member_id } = req.body;
    const [memberData, recentHandicap, upcomingTees, upcomingLessons] = await Promise.all([
      pool.query('SELECT * FROM member_directory WHERE id = $1 OR name ILIKE $2 LIMIT 1', [member_id || 0, `%${member_name || ''}%`]).catch(() => ({ rows: [] })),
      pool.query('SELECT * FROM handicaps WHERE player_name ILIKE $1 ORDER BY created_at DESC LIMIT 1', [`%${member_name || ''}%`]).catch(() => ({ rows: [] })),
      pool.query("SELECT * FROM tee_times WHERE date >= NOW()::date ORDER BY date, time LIMIT 5").catch(() => ({ rows: [] })),
      pool.query("SELECT * FROM lessons WHERE student_name ILIKE $1 AND lesson_date >= NOW()::date ORDER BY lesson_date LIMIT 3", [`%${member_name || ''}%`]).catch(() => ({ rows: [] })),
    ]);

    const systemPrompt = `You are a personalized golf concierge AI. Based on member data, provide tailored recommendations. Return JSON: {"greeting": "", "handicap_insight": "", "recommended_tee_times": [{"date": "", "time": "", "reason": ""}], "gear_recommendations": [{"item": "", "rationale": ""}], "lesson_suggestions": [{"topic": "", "benefit": ""}], "upcoming_events": [{"event": "", "recommendation": ""}], "personal_tips": [""]}`;
    const userMessage = `Member: ${member_name || 'Guest'}
Member Profile: ${JSON.stringify(memberData.rows[0] || {})}
Current Handicap: ${JSON.stringify(recentHandicap.rows[0] || { handicap_index: 'Unknown' })}
Available Tee Times: ${JSON.stringify(upcomingTees.rows.map(t => ({ date: t.date, time: t.time, available_spots: t.available_spots })))}
Upcoming Lessons: ${JSON.stringify(upcomingLessons.rows)}

Provide personalized recommendations. Return JSON only.`;

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'member-concierge', result);
    res.json({ concierge: result, member_context: { member: memberData.rows[0] || null, handicap: recentHandicap.rows[0] || null } });
  } catch (err) {
    console.error('Member concierge error:', err.message);
    res.status(500).json({ error: 'Failed to generate concierge recommendations', message: err.message });
  }
});

// POST /api/ai/score-analysis — post a round, get AI coaching feedback
router.post('/score-analysis', async (req, res) => {
  try {
    const { player_name, scores_by_hole, course_rating, slope_rating, tee_played } = req.body;
    if (!scores_by_hole || !Array.isArray(scores_by_hole)) {
      return res.status(400).json({ error: 'scores_by_hole array is required' });
    }
    const totalScore = scores_by_hole.reduce((sum, s) => sum + (s.score || s), 0);
    const par = scores_by_hole.reduce((sum, s) => sum + (s.par || 4), 0);

    const systemPrompt = `You are a USGA-certified golf analyst. Analyze a scorecard and provide coaching insights. Return JSON: {"differential": <number>, "estimated_handicap_impact": <number>, "score_summary": {"total": 0, "vs_par": 0, "best_hole": "", "worst_hole": ""}, "pattern_analysis": {"putting_issues": false, "approach_issues": false, "driving_issues": false, "short_game_issues": false}, "strengths": [""], "areas_for_improvement": [{"area": "", "specific_holes": [], "drill": ""}], "next_lesson_focus": "", "coaching_tips": [""]}`;
    const userMessage = `Player: ${player_name || 'Golfer'}
Course Rating: ${course_rating || 72.0}, Slope: ${slope_rating || 113}, Tee: ${tee_played || 'White'}
Total Score: ${totalScore} (Par ${par})
Hole-by-hole: ${JSON.stringify(scores_by_hole)}
Return detailed coaching analysis as JSON.`;

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'score-analysis', result);

    // Update handicap table with new round
    const differential = ((totalScore - (course_rating || 72)) * 113 / (slope_rating || 113)).toFixed(1);
    await pool.query(
      `INSERT INTO handicaps (player_name, handicap_index, rounds_played, last_round_date, trend)
       VALUES ($1, $2, 1, NOW(), 'new')
       ON CONFLICT (player_name) DO UPDATE SET
         rounds_played = handicaps.rounds_played + 1,
         last_round_date = NOW()`,
      [player_name || 'Unknown', parseFloat(differential)]
    ).catch(() => {}); // ignore if constraint doesn't exist

    res.json({ analysis: result, score_summary: { total: totalScore, par, differential } });
  } catch (err) {
    console.error('Score analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze score', message: err.message });
  }
});

// POST /api/ai/round-pairing — optimal foursome composition
router.post('/round-pairing', async (req, res) => {
  try {
    const { tee_time, players = [], pace_target_minutes = 240 } = req.body || {};
    if (!Array.isArray(players) || players.length < 2) {
      return res.status(400).json({ error: 'At least 2 players required (handicap, pace_minutes optional)' });
    }

    const systemPrompt = `You are a golf-course pairing optimizer. Group golfers into foursomes that balance pace, social compatibility, and skill. Return STRICT JSON only.`;
    const userMessage = `Tee time: ${tee_time || 'unspecified'}
Players: ${JSON.stringify(players, null, 2)}
Pace target (minutes): ${pace_target_minutes}

Return JSON:
{
  "summary": "...",
  "groups": [
    { "tee_time_offset_min": 0, "players": ["name", "..."], "average_handicap": 0, "expected_pace_minutes": 0, "rationale": "string" }
  ],
  "warnings": ["..."],
  "disclaimer": "string"
}`;

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'round-pairing', result);
    res.json({ analysis: result });
  } catch (err) {
    console.error('Round pairing error:', err.message);
    res.status(500).json({ error: 'Failed to generate pairing', message: err.message });
  }
});

// POST /api/ai/facility-utilization-forecast — predict peak hours per facility
router.post('/facility-utilization-forecast', async (req, res) => {
  try {
    const { horizon_days = 14, facilities = ['tee_time', 'driving_range', 'pro_shop'] } = req.body || {};

    const teeTimeData = await pool.query(
      `SELECT EXTRACT(DOW FROM tee_date) AS dow, EXTRACT(HOUR FROM tee_time) AS hour, COUNT(*) AS bookings
       FROM tee_times
       WHERE tee_date >= CURRENT_DATE - INTERVAL '60 days'
       GROUP BY dow, hour
       ORDER BY bookings DESC
       LIMIT 100`
    ).catch(() => ({ rows: [] }));

    const memberCount = await pool.query('SELECT COUNT(*) AS cnt FROM membership').catch(() => ({ rows: [{ cnt: 0 }] }));

    const systemPrompt = `You are a golf-facility utilization forecaster. Predict peak hours and occupancy for each requested facility, and recommend pricing/capacity actions. Return STRICT JSON only.`;
    const userMessage = `Horizon: ${horizon_days} days
Facilities: ${JSON.stringify(facilities)}
Recent tee-time demand by day-of-week / hour: ${JSON.stringify(teeTimeData.rows)}
Member count: ${memberCount.rows[0]?.cnt || 0}

Return JSON:
{
  "summary": "...",
  "facility_forecasts": [
    { "facility": "string", "peak_windows": ["..."], "expected_utilization_pct": 0, "pricing_action": "string" }
  ],
  "capacity_warnings": ["..."],
  "marketing_opportunities": ["..."],
  "disclaimer": "string"
}`;

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'facility-utilization-forecast', result);
    res.json({ analysis: result });
  } catch (err) {
    console.error('Facility utilization error:', err.message);
    res.status(500).json({ error: 'Failed to forecast utilization', message: err.message });
  }
});

// POST /api/ai/tournament-format-recommendation — suggest tournament formats based on field size and skill mix
router.post('/tournament-format-recommendation', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured' });
    }

    const {
      field_size,
      event_name,
      audience,
      duration_hours,
      preferred_formats,
      notes,
    } = req.body || {};

    // Pull skill distribution from handicaps and recent tournaments for context
    const handicapStats = await pool.query(
      `SELECT
         COUNT(*) AS player_count,
         AVG(handicap_index) AS avg_hcp,
         MIN(handicap_index) AS min_hcp,
         MAX(handicap_index) AS max_hcp,
         STDDEV(handicap_index) AS hcp_stddev
       FROM handicaps`
    ).catch(() => ({ rows: [{}] }));

    const recentTournaments = await pool.query(
      `SELECT name, format, max_players, current_players, status
       FROM tournaments
       ORDER BY date DESC NULLS LAST
       LIMIT 10`
    ).catch(() => ({ rows: [] }));

    const systemPrompt = `You are a tournament-format advisor for a golf club. Recommend an event format that fits field size, skill distribution, audience, and time budget. Consider stroke play, scramble, best ball, modified Stableford, Chapman, shotgun, flighted match play, etc. Return STRICT JSON only.`;
    const userMessage = `Event: ${event_name || 'Club tournament'}
Audience: ${audience || 'mixed_membership'}
Field size: ${field_size || (handicapStats.rows[0]?.player_count || 0)}
Duration (hours): ${duration_hours || 5}
Preferred formats: ${JSON.stringify(preferred_formats || [])}
Notes: ${notes || ''}
Skill distribution (handicaps): ${JSON.stringify(handicapStats.rows[0] || {})}
Recent tournaments at this club: ${JSON.stringify(recentTournaments.rows)}

Return JSON:
{
  "summary": "...",
  "primary_recommendation": {
    "format": "string",
    "rationale": "string",
    "flighting": "string",
    "estimated_duration_hours": 0,
    "fairness_score_1to10": 0
  },
  "alternatives": [
    { "format": "string", "best_for": "string", "rationale": "string" }
  ],
  "tee_arrangement": "string",
  "scoring_notes": ["..."],
  "warnings": ["..."],
  "disclaimer": "string"
}`;

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'tournament-format-recommendation', result);
    res.json({
      analysis: result,
      live_context: {
        players_in_handicap_db: parseInt(handicapStats.rows[0]?.player_count || 0),
        recent_tournaments: recentTournaments.rows.length,
      },
    });
  } catch (err) {
    console.error('Tournament format recommendation error:', err.message);
    if (err.message && err.message.includes('OPENROUTER_API_KEY')) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured' });
    }
    res.status(500).json({ error: 'Failed to recommend tournament format', message: err.message });
  }
});

// POST /api/ai/member-retention — identify at-risk members and recommend offers
router.post('/member-retention', async (req, res) => {
  try {
    const members = await pool.query(
      `SELECT m.id, m.name, m.member_type, m.joined_at, m.last_round_at, m.last_payment_at,
              m.dues_status, m.handicap_index
       FROM membership m
       ORDER BY COALESCE(m.last_round_at, m.joined_at) ASC NULLS FIRST
       LIMIT 300`
    ).catch(() => ({ rows: [] }));

    const now = Date.now();
    const enriched = members.rows.map(m => {
      const daysSinceRound = m.last_round_at ? Math.floor((now - new Date(m.last_round_at).getTime()) / 86400000) : 9999;
      const daysSincePayment = m.last_payment_at ? Math.floor((now - new Date(m.last_payment_at).getTime()) / 86400000) : 9999;
      let risk = 'low';
      if (daysSinceRound > 90 || daysSincePayment > 60) risk = 'medium';
      if (daysSinceRound > 180 || daysSincePayment > 90 || m.dues_status === 'past_due') risk = 'high';
      return { ...m, days_since_round: daysSinceRound, days_since_payment: daysSincePayment, local_risk: risk };
    });

    const systemPrompt = `You are a golf-club member retention strategist. Identify at-risk members and recommend personalized retention offers. Return STRICT JSON only.`;
    const userMessage = `Members: ${JSON.stringify(enriched.slice(0, 100))}

Return JSON:
{
  "summary": "...",
  "high_risk_members": [
    { "member_id": 0, "name": "string", "reasons": ["..."], "offer": "string", "estimated_save_probability": 0 }
  ],
  "watchlist": [{ "member_id": 0, "reason": "string" }],
  "general_actions": ["..."],
  "disclaimer": "string"
}`;

    const result = await callOpenRouter(systemPrompt, userMessage);
    await saveAiResult(req.user?.id, 'member-retention', result);
    res.json({ analysis: result, members_evaluated: enriched.length });
  } catch (err) {
    console.error('Member retention error:', err.message);
    res.status(500).json({ error: 'Failed to evaluate member retention', message: err.message });
  }
});

module.exports = router;

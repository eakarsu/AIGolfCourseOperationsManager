const express = require('express');
const router = express.Router();
const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(systemPrompt, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const response = await axios.post(
    OPENROUTER_URL,
    {
      model,
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

// POST /api/ai/dynamic-pricing
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { weather, demand, date, time, day_of_week, current_rate, historical_data } = req.body;

    const systemPrompt = `You are an AI pricing analyst for a premium golf course. Your job is to recommend dynamic tee time pricing based on weather conditions, historical demand patterns, day of week, and time of day. Consider factors like:
- Weather impact on player willingness to play
- Peak vs off-peak hours
- Weekend vs weekday demand
- Seasonal trends
- Special events or holidays
Provide specific price recommendations with reasoning. Return your response as JSON with fields: recommended_rate, adjustment_percentage, confidence, reasoning, and factors_considered (array).`;

    const userMessage = JSON.stringify({
      weather: weather || 'clear, 75F',
      demand: demand || 'moderate',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00 AM',
      day_of_week: day_of_week || 'Saturday',
      current_rate: current_rate || 89,
      historical_data: historical_data || 'Average weekend occupancy: 85%',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    res.json({ recommendation: result });
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

    const systemPrompt = `You are an AI handicap analyst for golf tournaments. Analyze player handicaps for tournament flight assignments, net scoring calculations, and competitive balance. Consider:
- USGA handicap calculation methodology
- Flight assignments based on handicap ranges
- Net score projections
- Competitive balance between flights
Return your response as JSON with fields: flights (array of flight objects with name, handicap_range, players), recommendations, competitive_balance_score (1-10), and notes.`;

    const userMessage = JSON.stringify({
      players: players || [],
      tournament_format: tournament_format || 'stroke play',
      course_rating: course_rating || 72.1,
      slope_rating: slope_rating || 131,
      handicap_data: handicap_data || 'Mixed field, handicaps ranging from 2 to 28',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    res.json({ analysis: result });
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

    const systemPrompt = `You are an AI maintenance optimization specialist for a golf course. Create optimized maintenance schedules based on:
- Weather forecasts (avoid mowing before rain, schedule aeration during dry periods)
- Staff availability and workload balancing
- Equipment maintenance windows
- Course area priorities (greens > tees > fairways > rough)
- Tournament and event schedules
- Budget constraints
Return your response as JSON with fields: optimized_schedule (array of tasks with date, time, area, task, assigned_to, priority), weather_considerations (array), cost_estimate, efficiency_score (1-10), and recommendations (array).`;

    const userMessage = JSON.stringify({
      weather_forecast: weather_forecast || '5-day forecast: Mon-sunny, Tue-cloudy, Wed-rain, Thu-partly cloudy, Fri-sunny',
      current_tasks: current_tasks || [],
      equipment_availability: equipment_availability || 'All equipment operational',
      staff_schedule: staff_schedule || '6 maintenance crew members available Mon-Sat',
      course_areas: course_areas || '18 holes, practice facility, clubhouse grounds',
      budget: budget || 'Standard weekly maintenance budget of $8,500',
    });

    const result = await callOpenRouter(systemPrompt, userMessage);
    res.json({ optimization: result });
  } catch (err) {
    console.error('Maintenance optimization error:', err.message);
    res.status(500).json({ error: 'Failed to generate maintenance optimization', message: err.message });
  }
});

module.exports = router;

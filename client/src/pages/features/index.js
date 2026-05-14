export const featureConfigs = [
  {
    path: 'tee-times',
    title: 'Tee Time Management',
    icon: '\u{1F3CC}\uFE0F',
    description: 'Book and manage tee times',
    apiEndpoint: '/api/tee-times',
    columns: [
      { key: 'player_name', label: 'Player' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'holes', label: 'Holes' },
      { key: 'players', label: 'Players' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'player_name', label: 'Player Name', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time', type: 'time' },
      { key: 'holes', label: 'Holes', type: 'number' },
      { key: 'players', label: 'Number of Players', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['confirmed', 'pending', 'cancelled'] },
      { key: 'cart_required', label: 'Cart Required', type: 'checkbox' }
    ]
  },
  {
    path: 'memberships',
    title: 'Membership Management',
    icon: '\u{1F465}',
    description: 'Manage club memberships and renewals',
    apiEndpoint: '/api/memberships',
    columns: [
      { key: 'member_name', label: 'Member' },
      { key: 'tier', label: 'Tier' },
      { key: 'dues_amount', label: 'Dues Amount' },
      { key: 'billing_cycle', label: 'Billing Cycle' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'member_name', label: 'Member Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'tier', label: 'Tier', type: 'select', options: ['Gold', 'Silver', 'Bronze', 'Platinum'] },
      { key: 'dues_amount', label: 'Dues Amount ($)', type: 'number' },
      { key: 'billing_cycle', label: 'Billing Cycle', type: 'select', options: ['monthly', 'annual'] },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'pending', 'expired'] }
    ]
  },
  {
    path: 'handicaps',
    title: 'Handicap Tracking',
    icon: '\u{1F4CA}',
    description: 'Track and calculate player handicaps',
    apiEndpoint: '/api/handicaps',
    columns: [
      { key: 'player_name', label: 'Player' },
      { key: 'handicap_index', label: 'Handicap Index' },
      { key: 'rounds_played', label: 'Rounds' },
      { key: 'last_round_date', label: 'Last Round Date' },
      { key: 'trend', label: 'Trend' }
    ],
    formFields: [
      { key: 'player_name', label: 'Player Name', type: 'text' },
      { key: 'handicap_index', label: 'Handicap Index', type: 'number' },
      { key: 'rounds_played', label: 'Rounds Played', type: 'number' },
      { key: 'last_round_date', label: 'Last Round Date', type: 'date' },
      { key: 'trend', label: 'Trend', type: 'select', options: ['improving', 'stable', 'worsening'] }
    ]
  },
  {
    path: 'tournaments',
    title: 'Tournament Management',
    icon: '\u{1F3C6}',
    description: 'Organize and manage golf tournaments',
    apiEndpoint: '/api/tournaments',
    columns: [
      { key: 'name', label: 'Tournament' },
      { key: 'date', label: 'Date' },
      { key: 'format', label: 'Format' },
      { key: 'current_players', label: 'Current Players' },
      { key: 'max_players', label: 'Max Players' },
      { key: 'entry_fee', label: 'Entry Fee' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'name', label: 'Tournament Name', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'format', label: 'Format', type: 'select', options: ['stroke', 'match_play', 'scramble', 'best_ball', 'stableford', 'alternate_shot', 'shamble'] },
      { key: 'entry_fee', label: 'Entry Fee ($)', type: 'number' },
      { key: 'max_players', label: 'Max Players', type: 'number' },
      { key: 'current_players', label: 'Current Players', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['upcoming', 'registration', 'completed', 'cancelled'] },
      { key: 'flight', label: 'Flight', type: 'select', options: ['A', 'B', 'C'] }
    ]
  },
  {
    path: 'pro-shop',
    title: 'Pro Shop & Inventory',
    icon: '\u{1F6CD}\uFE0F',
    description: 'Manage pro shop inventory and sales',
    apiEndpoint: '/api/pro-shop',
    columns: [
      { key: 'name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'brand', label: 'Brand' },
      { key: 'price', label: 'Price' },
      { key: 'stock', label: 'Stock' },
      { key: 'sku', label: 'SKU' }
    ],
    formFields: [
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['clubs', 'balls', 'apparel', 'footwear', 'accessories', 'bags', 'electronics', 'training'] },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'stock', label: 'Stock Quantity', type: 'number' },
      { key: 'sku', label: 'SKU', type: 'text' }
    ]
  },
  {
    path: 'golf-carts',
    title: 'Golf Cart Fleet',
    icon: '\u{1F697}',
    description: 'Manage golf cart fleet and maintenance',
    apiEndpoint: '/api/golf-carts',
    columns: [
      { key: 'cart_number', label: 'Cart #' },
      { key: 'status', label: 'Status' },
      { key: 'battery_level', label: 'Battery' },
      { key: 'mileage', label: 'Mileage' },
      { key: 'gps_enabled', label: 'GPS' },
      { key: 'last_maintenance', label: 'Last Maintenance' }
    ],
    formFields: [
      { key: 'cart_number', label: 'Cart Number', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['available', 'in_use', 'maintenance'] },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date' },
      { key: 'next_maintenance', label: 'Next Maintenance', type: 'date' },
      { key: 'gps_enabled', label: 'GPS Enabled', type: 'checkbox' },
      { key: 'battery_level', label: 'Battery Level (%)', type: 'number' },
      { key: 'mileage', label: 'Mileage', type: 'number' }
    ]
  },
  {
    path: 'driving-range',
    title: 'Driving Range',
    icon: '\u26F3',
    description: 'Manage driving range buckets and inventory',
    apiEndpoint: '/api/driving-range',
    columns: [
      { key: 'bucket_type', label: 'Bucket Type' },
      { key: 'price', label: 'Price' },
      { key: 'balls_count', label: 'Balls Count' },
      { key: 'inventory', label: 'Inventory' },
      { key: 'session_date', label: 'Session Date' }
    ],
    formFields: [
      { key: 'bucket_type', label: 'Bucket Type', type: 'text' },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'balls_count', label: 'Balls Count', type: 'number' },
      { key: 'inventory', label: 'Inventory', type: 'number' },
      { key: 'session_date', label: 'Session Date', type: 'date' }
    ]
  },
  {
    path: 'lessons',
    title: 'Lesson Booking',
    icon: '\u{1F4DA}',
    description: 'Book and manage golf lessons',
    apiEndpoint: '/api/lessons',
    columns: [
      { key: 'student_name', label: 'Student' },
      { key: 'pro_name', label: 'Instructor' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'type', label: 'Type' },
      { key: 'duration', label: 'Duration' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'student_name', label: 'Student Name', type: 'text' },
      { key: 'pro_name', label: 'Instructor', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time', type: 'time' },
      { key: 'duration', label: 'Duration (minutes)', type: 'number' },
      { key: 'type', label: 'Lesson Type', type: 'select', options: ['individual', 'group', 'short_game', 'putting'] },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'confirmed', 'completed', 'cancelled'] }
    ]
  },
  {
    path: 'maintenance',
    title: 'Course Maintenance',
    icon: '\u{1F527}',
    description: 'Schedule and track course maintenance tasks',
    apiEndpoint: '/api/maintenance',
    columns: [
      { key: 'task_name', label: 'Task' },
      { key: 'area', label: 'Area' },
      { key: 'type', label: 'Type' },
      { key: 'priority', label: 'Priority' },
      { key: 'assigned_to', label: 'Assigned To' },
      { key: 'scheduled_date', label: 'Scheduled Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'task_name', label: 'Task Name', type: 'text' },
      { key: 'area', label: 'Area', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'] },
      { key: 'assigned_to', label: 'Assigned To', type: 'text' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    path: 'weather',
    title: 'Weather Monitoring',
    icon: '\u{1F324}\uFE0F',
    description: 'Monitor weather conditions and forecasts',
    apiEndpoint: '/api/weather',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'temperature', label: 'Temperature' },
      { key: 'conditions', label: 'Conditions' },
      { key: 'wind_speed', label: 'Wind Speed' },
      { key: 'humidity', label: 'Humidity' },
      { key: 'precipitation', label: 'Precipitation' }
    ],
    formFields: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'temperature', label: 'Temperature (F)', type: 'number' },
      { key: 'humidity', label: 'Humidity (%)', type: 'number' },
      { key: 'wind_speed', label: 'Wind Speed (mph)', type: 'number' },
      { key: 'wind_direction', label: 'Wind Direction', type: 'select', options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
      { key: 'conditions', label: 'Conditions', type: 'select', options: ['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'windy', 'foggy'] },
      { key: 'precipitation', label: 'Precipitation (inches)', type: 'number' },
      { key: 'forecast', label: 'Forecast', type: 'textarea' }
    ]
  },
  {
    path: 'food-beverage',
    title: 'Food & Beverage',
    icon: '\u{1F37D}\uFE0F',
    description: 'Manage restaurant and bar operations',
    apiEndpoint: '/api/food-beverage',
    columns: [
      { key: 'item_name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price' },
      { key: 'available', label: 'Available' },
      { key: 'calories', label: 'Calories' }
    ],
    formFields: [
      { key: 'item_name', label: 'Item Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages'] },
      { key: 'price', label: 'Price ($)', type: 'number' },
      { key: 'available', label: 'Available', type: 'checkbox' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'calories', label: 'Calories', type: 'number' }
    ]
  },
  {
    path: 'events',
    title: 'Event Booking',
    icon: '\u{1F389}',
    description: 'Book and manage events at the club',
    apiEndpoint: '/api/events',
    columns: [
      { key: 'name', label: 'Event' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date' },
      { key: 'attendees', label: 'Attendees' },
      { key: 'venue', label: 'Venue' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'name', label: 'Event Name', type: 'text' },
      { key: 'type', label: 'Event Type', type: 'select', options: ['wedding', 'corporate', 'social', 'charity', 'private', 'club'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time', type: 'time' },
      { key: 'attendees', label: 'Number of Attendees', type: 'number' },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['planned', 'confirmed', 'cancelled', 'completed'] },
      { key: 'contact', label: 'Contact', type: 'text' },
      { key: 'price', label: 'Price ($)', type: 'number' }
    ]
  },
  {
    path: 'leagues',
    title: 'League Management',
    icon: '\u{1F3C5}',
    description: 'Manage golf leagues and standings',
    apiEndpoint: '/api/leagues',
    columns: [
      { key: 'name', label: 'League' },
      { key: 'format', label: 'Format' },
      { key: 'day_of_week', label: 'Day' },
      { key: 'members_count', label: 'Members' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'name', label: 'League Name', type: 'text' },
      { key: 'format', label: 'Format', type: 'select', options: ['stroke', 'match_play', 'scramble', 'best_ball', 'stableford', 'alternate_shot', 'skins', 'simulator'] },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'members_count', label: 'Members Count', type: 'number' },
      { key: 'day_of_week', label: 'Day of Week', type: 'select', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'upcoming', 'completed'] },
      { key: 'fee', label: 'Fee ($)', type: 'number' }
    ]
  },
  {
    path: 'financial',
    title: 'Financial Reporting',
    icon: '\u{1F4B0}',
    description: 'View financial reports and analytics',
    apiEndpoint: '/api/financial',
    columns: [
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount' },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'amount', label: 'Amount ($)', type: 'number' },
      { key: 'type', label: 'Type', type: 'select', options: ['revenue', 'expense'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'pending'] }
    ]
  },
  {
    path: 'member-directory',
    title: 'Member Directory',
    icon: '\u{1F4CB}',
    description: 'Browse and manage member information',
    apiEndpoint: '/api/member-directory',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'membership_tier', label: 'Membership Tier' },
      { key: 'join_date', label: 'Join Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'name', label: 'Full Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'membership_tier', label: 'Membership Tier', type: 'select', options: ['Gold', 'Silver', 'Bronze', 'Platinum'] },
      { key: 'join_date', label: 'Join Date', type: 'date' },
      { key: 'handicap', label: 'Handicap', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
    ]
  },
  {
    path: 'caddies',
    title: 'Caddie Management',
    icon: '\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}',
    description: 'Manage caddie roster and availability',
    apiEndpoint: '/api/caddies',
    columns: [
      { key: 'name', label: 'Caddie' },
      { key: 'experience_years', label: 'Experience (yrs)' },
      { key: 'rating', label: 'Rating' },
      { key: 'availability', label: 'Availability' },
      { key: 'hourly_rate', label: 'Hourly Rate' }
    ],
    formFields: [
      { key: 'name', label: 'Caddie Name', type: 'text' },
      { key: 'experience_years', label: 'Experience (years)', type: 'number' },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
      { key: 'availability', label: 'Availability', type: 'select', options: ['available', 'on_loop', 'off_duty'] },
      { key: 'certifications', label: 'Certifications', type: 'text' },
      { key: 'hourly_rate', label: 'Hourly Rate ($)', type: 'number' }
    ]
  },
  {
    path: 'lockers',
    title: 'Locker Management',
    icon: '\u{1F510}',
    description: 'Manage locker assignments and availability',
    apiEndpoint: '/api/lockers',
    columns: [
      { key: 'locker_number', label: 'Locker #' },
      { key: 'member_name', label: 'Member' },
      { key: 'size', label: 'Size' },
      { key: 'annual_fee', label: 'Annual Fee' },
      { key: 'expiry_date', label: 'Expiry Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'locker_number', label: 'Locker Number', type: 'text' },
      { key: 'member_name', label: 'Member Name', type: 'text' },
      { key: 'size', label: 'Size', type: 'select', options: ['standard', 'large', 'premium'] },
      { key: 'status', label: 'Status', type: 'select', options: ['available', 'occupied', 'maintenance'] },
      { key: 'annual_fee', label: 'Annual Fee ($)', type: 'number' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date' }
    ]
  },
  {
    path: 'bag-storage',
    title: 'Bag Storage',
    icon: '\u{1F392}',
    description: 'Manage bag storage and drop-off',
    apiEndpoint: '/api/bag-storage',
    columns: [
      { key: 'member_name', label: 'Member' },
      { key: 'bag_brand', label: 'Bag Brand' },
      { key: 'storage_location', label: 'Location' },
      { key: 'monthly_fee', label: 'Monthly Fee' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'member_name', label: 'Member Name', type: 'text' },
      { key: 'bag_brand', label: 'Bag Brand', type: 'text' },
      { key: 'storage_location', label: 'Storage Location', type: 'text' },
      { key: 'monthly_fee', label: 'Monthly Fee ($)', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
    ]
  },
  {
    path: 'marshals',
    title: 'Marshal Scheduling',
    icon: '\u{1F46E}',
    description: 'Schedule course marshals and patrol routes',
    apiEndpoint: '/api/marshals',
    columns: [
      { key: 'name', label: 'Marshal' },
      { key: 'date', label: 'Date' },
      { key: 'shift', label: 'Shift' },
      { key: 'area', label: 'Area' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'name', label: 'Marshal Name', type: 'text' },
      { key: 'shift', label: 'Shift', type: 'select', options: ['morning', 'afternoon'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'area', label: 'Area', type: 'select', options: ['Front Nine', 'Back Nine', 'Full Course'] },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'on_duty', 'off_duty'] },
      { key: 'phone', label: 'Phone', type: 'text' }
    ]
  },
  {
    path: 'pace-of-play',
    title: 'Pace of Play',
    icon: '\u23F1\uFE0F',
    description: 'Monitor and manage pace of play',
    apiEndpoint: '/api/pace-of-play',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'hole_number', label: 'Hole' },
      { key: 'group_id', label: 'Group' },
      { key: 'time_minutes', label: 'Time (min)' },
      { key: 'status', label: 'Status' }
    ],
    formFields: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'hole_number', label: 'Hole Number', type: 'number' },
      { key: 'group_id', label: 'Group ID', type: 'text' },
      { key: 'time_minutes', label: 'Time (minutes)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['on_pace', 'slow', 'behind'] },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    path: 'practice-facilities',
    title: 'Practice Facilities',
    icon: '\u{1F3AF}',
    description: 'Manage practice areas and equipment',
    apiEndpoint: '/api/practice-facilities',
    columns: [
      { key: 'name', label: 'Facility' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'operating_hours', label: 'Hours' }
    ],
    formFields: [
      { key: 'name', label: 'Facility Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'select', options: ['driving_range', 'putting_green', 'chipping_green', 'teaching', 'simulator', 'bunker', 'net', 'mixed', 'fitness', 'fitting', 'pitching'] },
      { key: 'status', label: 'Status', type: 'select', options: ['open', 'closed', 'maintenance'] },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'operating_hours', label: 'Operating Hours', type: 'text' },
      { key: 'equipment', label: 'Equipment', type: 'textarea' }
    ]
  },
  {
    path: 'greens-fees',
    title: 'Greens Fee Management',
    icon: '\u{1F4B5}',
    description: 'Manage greens fee rates and specials',
    apiEndpoint: '/api/greens-fees',
    columns: [
      { key: 'fee_type', label: 'Fee Type' },
      { key: 'rate', label: 'Rate' },
      { key: 'day_type', label: 'Day Type' },
      { key: 'season', label: 'Season' },
      { key: 'holes', label: 'Holes' },
      { key: 'cart_included', label: 'Cart Included' }
    ],
    formFields: [
      { key: 'fee_type', label: 'Fee Type', type: 'text' },
      { key: 'rate', label: 'Rate ($)', type: 'number' },
      { key: 'day_type', label: 'Day Type', type: 'select', options: ['weekday', 'weekend'] },
      { key: 'season', label: 'Season', type: 'select', options: ['peak', 'off_peak', 'regular'] },
      { key: 'cart_included', label: 'Cart Included', type: 'checkbox' },
      { key: 'holes', label: 'Holes', type: 'select', options: ['9', '18'] }
    ]
  }
];

export const aiFeatureConfigs = [
  {
    path: 'ai/dynamic-pricing',
    title: 'Dynamic Pricing',
    icon: '\u{1F916}',
    description: 'AI-powered dynamic tee time pricing based on weather conditions, demand levels, time of day, and historical data to optimize revenue while maintaining fair pricing for members.',
    endpoint: '/api/ai/dynamic-pricing',
    inputFields: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'current_bookings', label: 'Current Bookings', type: 'number' },
      { key: 'weather', label: 'Weather Conditions', type: 'text' },
      { key: 'base_price', label: 'Base Price ($)', type: 'number' }
    ]
  },
  {
    path: 'ai/course-conditions',
    title: 'Course Conditions',
    icon: '\u{1F4DD}',
    description: 'AI analysis of current course conditions including green speed, fairway health, bunker quality, and overall playability rating based on maintenance data and weather patterns.',
    endpoint: '/api/ai/course-conditions',
    inputFields: [
      { key: 'area', label: 'Course Area', type: 'select', options: ['Full Course', 'Front 9', 'Back 9', 'Greens', 'Fairways', 'Bunkers'] },
      { key: 'recent_rainfall', label: 'Recent Rainfall (inches)', type: 'number' },
      { key: 'temperature', label: 'Temperature (F)', type: 'number' },
      { key: 'last_maintenance', label: 'Last Maintenance Date', type: 'date' },
      { key: 'notes', label: 'Additional Notes', type: 'textarea' }
    ]
  },
  {
    path: 'ai/handicap-analysis',
    title: 'Handicap Analysis',
    icon: '\u{1F4C8}',
    description: 'Deep AI analysis of player handicap trends, performance patterns, strengths and weaknesses, and personalized improvement recommendations.',
    endpoint: '/api/ai/handicap-analysis',
    inputFields: [
      { key: 'player_name', label: 'Player Name', type: 'text' },
      { key: 'current_handicap', label: 'Current Handicap', type: 'number' },
      { key: 'recent_scores', label: 'Recent Scores (comma-separated)', type: 'text' },
      { key: 'goals', label: 'Improvement Goals', type: 'textarea' }
    ]
  },
  {
    path: 'ai/product-recommendations',
    title: 'Product Recommendations',
    icon: '\u{1F4A1}',
    description: 'AI-powered product recommendations for the pro shop based on member preferences, purchase history, trends, and inventory analysis.',
    endpoint: '/api/ai/product-recommendations',
    inputFields: [
      { key: 'member_name', label: 'Member Name', type: 'text' },
      { key: 'handicap', label: 'Handicap', type: 'number' },
      { key: 'budget', label: 'Budget ($)', type: 'number' },
      { key: 'category', label: 'Category', type: 'select', options: ['Clubs', 'Balls', 'Apparel', 'Shoes', 'Accessories', 'All'] },
      { key: 'preferences', label: 'Preferences & Notes', type: 'textarea' }
    ]
  },
  {
    path: 'ai/member-communications',
    title: 'Member Communications',
    icon: '\u2709\uFE0F',
    description: 'AI-generated personalized member communications including newsletters, event invitations, renewal reminders, and engagement campaigns.',
    endpoint: '/api/ai/member-communications',
    inputFields: [
      { key: 'communication_type', label: 'Communication Type', type: 'select', options: ['Newsletter', 'Event Invitation', 'Renewal Reminder', 'Welcome Email', 'Tournament Announcement', 'Seasonal Update'] },
      { key: 'target_audience', label: 'Target Audience', type: 'select', options: ['All Members', 'Gold Members', 'New Members', 'Expiring Memberships', 'Tournament Players', 'League Players'] },
      { key: 'subject', label: 'Subject / Topic', type: 'text' },
      { key: 'key_points', label: 'Key Points to Include', type: 'textarea' },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Urgent', 'Celebratory', 'Informative'] }
    ]
  },
  {
    path: 'ai/maintenance-optimization',
    title: 'Maintenance Optimization',
    icon: '\u{1F52C}',
    description: 'AI-optimized maintenance scheduling and resource allocation based on weather forecasts, usage patterns, seasonal requirements, and budget constraints.',
    endpoint: '/api/ai/maintenance-optimization',
    inputFields: [
      { key: 'area', label: 'Course Area', type: 'select', options: ['Full Course', 'Greens', 'Fairways', 'Tee Boxes', 'Bunkers', 'Irrigation', 'Landscaping'] },
      { key: 'budget', label: 'Monthly Budget ($)', type: 'number' },
      { key: 'staff_available', label: 'Staff Available', type: 'number' },
      { key: 'upcoming_events', label: 'Upcoming Events', type: 'textarea' },
      { key: 'priority', label: 'Priority Focus', type: 'select', options: ['Aesthetics', 'Playability', 'Cost Savings', 'Tournament Prep', 'Seasonal Transition'] }
    ]
  },
  // ─── New AI endpoints (server/routes/ai.js) ──────────────────────────────
  {
    path: 'ai/round-pairing',
    title: 'Round Pairing',
    icon: '⛳',
    description: 'Group players into balanced foursomes by handicap and pace, with rationale.',
    endpoint: '/api/ai/round-pairing',
    inputFields: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'players_text', label: 'Players (one per line: name, handicap, pace)', type: 'textarea' },
      { key: 'goal', label: 'Pairing goal', type: 'select', options: ['balanced', 'social_mix', 'competitive', 'pace_optimized'] },
    ],
  },
  {
    path: 'ai/facility-utilization-forecast',
    title: 'Facility Utilization Forecast',
    icon: '\u{1F4C5}',
    description: 'Predict peak windows and pricing actions per facility from 60-day tee-time demand by dow/hour.',
    endpoint: '/api/ai/facility-utilization-forecast',
    inputFields: [
      { key: 'facility', label: 'Facility / Course Name', type: 'text' },
      { key: 'horizon_days', label: 'Forecast horizon (days)', type: 'number' },
      { key: 'season_notes', label: 'Seasonal / weather notes', type: 'textarea' },
    ],
  },
  {
    path: 'ai/member-retention',
    title: 'Member Retention',
    icon: '\u{1F4AB}',
    description: 'Personalized retention offers per member with estimated save probability.',
    endpoint: '/api/ai/member-retention',
    inputFields: [
      { key: 'recency_days', label: 'Round / payment recency threshold (days)', type: 'number' },
      { key: 'risk_focus', label: 'Risk focus', type: 'select', options: ['churn', 'downgrade', 'low_engagement', 'lapsed'] },
      { key: 'budget_per_member', label: 'Max retention spend per member ($)', type: 'number' },
      { key: 'notes', label: 'Notes / context', type: 'textarea' },
    ],
  },
  {
    path: 'ai/tournament-format-recommendation',
    title: 'Tournament Format Recommendation',
    icon: '\u{1F3C6}',
    description: 'Recommend a tournament format that fits field size, skill mix, audience, and time budget.',
    endpoint: '/api/ai/tournament-format-recommendation',
    inputFields: [
      { key: 'event_name', label: 'Event name', type: 'text' },
      { key: 'field_size', label: 'Expected field size', type: 'number' },
      { key: 'audience', label: 'Audience', type: 'select', options: ['mixed_membership', 'men', 'women', 'junior', 'senior', 'corporate', 'charity'] },
      { key: 'duration_hours', label: 'Target duration (hours)', type: 'number' },
      { key: 'preferred_formats', label: 'Preferred formats (comma-separated)', type: 'text' },
      { key: 'notes', label: 'Notes / constraints', type: 'textarea' },
    ],
  },
];

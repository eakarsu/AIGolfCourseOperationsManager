require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS pace_of_play CASCADE;
      DROP TABLE IF EXISTS marshals CASCADE;
      DROP TABLE IF EXISTS bag_storage CASCADE;
      DROP TABLE IF EXISTS lockers CASCADE;
      DROP TABLE IF EXISTS caddies CASCADE;
      DROP TABLE IF EXISTS member_directory CASCADE;
      DROP TABLE IF EXISTS financial_records CASCADE;
      DROP TABLE IF EXISTS leagues CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS food_beverage CASCADE;
      DROP TABLE IF EXISTS weather_records CASCADE;
      DROP TABLE IF EXISTS maintenance_tasks CASCADE;
      DROP TABLE IF EXISTS lessons CASCADE;
      DROP TABLE IF EXISTS driving_range CASCADE;
      DROP TABLE IF EXISTS golf_carts CASCADE;
      DROP TABLE IF EXISTS pro_shop_items CASCADE;
      DROP TABLE IF EXISTS tournaments CASCADE;
      DROP TABLE IF EXISTS handicaps CASCADE;
      DROP TABLE IF EXISTS memberships CASCADE;
      DROP TABLE IF EXISTS tee_times CASCADE;
      DROP TABLE IF EXISTS greens_fees CASCADE;
      DROP TABLE IF EXISTS practice_facilities CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('Tables dropped.');

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE tee_times (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        holes INTEGER DEFAULT 18,
        players INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'confirmed',
        cart_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE memberships (
        id SERIAL PRIMARY KEY,
        member_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        tier VARCHAR(50) DEFAULT 'Silver',
        dues_amount DECIMAL(10,2),
        billing_cycle VARCHAR(50) DEFAULT 'monthly',
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE handicaps (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        handicap_index DECIMAL(4,1),
        rounds_played INTEGER DEFAULT 0,
        last_round_date DATE,
        trend VARCHAR(50) DEFAULT 'stable',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE tournaments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        format VARCHAR(100),
        entry_fee DECIMAL(10,2) DEFAULT 0,
        max_players INTEGER DEFAULT 72,
        current_players INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'upcoming',
        flight VARCHAR(10) DEFAULT 'A',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE pro_shop_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        brand VARCHAR(100),
        price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        sku VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE golf_carts (
        id SERIAL PRIMARY KEY,
        cart_number VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        last_maintenance DATE,
        next_maintenance DATE,
        gps_enabled BOOLEAN DEFAULT true,
        battery_level INTEGER DEFAULT 100,
        mileage DECIMAL(10,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE driving_range (
        id SERIAL PRIMARY KEY,
        bucket_type VARCHAR(100) NOT NULL,
        price DECIMAL(10,2),
        balls_count INTEGER,
        inventory INTEGER DEFAULT 0,
        session_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE lessons (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        pro_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER DEFAULT 60,
        type VARCHAR(50) DEFAULT 'individual',
        status VARCHAR(50) DEFAULT 'scheduled',
        price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE maintenance_tasks (
        id SERIAL PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        area VARCHAR(100),
        type VARCHAR(100),
        scheduled_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to VARCHAR(255),
        priority VARCHAR(20) DEFAULT 'medium',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE weather_records (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        temperature DECIMAL(5,1),
        humidity DECIMAL(5,1),
        wind_speed DECIMAL(5,1),
        wind_direction VARCHAR(10),
        conditions VARCHAR(100) DEFAULT 'clear',
        precipitation DECIMAL(5,2) DEFAULT 0,
        forecast TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE food_beverage (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10,2),
        available BOOLEAN DEFAULT true,
        description TEXT,
        calories INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        date DATE NOT NULL,
        time TIME,
        attendees INTEGER DEFAULT 0,
        venue VARCHAR(255),
        status VARCHAR(50) DEFAULT 'planned',
        contact VARCHAR(255),
        price DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE leagues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        format VARCHAR(100),
        start_date DATE,
        end_date DATE,
        members_count INTEGER DEFAULT 0,
        day_of_week VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        fee DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE financial_records (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        description TEXT,
        amount DECIMAL(12,2),
        type VARCHAR(50) DEFAULT 'revenue',
        date DATE,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE member_directory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        membership_tier VARCHAR(50),
        join_date DATE,
        handicap DECIMAL(4,1),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE caddies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        experience_years INTEGER DEFAULT 0,
        rating DECIMAL(3,1) DEFAULT 5.0,
        availability VARCHAR(50) DEFAULT 'available',
        certifications VARCHAR(255),
        hourly_rate DECIMAL(10,2) DEFAULT 25,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE lockers (
        id SERIAL PRIMARY KEY,
        locker_number VARCHAR(20) NOT NULL,
        member_name VARCHAR(255),
        size VARCHAR(20) DEFAULT 'standard',
        status VARCHAR(50) DEFAULT 'available',
        annual_fee DECIMAL(10,2) DEFAULT 200,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE bag_storage (
        id SERIAL PRIMARY KEY,
        member_name VARCHAR(255) NOT NULL,
        bag_brand VARCHAR(100),
        storage_location VARCHAR(100),
        monthly_fee DECIMAL(10,2) DEFAULT 25,
        start_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE marshals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        shift VARCHAR(50) DEFAULT 'morning',
        date DATE NOT NULL,
        area VARCHAR(100),
        status VARCHAR(50) DEFAULT 'scheduled',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE pace_of_play (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        hole_number INTEGER NOT NULL,
        group_id VARCHAR(50),
        time_minutes DECIMAL(5,1),
        status VARCHAR(50) DEFAULT 'on_pace',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE practice_facilities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'open',
        capacity INTEGER DEFAULT 20,
        operating_hours VARCHAR(100),
        equipment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE greens_fees (
        id SERIAL PRIMARY KEY,
        fee_type VARCHAR(100) NOT NULL,
        rate DECIMAL(10,2),
        day_type VARCHAR(50) DEFAULT 'weekday',
        season VARCHAR(50) DEFAULT 'regular',
        cart_included BOOLEAN DEFAULT false,
        holes INTEGER DEFAULT 18,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tables created.');

    // Seed demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
      ['admin@golfclub.com', hashedPassword, 'Club Administrator', 'admin']
    );
    console.log('Demo user created.');

    // Seed tee_times
    await client.query(`
      INSERT INTO tee_times (player_name, date, time, holes, players, status, cart_required) VALUES
      ('James Whitfield', '2026-03-24', '07:00', 18, 4, 'confirmed', true),
      ('Robert Chen', '2026-03-24', '07:12', 18, 2, 'confirmed', false),
      ('Patricia Holloway', '2026-03-24', '07:24', 18, 4, 'confirmed', true),
      ('Michael Torres', '2026-03-24', '07:36', 18, 3, 'confirmed', true),
      ('Elizabeth Warren', '2026-03-24', '08:00', 18, 2, 'pending', false),
      ('David Kim', '2026-03-24', '08:12', 9, 2, 'confirmed', true),
      ('Sarah Mitchell', '2026-03-24', '08:24', 18, 4, 'confirmed', true),
      ('Thomas Anderson', '2026-03-24', '09:00', 18, 4, 'confirmed', false),
      ('Jennifer Lopez', '2026-03-24', '09:30', 18, 2, 'pending', true),
      ('William Harris', '2026-03-24', '10:00', 18, 4, 'confirmed', true),
      ('Amanda Foster', '2026-03-25', '07:00', 18, 4, 'confirmed', true),
      ('Christopher Blake', '2026-03-25', '07:30', 18, 3, 'confirmed', false),
      ('Laura Martinez', '2026-03-25', '08:00', 9, 2, 'confirmed', true),
      ('Daniel Wright', '2026-03-25', '08:30', 18, 4, 'pending', true),
      ('Michelle Park', '2026-03-25', '09:00', 18, 2, 'cancelled', false)
    `);

    // Seed memberships
    await client.query(`
      INSERT INTO memberships (member_name, email, tier, dues_amount, billing_cycle, start_date, end_date, status) VALUES
      ('James Whitfield', 'j.whitfield@email.com', 'Platinum', 850.00, 'monthly', '2025-01-01', '2026-12-31', 'active'),
      ('Robert Chen', 'r.chen@email.com', 'Gold', 550.00, 'monthly', '2025-03-15', '2026-03-14', 'active'),
      ('Patricia Holloway', 'p.holloway@email.com', 'Platinum', 850.00, 'monthly', '2024-06-01', '2026-05-31', 'active'),
      ('Michael Torres', 'm.torres@email.com', 'Silver', 350.00, 'monthly', '2025-09-01', '2026-08-31', 'active'),
      ('Elizabeth Warren', 'e.warren@email.com', 'Gold', 550.00, 'monthly', '2025-01-15', '2026-01-14', 'active'),
      ('David Kim', 'd.kim@email.com', 'Bronze', 200.00, 'monthly', '2025-11-01', '2026-10-31', 'active'),
      ('Sarah Mitchell', 's.mitchell@email.com', 'Gold', 6000.00, 'annual', '2025-01-01', '2025-12-31', 'active'),
      ('Thomas Anderson', 't.anderson@email.com', 'Platinum', 9500.00, 'annual', '2025-01-01', '2025-12-31', 'active'),
      ('Jennifer Lopez', 'j.lopez@email.com', 'Silver', 350.00, 'monthly', '2025-07-01', '2026-06-30', 'active'),
      ('William Harris', 'w.harris@email.com', 'Gold', 550.00, 'monthly', '2025-04-01', '2026-03-31', 'active'),
      ('Amanda Foster', 'a.foster@email.com', 'Bronze', 200.00, 'monthly', '2026-01-01', '2026-12-31', 'active'),
      ('Christopher Blake', 'c.blake@email.com', 'Silver', 350.00, 'monthly', '2025-08-01', '2026-07-31', 'active'),
      ('Laura Martinez', 'l.martinez@email.com', 'Gold', 550.00, 'monthly', '2025-05-01', '2026-04-30', 'active'),
      ('Daniel Wright', 'd.wright@email.com', 'Platinum', 850.00, 'monthly', '2025-02-01', '2026-01-31', 'active'),
      ('Michelle Park', 'm.park@email.com', 'Bronze', 2200.00, 'annual', '2025-01-01', '2025-12-31', 'expired')
    `);

    // Seed handicaps
    await client.query(`
      INSERT INTO handicaps (player_name, handicap_index, rounds_played, last_round_date, trend) VALUES
      ('James Whitfield', 4.2, 82, '2026-03-20', 'improving'),
      ('Robert Chen', 12.8, 45, '2026-03-18', 'stable'),
      ('Patricia Holloway', 8.5, 67, '2026-03-21', 'improving'),
      ('Michael Torres', 18.3, 28, '2026-03-15', 'worsening'),
      ('Elizabeth Warren', 15.1, 34, '2026-03-19', 'stable'),
      ('David Kim', 22.6, 15, '2026-03-10', 'improving'),
      ('Sarah Mitchell', 6.7, 73, '2026-03-22', 'improving'),
      ('Thomas Anderson', 2.1, 95, '2026-03-22', 'stable'),
      ('Jennifer Lopez', 19.4, 22, '2026-03-12', 'improving'),
      ('William Harris', 10.3, 56, '2026-03-20', 'worsening'),
      ('Amanda Foster', 25.8, 12, '2026-03-08', 'improving'),
      ('Christopher Blake', 14.7, 38, '2026-03-17', 'stable'),
      ('Laura Martinez', 9.2, 61, '2026-03-21', 'improving'),
      ('Daniel Wright', 3.8, 88, '2026-03-22', 'stable'),
      ('Michelle Park', 16.9, 30, '2026-03-14', 'worsening')
    `);

    // Seed tournaments
    await client.query(`
      INSERT INTO tournaments (name, date, format, entry_fee, max_players, current_players, status, flight) VALUES
      ('Spring Club Championship', '2026-04-11', 'stroke', 150.00, 72, 64, 'upcoming', 'A'),
      ('Member-Guest Invitational', '2026-04-25', 'best_ball', 250.00, 96, 82, 'upcoming', 'A'),
      ('Ladies Classic', '2026-05-02', 'stroke', 100.00, 48, 35, 'upcoming', 'A'),
      ('Senior Masters', '2026-05-16', 'stroke', 125.00, 60, 48, 'upcoming', 'B'),
      ('Junior Development Cup', '2026-05-30', 'stableford', 50.00, 36, 28, 'upcoming', 'C'),
      ('Fourth of July Scramble', '2026-07-04', 'scramble', 75.00, 120, 0, 'registration', 'A'),
      ('Club Match Play Championship', '2026-06-06', 'match_play', 125.00, 32, 32, 'upcoming', 'A'),
      ('Couples Tournament', '2026-06-20', 'alternate_shot', 200.00, 48, 30, 'registration', 'A'),
      ('Labor Day Classic', '2026-09-07', 'stroke', 100.00, 72, 0, 'registration', 'A'),
      ('Fall Invitational', '2026-10-10', 'best_ball', 175.00, 96, 0, 'registration', 'A'),
      ('Turkey Shoot', '2026-11-21', 'scramble', 60.00, 80, 0, 'registration', 'A'),
      ('Winter Solstice Cup', '2026-12-19', 'stableford', 80.00, 48, 0, 'registration', 'B'),
      ('New Year Kickoff', '2026-01-10', 'scramble', 65.00, 80, 72, 'completed', 'A'),
      ('Valentines Couples', '2026-02-14', 'best_ball', 150.00, 48, 44, 'completed', 'A'),
      ('St. Patricks Shamble', '2026-03-17', 'shamble', 85.00, 72, 68, 'completed', 'A')
    `);

    // Seed pro_shop_items
    await client.query(`
      INSERT INTO pro_shop_items (name, category, brand, price, stock, sku) VALUES
      ('Pro V1 Golf Balls (dozen)', 'balls', 'Titleist', 54.99, 48, 'TIT-PV1-12'),
      ('TP5x Golf Balls (dozen)', 'balls', 'TaylorMade', 49.99, 36, 'TM-TP5X-12'),
      ('Stealth 2 Driver', 'clubs', 'TaylorMade', 599.99, 5, 'TM-ST2-DR'),
      ('Paradym X Irons (5-PW)', 'clubs', 'Callaway', 899.99, 3, 'CAL-PDX-IP'),
      ('Spider GT Putter', 'clubs', 'TaylorMade', 349.99, 8, 'TM-SGT-PT'),
      ('Tour Staff Bag', 'bags', 'Titleist', 399.99, 6, 'TIT-TSB-01'),
      ('FlexTech Crossover Stand Bag', 'bags', 'TaylorMade', 249.99, 10, 'TM-FTC-SB'),
      ('StaSof Golf Glove', 'accessories', 'FootJoy', 24.99, 60, 'FJ-SS-GL'),
      ('Tour Visor', 'apparel', 'Titleist', 29.99, 25, 'TIT-TV-01'),
      ('Dri-FIT Polo', 'apparel', 'Nike', 79.99, 30, 'NK-DFP-01'),
      ('Pro SL Golf Shoes', 'footwear', 'FootJoy', 169.99, 12, 'FJ-PSL-SH'),
      ('Rangefinder Pro X3', 'electronics', 'Bushnell', 299.99, 7, 'BSH-PX3-RF'),
      ('Golf GPS Watch', 'electronics', 'Garmin', 249.99, 9, 'GAR-GPS-W'),
      ('Rain Suit (jacket + pants)', 'apparel', 'Under Armour', 189.99, 15, 'UA-RS-SET'),
      ('Alignment Sticks (pair)', 'training', 'Tour Sticks', 34.99, 20, 'TS-AS-PR')
    `);

    // Seed golf_carts
    await client.query(`
      INSERT INTO golf_carts (cart_number, status, last_maintenance, next_maintenance, gps_enabled, battery_level, mileage) VALUES
      ('C-001', 'available', '2026-03-01', '2026-04-01', true, 95, 1250.5),
      ('C-002', 'available', '2026-03-01', '2026-04-01', true, 88, 1180.3),
      ('C-003', 'in_use', '2026-02-15', '2026-03-15', true, 72, 1420.7),
      ('C-004', 'available', '2026-03-10', '2026-04-10', true, 100, 980.2),
      ('C-005', 'maintenance', '2026-03-20', '2026-04-20', true, 15, 2100.8),
      ('C-006', 'available', '2026-03-05', '2026-04-05', true, 91, 1340.1),
      ('C-007', 'in_use', '2026-02-28', '2026-03-28', true, 65, 1560.4),
      ('C-008', 'available', '2026-03-12', '2026-04-12', false, 97, 890.6),
      ('C-009', 'available', '2026-03-08', '2026-04-08', true, 82, 1670.9),
      ('C-010', 'in_use', '2026-03-15', '2026-04-15', true, 58, 1450.3),
      ('C-011', 'available', '2026-03-18', '2026-04-18', true, 100, 720.1),
      ('C-012', 'available', '2026-03-02', '2026-04-02', true, 93, 1120.5),
      ('C-013', 'maintenance', '2026-03-22', '2026-04-22', true, 0, 2450.8),
      ('C-014', 'available', '2026-03-07', '2026-04-07', true, 86, 1380.2),
      ('C-015', 'available', '2026-03-14', '2026-04-14', false, 79, 1590.7)
    `);

    // Seed driving_range
    await client.query(`
      INSERT INTO driving_range (bucket_type, price, balls_count, inventory, session_date) VALUES
      ('Small Bucket', 8.00, 35, 5000, '2026-03-23'),
      ('Medium Bucket', 12.00, 65, 5000, '2026-03-23'),
      ('Large Bucket', 16.00, 100, 5000, '2026-03-23'),
      ('Jumbo Bucket', 22.00, 150, 3000, '2026-03-23'),
      ('Unlimited Session', 30.00, 999, 3000, '2026-03-23'),
      ('Small Bucket', 8.00, 35, 4800, '2026-03-22'),
      ('Medium Bucket', 12.00, 65, 4800, '2026-03-22'),
      ('Large Bucket', 16.00, 100, 4800, '2026-03-22'),
      ('Junior Bucket', 5.00, 25, 2000, '2026-03-23'),
      ('Warm-Up Bucket', 6.00, 20, 3000, '2026-03-23'),
      ('Small Bucket', 8.00, 35, 4600, '2026-03-21'),
      ('Medium Bucket', 12.00, 65, 4600, '2026-03-21'),
      ('Large Bucket', 16.00, 100, 4600, '2026-03-21'),
      ('Premium Lesson Bucket', 0.00, 100, 1000, '2026-03-23'),
      ('Member Complimentary', 0.00, 50, 2000, '2026-03-23')
    `);

    // Seed lessons
    await client.query(`
      INSERT INTO lessons (student_name, pro_name, date, time, duration, type, status, price) VALUES
      ('David Kim', 'Pro Mike Richardson', '2026-03-24', '09:00', 60, 'individual', 'scheduled', 120.00),
      ('Amanda Foster', 'Pro Mike Richardson', '2026-03-24', '10:00', 60, 'individual', 'scheduled', 120.00),
      ('Jennifer Lopez', 'Pro Sarah Collins', '2026-03-24', '11:00', 90, 'individual', 'scheduled', 175.00),
      ('Michael Torres', 'Pro Mike Richardson', '2026-03-24', '14:00', 60, 'individual', 'scheduled', 120.00),
      ('Elizabeth Warren', 'Pro Sarah Collins', '2026-03-25', '09:00', 60, 'individual', 'scheduled', 120.00),
      ('Robert Chen', 'Pro James Taylor', '2026-03-25', '10:00', 30, 'short_game', 'scheduled', 75.00),
      ('Group Clinic', 'Pro Mike Richardson', '2026-03-25', '15:00', 120, 'group', 'scheduled', 45.00),
      ('Laura Martinez', 'Pro Sarah Collins', '2026-03-26', '09:00', 60, 'individual', 'scheduled', 120.00),
      ('William Harris', 'Pro James Taylor', '2026-03-26', '11:00', 60, 'putting', 'scheduled', 100.00),
      ('Christopher Blake', 'Pro Mike Richardson', '2026-03-26', '14:00', 60, 'individual', 'scheduled', 120.00),
      ('Michelle Park', 'Pro Sarah Collins', '2026-03-27', '09:00', 90, 'individual', 'confirmed', 175.00),
      ('Junior Clinic', 'Pro James Taylor', '2026-03-27', '16:00', 90, 'group', 'scheduled', 35.00),
      ('Daniel Wright', 'Pro Mike Richardson', '2026-03-22', '10:00', 60, 'individual', 'completed', 120.00),
      ('Sarah Mitchell', 'Pro Sarah Collins', '2026-03-21', '09:00', 60, 'individual', 'completed', 120.00),
      ('Thomas Anderson', 'Pro James Taylor', '2026-03-20', '14:00', 30, 'short_game', 'completed', 75.00)
    `);

    // Seed maintenance_tasks
    await client.query(`
      INSERT INTO maintenance_tasks (task_name, area, type, scheduled_date, status, assigned_to, priority, notes) VALUES
      ('Mow Greens', 'All Greens', 'mowing', '2026-03-24', 'pending', 'Carlos Rivera', 'high', 'Cut to 0.125 inches for tournament prep'),
      ('Aerate Fairways 1-9', 'Front Nine Fairways', 'aeration', '2026-03-25', 'pending', 'Team A', 'medium', 'Core aeration with 0.5 inch tines'),
      ('Bunker Raking', 'All Bunkers', 'grooming', '2026-03-24', 'pending', 'Miguel Santos', 'high', 'Full rake and edge maintenance'),
      ('Irrigation Check', 'Back Nine', 'irrigation', '2026-03-24', 'in_progress', 'Dave Wilson', 'high', 'Heads on holes 14 and 16 need adjustment'),
      ('Fertilize Tees', 'All Tee Boxes', 'fertilization', '2026-03-26', 'pending', 'Team B', 'medium', 'Spring fertilizer application'),
      ('Tree Trimming', 'Hole 7, Hole 12', 'landscaping', '2026-03-27', 'pending', 'External Contractor', 'low', 'Remove overhanging branches on cart path'),
      ('Paint Yardage Markers', 'All Fairways', 'cosmetic', '2026-03-28', 'pending', 'Miguel Santos', 'low', 'Refresh 100, 150, 200 yard markers'),
      ('Overseed Thin Areas', 'Hole 3, Hole 11 Fairways', 'seeding', '2026-03-25', 'pending', 'Carlos Rivera', 'medium', 'Use perennial ryegrass blend'),
      ('Drainage Repair', 'Hole 5 Left Side', 'repair', '2026-03-29', 'pending', 'Dave Wilson', 'high', 'Standing water after rain events'),
      ('Mow Rough', 'All Rough Areas', 'mowing', '2026-03-24', 'pending', 'Team A', 'medium', 'Cut to 2.5 inches'),
      ('Cart Path Repair', 'Hole 9 to Hole 10', 'repair', '2026-03-30', 'pending', 'External Contractor', 'medium', 'Fill cracks and resurface'),
      ('Pest Control', 'Greens Complex', 'chemical', '2026-03-26', 'pending', 'Carlos Rivera', 'high', 'Treat for grubs detected on hole 6'),
      ('Pond Maintenance', 'Hole 4 Water Feature', 'landscaping', '2026-03-28', 'pending', 'Team B', 'low', 'Clean algae, check fountain pump'),
      ('Topdress Greens', 'All Greens', 'topdressing', '2026-03-22', 'completed', 'Team A', 'high', 'Light sand application completed'),
      ('Mow Greens', 'All Greens', 'mowing', '2026-03-23', 'completed', 'Carlos Rivera', 'high', 'Standard daily cut')
    `);

    // Seed weather_records
    await client.query(`
      INSERT INTO weather_records (date, temperature, humidity, wind_speed, wind_direction, conditions, precipitation, forecast) VALUES
      ('2026-03-23', 74.0, 52.0, 8.5, 'SW', 'sunny', 0.00, 'Clear skies through evening'),
      ('2026-03-22', 71.0, 58.0, 12.0, 'W', 'partly_cloudy', 0.00, 'Partly cloudy with afternoon sun'),
      ('2026-03-21', 68.0, 65.0, 6.0, 'S', 'cloudy', 0.10, 'Light morning drizzle, clearing by noon'),
      ('2026-03-20', 65.0, 72.0, 15.0, 'NW', 'rainy', 0.85, 'Rain through midday, clearing evening'),
      ('2026-03-19', 62.0, 78.0, 18.0, 'N', 'rainy', 1.20, 'Heavy rain, course cart-path only'),
      ('2026-03-18', 70.0, 45.0, 5.0, 'SE', 'sunny', 0.00, 'Beautiful day for golf'),
      ('2026-03-17', 72.0, 48.0, 7.0, 'S', 'sunny', 0.00, 'Clear and calm'),
      ('2026-03-16', 69.0, 55.0, 10.0, 'SW', 'partly_cloudy', 0.00, 'Mild with light breeze'),
      ('2026-03-15', 63.0, 68.0, 14.0, 'W', 'cloudy', 0.05, 'Overcast with occasional mist'),
      ('2026-03-14', 60.0, 75.0, 20.0, 'NW', 'windy', 0.00, 'Strong winds, advise caution'),
      ('2026-03-13', 67.0, 50.0, 8.0, 'E', 'sunny', 0.00, 'Warm and pleasant'),
      ('2026-03-12', 58.0, 82.0, 12.0, 'NE', 'foggy', 0.00, 'Dense morning fog, clearing by 10 AM'),
      ('2026-03-11', 72.0, 42.0, 6.0, 'S', 'sunny', 0.00, 'Perfect conditions'),
      ('2026-03-10', 75.0, 38.0, 4.0, 'SE', 'sunny', 0.00, 'Hot and dry'),
      ('2026-03-24', 76.0, 50.0, 7.0, 'SW', 'sunny', 0.00, 'Forecast: Excellent playing conditions')
    `);

    // Seed food_beverage
    await client.query(`
      INSERT INTO food_beverage (item_name, category, price, available, description, calories) VALUES
      ('Classic Club Sandwich', 'lunch', 14.99, true, 'Turkey, bacon, lettuce, tomato on toasted sourdough', 580),
      ('Grilled Chicken Caesar Salad', 'lunch', 13.99, true, 'Romaine, parmesan, croutons with house-made dressing', 420),
      ('Angus Beef Burger', 'lunch', 16.99, true, '8oz patty with cheddar, lettuce, tomato, pickle', 750),
      ('Fish Tacos', 'lunch', 15.99, true, 'Grilled mahi-mahi with cilantro lime slaw', 490),
      ('Hot Dog (Turn)', 'snacks', 5.99, true, 'All-beef frank with choice of toppings', 310),
      ('Trail Mix', 'snacks', 4.99, true, 'Mixed nuts, dried fruit, chocolate chips', 280),
      ('Fresh Fruit Cup', 'snacks', 6.99, true, 'Seasonal fresh cut fruit', 120),
      ('Domestic Beer', 'beverages', 6.00, true, 'Bud Light, Coors Light, Miller Lite', 110),
      ('Craft Beer', 'beverages', 8.00, true, 'Rotating local craft selection', 180),
      ('Premium Cocktail', 'beverages', 12.00, true, 'Arnold Palmer, Bloody Mary, Mimosa', 200),
      ('Soft Drinks', 'beverages', 3.50, true, 'Coca-Cola, Diet Coke, Sprite, Water', 140),
      ('Breakfast Burrito', 'breakfast', 10.99, true, 'Eggs, sausage, peppers, cheese in flour tortilla', 520),
      ('Eggs Benedict', 'breakfast', 14.99, true, 'Poached eggs, Canadian bacon, hollandaise on English muffin', 620),
      ('Grilled Salmon', 'dinner', 28.99, true, 'Atlantic salmon with roasted vegetables and rice pilaf', 480),
      ('NY Strip Steak', 'dinner', 38.99, true, '12oz USDA Choice with baked potato and asparagus', 820)
    `);

    // Seed events
    await client.query(`
      INSERT INTO events (name, type, date, time, attendees, venue, status, contact, price) VALUES
      ('Johnson-Smith Wedding Reception', 'wedding', '2026-04-18', '17:00', 180, 'Grand Ballroom & Terrace', 'confirmed', 'Sarah Johnson 555-0142', 15000.00),
      ('Meridian Corp Golf Outing', 'corporate', '2026-04-22', '08:00', 96, 'Full Course & Pavilion', 'confirmed', 'Tom Bradley 555-0198', 12500.00),
      ('Annual Wine & Dine Gala', 'social', '2026-05-09', '18:30', 120, 'Grand Ballroom', 'planned', 'Events Committee', 8500.00),
      ('Charity Fundraiser - Childrens Hospital', 'charity', '2026-05-23', '07:30', 144, 'Full Course & Ballroom', 'confirmed', 'Dr. Lisa Park 555-0167', 0.00),
      ('Tech Startup Mixer', 'corporate', '2026-06-05', '16:00', 60, 'Clubhouse Lounge', 'planned', 'Jake Williams 555-0211', 3500.00),
      ('Summer Kickoff BBQ', 'social', '2026-06-21', '12:00', 200, 'Pool Area & Patio', 'planned', 'Events Committee', 2000.00),
      ('Anderson 50th Birthday', 'private', '2026-07-12', '19:00', 80, 'Private Dining Room', 'confirmed', 'Thomas Anderson 555-0133', 4500.00),
      ('Junior Golf Camp Graduation', 'club', '2026-07-25', '10:00', 60, 'Practice Facility & Patio', 'planned', 'Pro James Taylor', 500.00),
      ('Member Appreciation Night', 'club', '2026-08-15', '18:00', 150, 'Grand Ballroom', 'planned', 'Club Manager', 3000.00),
      ('Garcia-Williams Wedding', 'wedding', '2026-09-12', '16:00', 200, 'Grand Ballroom & Terrace', 'confirmed', 'Maria Garcia 555-0188', 18000.00),
      ('Acme Industries Team Building', 'corporate', '2026-09-25', '09:00', 48, 'Course & Meeting Room', 'planned', 'HR Dept 555-0299', 6000.00),
      ('Halloween Costume Party', 'social', '2026-10-31', '19:00', 100, 'Clubhouse Lounge', 'planned', 'Events Committee', 1500.00),
      ('Thanksgiving Member Dinner', 'club', '2026-11-26', '17:00', 120, 'Grand Ballroom', 'planned', 'Club Manager', 4000.00),
      ('Holiday Gala', 'social', '2026-12-12', '18:00', 180, 'Grand Ballroom', 'planned', 'Events Committee', 7500.00),
      ('New Years Eve Celebration', 'social', '2026-12-31', '20:00', 200, 'Full Clubhouse', 'planned', 'Events Committee', 10000.00)
    `);

    // Seed leagues
    await client.query(`
      INSERT INTO leagues (name, format, start_date, end_date, members_count, day_of_week, status, fee) VALUES
      ('Mens Wednesday League', 'stroke', '2026-04-01', '2026-09-30', 48, 'Wednesday', 'active', 250.00),
      ('Ladies Tuesday League', 'stableford', '2026-04-07', '2026-09-29', 36, 'Tuesday', 'active', 200.00),
      ('Senior Thursday League', 'best_ball', '2026-04-02', '2026-09-24', 32, 'Thursday', 'active', 175.00),
      ('Couples Friday Twilight', 'scramble', '2026-05-01', '2026-08-28', 24, 'Friday', 'upcoming', 300.00),
      ('Junior Saturday League', 'stableford', '2026-06-06', '2026-08-29', 20, 'Saturday', 'upcoming', 100.00),
      ('Business League', 'stroke', '2026-04-06', '2026-10-05', 40, 'Monday', 'active', 275.00),
      ('Nine & Dine League', 'scramble', '2026-05-15', '2026-09-18', 28, 'Friday', 'upcoming', 350.00),
      ('Champions League (Low Handicap)', 'stroke', '2026-04-08', '2026-09-30', 24, 'Wednesday', 'active', 300.00),
      ('Beginners League', 'scramble', '2026-05-04', '2026-07-27', 16, 'Monday', 'upcoming', 125.00),
      ('Mixed Doubles League', 'alternate_shot', '2026-04-05', '2026-09-27', 32, 'Sunday', 'active', 225.00),
      ('Winter Indoor League', 'simulator', '2026-01-05', '2026-03-30', 20, 'Monday', 'completed', 150.00),
      ('Sunday Skins Game', 'skins', '2026-04-05', '2026-10-25', 20, 'Sunday', 'active', 50.00),
      ('Early Bird League', 'stroke', '2026-04-07', '2026-09-29', 24, 'Tuesday', 'active', 200.00),
      ('Twilight League', 'stableford', '2026-05-06', '2026-08-26', 28, 'Wednesday', 'upcoming', 175.00),
      ('Inter-Club Challenge', 'match_play', '2026-05-10', '2026-09-13', 16, 'Sunday', 'upcoming', 400.00)
    `);

    // Seed financial_records
    await client.query(`
      INSERT INTO financial_records (category, description, amount, type, date, status) VALUES
      ('Membership Dues', 'March 2026 membership dues collection', 45250.00, 'revenue', '2026-03-01', 'completed'),
      ('Greens Fees', 'March 2026 daily greens fee revenue', 28750.00, 'revenue', '2026-03-15', 'completed'),
      ('Pro Shop Sales', 'March 2026 pro shop merchandise', 18420.00, 'revenue', '2026-03-15', 'completed'),
      ('Food & Beverage', 'March 2026 restaurant and bar revenue', 22100.00, 'revenue', '2026-03-15', 'completed'),
      ('Cart Rentals', 'March 2026 golf cart rental fees', 8900.00, 'revenue', '2026-03-15', 'completed'),
      ('Lesson Revenue', 'March 2026 lesson and clinic fees', 6750.00, 'revenue', '2026-03-15', 'completed'),
      ('Event Revenue', 'Johnson-Smith wedding deposit', 7500.00, 'revenue', '2026-03-10', 'completed'),
      ('Payroll', 'March 2026 staff payroll', 52000.00, 'expense', '2026-03-15', 'completed'),
      ('Course Maintenance', 'March 2026 maintenance supplies and equipment', 12500.00, 'expense', '2026-03-10', 'completed'),
      ('Utilities', 'March 2026 water, electric, gas', 8200.00, 'expense', '2026-03-05', 'completed'),
      ('Insurance', 'Q1 2026 liability and property insurance', 15000.00, 'expense', '2026-03-01', 'completed'),
      ('Pro Shop Inventory', 'Spring merchandise order - clubs and apparel', 24500.00, 'expense', '2026-03-08', 'completed'),
      ('Marketing', 'Spring campaign - digital and print advertising', 3500.00, 'expense', '2026-03-12', 'completed'),
      ('Equipment Lease', 'Monthly cart fleet lease payment', 4200.00, 'expense', '2026-03-01', 'completed'),
      ('Driving Range', 'March 2026 range ball sales and fees', 4850.00, 'revenue', '2026-03-15', 'completed')
    `);

    // Seed member_directory
    await client.query(`
      INSERT INTO member_directory (name, email, phone, membership_tier, join_date, handicap, status) VALUES
      ('James Whitfield', 'j.whitfield@email.com', '555-0101', 'Platinum', '2020-01-15', 4.2, 'active'),
      ('Robert Chen', 'r.chen@email.com', '555-0102', 'Gold', '2021-03-20', 12.8, 'active'),
      ('Patricia Holloway', 'p.holloway@email.com', '555-0103', 'Platinum', '2019-06-01', 8.5, 'active'),
      ('Michael Torres', 'm.torres@email.com', '555-0104', 'Silver', '2022-09-10', 18.3, 'active'),
      ('Elizabeth Warren', 'e.warren@email.com', '555-0105', 'Gold', '2021-01-15', 15.1, 'active'),
      ('David Kim', 'd.kim@email.com', '555-0106', 'Bronze', '2023-11-01', 22.6, 'active'),
      ('Sarah Mitchell', 's.mitchell@email.com', '555-0107', 'Gold', '2020-05-12', 6.7, 'active'),
      ('Thomas Anderson', 't.anderson@email.com', '555-0108', 'Platinum', '2018-01-01', 2.1, 'active'),
      ('Jennifer Lopez', 'j.lopez@email.com', '555-0109', 'Silver', '2022-07-01', 19.4, 'active'),
      ('William Harris', 'w.harris@email.com', '555-0110', 'Gold', '2021-04-15', 10.3, 'active'),
      ('Amanda Foster', 'a.foster@email.com', '555-0111', 'Bronze', '2024-01-01', 25.8, 'active'),
      ('Christopher Blake', 'c.blake@email.com', '555-0112', 'Silver', '2022-08-15', 14.7, 'active'),
      ('Laura Martinez', 'l.martinez@email.com', '555-0113', 'Gold', '2021-05-01', 9.2, 'active'),
      ('Daniel Wright', 'd.wright@email.com', '555-0114', 'Platinum', '2019-02-01', 3.8, 'active'),
      ('Michelle Park', 'm.park@email.com', '555-0115', 'Bronze', '2023-04-20', 16.9, 'inactive')
    `);

    // Seed caddies
    await client.query(`
      INSERT INTO caddies (name, experience_years, rating, availability, certifications, hourly_rate) VALUES
      ('Marcus Johnson', 12, 4.9, 'available', 'PGA Certified, First Aid', 45.00),
      ('Tyler Brooks', 8, 4.7, 'available', 'PGA Certified', 40.00),
      ('Anthony Davis', 15, 5.0, 'available', 'PGA Certified, Master Caddie, First Aid', 55.00),
      ('Kevin OBrien', 5, 4.3, 'available', 'Certified Caddie', 35.00),
      ('Jason Lee', 3, 4.1, 'available', 'Certified Caddie', 30.00),
      ('Brandon Taylor', 10, 4.8, 'on_loop', 'PGA Certified, First Aid', 45.00),
      ('Derek Wilson', 7, 4.5, 'available', 'PGA Certified', 38.00),
      ('Ryan Garcia', 2, 3.9, 'available', 'Junior Certification', 25.00),
      ('Nathan Clark', 6, 4.4, 'off_duty', 'Certified Caddie, First Aid', 35.00),
      ('Chris Martinez', 9, 4.6, 'available', 'PGA Certified', 42.00),
      ('Sean Murphy', 4, 4.2, 'on_loop', 'Certified Caddie', 32.00),
      ('Patrick Sullivan', 11, 4.8, 'available', 'PGA Certified, Master Caddie', 50.00),
      ('Alex Rivera', 1, 3.8, 'available', 'Junior Certification', 22.00),
      ('Jordan Campbell', 6, 4.4, 'off_duty', 'Certified Caddie', 36.00),
      ('Matt Henderson', 8, 4.6, 'available', 'PGA Certified, First Aid', 40.00)
    `);

    // Seed lockers
    await client.query(`
      INSERT INTO lockers (locker_number, member_name, size, status, annual_fee, expiry_date) VALUES
      ('L-001', 'James Whitfield', 'large', 'occupied', 350.00, '2026-12-31'),
      ('L-002', 'Robert Chen', 'standard', 'occupied', 200.00, '2026-12-31'),
      ('L-003', 'Patricia Holloway', 'large', 'occupied', 350.00, '2026-12-31'),
      ('L-004', 'Thomas Anderson', 'premium', 'occupied', 500.00, '2026-12-31'),
      ('L-005', 'Sarah Mitchell', 'standard', 'occupied', 200.00, '2026-12-31'),
      ('L-006', 'Daniel Wright', 'large', 'occupied', 350.00, '2026-12-31'),
      ('L-007', NULL, 'standard', 'available', 200.00, NULL),
      ('L-008', NULL, 'standard', 'available', 200.00, NULL),
      ('L-009', 'William Harris', 'standard', 'occupied', 200.00, '2026-12-31'),
      ('L-010', 'Laura Martinez', 'standard', 'occupied', 200.00, '2026-12-31'),
      ('L-011', NULL, 'large', 'available', 350.00, NULL),
      ('L-012', NULL, 'standard', 'available', 200.00, NULL),
      ('L-013', 'Elizabeth Warren', 'standard', 'occupied', 200.00, '2026-06-30'),
      ('L-014', NULL, 'premium', 'available', 500.00, NULL),
      ('L-015', NULL, 'standard', 'maintenance', 200.00, NULL)
    `);

    // Seed bag_storage
    await client.query(`
      INSERT INTO bag_storage (member_name, bag_brand, storage_location, monthly_fee, start_date, status) VALUES
      ('James Whitfield', 'Titleist Tour Staff', 'Rack A-01', 35.00, '2025-01-01', 'active'),
      ('Robert Chen', 'TaylorMade FlexTech', 'Rack A-05', 25.00, '2025-03-15', 'active'),
      ('Patricia Holloway', 'Callaway Org 14', 'Rack A-08', 25.00, '2024-06-01', 'active'),
      ('Thomas Anderson', 'Titleist Hybrid 14', 'Rack B-01', 35.00, '2025-01-01', 'active'),
      ('Sarah Mitchell', 'Ping Hoofer Lite', 'Rack B-04', 25.00, '2025-01-01', 'active'),
      ('Daniel Wright', 'Titleist Players 4', 'Rack B-07', 25.00, '2025-02-01', 'active'),
      ('William Harris', 'Sun Mountain C-130', 'Rack C-02', 25.00, '2025-04-01', 'active'),
      ('Laura Martinez', 'Callaway Fairway C', 'Rack C-05', 25.00, '2025-05-01', 'active'),
      ('Elizabeth Warren', 'Ping Traverse', 'Rack C-08', 25.00, '2025-01-15', 'active'),
      ('Michael Torres', 'Ogio Fuse', 'Rack D-01', 25.00, '2025-09-01', 'active'),
      ('Christopher Blake', 'TaylorMade Pro Cart', 'Rack D-04', 25.00, '2025-08-01', 'active'),
      ('Jennifer Lopez', 'Callaway Chev 14', 'Rack D-07', 25.00, '2025-07-01', 'active'),
      ('David Kim', 'Ping Hoofer', 'Rack E-02', 25.00, '2025-11-01', 'active'),
      ('Amanda Foster', 'TaylorMade Select ST', 'Rack E-05', 25.00, '2026-01-01', 'active'),
      ('Michelle Park', 'Titleist Cart 15', 'Rack E-08', 25.00, '2025-04-20', 'inactive')
    `);

    // Seed marshals
    await client.query(`
      INSERT INTO marshals (name, shift, date, area, status, phone) VALUES
      ('Frank Morrison', 'morning', '2026-03-24', 'Front Nine', 'scheduled', '555-0201'),
      ('Bill Patterson', 'morning', '2026-03-24', 'Back Nine', 'scheduled', '555-0202'),
      ('Steve Walker', 'afternoon', '2026-03-24', 'Front Nine', 'scheduled', '555-0203'),
      ('Larry Thompson', 'afternoon', '2026-03-24', 'Back Nine', 'scheduled', '555-0204'),
      ('Frank Morrison', 'morning', '2026-03-25', 'Front Nine', 'scheduled', '555-0201'),
      ('Greg Nelson', 'morning', '2026-03-25', 'Back Nine', 'scheduled', '555-0205'),
      ('Steve Walker', 'afternoon', '2026-03-25', 'Front Nine', 'scheduled', '555-0203'),
      ('Bill Patterson', 'afternoon', '2026-03-25', 'Back Nine', 'scheduled', '555-0202'),
      ('Larry Thompson', 'morning', '2026-03-26', 'Front Nine', 'scheduled', '555-0204'),
      ('Greg Nelson', 'morning', '2026-03-26', 'Back Nine', 'scheduled', '555-0205'),
      ('Frank Morrison', 'afternoon', '2026-03-26', 'Full Course', 'scheduled', '555-0201'),
      ('Bill Patterson', 'morning', '2026-03-23', 'Front Nine', 'on_duty', '555-0202'),
      ('Steve Walker', 'morning', '2026-03-23', 'Back Nine', 'on_duty', '555-0203'),
      ('Larry Thompson', 'afternoon', '2026-03-23', 'Front Nine', 'scheduled', '555-0204'),
      ('Greg Nelson', 'afternoon', '2026-03-23', 'Back Nine', 'scheduled', '555-0205')
    `);

    // Seed pace_of_play
    await client.query(`
      INSERT INTO pace_of_play (date, hole_number, group_id, time_minutes, status, notes) VALUES
      ('2026-03-23', 1, 'G-0700A', 14.5, 'on_pace', 'Good start, no delays'),
      ('2026-03-23', 2, 'G-0700A', 12.0, 'on_pace', 'Par 3, quick play'),
      ('2026-03-23', 3, 'G-0700A', 16.5, 'on_pace', 'Par 5, reasonable pace'),
      ('2026-03-23', 4, 'G-0700A', 18.0, 'slow', 'Water hazard causing delays'),
      ('2026-03-23', 5, 'G-0700A', 13.5, 'on_pace', 'Recovered pace'),
      ('2026-03-23', 1, 'G-0712A', 15.0, 'on_pace', NULL),
      ('2026-03-23', 2, 'G-0712A', 11.5, 'on_pace', NULL),
      ('2026-03-23', 3, 'G-0712A', 17.0, 'on_pace', NULL),
      ('2026-03-23', 1, 'G-0724A', 16.0, 'on_pace', 'Foursome, keeping good pace'),
      ('2026-03-23', 2, 'G-0724A', 13.0, 'on_pace', NULL),
      ('2026-03-22', 6, 'G-0800B', 20.5, 'behind', 'Group lost ball, searched 3 minutes'),
      ('2026-03-22', 7, 'G-0800B', 14.0, 'on_pace', 'Made up time on short par 3'),
      ('2026-03-22', 8, 'G-0800B', 19.0, 'slow', 'Waiting on group ahead'),
      ('2026-03-22', 9, 'G-0800B', 15.5, 'on_pace', 'Finished front nine in 2:12'),
      ('2026-03-22', 10, 'G-0800B', 14.0, 'on_pace', 'Good pace to start back nine')
    `);

    // Seed practice_facilities
    await client.query(`
      INSERT INTO practice_facilities (name, type, status, capacity, operating_hours, equipment) VALUES
      ('Main Driving Range', 'driving_range', 'open', 40, '6:00 AM - 8:00 PM', 'Covered and open stalls, target greens at 50-250 yards'),
      ('Short Game Practice Area', 'chipping_green', 'open', 15, '6:00 AM - 7:30 PM', 'Chipping green, practice bunker, varied lies'),
      ('Practice Putting Green #1', 'putting_green', 'open', 20, '6:00 AM - 8:00 PM', 'Stimpmeter 11, undulating surface, multiple hole locations'),
      ('Practice Putting Green #2', 'putting_green', 'open', 15, '6:00 AM - 8:00 PM', 'Stimpmeter 10, flatter surface for beginners'),
      ('Covered Teaching Bay', 'teaching', 'open', 4, '7:00 AM - 6:00 PM', 'TrackMan launch monitor, video analysis, hitting mats'),
      ('Golf Simulator Room 1', 'simulator', 'open', 4, '8:00 AM - 9:00 PM', 'Full Swing simulator, 100+ courses, climate controlled'),
      ('Golf Simulator Room 2', 'simulator', 'open', 4, '8:00 AM - 9:00 PM', 'TrackMan simulator, fitting capabilities'),
      ('Practice Bunker', 'bunker', 'open', 8, '6:00 AM - 7:30 PM', 'Greenside bunker with varied lip heights'),
      ('Warm-Up Net Area', 'net', 'open', 6, '6:00 AM - 8:00 PM', 'Enclosed nets for quick warm-up swings'),
      ('Junior Practice Zone', 'mixed', 'open', 12, '8:00 AM - 6:00 PM', 'Scaled-down range, putting area, chipping green'),
      ('Fitness Center', 'fitness', 'open', 20, '5:30 AM - 9:00 PM', 'Golf-specific fitness equipment, TPI assessment tools'),
      ('Club Fitting Studio', 'fitting', 'open', 2, '9:00 AM - 5:00 PM', 'TrackMan, shaft testing, lie/loft machines'),
      ('Pitching Green', 'pitching', 'open', 10, '6:00 AM - 7:30 PM', '30-80 yard approach shots with target flags'),
      ('Members Warm-Up Range', 'driving_range', 'open', 12, '6:00 AM - 8:00 PM', 'Premium grass tees, reserved for members only'),
      ('Outdoor Lesson Tee', 'teaching', 'maintenance', 6, '7:00 AM - 6:00 PM', 'Grass hitting area, alignment aids, video tripod mounts')
    `);

    // Seed greens_fees
    await client.query(`
      INSERT INTO greens_fees (fee_type, rate, day_type, season, cart_included, holes) VALUES
      ('Standard', 89.00, 'weekday', 'peak', false, 18),
      ('Standard', 119.00, 'weekend', 'peak', false, 18),
      ('Standard', 59.00, 'weekday', 'off_peak', false, 18),
      ('Standard', 79.00, 'weekend', 'off_peak', false, 18),
      ('Twilight', 55.00, 'weekday', 'peak', false, 18),
      ('Twilight', 69.00, 'weekend', 'peak', false, 18),
      ('Senior', 65.00, 'weekday', 'peak', false, 18),
      ('Junior', 35.00, 'weekday', 'peak', false, 18),
      ('Junior', 45.00, 'weekend', 'peak', false, 18),
      ('Nine Hole', 49.00, 'weekday', 'peak', false, 9),
      ('Nine Hole', 59.00, 'weekend', 'peak', false, 9),
      ('Cart Fee', 22.00, 'weekday', 'regular', false, 18),
      ('Cart Fee', 22.00, 'weekend', 'regular', false, 18),
      ('Member Guest', 69.00, 'weekday', 'peak', false, 18),
      ('Member Guest', 89.00, 'weekend', 'peak', false, 18)
    `);

    console.log('All seed data inserted successfully!');
    console.log('');
    console.log('Demo credentials:');
    console.log('  Email: admin@golfclub.com');
    console.log('  Password: password123');

  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});

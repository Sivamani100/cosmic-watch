-- SQL Script: Seed High-Risk Asteroid Notifications
-- Purpose: Populate local cache and generate alerts for critical near-earth objects.
-- Run this in the Supabase SQL Editor.

-- 1. Insert/Update High-Risk Asteroids into Cache
INSERT INTO public.asteroids_cache (
    neo_id, name, risk_level, risk_score, is_potentially_hazardous, 
    absolute_magnitude, diameter_min_km, diameter_max_km, 
    close_approach_data
) VALUES 
(
    '99942', 
    '99942 Apophis (2004 MN4)', 
    'CRITICAL', 
    95, 
    true, 
    19.7, 
    0.34, 
    0.37, 
    '[{"close_approach_date": "2029-04-13", "miss_distance": {"kilometers": "31000"}, "relative_velocity": {"kilometers_per_hour": "30744"}}]'::jsonb
),
(
    '101955', 
    '101955 Bennu (1999 RQ36)', 
    'HIGH', 
    82, 
    true, 
    20.1, 
    0.48, 
    0.51, 
    '[{"close_approach_date": "2135-09-22", "miss_distance": {"kilometers": "203000"}, "relative_velocity": {"kilometers_per_hour": "22000"}}]'::jsonb
),
(
    '2023 NT1', 
    '2023 NT1', 
    'MEDIUM', 
    55, 
    true, 
    24.2, 
    0.03, 
    0.06, 
    '[{"close_approach_date": "2023-07-13", "miss_distance": {"kilometers": "100000"}, "relative_velocity": {"kilometers_per_hour": "40000"}}]'::jsonb
)
ON CONFLICT (neo_id) DO UPDATE SET
    risk_level = EXCLUDED.risk_level,
    risk_score = EXCLUDED.risk_score,
    close_approach_data = EXCLUDED.close_approach_data;

-- 2. Insert Sample Notifications for the User
-- Replace 'USER_ID_HERE' with a valid UUID from your auth.users table if running manually
-- Or use the logic below to target the first active user.

DO $$ 
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Close Approach Alert
        INSERT INTO public.notifications (user_id, neo_id, title, message, notification_type, metadata)
        VALUES (
            target_user_id, 
            '99942', 
            '🚨 CRITICAL: Apophis Approach', 
            'Apophis (99942) is projected for a historically close approach on 2029-04-13. Current risk score: 95.', 
            'threshold_breach', 
            '{"event_id": "manual-seed-001", "risk_level": "CRITICAL"}'::jsonb
        );

        -- New Hazardous Discovery
        INSERT INTO public.notifications (user_id, neo_id, title, message, notification_type, metadata)
        VALUES (
            target_user_id, 
            '101955', 
            '⚠️ New Hazardous Catalogued', 
            'Bennu (101955) has been identified with a high-velocity trajectory. Monitoring protocols active.', 
            'new_hazardous', 
            '{"event_id": "manual-seed-002", "risk_level": "HIGH"}'::jsonb
        );
    END IF;
END $$;

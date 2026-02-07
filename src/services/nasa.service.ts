import { supabase } from '@/integrations/supabase/client';
import {
  NASA_NEO_BASE,
  NASA_API_KEY,
  RISK_THRESHOLDS,
  DISTANCE_THRESHOLDS,
  DIAMETER_THRESHOLDS
} from '@/lib/constants';
import type { Asteroid, RiskLevel, NASANeo, CloseApproachData } from '@/types/asteroid';

interface RiskAnalysis {
  score: number;
  level: RiskLevel;
}

export function calculateRiskScore(neo: NASANeo): RiskAnalysis {
  let score = 0;

  // Hazardous classification (40 points max)
  if (neo.is_potentially_hazardous_asteroid) {
    score += 40;
  }

  // Size analysis (30 points max)
  const avgDiameter =
    (neo.estimated_diameter.kilometers.estimated_diameter_min +
      neo.estimated_diameter.kilometers.estimated_diameter_max) /
    2;

  if (avgDiameter >= DIAMETER_THRESHOLDS.LARGE) {
    score += 30;
  } else if (avgDiameter >= DIAMETER_THRESHOLDS.MEDIUM) {
    score += 20;
  } else if (avgDiameter >= DIAMETER_THRESHOLDS.SMALL) {
    score += 10;
  } else {
    score += 5;
  }

  // Proximity analysis (30 points max)
  if (neo.close_approach_data?.length > 0) {
    const minDistance = Math.min(
      ...neo.close_approach_data.map((a) =>
        parseFloat(a.miss_distance.kilometers)
      )
    );

    if (minDistance < DISTANCE_THRESHOLDS.VERY_CLOSE) {
      score += 30;
    } else if (minDistance < DISTANCE_THRESHOLDS.CLOSE) {
      score += 20;
    } else if (minDistance < DISTANCE_THRESHOLDS.MODERATE) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // Determine risk level
  let level: RiskLevel = 'LOW';
  if (score >= RISK_THRESHOLDS.CRITICAL) {
    level = 'CRITICAL';
  } else if (score >= RISK_THRESHOLDS.HIGH) {
    level = 'HIGH';
  } else if (score >= RISK_THRESHOLDS.MEDIUM) {
    level = 'MEDIUM';
  }

  return { score, level };
}

function transformNeoToAsteroid(neo: NASANeo): Omit<Asteroid, 'created_at' | 'updated_at'> {
  const risk = calculateRiskScore(neo);

  return {
    neo_id: neo.id,
    name: neo.name,
    nasa_jpl_url: neo.nasa_jpl_url,
    absolute_magnitude: neo.absolute_magnitude_h,
    diameter_min_km: neo.estimated_diameter.kilometers.estimated_diameter_min,
    diameter_max_km: neo.estimated_diameter.kilometers.estimated_diameter_max,
    is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
    close_approach_data: neo.close_approach_data as CloseApproachData[],
    orbital_data: neo.orbital_data || null,
    risk_score: risk.score,
    risk_level: risk.level,
    last_fetched_at: new Date().toISOString(),
  };
}

export async function fetchNASAFeed(
  startDate: string,
  endDate: string
): Promise<Asteroid[]> {
  const url = `${NASA_NEO_BASE}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NASA API error: ${response.statusText}`);
  }

  const data = await response.json();
  const asteroids: Omit<Asteroid, 'created_at' | 'updated_at'>[] = [];

  for (const date in data.near_earth_objects) {
    for (const neo of data.near_earth_objects[date]) {
      asteroids.push(transformNeoToAsteroid(neo));
    }
  }

  // Upsert to Supabase cache
  if (asteroids.length > 0) {
    const { error } = await supabase
      .from('asteroids_cache')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(asteroids as any, { onConflict: 'neo_id' });

    if (error) {
      console.error('Error caching asteroids:', error);
    }
  }

  return asteroids as Asteroid[];
}

export async function getAsteroidById(neoId: string): Promise<Asteroid | null> {
  // Try cache first
  const { data: cached, error: cacheError } = await supabase
    .from('asteroids_cache')
    .select('*')
    .eq('neo_id', neoId)
    .single();

  if (cached && !cacheError) {
    return cached as unknown as Asteroid;
  }

  // Fetch from NASA if not in cache
  const url = `${NASA_NEO_BASE}/neo/${neoId}?api_key=${NASA_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Asteroid not found');
    }

    const neo: NASANeo = await response.json();
    const asteroid = transformNeoToAsteroid(neo);

    // Cache the result
    await supabase
      .from('asteroids_cache')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert([asteroid as any], { onConflict: 'neo_id' });

    return asteroid as Asteroid;
  } catch (error) {
    console.error('Error fetching asteroid:', error);
    return null;
  }
}

export async function searchAsteroids(query: string): Promise<Asteroid[]> {
  const { data, error } = await supabase
    .from('asteroids_cache')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching asteroids:', error);
    return [];
  }

  return (data || []) as unknown as Asteroid[];
}

export async function getHazardousAsteroids(): Promise<Asteroid[]> {
  const { data, error } = await supabase
    .from('asteroids_cache')
    .select('*')
    .eq('is_potentially_hazardous', true)
    .order('risk_score', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching hazardous asteroids:', error);
    return [];
  }

  return (data || []) as unknown as Asteroid[];
}

export async function getCachedAsteroids(
  limit = 20,
  offset = 0,
  hazardousOnly = false
): Promise<Asteroid[]> {
  let query = supabase
    .from('asteroids_cache')
    .select('*')
    .order('risk_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (hazardousOnly) {
    query = query.eq('is_potentially_hazardous', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cached asteroids:', error);
    return [];
  }

  return (data || []) as unknown as Asteroid[];
}

export async function getAsteroidStats(): Promise<{
  total: number;
  hazardous: number;
  critical: number;
  high: number;
}> {
  const [totalResult, hazardousResult, criticalResult, highResult] = await Promise.all([
    supabase.from('asteroids_cache').select('*', { count: 'exact', head: true }),
    supabase.from('asteroids_cache').select('*', { count: 'exact', head: true }).eq('is_potentially_hazardous', true),
    supabase.from('asteroids_cache').select('*', { count: 'exact', head: true }).eq('risk_level', 'CRITICAL'),
    supabase.from('asteroids_cache').select('*', { count: 'exact', head: true }).eq('risk_level', 'HIGH'),
  ]);

  return {
    total: totalResult.count || 0,
    hazardous: hazardousResult.count || 0,
    critical: criticalResult.count || 0,
    high: highResult.count || 0,
  };
}
export async function generateAutomatedNotifications(userId: string): Promise<number> {
  // 1. Get watched asteroids for the user
  const { data: watched, error: watchedError } = await supabase
    .from('watched_asteroids')
    .select('*, asteroids_cache(*)')
    .eq('user_id', userId);

  if (watchedError || !watched) return 0;

  let notificationsCreated = 0;
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  for (const item of watched) {
    const asteroid = item.asteroids_cache as unknown as Asteroid;
    if (!asteroid || !asteroid.close_approach_data) continue;

    // Find the next upcoming close approach
    const nextApproach = asteroid.close_approach_data.find(a => {
      const approachDate = new Date(a.close_approach_date);
      return approachDate >= now && approachDate <= nextWeek;
    });

    if (nextApproach) {
      const approachDate = new Date(nextApproach.close_approach_date);
      const missDistance = parseFloat(nextApproach.miss_distance.kilometers);

      // Check if notification already exists for this approach
      const notificationId = `close-approach-${asteroid.neo_id}-${nextApproach.close_approach_date}`;
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('metadata->>event_id', notificationId)
        .maybeSingle();

      if (!existing) {
        // Determine if it breaches a custom threshold
        const thresholdBreached = item.min_distance_threshold_km && missDistance <= item.min_distance_threshold_km;

        const title = thresholdBreached ? '🚨 CRITICAL Close Approach' : '⚠️ Upcoming Close Approach';
        const message = `${asteroid.name} will pass within ${missDistance.toLocaleString()} km of Earth on ${nextApproach.close_approach_date}.`;

        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: userId,
          neo_id: asteroid.neo_id,
          title,
          message,
          notification_type: thresholdBreached ? 'threshold_breach' : 'close_approach',
          metadata: {
            event_id: notificationId,
            miss_distance_km: missDistance,
            approach_date: nextApproach.close_approach_date
          }
        });

        if (!insertError) notificationsCreated++;
      }
    }
  }

  // 2. NEW: Global High-Risk Awareness Alerts
  // Get all asteroids with HIGH or CRITICAL risk level in the next 7 days
  const { data: globalHazardous, error: globalError } = await supabase
    .from('asteroids_cache')
    .select('*')
    .or('risk_level.eq.CRITICAL,risk_level.eq.HIGH')
    .order('risk_score', { ascending: false });

  if (!globalError && globalHazardous) {
    for (const asteroid of globalHazardous as unknown as Asteroid[]) {
      if (!asteroid.close_approach_data) continue;

      const nextApproach = asteroid.close_approach_data.find(a => {
        const approachDate = new Date(a.close_approach_date);
        return approachDate >= now && approachDate <= nextWeek;
      });

      if (nextApproach) {
        const notificationId = `global-hazardous-${asteroid.neo_id}-${nextApproach.close_approach_date}`;

        // Check if user already has this global notification
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('metadata->>event_id', notificationId)
          .maybeSingle();

        if (!existing) {
          const missDistance = parseFloat(nextApproach.miss_distance.kilometers);
          const title = `🚨 GLOBAL ALERT: High Risk Object Detected`;
          const message = `Hazardous asteroid ${asteroid.name} is approaching Earth! Level: ${asteroid.risk_level}. Miss distance: ${missDistance.toLocaleString()} km.`;

          const { error: insertError } = await supabase.from('notifications').insert({
            user_id: userId,
            neo_id: asteroid.neo_id,
            title,
            message,
            notification_type: 'new_hazardous',
            metadata: {
              event_id: notificationId,
              risk_level: asteroid.risk_level,
              approach_date: nextApproach.close_approach_date
            }
          });

          if (!insertError) notificationsCreated++;
        }
      }
    }
  }

  return notificationsCreated;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
}

export interface OrbitalData {
  orbit_id: string;
  orbit_determination_date: string;
  first_observation_date: string;
  last_observation_date: string;
  data_arc_in_days: number;
  observations_used: number;
  orbit_uncertainty: string;
  minimum_orbit_intersection: string;
  jupiter_tisserand_invariant: string;
  epoch_osculation: string;
  eccentricity: string;
  semi_major_axis: string;
  inclination: string;
  ascending_node_longitude: string;
  orbital_period: string;
  perihelion_distance: string;
  perihelion_argument: string;
  aphelion_distance: string;
  perihelion_time: string;
  mean_anomaly: string;
  mean_motion: string;
  equinox: string;
}

export interface Asteroid {
  neo_id: string;
  name: string;
  nasa_jpl_url: string | null;
  absolute_magnitude: number | null;
  diameter_min_km: number | null;
  diameter_max_km: number | null;
  is_potentially_hazardous: boolean;
  close_approach_data: CloseApproachData[] | null;
  orbital_data: OrbitalData | null;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WatchedAsteroid {
  id: string;
  user_id: string;
  neo_id: string;
  alert_enabled: boolean;
  min_distance_threshold_km: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  asteroid?: Asteroid;
}

export interface Notification {
  id: string;
  user_id: string;
  neo_id: string | null;
  title: string;
  message: string;
  notification_type: 'close_approach' | 'new_hazardous' | 'threshold_breach' | 'custom';
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  neo_id: string;
  username: string;
  message: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  alert_preferences: {
    email_alerts: boolean;
    push_alerts: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NASAFeedResponse {
  links: {
    next: string;
    previous: string;
    self: string;
  };
  element_count: number;
  near_earth_objects: {
    [date: string]: NASANeo[];
  };
}

export interface NASANeo {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  is_sentry_object: boolean;
  orbital_data?: OrbitalData;
}

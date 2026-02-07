// NASA API Configuration
export const NASA_API_BASE = 'https://api.nasa.gov';
export const NASA_NEO_BASE = `${NASA_API_BASE}/neo/rest/v1`;
export const NASA_API_KEY = 'mMFXLrNHGzhjvOAxeI4DSUfHyplgKMQ6Ehs8imLh';

// Risk Level Thresholds
export const RISK_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  MEDIUM: 40,
  LOW: 0,
} as const;

// Distance Thresholds (in kilometers)
export const DISTANCE_THRESHOLDS = {
  VERY_CLOSE: 1_000_000,
  CLOSE: 5_000_000,
  MODERATE: 10_000_000,
} as const;

// Diameter Thresholds (in kilometers)
export const DIAMETER_THRESHOLDS = {
  LARGE: 1,
  MEDIUM: 0.5,
  SMALL: 0.1,
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ASTEROID_DETAIL: '/asteroid/:neoId',
  WATCHED: '/watched',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  VISUALIZATION: '/visualization',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy HH:mm:ss',
  TIME: 'HH:mm:ss',
} as const;

// Cache Duration (in minutes)
export const CACHE_DURATION = {
  ASTEROIDS: 60,
  PROFILE: 5,
  NOTIFICATIONS: 1,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Risk Colors (mapped to Tailwind classes)
export const RISK_COLORS = {
  LOW: 'risk-low',
  MEDIUM: 'risk-medium',
  HIGH: 'risk-high',
  CRITICAL: 'risk-critical',
} as const;

// Animation Variants for Framer Motion
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const SCALE_IN = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.2 },
};

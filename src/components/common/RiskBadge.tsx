import type { RiskLevel } from '@/types/asteroid';

interface RiskBadgeProps {
  level: RiskLevel | null;
  score?: number | null;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({
  level,
  score,
  showScore = true,
  size = 'md',
}: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const levelClasses = {
    LOW: 'risk-low',
    MEDIUM: 'risk-medium',
    HIGH: 'risk-high',
    CRITICAL: 'risk-critical',
  };

  if (!level) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${
        sizeClasses[size]
      } ${levelClasses[level]}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          level === 'CRITICAL'
            ? 'bg-risk-critical animate-pulse'
            : level === 'HIGH'
            ? 'bg-risk-high'
            : level === 'MEDIUM'
            ? 'bg-risk-medium'
            : 'bg-risk-low'
        }`}
      />
      {level}
      {showScore && score !== undefined && score !== null && (
        <span className="opacity-70">({score})</span>
      )}
    </span>
  );
}

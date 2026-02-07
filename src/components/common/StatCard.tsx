import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorClass = 'text-primary',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-gradient rounded-lg p-6 border border-border/50 hover:shadow-glow-purple/20 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold"
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <p
              className={`text-xs mt-2 ${trend.isPositive ? 'text-risk-low' : 'text-risk-high'
                }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last
              week
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ${colorClass}`}
        >
          <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

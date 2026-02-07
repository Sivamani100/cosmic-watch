import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAuth } from '@/hooks/useAuth';
import { useIsWatching, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchedAsteroids';
import type { Asteroid } from '@/types/asteroid';
import toast from 'react-hot-toast';

interface AsteroidCardProps {
  asteroid: Asteroid;
  index?: number;
}

export function AsteroidCard({ asteroid, index = 0 }: AsteroidCardProps) {
  const { isAuthenticated } = useAuth();
  const { data: isWatching = false } = useIsWatching(asteroid.neo_id);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleToggleWatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add asteroids to your watchlist');
      return;
    }

    try {
      if (isWatching) {
        await removeFromWatchlist.mutateAsync(asteroid.neo_id);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist.mutateAsync({ neoId: asteroid.neo_id });
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const avgDiameter =
    asteroid.diameter_min_km && asteroid.diameter_max_km
      ? ((asteroid.diameter_min_km + asteroid.diameter_max_km) / 2).toFixed(3)
      : 'Unknown';

  const nextApproach = asteroid.close_approach_data?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card-gradient rounded-lg p-5 border border-border/50 hover:border-primary/50 hover:shadow-glow-purple/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
            {asteroid.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            ID: {asteroid.neo_id}
          </p>
        </div>
        <RiskBadge level={asteroid.risk_level} score={asteroid.risk_score} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Approx. Size</span>
          <span className="font-medium">{avgDiameter} km</span>
        </div>

        {asteroid.is_potentially_hazardous && (
          <div className="flex items-center gap-2 text-risk-high text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Potentially Hazardous</span>
          </div>
        )}

        {nextApproach && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next Approach</span>
            <span className="font-medium">
              {nextApproach.close_approach_date}
            </span>
          </div>
        )}

        {nextApproach && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-bold text-primary/80">Distance to Earth</span>
            <span className="font-bold">
              {parseFloat(nextApproach.miss_distance.kilometers).toLocaleString()} km
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/asteroid/${asteroid.neo_id}`} className="flex-1">
          <Button
            variant="default"
            className="w-full bg-hero-gradient hover:shadow-glow-purple transition-all"
          >
            View Details
          </Button>
        </Link>

        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleWatch}
          disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
          className={`transition-all ${isWatching
            ? 'border-cosmic-pink text-cosmic-pink hover:bg-cosmic-pink/10'
            : 'hover:border-cosmic-pink hover:text-cosmic-pink'
            }`}
        >
          <Heart
            className={`h-5 w-5 ${isWatching ? 'fill-current' : ''}`}
          />
        </Button>

        {asteroid.nasa_jpl_url && (
          <Button variant="outline" size="icon" asChild>
            <a
              href={asteroid.nasa_jpl_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

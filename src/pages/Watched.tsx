import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Trash2, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { RiskBadge } from '@/components/common/RiskBadge';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useWatchedAsteroids, useRemoveFromWatchlist } from '@/hooks/useWatchedAsteroids';
import toast from 'react-hot-toast';

function WatchedContent() {
  const { data: watchedAsteroids = [], isLoading } = useWatchedAsteroids();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const handleRemove = async (neoId: string) => {
    try {
      await removeFromWatchlist.mutateAsync(neoId);
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Your Watchlist</h1>
          <p className="text-muted-foreground">
            Asteroids you're monitoring for close approaches
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : watchedAsteroids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card-gradient rounded-xl border border-border/50"
          >
            <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Asteroids in Watchlist</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking asteroids by adding them to your watchlist from the dashboard.
            </p>
            <Link to="/dashboard">
              <Button className="bg-hero-gradient hover:shadow-glow-purple">
                Explore Asteroids
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {watchedAsteroids.map((watched, index) => (
              <motion.div
                key={watched.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card-gradient rounded-xl p-6 border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{watched.asteroid?.name || watched.neo_id}</h3>
                    {watched.asteroid?.risk_level && (
                      <RiskBadge
                        level={watched.asteroid.risk_level}
                        score={watched.asteroid.risk_score}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono mb-2">
                    NEO ID: {watched.neo_id}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3">
                    {watched.asteroid?.is_potentially_hazardous && (
                      <div className="flex items-center gap-2 text-risk-high text-sm bg-risk-high/10 px-2 py-1 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Potentially Hazardous</span>
                      </div>
                    )}
                    {watched.min_distance_threshold_km && (
                      <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 px-2 py-1 rounded">
                        <Eye className="h-4 w-4" />
                        <span>Threshold: {watched.min_distance_threshold_km.toLocaleString()} km</span>
                      </div>
                    )}
                  </div>

                  {watched.notes && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50 italic text-sm text-muted-foreground">
                      "{watched.notes}"
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/asteroid/${watched.neo_id}`}>
                    <Button variant="default" className="bg-hero-gradient">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemove(watched.neo_id)}
                    disabled={removeFromWatchlist.isPending}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Watched() {
  return (
    <ProtectedRoute>
      <WatchedContent />
    </ProtectedRoute>
  );
}

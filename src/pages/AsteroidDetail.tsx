import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  AlertTriangle,
  Ruler,
  Gauge,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { RiskBadge } from '@/components/common/RiskBadge';
import { ChatPanel } from '@/components/features/ChatPanel';
import { AstroAI } from '@/components/features/AstroAI';
import { useAsteroid } from '@/hooks/useAsteroids';
import { useAuth } from '@/hooks/useAuth';
import { useIsWatching, useAddToWatchlist, useRemoveFromWatchlist } from '@/hooks/useWatchedAsteroids';
import toast from 'react-hot-toast';

export default function AsteroidDetail() {
  const { neoId } = useParams<{ neoId: string }>();
  const { data: asteroid, isLoading, error } = useAsteroid(neoId);
  const { isAuthenticated } = useAuth();
  const { data: isWatching = false } = useIsWatching(neoId || '');
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const [threshold, setThreshold] = useState<string>('5000000');
  const [notes, setNotes] = useState<string>('');

  const handleToggleWatch = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add asteroids to your watchlist');
      return;
    }

    if (!neoId) return;

    try {
      if (isWatching) {
        await removeFromWatchlist.mutateAsync(neoId);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist.mutateAsync({
          neoId,
          minDistanceThreshold: parseFloat(threshold),
          notes: notes.trim() || undefined
        });
        toast.success('Added to watchlist with custom settings');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !asteroid) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Asteroid Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the asteroid you're looking for.
          </p>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgDiameter =
    asteroid.diameter_min_km && asteroid.diameter_max_km
      ? ((asteroid.diameter_min_km + asteroid.diameter_max_km) / 2).toFixed(3)
      : 'Unknown';

  const nextApproach = asteroid.close_approach_data?.[0];

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-gradient rounded-xl p-8 border border-border/50 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold">{asteroid.name}</h1>
                <RiskBadge
                  level={asteroid.risk_level}
                  score={asteroid.risk_score}
                  size="lg"
                />
              </div>
              <p className="text-muted-foreground font-mono mb-4">
                NEO ID: {asteroid.neo_id}
              </p>
              {asteroid.is_potentially_hazardous && (
                <div className="flex items-center gap-2 text-risk-high">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Potentially Hazardous Asteroid</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {!isWatching && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 bg-background/50 p-4 rounded-lg border border-border/50 mb-2"
                >
                  <p className="text-sm font-medium mb-2">Custom Alert Parameters</p>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Proximity Threshold (km)</label>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      placeholder="5000000"
                      className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Personal Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Potential research target..."
                      className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm resize-none h-20"
                    />
                  </div>
                </motion.div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleToggleWatch}
                  disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
                  variant={isWatching ? 'default' : 'outline'}
                  className={isWatching ? 'bg-cosmic-pink hover:bg-cosmic-pink/80 w-full lg:w-auto' : 'w-full lg:w-auto'}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isWatching ? 'fill-current' : ''}`} />
                  {isWatching ? 'Watching' : 'Add to Watchlist'}
                </Button>
                {asteroid.nasa_jpl_url && (
                  <Button variant="outline" asChild className="flex-1 lg:flex-none">
                    <a
                      href={asteroid.nasa_jpl_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      NASA JPL
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AstroAI Insights Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AstroAI asteroid={asteroid} />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card-gradient rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Diameter</span>
            </div>
            <p className="text-2xl font-bold">{avgDiameter} km</p>
            <p className="text-sm text-muted-foreground">
              {asteroid.diameter_min_km?.toFixed(3)} - {asteroid.diameter_max_km?.toFixed(3)} km
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card-gradient rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cosmic-blue/10 rounded-lg">
                <Gauge className="h-5 w-5 text-cosmic-blue" />
              </div>
              <span className="text-muted-foreground">Absolute Magnitude</span>
            </div>
            <p className="text-2xl font-bold">{asteroid.absolute_magnitude?.toFixed(2) || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Brightness measurement</p>
          </motion.div>

          {nextApproach && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card-gradient rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cosmic-pink/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-cosmic-pink" />
                  </div>
                  <span className="text-muted-foreground">Next Approach</span>
                </div>
                <p className="text-2xl font-bold">{nextApproach.close_approach_date}</p>
                <p className="text-sm text-muted-foreground">
                  Orbiting {nextApproach.orbiting_body}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card-gradient rounded-xl p-6 border border-border/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-risk-high/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-risk-high" />
                  </div>
                  <span className="text-muted-foreground">Miss Distance</span>
                </div>
                <p className="text-2xl font-bold">
                  {parseFloat(nextApproach.miss_distance.kilometers).toLocaleString()} km
                </p>
                <p className="text-sm text-muted-foreground">
                  {parseFloat(nextApproach.miss_distance.lunar).toFixed(2)} lunar distances
                </p>
              </motion.div>
            </>
          )}
        </div>

        {/* Close Approaches Table */}
        {asteroid.close_approach_data && asteroid.close_approach_data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card-gradient rounded-xl p-6 border border-border/50"
          >
            <h2 className="text-xl font-bold mb-4">Close Approaches</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Miss Distance (km)</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Velocity (km/s)</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Orbiting Body</th>
                  </tr>
                </thead>
                <tbody>
                  {asteroid.close_approach_data.slice(0, 10).map((approach, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4">{approach.close_approach_date}</td>
                      <td className="py-3 px-4">
                        {parseFloat(approach.miss_distance.kilometers).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{approach.orbiting_body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      {/* Chat Panel */}
      <ChatPanel neoId={asteroid.neo_id} asteroidName={asteroid.name} />
    </div>
  );
}

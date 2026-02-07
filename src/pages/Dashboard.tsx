import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  AlertTriangle,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Loader2,
  Calendar,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { StatCard } from '@/components/common/StatCard';
import { AsteroidCard } from '@/components/features/AsteroidCard';
import { useAsteroids, useAsteroidStats, useFetchNASAFeed } from '@/hooks/useAsteroids';
import { useWatchedCount } from '@/hooks/useWatchedAsteroids';
import { CommunityPreview } from '@/components/features/CommunityPreview';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [hazardousOnly, setHazardousOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: asteroids = [], isLoading, refetch } = useAsteroids(hazardousOnly);
  const { data: stats } = useAsteroidStats();
  const { data: watchedCount = 0 } = useWatchedCount();
  const fetchNASA = useFetchNASAFeed();

  // Fetch NASA data on initial load if cache is empty
  useEffect(() => {
    if (!isLoading && asteroids.length === 0) {
      handleRefresh();
    }
  }, [isLoading, asteroids.length]);

  const handleRefresh = async () => {
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      await fetchNASA.mutateAsync({ startDate, endDate });
      toast.success('Data refreshed from NASA!');
    } catch (error) {
      toast.error('Failed to fetch NASA data');
    }
  };

  const filteredAsteroids = asteroids.filter((asteroid) =>
    asteroid.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Mission Control</h1>
            <p className="text-muted-foreground">
              Real-time near-Earth object monitoring dashboard
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={fetchNASA.isPending}
            className="bg-hero-gradient hover:shadow-glow-purple"
          >
            {fetchNASA.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh NASA Data
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tracked"
            value={stats?.total || 0}
            icon={Target}
            description="Active Near-Earth Objects"
          />
          <StatCard
            title="Dangerous Objects"
            value={stats?.hazardous || 0}
            icon={AlertTriangle}
            colorClass="text-risk-high"
            description="Requiring monitoring"
          />
          <div className="bg-card-gradient rounded-lg p-6 border border-border/50 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Planetary Safety Level</p>
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full animate-pulse ${stats?.critical ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-500 shadow-[0_0_10px_green]'}`} />
              <span className={`text-2xl font-black ${stats?.critical ? 'text-red-500' : 'text-green-500'}`}>
                {stats?.critical ? 'LEVEL RED' : 'NOMINAL'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Verified with NASA Live Telemetry</p>
          </div>
          <CommunityPreview />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card-gradient rounded-xl p-4 border border-border/50 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search asteroids by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={hazardousOnly ? 'default' : 'outline'}
                onClick={() => setHazardousOnly(!hazardousOnly)}
                className={hazardousOnly ? 'bg-risk-high hover:bg-risk-high/80' : ''}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Hazardous Only
              </Button>
            </div>
          </div>
        </motion.div>
        {/* Risk Analysis Methodology Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card/30 rounded-xl p-4 border border-primary/20 mb-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Target className="h-5 w-5" />
            <h3 className="font-bold text-sm">Risk Analysis Engine (v1.0)</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Our autonomous engine calculates risk scores (0-100) using multi-factor space-agency trajectory datasets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background/40 p-2 rounded border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Hazardous Class</p>
              <p className="text-xs font-mono">+40 pts (Max)</p>
            </div>
            <div className="bg-background/40 p-2 rounded border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Diameter Profile</p>
              <p className="text-xs font-mono">+30 pts (Max)</p>
            </div>
            <div className="bg-background/40 p-2 rounded border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Proximity Alert</p>
              <p className="text-xs font-mono">+30 pts (Max)</p>
            </div>
          </div>
        </motion.div>

        {/* Asteroids Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredAsteroids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Asteroids Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Click "Refresh NASA Data" to fetch the latest asteroids'}
            </p>
            {!searchQuery && (
              <Button onClick={handleRefresh} disabled={fetchNASA.isPending}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Fetch Data
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAsteroids.map((asteroid, index) => (
              <AsteroidCard
                key={asteroid.neo_id}
                asteroid={asteroid}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, RefreshCw, Loader2, List, Search, Camera, Info, Circle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Scene3D } from '@/components/3d/Scene3D';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAsteroids, useFetchNASAFeed } from '@/hooks/useAsteroids';
import type { Asteroid } from '@/types/asteroid';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Visualization() {
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  const { data: asteroids = [], isLoading } = useAsteroids();
  const fetchNASA = useFetchNASAFeed();

  const filteredAsteroids = asteroids.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = !riskFilter || a.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleRefresh = async () => {
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      await fetchNASA.mutateAsync({ startDate, endDate });
      toast.success('Data refreshed!');
    } catch (error) {
      toast.error('Failed to fetch NASA data');
    }
  };

  const riskLevels = [
    { level: 'CRITICAL', color: 'bg-risk-critical', textColor: 'text-risk-critical', count: asteroids.filter(a => a.risk_level === 'CRITICAL').length },
    { level: 'HIGH', color: 'bg-risk-high', textColor: 'text-risk-high', count: asteroids.filter(a => a.risk_level === 'HIGH').length },
    { level: 'MEDIUM', color: 'bg-risk-medium', textColor: 'text-risk-medium', count: asteroids.filter(a => a.risk_level === 'MEDIUM').length },
    { level: 'LOW', color: 'bg-risk-low', textColor: 'text-risk-low', count: asteroids.filter(a => a.risk_level === 'LOW').length },
  ];

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Box className="h-10 w-10 text-primary" />
              3D Visualization
            </h1>
            <p className="text-muted-foreground">
              Interactive view of near-Earth objects and their orbital paths
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLegend(!showLegend)}
              variant="outline"
              size="sm"
            >
              <Info className="mr-2 h-4 w-4" />
              {showLegend ? 'Hide' : 'Show'} Legend
            </Button>
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
              Refresh Data
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="icon"
              title="Reset View"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Risk Legend */}
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card-gradient rounded-lg p-4 border border-border/50 mb-6"
          >
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Risk Level Legend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {riskLevels.map(({ level, color, textColor, count }) => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(riskFilter === level ? null : level)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${riskFilter === level
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:border-border'
                    }`}
                >
                  <Circle className={`h-4 w-4 ${color} rounded-full fill-current`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${textColor}`}>{level}</p>
                    <p className="text-xs text-muted-foreground">{count} objects</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              💡 Click on a risk level to filter asteroids. Scale: 1 unit = 1,000,000 km
            </p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3 bg-card-gradient rounded-lg border border-border/50 overflow-hidden relative"
          >
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="h-[600px]">
                <Scene3D
                  asteroids={riskFilter ? asteroids.filter(a => a.risk_level === riskFilter) : asteroids}
                  selectedAsteroid={selectedAsteroid}
                  onSelectAsteroid={setSelectedAsteroid}
                />
              </div>
            )}

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
              <p className="text-xs text-white/80">
                <strong className="text-white">Viewing:</strong> {filteredAsteroids.length} asteroids
              </p>
              {selectedAsteroid && (
                <p className="text-xs text-white/80 mt-1">
                  <strong className="text-white">Selected:</strong> {selectedAsteroid.name}
                </p>
              )}
            </div>
          </motion.div>

          {/* Asteroid List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card-gradient rounded-lg border border-border/50 p-4 h-[600px] overflow-hidden flex flex-col"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              Asteroids ({filteredAsteroids.length})
            </h2>

            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {riskFilter && (
              <div className="mb-3 flex items-center justify-between bg-primary/10 rounded-lg p-2 border border-primary/30">
                <span className="text-xs font-medium">Filtered by: {riskFilter}</span>
                <button
                  onClick={() => setRiskFilter(null)}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredAsteroids.slice(0, 50).map((asteroid) => (
                <button
                  key={asteroid.neo_id}
                  onClick={() =>
                    setSelectedAsteroid(
                      selectedAsteroid?.neo_id === asteroid.neo_id ? null : asteroid
                    )
                  }
                  className={`w-full text-left p-3 rounded-lg transition-all ${selectedAsteroid?.neo_id === asteroid.neo_id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-muted/50 hover:bg-muted border border-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate text-sm">
                      {asteroid.name}
                    </span>
                    <RiskBadge
                      level={asteroid.risk_level}
                      showScore={false}
                      size="sm"
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Asteroid Details */}
            {selectedAsteroid && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-bold mb-2">{selectedAsteroid.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Diameter:{' '}
                    {(
                      ((selectedAsteroid.diameter_min_km || 0) +
                        (selectedAsteroid.diameter_max_km || 0)) /
                      2
                    ).toFixed(3)}{' '}
                    km
                  </p>
                  <p>Risk Score: {selectedAsteroid.risk_score}</p>
                  {selectedAsteroid.close_approach_data?.[0] && (
                    <p>
                      Velocity:{' '}
                      {parseFloat(
                        selectedAsteroid.close_approach_data[0].relative_velocity
                          .kilometers_per_hour
                      ).toLocaleString()}{' '}
                      km/h
                    </p>
                  )}
                  <p>
                    Hazardous: {selectedAsteroid.is_potentially_hazardous ? 'Yes' : 'No'}
                  </p>
                </div>
                <Link to={`/asteroid/${selectedAsteroid.neo_id}`}>
                  <Button size="sm" className="w-full mt-3 bg-hero-gradient">
                    View Details
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-card-gradient rounded-lg p-4 border border-border/50"
        >
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Controls
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <p>🖱️ <strong>Left-click + Drag:</strong> Rotate view</p>
            <p>📜 <strong>Scroll:</strong> Zoom in/out</p>
            <p>🖱️ <strong>Right-click + Drag:</strong> Pan camera</p>
            <p>🎯 <strong>Click asteroid:</strong> Select/deselect</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

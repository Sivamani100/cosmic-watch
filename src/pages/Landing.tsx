import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Shield,
  Bell,
  Eye,
  Globe,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { CosmicLogo } from '@/components/ui/CosmicLogo';
import { useNeoStats } from '@/hooks/useNeoStats';
import { LandingScene } from '@/components/LandingScene';

const features = [
  {
    icon: Globe,
    title: 'Real-Time NASA Data',
    description: 'Live asteroid feed from NASA NeoWs API, updated daily with the latest discoveries.',
  },
  {
    icon: Shield,
    title: 'Risk Analysis',
    description: 'Advanced risk scoring algorithm evaluating size, velocity, and proximity.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Personalized notifications for close approaches and threshold breaches.',
  },
  {
    icon: Eye,
    title: '3D Visualization',
    description: 'Interactive orbital paths and asteroid positions in our solar system.',
  },
  {
    icon: Activity,
    title: 'Real-Time Chat',
    description: 'Collaborate with researchers worldwide on specific asteroid observations.',
  },
  {
    icon: TrendingUp,
    title: 'Custom Watchlist',
    description: 'Track specific asteroids with personalized proximity thresholds and notes.',
  },
];

// Animated Counter Component
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {value < 100 ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const { stats: neoStats } = useNeoStats();

  // Dynamic Stats
  const stats = [
    {
      value: neoStats ? neoStats.near_earth_object_count : 33000,
      suffix: '+',
      label: 'NEOs Tracked'
    },
    {
      value: neoStats ? neoStats.close_approach_count : 2300,
      suffix: '',
      label: 'Close Approaches'
    },
    { value: 99.9, suffix: '%', label: 'Detection Rate' },
    { value: 24, suffix: '/7', label: 'Monitoring' },
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* 3D Scene Background for Hero */}
      <div className="absolute inset-0 z-0 h-screen pointer-events-none">
        <LandingScene />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-32 relative z-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">
              Live NASA Data Integration • Real-Time Monitoring
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Monitor{' '}
            <span className="text-gradient">Near-Earth Objects</span>
            <br />
            in Real-Time
          </h1>

          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Track asteroids, analyze potential risks, and receive instant alerts
            about close approaches to Earth. Your mission control for space awareness.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                size="lg"
                className="bg-hero-gradient hover:shadow-glow-purple text-lg px-8 py-6 group text-white"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/visualization">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10 text-white"
              >
                <Eye className="mr-2 h-5 w-5" />
                View 3D Visualization
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/10 bg-black/50 backdrop-blur-sm py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 relative z-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">
            Everything You Need for{' '}
            <span className="text-gradient">Space Awareness</span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Comprehensive tools for tracking, analyzing, and monitoring near-Earth objects.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card-gradient p-6 rounded-lg border border-white/10 hover:border-primary/50 hover:shadow-glow-purple/10 transition-all group cursor-pointer"
            >
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-white/80 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Showcase Carousel */}
      <section className="container mx-auto px-4 py-16 relative z-10 text-white">
        <div className="bg-card-gradient rounded-lg p-8 border border-white/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-white">
                {currentFeature === 0 && '🎯 Precision Risk Analysis'}
                {currentFeature === 1 && '🌍 Interactive 3D Orbits'}
                {currentFeature === 2 && '🔔 Smart Alert System'}
              </h3>
              <p className="text-white/80 mb-6">
                {currentFeature === 0 && 'Multi-factor scoring algorithm evaluates hazardous classification, diameter, and proximity to provide accurate risk assessments for every near-Earth object.'}
                {currentFeature === 1 && 'Explore asteroid trajectories in stunning 3D visualization with accurate orbital mechanics, real inclination data, and risk-based color coding.'}
                {currentFeature === 2 && 'Receive automated notifications for upcoming close approaches with customizable proximity thresholds for each asteroid you track.'}
              </p>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentFeature(i)}
                    className={`h-2 rounded-full transition-all ${currentFeature === i ? 'w-8 bg-primary' : 'w-2 bg-white/20'
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="relative h-64 bg-gradient-to-br from-primary/10 to-cosmic-purple/10 rounded-lg flex items-center justify-center">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {currentFeature === 0 && <Shield className="h-32 w-32 text-primary" />}
                {currentFeature === 1 && <Globe className="h-32 w-32 text-cosmic-blue" />}
                {currentFeature === 2 && <Bell className="h-32 w-32 text-cosmic-pink" />}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-hero-gradient rounded-lg p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10">
            <Target className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Start Your Space Watch Mission
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of space enthusiasts monitoring near-Earth objects.
              Free forever, no credit card required.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 group text-white"
              >
                Create Free Account
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 relative z-10 bg-black text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CosmicLogo className="h-6 w-6" />
            <span className="font-bold">Cosmic Watch</span>
          </div>
          <p className="text-sm text-white/60">
            © 2026 Cosmic Watch. Powered by NASA NeoWs API.
          </p>
        </div>
      </footer>
    </div>
  );
}

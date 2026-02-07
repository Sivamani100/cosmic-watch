import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Rocket, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-space-darkest flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background stars */}
      <div className="stars opacity-30" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        <div className="mb-8 flex justify-center">
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-card-gradient p-6 rounded-3xl border border-primary/20 shadow-glow-purple/20"
          >
            <Rocket className="h-16 w-16 text-primary" />
          </motion.div>
        </div>

        <h1 className="text-8xl font-black mb-4 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">
          404
        </h1>

        <div className="flex items-center justify-center gap-2 mb-6 text-risk-high animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span className="font-mono text-sm tracking-tighter uppercase font-bold">Signal Lost in Deep Space</span>
        </div>

        <h2 className="text-2xl font-bold mb-4">You've drifted off course</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          The research coordinates you're looking for don't exist in our current stellar maps.
          Return to Mission Control to resume monitoring.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-hero-gradient hover:shadow-glow-purple h-12 px-8 rounded-xl font-bold">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/10 h-12 px-8 rounded-xl backdrop-blur-sm">
            <Link to="/dashboard">
              View Mission Control
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Floating debris/elements for depth */}
      <motion.div
        animate={{ y: [0, 40, 0], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-[10%] opacity-20"
      >
        <div className="w-4 h-4 rounded-full bg-primary" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -60, 0], rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-40 right-[15%] opacity-10"
      >
        <div className="w-8 h-8 rounded-lg bg-risk-high rotate-45" />
      </motion.div>
    </div>
  );
};

export default NotFound;

import { motion } from 'framer-motion';

export function CosmicLogo({ className = "h-10 w-10" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Outer Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            />

            {/* Inner Ring */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[15%] rounded-full border border-cosmic-pink/30 border-b-cosmic-pink"
            />

            {/* Core Planet */}
            <div className="absolute inset-[30%] bg-gradient-to-br from-primary to-cosmic-blue rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />

            {/* Orbiting Dot */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20%] w-[15%] h-[15%] bg-white rounded-full shadow-[0_0_5px_white]" />
            </motion.div>
        </div>
    );
}

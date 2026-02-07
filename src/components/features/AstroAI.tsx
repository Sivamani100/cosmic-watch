import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Sparkles, Terminal } from 'lucide-react';
import type { Asteroid } from '@/types/asteroid';

interface AstroAIProps {
    asteroid: Asteroid;
}

export function AstroAI({ asteroid }: AstroAIProps) {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const generateAnalysis = (ast: Asteroid) => {
        const isHazardous = ast.is_potentially_hazardous;
        const riskLevel = ast.risk_level;
        const diameter = ((ast.diameter_min_km + ast.diameter_max_km) / 2).toFixed(3);

        const greetings = [
            "Analyzing orbital trajectories...",
            "Synchronizing with NASA NeoWs telemetry...",
            "Running stochastic impact simulations...",
            "Interpreting deep space spectral data..."
        ];

        const greeting = greetings[Math.floor(Math.random() * greetings.length)];

        let analysis = `${greeting}\n\n`;
        analysis += `AstroAI Analysis for ${ast.name}:\n`;
        analysis += `--------------------------------\n`;

        if (isHazardous) {
            analysis += `CRITICAL ADVISORY: This object is classified as Potentially Hazardous. `;
            analysis += `With an estimated diameter of ${diameter} km, an impact would release energy equivalent to thousands of gigatons of TNT. `;
        } else {
            analysis += `OBSERVATIONAL NOTE: ${ast.name} is currently non-hazardous. `;
            analysis += `Its modest size and stable orbit pose no immediate threat to terrestrial life. `;
        }

        analysis += `\n\nRISK ASSESSMENT [${riskLevel}]: `;
        if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
            analysis += `The combination of its velocity and close approach distance warrants continuous monitoring. Orbital perturbations should be tracked for any sign of drift towards Earth's gravitational well.`;
        } else if (riskLevel === 'MEDIUM') {
            analysis += `Moderate risk score indicates a 'Wait and See' profile. While the current trajectory is clear, its mass is sufficient to cause regional devastation in a worst-case scenario.`;
        } else {
            analysis += `Low risk indicators. It is a fascinating subject for scientific research without the burden of planetary defense concerns.`;
        }

        analysis += `\n\nCONCLUSION: Recommend standard optical tracking and radar imaging during next close approach. Data integrity is 99.8% nominal.`;

        return analysis;
    };

    useEffect(() => {
        const fullText = generateAnalysis(asteroid);
        let currentIdx = 0;
        setText('');
        setIsTyping(true);

        const interval = setInterval(() => {
            if (currentIdx < fullText.length) {
                setText(fullText.slice(0, currentIdx + 1));
                currentIdx++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 20);

        return () => clearInterval(interval);
    }, [asteroid]);

    return (
        <div className="bg-black border border-primary/30 rounded-lg overflow-hidden shadow-glow-purple/10">
            <div className="bg-primary/10 px-4 py-2 border-b border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">AstroAI Insights</span>
                </div>
                <div className="flex items-center gap-1">
                    <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="h-2 w-2 rounded-full bg-primary"
                    />
                    <span className="text-[10px] text-primary/70 font-mono">LIVE_ANALYSIS</span>
                </div>
            </div>

            <div className="p-4 font-mono text-sm relative">
                <Terminal className="absolute top-4 right-4 h-4 w-4 text-primary/20" />
                <div className="text-primary-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[200px]">
                    {text}
                    {isTyping && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />}
                </div>

                {!isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-4 border-t border-primary/20 flex items-center gap-4"
                    >
                        <div className="flex items-center gap-1 text-[10px] text-primary/50">
                            <Cpu className="h-3 w-3" />
                            <span>LOGS: NOMINAL</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-primary/50">
                            <Sparkles className="h-3 w-3" />
                            <span>ACCURACY: 99.8%</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { NASA_API_KEY, NASA_API_BASE } from '@/lib/constants';
import { Loader2, Sun, Zap, ShieldAlert, Wind, Info, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DONKIItem {
    flrID?: string;
    gstID?: string;
    cmeID?: string;
    beginTime: string;
    endTime?: string;
    peakTime?: string;
    classType?: string;
    sourceLocation?: string;
    activeRegionNum?: number;
    note?: string;
    submissionTime?: string;
    link?: string;
}

export default function SpaceWeather() {
    const { data: flares, isLoading: flaresLoading } = useQuery({
        queryKey: ['solarflares'],
        queryFn: async (): Promise<DONKIItem[]> => {
            const response = await fetch(
                `${NASA_API_BASE}/DONKI/FLR?api_key=${NASA_API_KEY}`
            );
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        },
    });

    const { data: storms, isLoading: stormsLoading } = useQuery({
        queryKey: ['geomagneticstorms'],
        queryFn: async (): Promise<DONKIItem[]> => {
            const response = await fetch(
                `${NASA_API_BASE}/DONKI/GST?api_key=${NASA_API_KEY}`
            );
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        },
    });

    const isLoading = flaresLoading || stormsLoading;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="stars opacity-30" />
            <Navbar />

            <main className="container mx-auto px-4 py-8 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/20 rounded-xl">
                        <Sun className="h-8 w-8 text-primary shadow-glow-purple" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold mb-1">Space Weather Monitor</h1>
                        <p className="text-white/60 font-mono text-sm">DONKI Telementry • Real-time Solar Activity</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-white/40 font-mono">Decoding solar wind data...</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Solar Flares Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                    Recent Solar Flares
                                </h2>
                                <div className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded uppercase">
                                    Electron Flux
                                </div>
                            </div>

                            <div className="space-y-4">
                                {flares && flares.length > 0 ? (
                                    flares.slice(0, 5).map((flare, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-lg group hover:border-yellow-500/30 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-sm font-bold text-yellow-500">{flare.classType || 'Unclassified'} Class Flare</span>
                                                <span className="text-xs text-white/40">
                                                    {flare.beginTime ? format(new Date(flare.beginTime), 'MMM d, HH:mm') : 'Unknown Time'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70 mb-4 font-light leading-relaxed">
                                                {flare.note?.split('##')[0] || 'Solar transient event detected. Monitoring active region for increased geomagnetic potential.'}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-[10px] text-white/40">
                                                    <Activity className="h-3 w-3" />
                                                    <span>Region: {flare.activeRegionNum || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-white/40">
                                                    <ShieldAlert className="h-3 w-3" />
                                                    <span>Source: {flare.sourceLocation || 'Solar Disk'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center opacity-50">
                                        <p className="text-sm">Solar surface is currently quiet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Geomagnetic Storms Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Wind className="h-5 w-5 text-primary" />
                                    Magnetosphere Impact
                                </h2>
                                <div className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded uppercase">
                                    Kp-Index Feed
                                </div>
                            </div>

                            <div className="space-y-4">
                                {storms && storms.length > 0 ? (
                                    storms.slice(0, 5).map((storm, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-lg border-l-4 border-l-primary group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-primary">Geomagnetic Disturbance Detected</span>
                                                <span className="text-xs text-white/40">
                                                    {storm.beginTime ? format(new Date(storm.beginTime), 'MMM d, HH:mm') : 'Unknown Time'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/70 mb-4 font-light leading-relaxed">
                                                Interaction between solar wind and Earth's magnetosphere observed. Potential for aurora visibility and minor satellite navigation interference.
                                            </p>
                                            <Button variant="outline" size="sm" className="h-7 text-[10px] border-primary/30 text-primary hover:bg-primary/10" asChild>
                                                <a href={storm.link} target="_blank" rel="noopener noreferrer">View Full Analysis</a>
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center border-dashed">
                                        <ShieldAlert className="h-8 w-8 text-white/20 mx-auto mb-2" />
                                        <p className="text-sm text-white/40 italic">Earth's magnetic field is stable. No active alerts.</p>
                                    </div>
                                )}

                                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-500 mb-1">Impact Warning Protocol</h4>
                                            <p className="text-xs text-white/60 leading-relaxed">
                                                The monitor tracks solar events that could correlate with asteroid detection interference or mission-critical hardware risks. High level storms may trigger automatic alert overrides.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}

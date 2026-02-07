import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { NASA_API_KEY, NASA_API_BASE } from '@/lib/constants';
import { Loader2, Calendar, Download, Share2, Info, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format, subDays } from 'date-fns';

interface APODData {
    date: string;
    explanation: string;
    hdurl?: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
}

export default function APOD() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const { data: apod, isLoading, error } = useQuery({
        queryKey: ['apod', dateStr],
        queryFn: async (): Promise<APODData> => {
            const response = await fetch(
                `${NASA_API_BASE}/planetary/apod?api_key=${NASA_API_KEY}&date=${dateStr}`
            );
            if (!response.ok) throw new Error('Failed to fetch APOD');
            return response.json();
        },
    });

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        if (next <= new Date()) setSelectedDate(next);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            <div className="stars opacity-30" />
            <Navbar />

            <main className="container mx-auto px-4 py-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">APOD Explorer</h1>
                        <p className="text-white/60">NASA's Astronomy Picture of the Day</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                        <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 px-3 font-mono text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            {dateStr}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextDay}
                            disabled={dateStr === format(new Date(), 'yyyy-MM-dd')}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-white/40 animate-pulse font-mono">Retrieving cosmic imagery...</p>
                    </div>
                ) : error || !apod ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-12 text-center">
                        <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Connection Interrupted</h2>
                        <p className="text-white/60 mb-6">Deep space telemetry failed to return a valid visual for this coordinate.</p>
                        <Button onClick={() => window.location.reload()}>Retry Transmission</Button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-6">
                            <div className="group relative rounded-lg overflow-hidden border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
                                {apod.media_type === 'image' ? (
                                    <img
                                        src={apod.hdurl || apod.url}
                                        alt={apod.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <iframe
                                        src={apod.url}
                                        title={apod.title}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <div className="flex gap-2">
                                        {apod.hdurl && (
                                            <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 text-white" asChild>
                                                <a href={apod.hdurl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4 mr-2" /> HD Download
                                                </a>
                                            </Button>
                                        )}
                                        <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 text-white">
                                            <Share2 className="h-4 w-4 mr-2" /> Share Discovery
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-primary">
                                    {apod.title}
                                </h2>
                                <div className="prose prose-invert max-w-none text-white/80 leading-relaxed font-light">
                                    {apod.explanation}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                                <h3 className="font-bold mb-4 uppercase tracking-wider text-xs text-primary/70">Technical Specs</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-white/40 text-sm">Media Type</span>
                                        <span className="text-white capitalize">{apod.media_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-white/40 text-sm">Catalog Date</span>
                                        <span className="text-white">{apod.date}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-white/40 text-sm">Service Version</span>
                                        <span className="text-white">{apod.service_version}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-primary/10 border border-primary/20 rounded-lg backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Sparkles className="h-24 w-24 text-primary" />
                                </div>
                                <h3 className="font-bold mb-2 text-primary">Daily Exploration</h3>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    Every day a different image or photograph of our fascinating universe is featured, along with a brief explanation written by a professional astronomer.
                                </p>
                                <Button variant="link" className="text-primary p-0 h-auto mt-4 text-xs font-bold" asChild>
                                    <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer">
                                        Official NASA Archive →
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

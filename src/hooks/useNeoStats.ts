import { useState, useEffect } from 'react';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

interface NeoStats {
    near_earth_object_count: number;
    close_approach_count: number;
    last_updated: string;
    source: string;
}

export function useNeoStats() {
    const [stats, setStats] = useState<NeoStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // NASA NeoWs Stats Endpoint
                // https://api.nasa.gov/neo/rest/v1/stats?api_key=DEMO_KEY
                // However, standard feed is safer if stats endpoint is restricted.
                // Let's try stats endpoint first.
                const res = await fetch(`https://api.nasa.gov/neo/rest/v1/stats?api_key=${NASA_API_KEY}`);
                if (!res.ok) throw new Error(`NASA API error: ${res.status}`);
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch NASA stats, falling back to estimations", err);
                // Fallback to approximate real numbers if API fails
                setStats({
                    near_earth_object_count: 34000,
                    close_approach_count: 5000,
                    last_updated: new Date().toISOString(),
                    source: 'NASA JPL (Estimated)'
                });
                setError(String(err));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
}

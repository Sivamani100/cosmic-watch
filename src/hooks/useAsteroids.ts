import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import {
  fetchNASAFeed,
  getAsteroidById,
  getCachedAsteroids,
  getAsteroidStats,
  searchAsteroids,
  getHazardousAsteroids,
} from '@/services/nasa.service';
import type { Asteroid } from '@/types/asteroid';

export function useAsteroids(hazardousOnly = false) {
  return useQuery({
    queryKey: ['asteroids', { hazardousOnly }],
    queryFn: () => getCachedAsteroids(20, 0, hazardousOnly),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAsteroid(neoId: string | undefined) {
  return useQuery({
    queryKey: ['asteroid', neoId],
    queryFn: () => (neoId ? getAsteroidById(neoId) : null),
    enabled: !!neoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAsteroidStats() {
  return useQuery({
    queryKey: ['asteroidStats'],
    queryFn: getAsteroidStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHazardousAsteroids() {
  return useQuery({
    queryKey: ['hazardousAsteroids'],
    queryFn: getHazardousAsteroids,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchAsteroids(query: string) {
  return useQuery({
    queryKey: ['searchAsteroids', query],
    queryFn: () => searchAsteroids(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useFetchNASAFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
    }: {
      startDate?: string;
      endDate?: string;
    }) => {
      const end = endDate || format(new Date(), 'yyyy-MM-dd');
      const start = startDate || format(subDays(new Date(), 7), 'yyyy-MM-dd');
      return fetchNASAFeed(start, end);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asteroids'] });
      queryClient.invalidateQueries({ queryKey: ['asteroidStats'] });
      queryClient.invalidateQueries({ queryKey: ['hazardousAsteroids'] });
    },
  });
}

export function useAsteroidsInfinite(hazardousOnly = false) {
  const PAGE_SIZE = 20;

  return useQuery({
    queryKey: ['asteroidsInfinite', { hazardousOnly }],
    queryFn: async () => {
      const asteroids = await getCachedAsteroids(PAGE_SIZE, 0, hazardousOnly);
      return {
        pages: [asteroids],
        pageParams: [0],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

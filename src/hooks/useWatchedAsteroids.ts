import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { WatchedAsteroid, Asteroid } from '@/types/asteroid';

export function useWatchedAsteroids() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['watchedAsteroids', user?.id],
    queryFn: async (): Promise<WatchedAsteroid[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('watched_asteroids')
        .select(`
          *,
          asteroids_cache (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((item: any) => ({
        ...item,
        asteroid: item.asteroids_cache as Asteroid,
      })) as WatchedAsteroid[];
    },
    enabled: !!user,
  });
}

export function useIsWatching(neoId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isWatching', user?.id, neoId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('watched_asteroids')
        .select('id')
        .eq('user_id', user.id)
        .eq('neo_id', neoId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!neoId,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      neoId,
      notes,
      minDistanceThreshold,
    }: {
      neoId: string;
      notes?: string;
      minDistanceThreshold?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('watched_asteroids')
        .insert({
          user_id: user.id,
          neo_id: neoId,
          notes,
          min_distance_threshold_km: minDistanceThreshold,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchedAsteroids'] });
      queryClient.invalidateQueries({ queryKey: ['isWatching', user?.id, variables.neoId] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (neoId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('watched_asteroids')
        .delete()
        .eq('user_id', user.id)
        .eq('neo_id', neoId);

      if (error) throw error;
    },
    onSuccess: (_, neoId) => {
      queryClient.invalidateQueries({ queryKey: ['watchedAsteroids'] });
      queryClient.invalidateQueries({ queryKey: ['isWatching', user?.id, neoId] });
    },
  });
}

export function useUpdateWatchedAsteroid() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<WatchedAsteroid, 'alert_enabled' | 'notes' | 'min_distance_threshold_km'>>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('watched_asteroids')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(updates as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedAsteroids'] });
    },
  });
}

export function useWatchedCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['watchedCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('watched_asteroids')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CommunityMessage {
    id: string;
    created_at: string;
    user_id: string;
    username: string;
    message: string;
}

export function useCommunityMessages() {
    return useQuery({
        queryKey: ['communityMessages'],
        queryFn: async (): Promise<CommunityMessage[]> => {
            const { data, error } = await supabase
                .from('community_messages' as any)
                .select('*')
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            return (data || []) as unknown as CommunityMessage[];
        },
    });
}

export function useSendCommunityMessage() {
    const queryClient = useQueryClient();
    const { user, profile } = useAuth();

    return useMutation({
        mutationFn: async (message: string) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('community_messages' as any)
                .insert({
                    user_id: user.id,
                    username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
                    message,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communityMessages'] });
        },
    });
}

export function useDeleteCommunityMessage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (messageId: string) => {
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('community_messages' as any)
                .delete()
                .eq('id', messageId)
                .eq('user_id', user.id); // Security: ensure user can only delete their own messages

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communityMessages'] });
        },
    });
}

export function useRealtimeCommunityChat() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('community-chat')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, DELETE, etc.)
                    schema: 'public',
                    table: 'community_messages' as any,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['communityMessages'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}

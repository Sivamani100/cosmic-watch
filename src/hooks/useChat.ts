import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { ChatMessage } from '@/types/asteroid';

export function useChatMessages(neoId: string) {
  return useQuery({
    queryKey: ['chatMessages', neoId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('neo_id', neoId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return (data || []) as unknown as ChatMessage[];
    },
    enabled: !!neoId,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      neoId,
      message,
    }: {
      neoId: string;
      message: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          neo_id: neoId,
          username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.neoId] });
    },
  });
}

export function useRealtimeChat(neoId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!neoId) return;

    const channel = supabase
      .channel(`chat-${neoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `neo_id=eq.${neoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chatMessages', neoId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [neoId, queryClient]);
}

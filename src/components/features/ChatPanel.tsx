import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages, useSendChatMessage, useRealtimeChat } from '@/hooks/useChat';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ChatPanelProps {
  neoId: string;
  asteroidName: string;
}

export function ChatPanel({ neoId, asteroidName }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, profile } = useAuth();
  const { data: messages = [], isLoading } = useChatMessages(neoId);
  const sendMessage = useSendChatMessage();

  // Enable realtime updates
  useRealtimeChat(neoId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please login to send messages');
      return;
    }

    try {
      await sendMessage.mutateAsync({ neoId, message: message.trim() });
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-hero-gradient p-4 rounded-full shadow-glow-purple z-40"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-cosmic-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold">Live Discussion</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {asteroidName}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet.</p>
                  <p className="text-sm">Be the first to start the discussion!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.username === profile?.username;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback
                            className={`text-xs ${
                              isOwn ? 'bg-primary/20 text-primary' : 'bg-muted'
                            }`}
                          >
                            {msg.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[75%] ${
                            isOwn ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium opacity-70 mb-1">
                                {msg.username}
                              </p>
                            )}
                            <p className="text-sm break-words">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-1">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border">
              {!isAuthenticated ? (
                <p className="text-center text-sm text-muted-foreground">
                  Please login to join the discussion
                </p>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={1000}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || sendMessage.isPending}
                    className="bg-hero-gradient"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

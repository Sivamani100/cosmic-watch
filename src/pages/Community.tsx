import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Loader2, MessageSquare, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import {
    useCommunityMessages,
    useSendCommunityMessage,
    useRealtimeCommunityChat,
    useDeleteCommunityMessage
} from '@/hooks/useCommunityChat';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Community() {
    const [message, setMessage] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { isAuthenticated, profile } = useAuth();
    const { data: messages = [], isLoading } = useCommunityMessages();
    const sendMessage = useSendCommunityMessage();
    const deleteMessage = useDeleteCommunityMessage();

    // Enable realtime updates
    useRealtimeCommunityChat();

    // Scroll handler to show/hide "Scroll to Bottom" button
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
        setShowScrollButton(!isAtBottom);
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    // Auto-scroll when new messages arrive if user is already at bottom
    useEffect(() => {
        if (!showScrollButton) {
            scrollToBottom();
        }
    }, [messages, showScrollButton]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (!isAuthenticated) {
            toast.error('Please login to participate in the community');
            return;
        }

        try {
            await sendMessage.mutateAsync(message.trim());
            setMessage('');
            scrollToBottom();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMessage.mutateAsync(id);
            toast.success('Message deleted');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    return (
        <div className="min-h-screen bg-space-darkest text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col h-[calc(100vh-64px)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card-gradient rounded-xl border border-border/50 overflow-hidden flex flex-col flex-1 shadow-glow-purple/10 relative"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-black/20 backdrop-blur-sm flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Community Research Hub
                                </h1>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                    Live global collaboration thread
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground border border-border italic">
                                {messages.length} active signals
                            </span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea
                        className="flex-1 p-6 relative"
                        ref={scrollRef}
                        onScrollCapture={handleScroll}
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 grayscale opacity-50">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-lg">Synchronizing community data...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-20">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                <h3 className="text-xl font-semibold mb-2">The hub is quiet...</h3>
                                <p className="text-muted-foreground">Be the first to share an interstellar finding!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((msg, index) => {
                                    const isOwn = msg.username === profile?.username;
                                    const showUsername = index === 0 || messages[index - 1].username !== msg.username;

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`flex gap-3 group/msg ${isOwn ? 'flex-row-reverse' : ''}`}
                                        >
                                            {!isOwn ? (
                                                <Avatar className="h-8 w-8 mt-1 border border-primary/20 shadow-glow-blue/10">
                                                    <AvatarFallback className="bg-muted text-primary font-bold text-xs">
                                                        {msg.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : null}

                                            <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                                {showUsername && !isOwn && (
                                                    <span className="text-[10px] font-black text-primary/60 mb-1 ml-1 uppercase tracking-widest">
                                                        {msg.username}
                                                    </span>
                                                )}
                                                <div className="relative group/content">
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl shadow-sm transition-colors ${isOwn
                                                                ? 'bg-gradient-to-br from-primary/80 to-purple-600/80 text-primary-foreground rounded-tr-none border border-white/10'
                                                                : 'bg-muted/40 backdrop-blur-sm border border-border/50 rounded-tl-none'
                                                            }`}
                                                    >
                                                        <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                                                    </div>

                                                    {/* Delete Action (Own Messages Only) */}
                                                    {isOwn && (
                                                        <button
                                                            onClick={() => handleDelete(msg.id)}
                                                            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover/msg:opacity-100 transition-opacity"
                                                            title="Delete signal"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground mt-1 opacity-40 font-mono tracking-tighter">
                                                    {format(new Date(msg.created_at), 'HH:mm • MMM dd')}
                                                </span>
                                            </div>

                                            {isOwn ? (
                                                <Avatar className="h-8 w-8 mt-1 border border-primary/20 shadow-glow-purple/10">
                                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                                                        {msg.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : null}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Scroll to bottom button */}
                    <AnimatePresence>
                        {showScrollButton && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                onClick={scrollToBottom}
                                className="absolute bottom-28 right-8 bg-primary/20 hover:bg-primary/40 backdrop-blur-md p-2 rounded-full border border-primary/30 text-primary z-20 shadow-glow-primary/20"
                            >
                                <ChevronDown className="h-5 w-5 animate-bounce" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Input Area */}
                    <div className="p-6 border-t border-border bg-black/40 backdrop-blur-xl z-10">
                        {!isAuthenticated ? (
                            <div className="text-center p-4 bg-muted/20 rounded-xl border border-dashed border-border/50">
                                <p className="text-sm text-muted-foreground italic">
                                    🔐 Join the mission to participate in researchers' hub
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="flex gap-4">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Share a finding or ask a question..."
                                    className="flex-1 bg-background/30 border-primary/20 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-xl h-12 text-sm"
                                    maxLength={2000}
                                />
                                <Button
                                    type="submit"
                                    disabled={!message.trim() || sendMessage.isPending}
                                    className="h-12 w-12 rounded-xl bg-hero-gradient shadow-glow-purple/20 hover:shadow-glow-purple/40 transition-all hover:scale-105"
                                >
                                    {sendMessage.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </form>
                        )}
                        <p className="text-[9px] text-center text-muted-foreground/40 mt-3 uppercase tracking-[0.3em] font-black">
                            Satellite Research Uplink Active • Secure Environment
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

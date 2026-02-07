import { motion } from 'framer-motion';
import { Users, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommunityMessages } from '@/hooks/useCommunityChat';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function CommunityPreview() {
    const { data: messages = [], isLoading } = useCommunityMessages();

    // Get latest 3 messages
    const latestMessages = [...messages].reverse().slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-gradient rounded-xl border border-border/50 overflow-hidden flex flex-col h-full shadow-glow-purple/5"
        >
            <div className="p-4 border-b border-border flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Research Hub</h3>
                </div>
                <Link
                    to="/community"
                    className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group"
                >
                    JOIN DISCUSSION
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-xs">Uplinking...</span>
                    </div>
                ) : latestMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/20 mb-2" />
                        <p className="text-[10px] text-muted-foreground">Hub is currently silent</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {latestMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-2 items-start">
                                <Avatar className="h-6 w-6 border border-primary/20">
                                    <AvatarFallback className="text-[8px] bg-muted text-primary font-bold">
                                        {msg.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-bold text-primary/70 truncate uppercase">
                                            {msg.username}
                                        </span>
                                        <span className="text-[8px] text-muted-foreground font-mono">
                                            {format(new Date(msg.created_at), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate leading-tight">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-4 py-2 bg-primary/5 border-t border-border/30">
                <p className="text-[8px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                    {messages.length} total research signals detected
                </p>
            </div>
        </motion.div>
    );
}

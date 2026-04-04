import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  listingId: string;
  listingName: string;
  listingEmoji: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

const Inbox = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<{ partnerId: string; listingId: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Open a specific conversation from URL params
  useEffect(() => {
    const partnerId = searchParams.get("with");
    const listingId = searchParams.get("listing");
    if (partnerId && listingId) {
      setActiveConvo({ partnerId, listingId });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) loadConversations();
  }, [user, authLoading]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("inbox-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.recipient_id === user.id) {
            // Refresh conversations
            loadConversations();
            // If we're in the active conversation, add the message
            if (
              activeConvo &&
              ((msg.sender_id === activeConvo.partnerId && msg.listing_id === activeConvo.listingId) ||
                (msg.sender_id === user.id && msg.listing_id === activeConvo.listingId))
            ) {
              setMessages((prev) => [...prev, msg]);
              if (msg.recipient_id === user.id) {
                supabase.from("messages").update({ read: true } as any).eq("id", msg.id).then(() => {});
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;

    const { data: allMessages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!allMessages) {
      setLoading(false);
      return;
    }

    // Group by partner + listing
    const convoMap = new Map<string, { msgs: any[]; partnerId: string; listingId: string }>();
    for (const msg of allMessages) {
      const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      const key = `${partnerId}-${msg.listing_id}`;
      if (!convoMap.has(key)) {
        convoMap.set(key, { msgs: [], partnerId, listingId: msg.listing_id });
      }
      convoMap.get(key)!.msgs.push(msg);
    }

    // Fetch partner profiles and listing names
    const partnerIds = [...new Set([...convoMap.values()].map((c) => c.partnerId))];
    const listingIds = [...new Set([...convoMap.values()].map((c) => c.listingId))];

    const [{ data: profiles }, { data: listings }] = await Promise.all([
      supabase.rpc("get_public_profiles", { user_ids: partnerIds }),
      supabase.from("listings").select("id, name, emoji").in("id", listingIds),
    ]);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const listingMap = new Map((listings || []).map((l) => [l.id, l]));

    const convos: Conversation[] = [...convoMap.entries()].map(([, c]) => {
      const profile = profileMap.get(c.partnerId);
      const listing = listingMap.get(c.listingId);
      const unread = c.msgs.filter((m: any) => m.recipient_id === user.id && !m.read).length;
      return {
        partnerId: c.partnerId,
        partnerName: profile?.display_name || "Unknown",
        partnerAvatar: profile?.avatar_url || null,
        listingId: c.listingId,
        listingName: listing?.name || "Unknown",
        listingEmoji: listing?.emoji || "📦",
        lastMessage: c.msgs[0].content,
        lastMessageAt: c.msgs[0].created_at,
        unreadCount: unread,
      };
    });

    convos.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    setConversations(convos);
    setLoading(false);
  };

  const openConversation = async (partnerId: string, listingId: string) => {
    setActiveConvo({ partnerId, listingId });

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user!.id})`)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    // Mark unread as read
    const unreadIds = (data || []).filter((m: any) => m.recipient_id === user!.id && !m.read).map((m: any) => m.id);
    if (unreadIds.length > 0) {
      await supabase.from("messages").update({ read: true } as any).in("id", unreadIds);
      loadConversations();
    }
  };

  const sendMessage = async () => {
    if (!user || !activeConvo || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      listing_id: activeConvo.listingId,
      sender_id: user.id,
      recipient_id: activeConvo.partnerId,
      content: newMessage.trim(),
    } as any);
    setSending(false);
    if (error) {
      toast.error("Failed to send");
    } else {
      setNewMessage("");
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => (activeConvo ? setActiveConvo(null) : navigate("/"))}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {activeConvo ? "Back to Inbox" : "Back to marketplace"}
          </button>
          <div className="flex items-center gap-2 font-bold text-lg">
            <MessageCircle className="h-5 w-5 text-primary" /> Messages
          </div>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {!activeConvo ? (
          /* Conversation List */
          conversations.length === 0 ? (
            <div className="py-20 text-center">
              <span className="text-5xl block mb-4">💬</span>
              <p className="text-lg font-semibold text-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">When you make an offer or receive one, it'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((convo) => (
                <motion.button
                  key={`${convo.partnerId}-${convo.listingId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => openConversation(convo.partnerId, convo.listingId)}
                  className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors text-left"
                >
                  {convo.partnerAvatar ? (
                    <img src={convo.partnerAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {convo.partnerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-foreground text-sm truncate">{convo.partnerName}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{convo.listingEmoji} {convo.listingName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">{formatTime(convo.lastMessageAt)}</span>
                    {convo.unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )
        ) : (
          /* Active Conversation */
          <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-10 text-sm">No messages yet. Start the conversation!</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === user!.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-secondary-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <span className={`text-[10px] block mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border pt-4 flex gap-3">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                maxLength={1000}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="rounded-xl gradient-fun px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inbox;

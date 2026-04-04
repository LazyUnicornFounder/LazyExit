import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Sparkles, MessageCircle } from "lucide-react";
import AutonomyMeter from "./AutonomyMeter";
import VerifiedBadge from "./VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface Listing {
  id: string;
  name: string;
  description: string;
  category: string;
  mrr: number;
  askingPrice: number;
  autonomyScore: number;
  multiplier: number;
  techStack: string[];
  verified: boolean;
  emoji: string;
  websiteUrl?: string | null;
  userId: string;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const ListingCard = ({ listing, index = 0 }: { listing: Listing; index?: number }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offerOpen, setOfferOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleCardClick = () => {
    if (listing.websiteUrl) {
      window.open(listing.websiteUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOffer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    setOfferOpen(true);
  };

  const sendMessage = async () => {
    if (!user || !message.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      listing_id: listing.id,
      sender_id: user.id,
      recipient_id: listing.userId,
      content: message.trim(),
    } as any);
    setSending(false);
    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Offer sent! 🎉");
      setOfferOpen(false);
      setMessage("");
      navigate(`/inbox?with=${listing.userId}&listing=${listing.id}`);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:glow-primary-strong cursor-pointer card-shine"
        onClick={handleCardClick}
      >
        {/* Fun corner accent */}
        <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-bl from-primary/20 via-fun-pink/10 to-transparent rounded-tr-2xl rounded-bl-[2rem] pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex items-center gap-2.5">
            <motion.span
              className="text-2xl"
              whileHover={{ scale: 1.3, rotate: 15 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {listing.emoji}
            </motion.span>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground truncate group-hover:gradient-text transition-all">
                {listing.name}
              </h3>
              <span className="text-xs text-muted-foreground font-medium">{listing.category}</span>
            </div>
          </div>
          {listing.websiteUrl && (
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-secondary-foreground leading-relaxed mb-4 line-clamp-2">
          {listing.description}
        </p>

        {/* MRR & Price */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-secondary/80 p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">MRR</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">{formatCurrency(listing.mrr)}</span>
            {listing.verified && (
              <div className="mt-1.5">
                <VerifiedBadge />
              </div>
            )}
          </div>
          <div className="rounded-xl bg-secondary/80 p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-fun-pink" />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Price</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">{formatCurrency(listing.askingPrice)}</span>
            <span className="text-xs text-primary font-semibold block mt-0.5">{listing.multiplier}x</span>
          </div>
        </div>

        {/* Autonomy */}
        <div className="mb-4">
          <AutonomyMeter score={listing.autonomyScore} />
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          {listing.techStack.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-border/50 hover:border-primary/30 transition-colors">
              {t}
            </span>
          ))}
        </div>

        {/* Make an Offer button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOffer}
          className="w-full flex items-center justify-center gap-2 rounded-xl gradient-fun py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/40"
        >
          <MessageCircle className="h-4 w-4" /> Make an Offer
        </motion.button>
      </motion.div>

      {/* Offer Dialog */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{listing.emoji}</span> Make an Offer for {listing.name}
            </DialogTitle>
            <DialogDescription>
              Send a message to the seller with your offer or questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi! I'm interested in ${listing.name}. I'd like to offer...`}
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOfferOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={sendMessage}
                disabled={sending || !message.trim()}
                className="rounded-xl gradient-fun px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Offer 🚀"}
              </motion.button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListingCard;

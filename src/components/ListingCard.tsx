import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Sparkles } from "lucide-react";
import AutonomyMeter from "./AutonomyMeter";
import VerifiedBadge from "./VerifiedBadge";

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
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const ListingCard = ({ listing, index = 0 }: { listing: Listing; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotate: -1 }}
    animate={{ opacity: 1, y: 0, rotate: 0 }}
    whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:glow-primary-strong cursor-pointer card-shine"
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
      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
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
    <div className="flex flex-wrap gap-1.5 mt-auto">
      {listing.techStack.map((t) => (
        <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-border/50 hover:border-primary/30 transition-colors">
          {t}
        </span>
      ))}
    </div>
  </motion.div>
);

export default ListingCard;

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp } from "lucide-react";
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
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const ListingCard = ({ listing }: { listing: Listing }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3 }}
    className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:glow-primary cursor-pointer"
  >
    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="font-display font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
          {listing.name}
        </h3>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{listing.category}</span>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    </div>

    {/* Description */}
    <p className="text-sm text-secondary-foreground leading-relaxed mb-4 line-clamp-2">
      {listing.description}
    </p>

    {/* MRR & Price */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="rounded-lg bg-secondary p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Monthly Revenue</span>
        </div>
        <span className="font-display font-bold text-lg text-foreground">{formatCurrency(listing.mrr)}</span>
        {listing.verified && (
          <div className="mt-1">
            <VerifiedBadge />
          </div>
        )}
      </div>
      <div className="rounded-lg bg-secondary p-3">
        <span className="text-xs text-muted-foreground block mb-1">Asking Price</span>
        <span className="font-display font-bold text-lg text-foreground">{formatCurrency(listing.askingPrice)}</span>
        <span className="text-xs text-muted-foreground block mt-1">{listing.multiplier}x multiple</span>
      </div>
    </div>

    {/* Autonomy */}
    <div className="mb-4">
      <AutonomyMeter score={listing.autonomyScore} />
    </div>

    {/* Tech stack */}
    <div className="flex flex-wrap gap-1.5 mt-auto">
      {listing.techStack.map((t) => (
        <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {t}
        </span>
      ))}
    </div>
  </motion.div>
);

export default ListingCard;

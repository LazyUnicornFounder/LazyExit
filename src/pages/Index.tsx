import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Rocket, ShieldCheck, Bot, Sparkles, Zap } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { listings } from "@/data/listings";

const categories = [
  { label: "All", emoji: "🌐" },
  { label: "SaaS", emoji: "☁️" },
  { label: "E-Commerce", emoji: "🛒" },
  { label: "Finance", emoji: "💳" },
  { label: "SEO", emoji: "🔍" },
  { label: "Sales", emoji: "📈" },
  { label: "Content", emoji: "✏️" },
];

const stats = [
  { label: "Businesses Listed", value: "240+", emoji: "🏪" },
  { label: "Total MRR Listed", value: "$2.4M", emoji: "💸" },
  { label: "Avg Autonomy Score", value: "78%", emoji: "🤖" },
];

const Index = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [minAutonomy, setMinAutonomy] = useState(0);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "All" || l.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchAutonomy = l.autonomyScore >= minAutonomy;
      return matchSearch && matchCategory && matchAutonomy;
    });
  }, [search, activeCategory, minAutonomy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-2xl">🤖</span>
            <span className="font-display font-bold text-xl gradient-text">AutoAcquire</span>
          </motion.div>
          <div className="flex items-center gap-5">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Browse</button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">How it Works</button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl gradient-fun px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
            >
              🚀 List Your Business
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Fun background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-fun-pink/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-40 right-40 w-48 h-48 bg-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="container relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-semibold text-primary">The marketplace for autonomous businesses</span>
            </motion.div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-5">
              Buy & sell businesses
              <br />
              that <span className="gradient-text">run themselves</span>{" "}
              <motion.span
                className="inline-block"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              >
                ✨
              </motion.span>
            </h1>
            
            <p className="text-lg text-secondary-foreground max-w-xl leading-relaxed mb-8">
              Every listing features <span className="text-verified font-semibold">verified MRR</span> and an{" "}
              <span className="text-primary font-semibold">autonomy score</span> so you know exactly how hands-off the business truly is.
            </p>
            
            <div className="flex items-center gap-6 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-full px-4 py-2 border border-border">
                <ShieldCheck className="h-4 w-4 text-verified" />
                <span>Revenue verified</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-full px-4 py-2 border border-border">
                <Bot className="h-4 w-4 text-primary" />
                <span>Autonomy audited</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-full px-4 py-2 border border-border">
                <Zap className="h-4 w-4 text-accent" />
                <span>Instant transfer</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <span className="text-2xl mb-1 block">{stat.emoji}</span>
                <span className="font-display font-bold text-2xl text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground block mt-0.5 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="border-b border-border bg-background sticky top-16 z-40 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search businesses... 🔎"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <motion.button
                  key={cat.label}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeCategory === cat.label
                      ? "gradient-fun text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </motion.button>
              ))}
            </div>

            {/* Autonomy filter */}
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground whitespace-nowrap font-semibold">🤖 Min: {minAutonomy}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={minAutonomy}
                onChange={(e) => setMinAutonomy(Number(e.target.value))}
                className="w-24 accent-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              {filtered.length} {filtered.length === 1 ? "business" : "businesses"} ready to acquire
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <span className="text-6xl block mb-4">🤷</span>
            <p className="text-muted-foreground text-lg font-medium">No businesses match your criteria.</p>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters!</p>
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/30">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span>🤖</span>
            <span className="font-display font-semibold gradient-text">AutoAcquire</span>
            <span>© 2026</span>
          </span>
          <span>Built for autonomous entrepreneurs ⚡</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;

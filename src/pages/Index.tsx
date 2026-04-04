import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Zap, ShieldCheck, Bot } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { listings } from "@/data/listings";

const categories = ["All", "SaaS", "E-Commerce", "Finance", "SEO", "Sales", "Content"];

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
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">AutoAcquire</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse</button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</button>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              List Your Business
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
              <Zap className="h-3.5 w-3.5 text-primary animate-pulse-glow" />
              <span className="text-xs font-medium text-primary">The marketplace for autonomous businesses</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
              Buy & sell businesses that{" "}
              <span className="text-primary">run themselves</span>
            </h1>
            <p className="text-lg text-secondary-foreground max-w-xl leading-relaxed mb-8">
              Every listing features verified MRR and an autonomy score so you know exactly how hands-off the business truly is.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-verified" />
                <span>Revenue verified by third party</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="h-4 w-4 text-primary" />
                <span>Autonomy audited</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Autonomy filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">Min autonomy: {minAutonomy}%</span>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {filtered.length} {filtered.length === 1 ? "business" : "businesses"} available
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No businesses match your criteria.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 AutoAcquire. All rights reserved.</span>
          <span>Built for autonomous entrepreneurs.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;

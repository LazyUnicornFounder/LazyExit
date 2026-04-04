import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchListings();
  }, [user, authLoading]);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setListings(data || []);
    setLoading(false);
  };

  const toggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", listing.id);
    if (error) toast.error(error.message);
    else {
      toast.success(newStatus === "published" ? "Published! 🎉" : "Unpublished");
      fetchListings();
    }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted 🗑️");
      fetchListings();
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-4xl animate-bounce-in">😴</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold gradient-text">My Businesses 😴</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your lazy exits</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/list")}
            className="flex items-center gap-2 rounded-xl gradient-fun px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Add Business
          </motion.button>
        </div>

        {listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border border-border bg-card"
          >
            <span className="text-6xl block mb-4">🏖️</span>
            <p className="text-foreground font-display font-semibold text-lg mb-2">No businesses yet</p>
            <p className="text-muted-foreground text-sm mb-6">List your first autonomous business!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/list")}
              className="rounded-xl gradient-fun px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
            >
              🚀 List a Business
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl">{listing.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">{listing.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{listing.category}</span>
                    <span>•</span>
                    <span>{formatCurrency(listing.mrr)}/mo</span>
                    <span>•</span>
                    <span className={listing.status === "published" ? "text-accent font-semibold" : "text-muted-foreground"}>
                      {listing.status === "published" ? "🟢 Live" : listing.status === "sold" ? "🔴 Sold" : "⚪ Draft"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/list?edit=${listing.id}`)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(listing)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={listing.status === "published" ? "Unpublish" : "Publish"}
                  >
                    {listing.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

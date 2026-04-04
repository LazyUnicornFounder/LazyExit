import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Check, X, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";

interface AdminListing {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  mrr: number;
  asking_price: number;
  autonomy_score: number;
  status: string;
  created_at: string;
  user_id: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "published" | "all">("pending");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!roleLoading && !isAdmin && !authLoading) navigate("/");
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchListings();
  }, [isAdmin, filter]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from("listings").select("*").order("created_at", { ascending: false });

    if (filter === "pending") query = query.eq("status", "draft");
    else if (filter === "published") query = query.eq("status", "published");

    const { data, error } = await query;
    if (!error && data) setListings(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "published" | "rejected") => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update listing");
      return;
    }
    toast.success(status === "published" ? "Listing approved! ✅" : "Listing rejected");
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" /> Admin Panel
          </div>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Filters */}
        <div className="mb-8 flex gap-2">
          {(["pending", "published", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f === "pending" ? "⏳ Pending" : f === "published" ? "✅ Published" : "📋 All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">No {filter === "all" ? "" : filter} listings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{listing.emoji}</span>
                    <h3 className="font-semibold text-foreground truncate">{listing.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      listing.status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : listing.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{listing.description}</p>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>${listing.mrr.toLocaleString()}/mo</span>
                    <span>Ask: ${listing.asking_price.toLocaleString()}</span>
                    <span>Autonomy: {listing.autonomy_score}%</span>
                    <span>{listing.category}</span>
                  </div>
                </div>

                {listing.status === "draft" && (
                  <div className="ml-4 flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(listing.id, "published")}
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(listing.id, "rejected")}
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

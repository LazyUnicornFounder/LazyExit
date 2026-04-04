import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AutonomyMeter from "@/components/AutonomyMeter";

const CATEGORIES = ["SaaS · Email", "SaaS · Content", "SaaS · SEO", "SaaS · Sales", "SaaS · Finance", "E-Commerce", "API", "Other"];
const EMOJI_OPTIONS = ["📧", "📦", "✍️", "📊", "💰", "🎯", "🤖", "🔧", "🛒", "☁️", "🚀", "⚡", "🏪"];

const ListingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    emoji: "🏪",
    description: "",
    category: CATEGORIES[0],
    mrr: 0,
    asking_price: 0,
    autonomy_score: 50,
    multiplier: 2.5,
    tech_stack: [""],
  });

  const updateField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const addTech = () => updateField("tech_stack", [...form.tech_stack, ""]);
  const removeTech = (i: number) => updateField("tech_stack", form.tech_stack.filter((_, idx) => idx !== i));
  const updateTech = (i: number, v: string) => {
    const arr = [...form.tech_stack];
    arr[i] = v;
    updateField("tech_stack", arr);
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!user) return;
    setLoading(true);
    try {
      const techStack = form.tech_stack.filter((t) => t.trim());
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        name: form.name,
        emoji: form.emoji,
        description: form.description,
        category: form.category,
        mrr: form.mrr,
        asking_price: form.asking_price,
        autonomy_score: form.autonomy_score,
        multiplier: form.multiplier,
        tech_stack: techStack,
        status,
      });
      if (error) throw error;
      toast.success(status === "published" ? "Listed! 🎉" : "Saved as draft! 📝");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-10">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold gradient-text mb-2">List a Business 🚀</h1>
          <p className="text-muted-foreground mb-8">Add your autonomous business to the marketplace.</p>

          <div className="space-y-6">
            {/* Name + Emoji */}
            <div className="flex gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Emoji</label>
                <div className="flex flex-wrap gap-1 max-w-[120px]">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => updateField("emoji", e)}
                      className={`text-lg p-1 rounded-lg transition-all ${form.emoji === e ? "bg-primary/20 scale-110" : "hover:bg-secondary"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Business Name</label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="AutoMailFlow"
                  required
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe what your business does and how autonomous it is..."
                rows={4}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Financials */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">MRR ($)</label>
                <input
                  type="number"
                  value={form.mrr}
                  onChange={(e) => updateField("mrr", Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Asking Price ($)</label>
                <input
                  type="number"
                  value={form.asking_price}
                  onChange={(e) => updateField("asking_price", Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Multiplier</label>
                <input
                  type="number"
                  value={form.multiplier}
                  onChange={(e) => updateField("multiplier", Number(e.target.value))}
                  step={0.1}
                  min={0.1}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Autonomy */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Autonomy Score</label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.autonomy_score}
                onChange={(e) => updateField("autonomy_score", Number(e.target.value))}
                className="w-full accent-primary mb-2"
              />
              <AutonomyMeter score={form.autonomy_score} />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Tech Stack</label>
              {form.tech_stack.map((t, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={t}
                    onChange={(e) => updateTech(i, e.target.value)}
                    placeholder="e.g. React, Node.js, Stripe"
                    className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {form.tech_stack.length > 1 && (
                    <button onClick={() => removeTech(i)} className="text-destructive hover:text-destructive/80 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addTech} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1">
                <Plus className="h-3 w-3" /> Add tech
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit("draft")}
                disabled={loading || !form.name || !form.description}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-semibold text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" /> Save Draft
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit("published")}
                disabled={loading || !form.name || !form.description}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl gradient-fun py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 transition-shadow"
              >
                <Send className="h-4 w-4" /> Publish 🚀
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ListingForm;

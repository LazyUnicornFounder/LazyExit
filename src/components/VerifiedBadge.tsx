import { BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const VerifiedBadge = ({ label = "Verified MRR" }: { label?: string }) => (
  <motion.span
    whileHover={{ scale: 1.05 }}
    className="inline-flex items-center gap-1 rounded-full bg-verified/15 px-2.5 py-1 text-xs font-bold text-verified border border-verified/20"
  >
    <BadgeCheck className="h-3.5 w-3.5" />
    {label}
  </motion.span>
);

export default VerifiedBadge;

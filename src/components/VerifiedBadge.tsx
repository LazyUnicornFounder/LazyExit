import { BadgeCheck } from "lucide-react";

const VerifiedBadge = ({ label = "Verified MRR" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 px-2.5 py-0.5 text-xs font-semibold text-verified">
    <BadgeCheck className="h-3.5 w-3.5" />
    {label}
  </span>
);

export default VerifiedBadge;

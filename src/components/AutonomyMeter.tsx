import { motion } from "framer-motion";

interface AutonomyMeterProps {
  score: number;
  size?: "sm" | "md";
}

const getEmoji = (score: number) => {
  if (score >= 90) return "🤖";
  if (score >= 75) return "🚀";
  if (score >= 50) return "⚡";
  return "🔧";
};

const getLabel = (score: number) => {
  if (score >= 90) return "Robot Mode";
  if (score >= 75) return "Cruise Control";
  if (score >= 50) return "Semi-Auto";
  return "Needs a Pilot";
};

const getGradient = (score: number) => {
  if (score >= 80) return "from-accent via-accent/80 to-primary";
  if (score >= 50) return "from-verified via-fun-orange to-fun-pink";
  return "from-destructive via-fun-orange to-verified";
};

const AutonomyMeter = ({ score, size = "md" }: AutonomyMeterProps) => {
  const emoji = getEmoji(score);
  const label = getLabel(score);
  const gradient = getGradient(score);
  const barHeight = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Autonomy
        </span>
        <span className="text-sm font-bold font-display flex items-center gap-1">
          <span>{emoji}</span>
          <span className="gradient-text">{score}%</span>
          <span className="text-xs text-muted-foreground ml-1">{label}</span>
        </span>
      </div>
      <div className={`w-full ${barHeight} rounded-full bg-secondary overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
        />
      </div>
    </div>
  );
};

export default AutonomyMeter;

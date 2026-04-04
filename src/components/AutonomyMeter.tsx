import { motion } from "framer-motion";

interface AutonomyMeterProps {
  score: number; // 0-100
  size?: "sm" | "md";
}

const getColor = (score: number) => {
  if (score >= 80) return "hsl(var(--autonomy-high))";
  if (score >= 50) return "hsl(var(--autonomy-mid))";
  return "hsl(var(--autonomy-low))";
};

const getLabel = (score: number) => {
  if (score >= 90) return "Fully Autonomous";
  if (score >= 75) return "Highly Autonomous";
  if (score >= 50) return "Semi-Autonomous";
  return "Operator Required";
};

const AutonomyMeter = ({ score, size = "md" }: AutonomyMeterProps) => {
  const color = getColor(score);
  const label = getLabel(score);
  const barHeight = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Autonomy
        </span>
        <span className="text-xs font-semibold font-display" style={{ color }}>
          {score}% — {label}
        </span>
      </div>
      <div className={`w-full ${barHeight} rounded-full bg-secondary overflow-hidden`}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};

export default AutonomyMeter;

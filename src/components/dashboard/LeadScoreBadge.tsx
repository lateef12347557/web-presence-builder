import { Badge } from "@/components/ui/badge";
import { Flame, Thermometer, Snowflake } from "lucide-react";

interface LeadScoreBadgeProps {
  score: number | null;
  tier?: string | null;
  showScore?: boolean;
}

export const LeadScoreBadge = ({ score, tier, showScore = true }: LeadScoreBadgeProps) => {
  // Determine tier from score if not provided
  const leadTier = tier || (
    score !== null && score >= 70 ? "hot" :
    score !== null && score >= 40 ? "warm" : "cold"
  );

  const tierConfig = {
    hot: {
      icon: Flame,
      label: "Hot",
      className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
    },
    warm: {
      icon: Thermometer,
      label: "Warm",
      className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    },
    cold: {
      icon: Snowflake,
      label: "Cold",
      className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
    },
  };

  const config = tierConfig[leadTier as keyof typeof tierConfig] || tierConfig.cold;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
      {showScore && score !== null && (
        <span className="ml-1 font-mono text-xs opacity-75">({score})</span>
      )}
    </Badge>
  );
};

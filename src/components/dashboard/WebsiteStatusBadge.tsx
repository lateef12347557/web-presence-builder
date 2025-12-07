import { Badge } from "@/components/ui/badge";
import { Globe, AlertTriangle, Clock, XCircle } from "lucide-react";

interface WebsiteStatusBadgeProps {
  status: "none" | "broken" | "outdated" | string;
  hasSSL?: boolean | null;
  isMobileFriendly?: boolean | null;
}

export const WebsiteStatusBadge = ({ 
  status, 
  hasSSL, 
  isMobileFriendly 
}: WebsiteStatusBadgeProps) => {
  const statusConfig = {
    none: {
      icon: XCircle,
      label: "No Website",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    broken: {
      icon: AlertTriangle,
      label: "Broken",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    outdated: {
      icon: Clock,
      label: "Outdated",
      className: "bg-accent/10 text-accent-foreground border-accent/20",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    icon: Globe,
    label: "Has Website",
    className: "bg-success/10 text-success border-success/20",
  };

  const Icon = config.icon;

  // Additional warnings
  const warnings = [];
  if (hasSSL === false) warnings.push("No SSL");
  if (isMobileFriendly === false) warnings.push("Not Mobile-Friendly");

  return (
    <div className="flex flex-col gap-1">
      <Badge variant="outline" className={`gap-1 w-fit ${config.className}`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
      {warnings.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {warnings.map((warning) => (
            <Badge 
              key={warning} 
              variant="outline" 
              className="text-xs bg-muted text-muted-foreground"
            >
              {warning}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

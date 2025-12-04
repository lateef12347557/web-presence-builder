import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, UserPlus, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "email_sent",
    message: "Email sent to Joe's Plumbing Services",
    time: "2 minutes ago",
    icon: Mail,
    iconBg: "bg-primary",
  },
  {
    id: 2,
    type: "lead_added",
    message: "12 new leads discovered in Austin, TX",
    time: "15 minutes ago",
    icon: UserPlus,
    iconBg: "bg-success",
  },
  {
    id: 3,
    type: "response",
    message: "Maria's Mexican Restaurant replied",
    time: "1 hour ago",
    icon: MessageSquare,
    iconBg: "bg-accent",
  },
  {
    id: 4,
    type: "converted",
    message: "Family Dental Care converted to client",
    time: "3 hours ago",
    icon: CheckCircle,
    iconBg: "bg-success",
  },
  {
    id: 5,
    type: "bounce",
    message: "Email bounced for ABC Services",
    time: "5 hours ago",
    icon: XCircle,
    iconBg: "bg-destructive",
  },
];

export function RecentActivity() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div 
              key={activity.id} 
              className={cn(
                "flex items-start gap-4 pb-4",
                i !== activities.length - 1 && "border-b border-border"
              )}
            >
              <div className={cn("p-2 rounded-lg", activity.iconBg)}>
                <activity.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

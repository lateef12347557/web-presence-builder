import { motion } from "framer-motion";
import { 
  Globe, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Users, 
  Bell,
  Database,
  Mail
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Multi-Source Discovery",
    description: "Search Google Places, Yelp, Yellow Pages, and Bing Places simultaneously to find businesses without websites."
  },
  {
    icon: ShieldCheck,
    title: "Legal Compliance",
    description: "CAN-SPAM compliant emails and TCPA-safe phone handling. Automatic unsubscribe management and suppression lists."
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track email opens, clicks, replies, and conversion rates. Daily performance reports and ROI metrics."
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "Automated daily discovery, website validation, email verification, lead scoring, and scheduled outreach."
  },
  {
    icon: Users,
    title: "Lead Qualification",
    description: "AI-powered scoring based on industry type, location, contact availability, and website status."
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Get notified instantly when leads respond, emails bounce, or new high-quality prospects are found."
  },
  {
    icon: Database,
    title: "Data Verification",
    description: "Validate email structure and domain existence. Detect duplicates and flag risky contacts automatically."
  },
  {
    icon: Mail,
    title: "Template Library",
    description: "Industry-specific email templates with personalization. Automated follow-up sequences that convert."
  }
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to
            <span className="text-gradient"> Scale Your Agency</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete platform for discovering, qualifying, and converting businesses that need your web development services.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

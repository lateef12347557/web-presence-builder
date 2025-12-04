import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for freelancers starting out",
    features: [
      "500 leads/month",
      "Basic email templates",
      "Email tracking",
      "1 user",
      "Community support"
    ]
  },
  {
    name: "Professional",
    price: "$149",
    description: "For growing web agencies",
    popular: true,
    features: [
      "5,000 leads/month",
      "Advanced templates",
      "Full analytics suite",
      "5 users",
      "Priority support",
      "API access",
      "Custom branding"
    ]
  },
  {
    name: "Enterprise",
    price: "$399",
    description: "For large-scale operations",
    features: [
      "Unlimited leads",
      "White-label solution",
      "Dedicated account manager",
      "Unlimited users",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantee"
    ]
  }
];

export function Pricing() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your agency. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card 
                variant={plan.popular ? "elevated" : "default"}
                className={`relative h-full ${plan.popular ? 'border-primary shadow-glow' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/dashboard">
                    <Button 
                      variant={plan.popular ? "hero" : "outline"} 
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

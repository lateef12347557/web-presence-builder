import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Mail, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute top-1/4 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4" />
              AI-Powered Lead Generation Platform
            </span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Find Businesses That
            <span className="block text-gradient bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              Need Websites
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Automatically discover, qualify, and reach out to businesses across the USA 
            that don't have websites. Build your client base with compliant, professional outreach.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="group">
                Start Finding Leads
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            {
              icon: Search,
              title: "Smart Discovery",
              description: "AI scans Google Places, Yelp & more to find businesses without websites"
            },
            {
              icon: Mail,
              title: "CAN-SPAM Compliant",
              description: "Professional email outreach with unsubscribe links and suppression lists"
            },
            {
              icon: TrendingUp,
              title: "Lead Scoring",
              description: "Automatically rank leads based on industry, location, and conversion potential"
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            >
              <feature.icon className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">{feature.title}</h3>
              <p className="text-primary-foreground/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

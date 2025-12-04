import { motion } from "framer-motion";

const stats = [
  { value: "50K+", label: "Leads Discovered" },
  { value: "95%", label: "Email Deliverability" },
  { value: "12%", label: "Avg Response Rate" },
  { value: "500+", label: "Happy Agencies" },
];

export function Stats() {
  return (
    <section className="py-20 gradient-hero">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-primary-foreground/60 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

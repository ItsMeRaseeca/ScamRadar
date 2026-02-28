'use client';

import { motion } from "framer-motion";
import { RefreshCw, MessageSquare, Database, SlidersHorizontal } from "lucide-react";

const items = [
  {
    icon: RefreshCw,
    title: "Live Model Retraining",
    description: "Continuous learning from newly reported scams keeps detection models current with evolving fraud tactics.",
  },
  {
    icon: MessageSquare,
    title: "User Feedback Learning",
    description: "Community-verified reports create a feedback loop that improves accuracy over time.",
  },
  {
    icon: Database,
    title: "Social Media Dataset Expansion",
    description: "Expanding training data to cover scams across LinkedIn, Instagram, Facebook, and emerging platforms.",
  },
  {
    icon: SlidersHorizontal,
    title: "Adaptive AI Weighting",
    description: "Dynamic weight adjustment between ML, rules, and AI based on scam type and confidence levels.",
  },
];

const FutureScopeSection = () => {
  return (
    <section className="neo-section border-b-[3px] border-gray-900 bg-white">
      <div className="neo-container">
        <div className="mb-12">
          <div className="neo-label mb-3">Roadmap</div>
          <h2 className="neo-heading-lg text-gray-900">Continuous Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="neo-card-flat p-6"
            >
              <div className="flex items-start gap-4">
                <div className="neo-card-sm p-2 shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2 text-gray-900">{item.title}</h3>
                  <p className="neo-body text-sm">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FutureScopeSection;


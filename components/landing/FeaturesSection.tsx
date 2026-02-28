'use client';

import { motion } from "framer-motion";
import { Zap, Search, Camera, Scale, FileText, Lock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Quick ML Scan",
    description: "Instant pattern-based analysis using trained machine learning models for rapid fraud detection.",
  },
  {
    icon: Search,
    title: "Advanced AI Investigation",
    description: "Deep contextual reasoning powered by Gemini AI for nuanced scam analysis beyond surface-level checks.",
  },
  {
    icon: Camera,
    title: "Screenshot Analysis (OCR)",
    description: "Upload screenshots of suspicious job posts. OCR extracts text for full automated analysis.",
  },
  {
    icon: Scale,
    title: "Risk Arbitration Layer",
    description: "Weighted scoring system combines multiple detection signals into a single confident risk assessment.",
  },
  {
    icon: FileText,
    title: "Structured Fraud Explanation",
    description: "Every analysis includes clear, categorized explanations of detected risks and reasoning.",
  },
  {
    icon: Lock,
    title: "Rate-Limited & Secure",
    description: "Built-in rate limiting and secure API design protects the service from abuse and ensures availability.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="neo-section border-b-[3px] border-gray-900 bg-white">
      <div className="neo-container">
        <div className="mb-12">
          <div className="neo-label mb-3">Capabilities</div>
          <h2 className="neo-heading-lg text-gray-900">Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="neo-card-flat p-6"
            >
              <feature.icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-black text-lg mb-2 text-primary">{feature.title}</h3>
              <p className="neo-body text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;


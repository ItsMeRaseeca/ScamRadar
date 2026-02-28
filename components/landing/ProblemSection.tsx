'use client';

import { motion } from "framer-motion";
import { MessageCircle, DollarSign, Share2 } from "lucide-react";

const problems = [
  {
    icon: MessageCircle,
    title: "Telegram / WhatsApp Hiring",
    description:
      "Scammers bypass legitimate platforms, recruiting directly through messaging apps with fake offers and no accountability.",
  },
  {
    icon: DollarSign,
    title: "Unrealistic Salary Promises",
    description:
      "Fraudulent postings lure victims with inflated compensation, creating urgency to bypass critical thinking.",
  },
  {
    icon: Share2,
    title: "Social Media Recruitment Traps",
    description:
      "Fake recruiters exploit social platforms, impersonating real companies with polished but fabricated profiles.",
  },
];

const ProblemSection = () => {
  return (
    <section className="neo-section bg-gray-100 border-b-[3px] border-gray-900">
      <div className="neo-container">
        <div className="mb-12">
          <div className="neo-label mb-3">The Problem</div>
          <h2 className="neo-heading-lg text-gray-900">The Rise of Modern Recruitment Scams</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="neo-card p-6"
            >
              <problem.icon className="h-6 w-6 text-primary mb-4" />
              <h3 className="neo-heading-md mb-3 text-gray-900">{problem.title}</h3>
              <p className="neo-body text-sm">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;


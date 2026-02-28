'use client';

import { motion } from "framer-motion";
import { Cpu, ListChecks, Brain, Scale } from "lucide-react";

const steps = [
  {
    icon: Cpu,
    step: "01",
    title: "ML Pattern Detection",
    description: "Machine learning models trained on thousands of scam postings identify linguistic and structural fraud patterns.",
  },
  {
    icon: ListChecks,
    step: "02",
    title: "Red Flag Rule Engine",
    description: "Deterministic rules catch known scam indicators: fake domains, suspicious contact methods, and inflated promises.",
  },
  {
    icon: Brain,
    step: "03",
    title: "AI Deep Investigation",
    description: "Gemini AI performs contextual reasoning, analyzing nuance and manipulation tactics beyond pattern matching.",
  },
  {
    icon: Scale,
    step: "04",
    title: "Risk Arbitration System",
    description: "Weighted scoring combines all signals into a final risk assessment with structured explanations.",
  },
];

const SolutionSection = () => {
  return (
    <section id="how-it-works" className="neo-section border-b-[3px] border-gray-900 bg-white">
      <div className="neo-container">
        <div className="mb-12">
          <div className="neo-label mb-3">The Solution</div>
          <h2 className="neo-heading-lg text-gray-900">How ScamRadar Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="neo-card"
            >
              <div className="neo-strip-primary flex items-center gap-2">
                <step.icon className="h-4 w-4" />
                <span>Step {step.step}</span>
              </div>
              <div className="p-5">
                <h3 className="neo-heading-md mb-2 text-gray-900">{step.title}</h3>
                <p className="neo-body text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;


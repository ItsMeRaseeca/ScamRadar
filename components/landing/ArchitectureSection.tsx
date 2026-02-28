'use client';

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const layers = [
  { label: "User Input", sublabel: "Job posting text or screenshot", accent: false },
  { label: "ML Model", sublabel: "Pattern Recognition — 50% weight", accent: true },
  { label: "Rule Engine", sublabel: "Deterministic Red Flags — 20% weight", accent: false },
  { label: "Gemini AI", sublabel: "Deep Contextual Analysis — 30% weight", accent: true },
  { label: "Final Risk Score", sublabel: "Weighted aggregation with explanation", accent: false },
];

const ArchitectureSection = () => {
  return (
    <section id="architecture" className="neo-section bg-gray-100 border-b-[3px] border-gray-900">
      <div className="neo-container">
        <div className="mb-12">
          <div className="neo-label mb-3">Under The Hood</div>
          <h2 className="neo-heading-lg text-gray-900">Hybrid AI Architecture</h2>
        </div>
        <div className="max-w-lg mx-auto space-y-0">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`neo-card-flat p-5 text-center ${
                layer.accent 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-900'
              }`}>
                <div className="font-black text-lg">{layer.label}</div>
                <div className={`text-sm mt-1 ${
                  layer.accent ? 'opacity-80' : 'text-gray-600'
                }`}>
                  {layer.sublabel}
                </div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;


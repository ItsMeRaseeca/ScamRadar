'use client';

import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="bg-primary border-b-[3px] border-gray-900">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="neo-section"
      >
        <div className="neo-container text-center">
          <h2 className="neo-heading-xl text-white mb-6">
            Scan Smarter. Stay Safer.
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-lg mx-auto">
            Protect yourself from recruitment fraud with AI-powered analysis. Free to use, no signup required.
          </p>
          <a href="#analyzer" className="neo-btn-outline bg-white text-primary border-white text-base inline-block">
            Start Free Analysis
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;


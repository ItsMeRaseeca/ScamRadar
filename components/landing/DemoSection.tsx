'use client';

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const DemoSection = () => {
  return (
    <section id="demo" className="neo-section bg-gray-100 border-b-[3px] border-gray-900">
      <div className="neo-container">
        <div className="mb-12 text-center">
          <div className="neo-label mb-3">Live Preview</div>
          <h2 className="neo-heading-lg text-gray-900">See It In Action</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto neo-card"
        >
          {/* Header */}
          <div className="neo-strip-primary">Sample Analysis</div>

          <div className="p-6 space-y-5">
            {/* Fake job text */}
            <div className="neo-card-flat p-4 bg-gray-100">
              <div className="neo-label mb-2">Job Posting Input</div>
              <p className="text-sm italic text-gray-600 leading-relaxed">
                "Urgent Hiring! Work from home, earn $5,000/week. No experience needed.
                Contact us on Telegram @quickjobs2024. Limited spots available — apply now
                before positions fill up!"
              </p>
            </div>

            {/* Risk meter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm">Risk Assessment</span>
                <span className="font-black text-risk-red">89% — Critical Risk</span>
              </div>
              <div className="w-full h-3 border-[3px] border-gray-900 bg-white">
                <motion.div
                  className="h-full bg-risk-red"
                  initial={{ width: 0 }}
                  whileInView={{ width: "89%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Analysis items */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 neo-card-flat">
                <XCircle className="h-4 w-4 text-risk-red mt-0.5 shrink-0" />
                <div>
                  <span className="font-black text-sm">Unrealistic Compensation</span>
                  <p className="text-xs text-gray-600 mt-0.5">$5,000/week with no experience is statistically anomalous</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 neo-card-flat">
                <AlertTriangle className="h-4 w-4 text-risk-yellow mt-0.5 shrink-0" />
                <div>
                  <span className="font-black text-sm">Telegram-Only Contact</span>
                  <p className="text-xs text-gray-600 mt-0.5">Legitimate employers use professional communication channels</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 neo-card-flat">
                <XCircle className="h-4 w-4 text-risk-red mt-0.5 shrink-0" />
                <div>
                  <span className="font-black text-sm">Urgency Manipulation</span>
                  <p className="text-xs text-gray-600 mt-0.5">Pressure tactics detected: "Limited spots", "apply now"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 neo-card-flat">
                <CheckCircle className="h-4 w-4 text-risk-green mt-0.5 shrink-0" />
                <div>
                  <span className="font-black text-sm">AI Confidence</span>
                  <p className="text-xs text-gray-600 mt-0.5">High confidence — all three engines agree on critical risk level</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;


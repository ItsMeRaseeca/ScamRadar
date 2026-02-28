'use client';

import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Brain, FileWarning } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="neo-section border-b-[3px] border-gray-900 bg-white">
      <div className="neo-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="neo-label mb-4">AI-Powered Fraud Detection</div>
          <h1 className="neo-heading-xl mb-6 text-gray-900">
            Stop Job Scams<br />Before They Stop You.
          </h1>
          <p className="neo-body text-lg mb-8 max-w-lg">
            AI-powered hybrid fraud detection combining machine learning, rule-based analysis,
            and advanced AI reasoning to protect job seekers from modern recruitment scams.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#analyzer" className="neo-btn-primary text-base">
              Analyze a Job Posting
            </a>
            <a href="#how-it-works" className="neo-btn-outline text-base">
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Right: Risk Analysis Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="neo-card">
            {/* Header */}
            <div className="neo-strip-primary flex items-center justify-between">
              <span>Risk Analysis Report</span>
              <span className="text-xs opacity-80">ScamRadar v2.0</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Risk Score */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="neo-label mb-1">Overall Risk Score</div>
                  <div className="text-5xl font-black text-risk-red">72%</div>
                </div>
                <div className="neo-card-sm px-3 py-1.5 bg-risk-red/10">
                  <span className="font-black text-sm text-risk-red flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    HIGH RISK
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 border-[3px] border-gray-900 bg-gray-100">
                <div className="h-full bg-risk-red" style={{ width: "72%" }} />
              </div>

              {/* Analysis blocks */}
              <div className="space-y-3 pt-2">
                <div className="neo-card-flat p-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="font-black text-sm mb-0.5">ML Pattern Detection</div>
                      <p className="text-xs text-gray-600">Matches 4 known scam patterns in job description language</p>
                    </div>
                  </div>
                </div>
                <div className="neo-card-flat p-3">
                  <div className="flex items-start gap-2.5">
                    <FileWarning className="h-4 w-4 text-risk-yellow mt-0.5 shrink-0" />
                    <div>
                      <div className="font-black text-sm mb-0.5">Red Flag Engine</div>
                      <p className="text-xs text-gray-600">Unrealistic salary, no company website, Telegram-only contact</p>
                    </div>
                  </div>
                </div>
                <div className="neo-card-flat p-3">
                  <div className="flex items-start gap-2.5">
                    <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="font-black text-sm mb-0.5">AI Deep Analysis</div>
                      <p className="text-xs text-gray-600">Language manipulation tactics detected with high confidence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;


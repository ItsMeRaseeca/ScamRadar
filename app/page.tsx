'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ArchitectureSection from '@/components/landing/ArchitectureSection';
import DemoSection from '@/components/landing/DemoSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';
import AnalyzerForm from '@/components/AnalyzerForm';
import ResultCard from '@/components/ResultCard';
import AIAnalysisSection from '@/components/AIAnalysisSection';
import HistorySidebar from '@/components/HistorySidebar';
import { analyzeJobDeep, analyzeJobBasic } from '@/lib/api';
import { saveScanHistory } from '@/lib/storage';
import type { DeepAnalysisResponse, ScanHistoryItem } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DeepAnalysisResponse | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isDeepLoading, setIsDeepLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<{
    title: string;
    description: string;
    requirements: string;
    company_profile: string;
    salary_range: string;
    employment_type: string;
  } | null>(null);

  const handleAnalyze = async (data: {
    title: string;
    description: string;
    requirements: string;
    company_profile: string;
    salary_range: string;
    employment_type: string;
  }) => {
    setIsLoading(true);
    setResult(null);
    setLastRequest(data);

    try {
      const response = await analyzeJobDeep(data, false);
      setResult(response);

      const preview = data.description.slice(0, 100) || data.title || 'Untitled';
      saveScanHistory({
        preview,
        result: response.final_label,
        timestamp: new Date().toISOString(),
        ml_reasoning: response.ml_reasoning,
        ai_analysis: response.ai_analysis,
      });

      toast.success('DIAGNOSTIC SCAN COMPLETE.');
    } catch (error) {
      console.error('Deep analysis failed, trying basic ML:', error);

      try {
        const basicResponse = await analyzeJobBasic(data);
        const fallbackResult: DeepAnalysisResponse = {
          ml_probability: basicResponse.ml_probability || 0,
          rule_score: 0,
          gemini_risk_level: null,
          final_risk_score: basicResponse.ml_probability || 0,
          final_label: basicResponse.final_label,
          ml_reasoning: basicResponse.reasoning,
          ai_analysis: null,
        };
        setResult(fallbackResult);

        const preview = data.description.slice(0, 100) || data.title || 'Untitled';
        saveScanHistory({
          preview,
          result: fallbackResult.final_label,
          timestamp: new Date().toISOString(),
          ml_reasoning: fallbackResult.ml_reasoning,
          ai_analysis: null,
        });

        toast.success('ML SCAN DONE. AI OFFLINE.');
      } catch (fallbackError) {
        toast.error('TOTAL SYSTEM FAILURE.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    const historyResult: DeepAnalysisResponse = {
      ml_probability: 0,
      rule_score: 0,
      gemini_risk_level: item.ai_analysis?.risk_level || null,
      final_risk_score: 0,
      final_label: item.result,
      ml_reasoning: item.ml_reasoning,
      ai_analysis: item.ai_analysis,
    };
    setResult(historyResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunDeepReview = async () => {
    if (!lastRequest || !result) return;

    setIsDeepLoading(true);
    try {
      const response = await analyzeJobDeep(lastRequest, true);
      setResult(response);

      const preview =
        lastRequest.description.slice(0, 100) ||
        lastRequest.title ||
        'Untitled';
      saveScanHistory({
        preview,
        result: response.final_label,
        timestamp: new Date().toISOString(),
        ml_reasoning: response.ml_reasoning,
        ai_analysis: response.ai_analysis,
      });

      if (response.ai_analysis) {
        toast.success('ADVANCED HEURISTICS CAPTURED.');
      } else {
        toast.error('AI REFUSED TO COMPLY.');
      }
    } catch (error) {
      toast.error('AI CONNECTION SEVERED.');
    } finally {
      setIsDeepLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Landing Page Sections */}
      <Navbar onHistoryClick={() => setHistoryOpen(true)} />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <ArchitectureSection />
      <DemoSection />
      <CTASection />

      {/* Analyzer Section */}
      <section id="analyzer" className="neo-section border-b-[3px] border-gray-900 bg-white scroll-mt-24">
        <div className="neo-container">
          <div className="mb-12">
            <div className="neo-label mb-3">Try It Now</div>
            <h2 className="neo-heading-lg text-gray-900">Analyze a Job Posting</h2>
          </div>
          <AnalyzerForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.section
            id="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="neo-section border-b-[3px] border-gray-900 bg-white"
          >
            <div className="neo-container">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-12">
                <h2 className="neo-heading-lg text-gray-900">Analysis Results</h2>
                <div className="flex-grow h-[3px] bg-gray-900" />
                {result.final_risk_score !== undefined && (
                  <div className="badge-risk bg-gray-900 text-white">
                    Risk Score: {Math.round(result.final_risk_score * 100)}%
                  </div>
                )}
              </div>

              <ResultCard
                label={result.final_label}
                mlReasoning={result.ml_reasoning}
                riskScore={result.final_risk_score}
                hasAIAnalysis={!!result.ai_analysis}
                onRunDeepReview={handleRunDeepReview}
                isDeepLoading={isDeepLoading}
              />

              <AnimatePresence mode="wait">
                {result.ai_analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-12"
                  >
                    <AIAnalysisSection analysis={result.ai_analysis} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!result && !isLoading && (
        <section className="neo-section border-b-[3px] border-gray-900 bg-gray-100">
          <div className="neo-container">
            <div className="border-[3px] border-dashed border-gray-400 p-20 text-center bg-white">
              <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-400">
                Ready to Analyze
              </p>
              <p className="text-sm font-medium text-gray-500 mt-3">
                Paste a job posting above to get started
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <FooterSection />

      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectItem={handleSelectHistoryItem}
      />
    </div>
  );
}

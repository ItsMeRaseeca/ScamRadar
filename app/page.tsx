'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
      // First run: ML-only deep analysis (Gemini optional)
      const response = await analyzeJobDeep(data, false);
      setResult(response);

      // Save to history
      const preview = data.description.slice(0, 100) || data.title || 'Untitled';
      saveScanHistory({
        preview,
        result: response.final_label,
        timestamp: new Date().toISOString(),
        ml_reasoning: response.ml_reasoning,
        ai_analysis: response.ai_analysis,
      });

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);

      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Deep analysis failed, trying basic ML:', error);

      // Fallback to basic ML prediction
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

        // Save to history
        const preview = data.description.slice(0, 100) || data.title || 'Untitled';
        saveScanHistory({
          preview,
          result: fallbackResult.final_label,
          timestamp: new Date().toISOString(),
          ml_reasoning: fallbackResult.ml_reasoning,
          ai_analysis: null,
        });

        toast.success('ML analysis complete (AI analysis unavailable)');

        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      } catch (fallbackError) {
        console.error('Basic analysis also failed:', fallbackError);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to analyze job posting. Please try again.'
        );
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
      final_risk_score: 0, // We could derive this if saved in history, but 0 is safe for now
      final_label: item.result,
      ml_reasoning: item.ml_reasoning,
      ai_analysis: item.ai_analysis,
    };
    setResult(historyResult);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleRunDeepReview = async () => {
    if (!lastRequest || !result) return;

    setIsDeepLoading(true);
    try {
      const response = await analyzeJobDeep(lastRequest, true);
      setResult(response);

      // Update history with AI analysis as a new entry
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
        toast.success('Deep AI investigation complete.');
      } else {
        toast.error(
          'Advanced AI analysis is temporarily unavailable. Showing ML results only.'
        );
      }
    } catch (error) {
      console.error('Deep AI review failed:', error);
      toast.error(
        'Advanced AI analysis is temporarily unavailable. Showing ML results only.'
      );
    } finally {
      setIsDeepLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ScamRadar
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Fake Job Detection
                </p>
              </div>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Open history"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Fake Job Detection
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hybrid ML + Gemini AI analysis for job scam protection. Paste any job
            posting and get instant risk assessment with detailed explanations.
          </p>
        </motion.div>

        {/* Analyzer Form */}
        <div className="mb-12">
          <AnalyzerForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Results Section */}
        {result && (
          <div id="results" className="space-y-6">
            {/* ML Result Card */}
            <ResultCard
              label={result.final_label}
              mlReasoning={result.ml_reasoning}
              riskScore={result.final_risk_score}
              hasAIAnalysis={!!result.ai_analysis}
              onRunDeepReview={handleRunDeepReview}
              isDeepLoading={isDeepLoading}
            />

            {/* AI Analysis Section */}
            {result.ai_analysis ? (
              <AIAnalysisSection analysis={result.ai_analysis} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 p-6 text-center"
              >
                <p className="text-gray-600 dark:text-gray-400">
                  This posting appears structurally sound. No advanced fraud
                  signals were detected by the AI system.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-gray-500 dark:text-gray-400"
          >
            <p className="text-lg">Enter a job posting above to get started.</p>
          </motion.div>
        )}
      </main>

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectItem={handleSelectHistoryItem}
      />

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>ScamRadar - Protecting job seekers from scams</p>
          <p className="text-sm mt-2">
            Powered by ML + Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}


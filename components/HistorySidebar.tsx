'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScanHistory, clearScanHistory } from '@/lib/storage';
import type { ScanHistoryItem } from '@/lib/types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: ScanHistoryItem) => void;
}

export default function HistorySidebar({
  isOpen,
  onClose,
  onSelectItem,
}: HistorySidebarProps) {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getScanHistory());
    }
  }, [isOpen]);

  const handleClear = () => {
    if (confirm('ERASE ALL ARCHIVED DATA?')) {
      clearScanHistory();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' // ' + date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white border-l-2 border-black z-50 overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b-2 border-black bg-white sticky top-0 z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-label mb-1">Investigation Archive</div>
                  <h2 className="title-h2 text-2xl">History Log</h2>
                </div>
                <button
                  onClick={onClose}
                  className="bg-white text-black border-2 border-black p-2 hover:bg-black hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[10px] font-black uppercase tracking-widest text-risk-red border-b-2 border-transparent hover:border-risk-red self-start transition-all"
                >
                  Purge Diagnostic Archive
                </button>
              )}
            </div>

            {/* List */}
            <div className="p-8 space-y-6 flex-grow">
              {history.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm font-black uppercase tracking-widest text-gray-300">No telemetry captured</p>
                </div>
              ) : (
                history.map((item, index) => {
                  const isHighRisk = item.result === 'FAKE' || item.result === 'HIGH_RISK' || item.result === 'CRITICAL_RISK';
                  const isModerateRisk = item.result === 'MODERATE_RISK';

                  const badgeColor = isHighRisk
                    ? 'bg-risk-red text-white'
                    : isModerateRisk
                      ? 'bg-risk-yellow text-black'
                      : 'bg-risk-green text-white';

                  return (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="p-5 border-2 border-black bg-white transition-all group-hover:shadow-brutal group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`badge-risk ${badgeColor}`}>
                            {item.result}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="font-bold text-sm leading-snug text-gray-900 line-clamp-2 uppercase tracking-tight">
                          {item.preview}
                        </p>
                        {item.ai_analysis && (
                          <div className="mt-4 flex items-center gap-2">
                            <div className="text-[9px] font-black uppercase tracking-widest text-primary border-2 border-primary px-2 py-0.5">
                              Deep Analysed
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t-2 border-black/5 bg-gray-50/50">
              <p className="text-[10px] font-medium text-gray-400 leading-relaxed italic">
                Logs are stored locally in the secure browser container. Purging session data will permanently erase results.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}









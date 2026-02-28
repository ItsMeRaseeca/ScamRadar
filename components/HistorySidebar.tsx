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
    setHistory(getScanHistory());
  }, [isOpen]);

  const handleClear = () => {
    if (confirm('Clear all scan history?')) {
      clearScanHistory();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Scan History
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close sidebar"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {history.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No scan history yet.</p>
                  <p className="text-sm mt-2">Your scans will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      item.result === 'FAKE'
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                        : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.result === 'FAKE'
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        {item.result}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {item.preview}
                    </p>
                    {item.ai_analysis && (
                      <span className="inline-block mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                        ✨ AI Analysis Available
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}






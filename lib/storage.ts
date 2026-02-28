import type { ScanHistoryItem } from './types';

const STORAGE_KEY = 'scamradar_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Save a scan result to local storage
 */
export function saveScanHistory(item: Omit<ScanHistoryItem, 'id'>): void {
  try {
    const history = getScanHistory();
    
    const newItem: ScanHistoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    
    // Add to beginning and limit to MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save scan history:', error);
  }
}

/**
 * Retrieve scan history from local storage
 */
export function getScanHistory(): ScanHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as ScanHistoryItem[];
  } catch (error) {
    console.error('Failed to load scan history:', error);
    return [];
  }
}

/**
 * Clear all scan history
 */
export function clearScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear scan history:', error);
  }
}

/**
 * Get a specific scan by ID
 */
export function getScanById(id: string): ScanHistoryItem | null {
  const history = getScanHistory();
  return history.find((item) => item.id === id) || null;
}









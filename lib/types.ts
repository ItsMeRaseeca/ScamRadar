export type FinalLabel = 'FAKE' | 'GENUINE';

export interface PredictRequest {
  title: string;
  description: string;
  requirements: string;
  company_profile: string;
  salary_range: string;
  employment_type: string;
}

export interface PredictResponse {
  final_label: FinalLabel;
  reasoning: string[];
}

export interface AIAnalysis {
  manipulation_signals: string;
  tone_analysis: string;
  company_risk_analysis: string;
  overall_summary: string;
  safety_advice: string;
}

export interface DeepAnalysisResponse {
  final_label: FinalLabel;
  ml_reasoning: string[];
  ai_analysis: AIAnalysis | null;
}

export interface ScanHistoryItem {
  id: string;
  preview: string;
  result: FinalLabel;
  timestamp: string;
  ml_reasoning: string[];
  ai_analysis: AIAnalysis | null;
}

export type ScanMode = 'quick' | 'detailed';





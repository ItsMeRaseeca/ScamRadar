export type FinalLabel = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK' | 'FAKE' | 'GENUINE';

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
  ml_probability: number;
}

export interface AIAnalysis {
  risk_level: string;
  confidence: number;
  manipulation_signals: string;
  tone_analysis: string;
  company_risk_analysis: string;
  overall_summary: string;
  safety_advice: string;
}

export interface DeepAnalysisResponse {
  ml_probability: number;
  rule_score: number;
  gemini_risk_level: string | null;
  final_risk_score: number;
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

export interface ImageAnalysisResponse {
  extracted_text: string;
  analysis: DeepAnalysisResponse;
}









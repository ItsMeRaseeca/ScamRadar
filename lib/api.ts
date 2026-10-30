import axios, { AxiosError } from 'axios';
import type { DeepAnalysisResponse, PredictRequest, PredictResponse } from './types';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

if (typeof window !== 'undefined') {
  console.log('[ScamRadar Client] API Base URL:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds timeout for cold starts / deep AI
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Calls the /deep-analysis endpoint which internally uses ML + Gemini AI
 * This is the primary endpoint for the frontend
 */
export async function analyzeJobDeep(
  data: Partial<PredictRequest>,
  deepReview: boolean = false
): Promise<DeepAnalysisResponse> {
  try {
    const response = await apiClient.post<DeepAnalysisResponse>(
      '/deep-analysis',
      {
        title: data.title || '',
        description: data.description || '',
        requirements: data.requirements || '',
        company_profile: data.company_profile || '',
        salary_range: data.salary_range || '',
        employment_type: data.employment_type || '',
        deep_review: deepReview,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string }>;

      if (axiosError.response) {
        // Server responded with error status
        const message =
          axiosError.response.data?.detail ||
          `Server error: ${axiosError.response.status}`;
        throw new Error(message);
      } else if (axiosError.request) {
        // Request made but no response
        throw new Error(
          'Unable to reach the server. Please check if the backend is running.'
        );
      }
    }
    throw error;
  }
}

/**
 * Calls the /predict endpoint for fast ML scan only (no Gemini AI)
 * Used as a fallback if Gemini is offline
 */
export async function analyzeJobBasic(
  data: Partial<PredictRequest>
): Promise<PredictResponse> {
  try {
    const response = await apiClient.post<PredictResponse>('/predict', {
      title: data.title || '',
      description: data.description || '',
      requirements: data.requirements || '',
      company_profile: data.company_profile || '',
      salary_range: data.salary_range || '',
      employment_type: data.employment_type || '',
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string }>;

      if (axiosError.response) {
        const message =
          axiosError.response.data?.detail ||
          `Server error: ${axiosError.response.status}`;
        throw new Error(message);
      } else if (axiosError.request) {
        throw new Error(
          'Unable to reach the server. Please check if the backend is running.'
        );
      }
    }
    throw error;
  }
}

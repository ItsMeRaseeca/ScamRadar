import axios, { AxiosError } from 'axios';
import type { DeepAnalysisResponse, PredictRequest, PredictResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
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

    // Unknown error
    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

/**
 * Fallback endpoint - calls basic ML prediction only
 * Used if deep-analysis fails
 */
export async function analyzeJobBasic(
  data: Partial<PredictRequest>
): Promise<PredictResponse> {
  try {
    const response = await apiClient.post('/predict', {
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

    throw new Error(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}


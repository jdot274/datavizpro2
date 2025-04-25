/**
 * Enhanced Data Service
 * 
 * Provides advanced data processing and analysis capabilities
 * by connecting to Python-based backend services.
 */

import { toast } from 'sonner';

/**
 * Type definition for statistical analysis result
 */
export interface StatisticalAnalysisResult {
  success: boolean;
  error?: string;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  variance?: number;
  skew?: number;
  kurtosis?: number;
  percentiles?: Record<string, number>;
  [key: string]: any;
}

/**
 * Type definition for trend analysis result
 */
export interface TrendAnalysisResult {
  success: boolean;
  error?: string;
  stats?: {
    trend: string;
    slope: number;
    intercept: number;
    r_squared: number;
    p_value: number;
  };
  fitted_curves?: {
    linear?: number[][];
    exponential?: number[][];
    polynomial?: number[][];
    lowess?: number[][];
  };
  original_data?: {
    x: number[];
    y: number[];
  };
}

/**
 * Type definition for surface data generation result
 */
export interface SurfaceGenerationResult {
  success: boolean;
  data?: number[][];
  error?: string;
  dimensions?: {
    xRange: [number, number];
    yRange: [number, number];
    zRange: [number, number];
  };
  metadata?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
    zLabel?: string;
  };
}

/**
 * Type definition for heatmap data generation result
 */
export interface HeatmapGenerationResult {
  success: boolean;
  data?: number[][];
  error?: string;
  dimensions?: {
    xRange: [number, number];
    yRange: [number, number];
    zRange: [number, number];
  };
  metadata?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
  };
}

/**
 * Enhanced Data Service class
 */
class EnhancedDataService {
  /**
   * Base URL for enhanced data service API
   */
  private baseUrl = '/api/enhanced';

  /**
   * Perform statistical analysis on data
   */
  async performStatisticalAnalysis(data: number[][]): Promise<StatisticalAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to perform statistical analysis');
      }
      
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error performing statistical analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Perform trend analysis on data (requires x,y pairs)
   */
  async performTrendAnalysis(data: [number, number][]): Promise<TrendAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/trend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to perform trend analysis');
      }
      
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error performing trend analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate enhanced surface plot data with interpolation
   */
  async generateSurfacePlotData(data: number[][]): Promise<SurfaceGenerationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/surface`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate surface data');
      }
      
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error generating surface data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate enhanced heatmap data
   */
  async generateHeatmapData(data: number[][]): Promise<HeatmapGenerationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/heatmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate heatmap data');
      }
      
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process Excel file with enhanced analytics
   */
  async processExcelFile(file: File): Promise<SurfaceGenerationResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.baseUrl}/excel`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process Excel file');
      }
      
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error('Error processing Excel file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const enhancedDataService = new EnhancedDataService();
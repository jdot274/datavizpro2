/**
 * Type definitions for the server
 */

// Excel parsing result
export interface ExcelParseResult {
  success: boolean;
  data?: number[][] | null;
  headers?: string[];
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

// Python execution result
export interface PythonResult {
  success: boolean;
  data?: number[][] | null;
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

// Formula evaluation result
export interface FormulaResult {
  success: boolean;
  data?: number[][] | null;
  error?: string;
  dimensions?: {
    xRange: [number, number];
    yRange: [number, number];
    zRange: [number, number];
  };
}
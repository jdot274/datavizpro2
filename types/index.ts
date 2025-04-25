// Source data types
export type DataSource = "formula" | "excel" | "python" | "image" | "sample" | "none";

// Visualization types
export type VisualizationType = "surface" | "scatter" | "line" | "bar" | "heatmap";

// Shader types
export type ShaderType = "basic" | "wave" | "gradient" | "none";

// Visualization settings
export interface VisualizationSettings {
  type: VisualizationType;
  showGrid?: boolean;
  showAxis?: boolean;
  showLabels?: boolean;
  source?: DataSource;
  useAnimation?: boolean;
  rotationSpeed?: number;
  wireframe?: boolean;
  useCustomColors?: boolean;
  colorMap?: string;
  opacity?: number;
}

// Visualization props for 3D components
export interface VisualizationProps {
  data: number[][] | null;
  dimensions?: {
    xRange: [number, number];
    yRange: [number, number];
    zRange: [number, number];
  };
  settings: VisualizationSettings;
  shaderRef?: any;
}

// Data structure for visualization
export interface VisualizationData {
  type: VisualizationType;
  source: DataSource;
  data: number[][] | number[] | null;
  dimensions: {
    xRange: [number, number];
    yRange: [number, number];
    zRange: [number, number];
  };
  metadata?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
    zLabel?: string;
    formula?: string;
  };
}

// Formula input
export interface FormulaInput {
  expression: string;
  variables: {
    x: { min: number; max: number; steps: number };
    y: { min: number; max: number; steps: number };
  };
}

// Shader parameters
export interface ShaderParams {
  type: ShaderType;
  params: {
    scale?: number;
    speed?: number;
    intensity?: number;
    color1?: string;
    color2?: string;
    displacementScale?: number;
    noiseScale?: number;
  };
}

// Camera settings
export interface CameraSettings {
  position: [number, number, number];
  rotation: [number, number, number];
  fov: number;
}

// Visualization state
export interface VisualizationState {
  data: VisualizationData;
  shader: ShaderParams;
  camera: CameraSettings;
  isLoading: boolean;
  error: string | null;
}

// Python code execution result
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

// Excel data parsing result
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

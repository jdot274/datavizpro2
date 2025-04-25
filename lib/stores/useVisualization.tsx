import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  VisualizationState, 
  VisualizationData, 
  ShaderParams, 
  CameraSettings,
  FormulaInput,
  PythonResult,
  ExcelParseResult,
  VisualizationType
} from "../../types";
import { apiRequest } from "../queryClient";
import { evaluateFormula } from "../parsers/mathParser";
import { ShaderPreset, getPresetById } from "../shaders/ShaderPresets";

const DEFAULT_VISUALIZATION_DATA: VisualizationData = {
  type: "surface",
  source: "none",
  data: null,
  dimensions: {
    xRange: [-5, 5],
    yRange: [-5, 5],
    zRange: [-5, 5],
  },
  metadata: {
    title: "No Data",
    xLabel: "X",
    yLabel: "Y",
    zLabel: "Z",
  }
};

const DEFAULT_SHADER_PARAMS: ShaderParams = {
  type: "basic",
  params: {
    scale: 1.0,
    intensity: 1.0,
    color1: "#1a2f8a",
    color2: "#00bfff",
  }
};

const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  position: [5, 5, 5],
  rotation: [0, 0, 0],
  fov: 75
};

interface VisualizationStore extends VisualizationState {
  // Data actions
  setData: (data: VisualizationData) => void;
  clearData: () => void;
  
  // Formula actions
  processFormula: (input: FormulaInput) => Promise<void>;
  
  // File processing
  processPythonCode: (code: string) => Promise<void>;
  processExcelFile: (file: File, sheetName?: string) => Promise<void>;
  
  // Visualization settings
  setVisualizationType: (type: VisualizationType) => void;
  
  // Shader actions
  setShader: (shader: ShaderParams) => void;
  updateShaderParam: (param: string, value: any) => void;
  applyShaderPreset: (presetId: string) => void;
  applyShaderPresetObject: (preset: ShaderPreset) => void;
  
  // Camera actions
  setCameraSettings: (camera: CameraSettings) => void;
  updateCameraPosition: (position: [number, number, number]) => void;
  resetCamera: () => void;
}

export const useVisualization = create<VisualizationStore>()(
  subscribeWithSelector((set, get) => ({
    data: DEFAULT_VISUALIZATION_DATA,
    shader: DEFAULT_SHADER_PARAMS,
    camera: DEFAULT_CAMERA_SETTINGS,
    isLoading: false,
    error: null,

    // Data actions
    setData: (data) => set({ data }),
    clearData: () => set({ 
      data: DEFAULT_VISUALIZATION_DATA,
      error: null
    }),

    // Formula actions
    processFormula: async (input) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await evaluateFormula(input);
        
        if (result.success && result.data) {
          set({
            data: {
              type: "surface",
              source: "formula",
              data: result.data,
              dimensions: result.dimensions || DEFAULT_VISUALIZATION_DATA.dimensions,
              metadata: {
                title: "Formula Visualization",
                xLabel: "X",
                yLabel: "Y",
                zLabel: "Z",
                formula: input.expression
              }
            },
            isLoading: false
          });
        } else {
          set({ 
            error: result.error || "Failed to process formula", 
            isLoading: false 
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Unknown error processing formula", 
          isLoading: false 
        });
      }
    },

    // Python processing
    processPythonCode: async (code) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await apiRequest("POST", "/api/python/execute", { code });
        const result: PythonResult = await response.json();
        
        if (result.success && result.data) {
          set({
            data: {
              type: "surface",
              source: "python",
              data: result.data,
              dimensions: result.dimensions || DEFAULT_VISUALIZATION_DATA.dimensions,
              metadata: result.metadata || {
                title: "Python Data Visualization",
                xLabel: "X",
                yLabel: "Y",
                zLabel: "Z"
              }
            },
            isLoading: false
          });
        } else {
          set({ 
            error: result.error || "Failed to process Python code", 
            isLoading: false 
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Unknown error processing Python code", 
          isLoading: false 
        });
      }
    },

    // Excel processing
    processExcelFile: async (file, sheetName) => {
      set({ isLoading: true, error: null });
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        // Add sheet name to the form data if provided
        if (sheetName) {
          formData.append("sheet", sheetName);
        }
        
        const response = await fetch("/api/excel/parse", {
          method: "POST",
          body: formData,
        });
        
        const result: ExcelParseResult = await response.json();
        
        if (result.success && result.data) {
          set({
            data: {
              type: "surface",
              source: "excel",
              data: result.data,
              dimensions: result.dimensions || DEFAULT_VISUALIZATION_DATA.dimensions,
              metadata: result.metadata || {
                title: file.name,
                xLabel: result.headers?.[0] || "X",
                yLabel: result.headers?.[1] || "Y",
                zLabel: result.headers?.[2] || "Z"
              }
            },
            isLoading: false
          });
        } else {
          set({ 
            error: result.error || "Failed to parse Excel file", 
            isLoading: false 
          });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Unknown error processing Excel file", 
          isLoading: false 
        });
      }
    },

    // Visualization type
    setVisualizationType: (type) => {
      const { data } = get();
      set({ 
        data: {
          ...data,
          type
        } 
      });
    },

    // Shader actions
    setShader: (shader) => set({ shader }),
    updateShaderParam: (param, value) => {
      const { shader } = get();
      set({
        shader: {
          ...shader,
          params: {
            ...shader.params,
            [param]: value
          }
        }
      });
    },
    applyShaderPreset: (presetId) => {
      const preset = getPresetById(presetId);
      if (preset) {
        set({ 
          shader: preset.shader,
          error: null
        });
      } else {
        console.warn(`Shader preset with ID "${presetId}" not found`);
      }
    },
    applyShaderPresetObject: (preset) => {
      if (preset && preset.shader) {
        set({ 
          shader: preset.shader,
          error: null
        });
      } else {
        console.warn("Invalid shader preset object provided");
      }
    },

    // Camera actions
    setCameraSettings: (camera) => set({ camera }),
    updateCameraPosition: (position) => {
      const { camera } = get();
      set({
        camera: {
          ...camera,
          position
        }
      });
    },
    resetCamera: () => set({ camera: DEFAULT_CAMERA_SETTINGS })
  }))
);

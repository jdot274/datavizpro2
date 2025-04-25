import { ShaderParams, ShaderType } from "@/types";
import { MathUtils } from "three";

/**
 * A shader preset represents a complete configuration for a shader
 * including all parameters and meta information for UI display
 */
export interface ShaderPreset {
  id: string;
  name: string;
  description: string;
  category: 'simple' | 'animated' | 'data-driven' | 'artistic' | 'experimental';
  shader: ShaderParams;
  thumbnail?: string; // Path to thumbnail image
  tags: string[];
  author?: string;
}

/**
 * Collection of shader presets with different visual styles
 */
export const shaderPresets: ShaderPreset[] = [
  // Simple presets
  {
    id: 'default',
    name: 'Default',
    description: 'Basic shader with a blue to cyan gradient',
    category: 'simple',
    shader: {
      type: 'basic',
      params: {
        scale: 1.0,
        intensity: 1.0,
        color1: '#1a2f8a',
        color2: '#00bfff',
      }
    },
    tags: ['basic', 'blue', 'gradient', 'simple']
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm sunset gradient from orange to pink',
    category: 'simple',
    shader: {
      type: 'gradient',
      params: {
        scale: 1.0,
        intensity: 1.2,
        color1: '#ff7e5f',
        color2: '#feb47b',
      }
    },
    tags: ['warm', 'orange', 'gradient', 'sunset']
  },
  {
    id: 'heatmap',
    name: 'Heat Map',
    description: 'Thermal color mapping from blue (cold) to red (hot)',
    category: 'data-driven',
    shader: {
      type: 'gradient',
      params: {
        scale: 1.0,
        intensity: 1.3,
        color1: '#0000ff',
        color2: '#ff0000',
      }
    },
    tags: ['heat', 'thermal', 'data', 'analysis']
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    description: 'Animated wave pattern with blue tones',
    category: 'animated',
    shader: {
      type: 'wave',
      params: {
        scale: 1.0,
        speed: 0.8,
        intensity: 1.0,
        color1: '#0077be',
        color2: '#4ac7e9',
        displacementScale: 0.8
      }
    },
    tags: ['water', 'ocean', 'animated', 'waves']
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Vibrant neon colors with glow effect',
    category: 'artistic',
    shader: {
      type: 'gradient',
      params: {
        scale: 1.0,
        intensity: 1.5,
        color1: '#ff00ff',
        color2: '#00ffff',
      }
    },
    tags: ['neon', 'glow', 'vibrant', 'artistic']
  },
  {
    id: 'terrain',
    name: 'Terrain Map',
    description: 'Earth-like terrain coloring from green to brown',
    category: 'data-driven',
    shader: {
      type: 'gradient',
      params: {
        scale: 1.0,
        intensity: 1.0,
        color1: '#2e7d32',
        color2: '#8d6e63',
      }
    },
    tags: ['terrain', 'earth', 'geographic', 'natural']
  },
  {
    id: 'galaxy',
    name: 'Galaxy Swirl',
    description: 'Space-inspired swirling pattern with star colors',
    category: 'animated',
    shader: {
      type: 'wave',
      params: {
        scale: 1.2,
        speed: 0.5,
        intensity: 1.2,
        color1: '#000033',
        color2: '#9370DB',
        displacementScale: 1.0,
        noiseScale: 2.0
      }
    },
    tags: ['space', 'galaxy', 'stars', 'cosmic']
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    description: 'Clean wireframe visualization with edge highlighting',
    category: 'simple',
    shader: {
      type: 'basic',
      params: {
        scale: 1.0,
        intensity: 0.8,
        color1: '#ffffff',
        color2: '#cccccc',
      }
    },
    tags: ['wireframe', 'simple', 'clean', 'technical']
  },
  {
    id: 'rainbow',
    name: 'Rainbow Spectrum',
    description: 'Full spectrum rainbow coloring across the surface',
    category: 'artistic',
    shader: {
      type: 'gradient',
      params: {
        scale: 1.0,
        intensity: 1.4,
        color1: '#ff0000',
        color2: '#00ff00',
      }
    },
    tags: ['rainbow', 'colorful', 'spectrum', 'vibrant']
  },
  {
    id: 'electric',
    name: 'Electric Pulse',
    description: 'Pulsing electric blue wave patterns',
    category: 'animated',
    shader: {
      type: 'wave',
      params: {
        scale: 1.0,
        speed: 1.2,
        intensity: 1.3,
        color1: '#0000ff',
        color2: '#00ffff',
        displacementScale: 1.2
      }
    },
    tags: ['electric', 'pulse', 'animated', 'high-energy']
  },
  {
    id: 'topographic',
    name: 'Topographic',
    description: 'Topographic map style with contour lines',
    category: 'data-driven',
    shader: {
      type: 'basic',
      params: {
        scale: 1.0,
        intensity: 0.9,
        color1: '#e8f5e9',
        color2: '#2e7d32',
      }
    },
    tags: ['map', 'contour', 'topographic', 'geographic']
  },
  {
    id: 'experimental-noise',
    name: 'Noise Field',
    description: 'Experimental noise-based visualization',
    category: 'experimental',
    shader: {
      type: 'wave',
      params: {
        scale: 1.5,
        speed: 0.3,
        intensity: 1.1,
        color1: '#111111',
        color2: '#666666',
        noiseScale: 3.0
      }
    },
    tags: ['noise', 'experimental', 'abstract', 'generative']
  }
];

/**
 * Find a shader preset by its ID
 */
export function getPresetById(id: string): ShaderPreset | undefined {
  return shaderPresets.find(preset => preset.id === id);
}

/**
 * Group shader presets by category
 */
export function getPresetsByCategory() {
  return shaderPresets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, ShaderPreset[]>);
}

/**
 * Search shader presets by name, description or tags
 */
export function searchPresets(query: string): ShaderPreset[] {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return shaderPresets;
  
  return shaderPresets.filter(preset => 
    preset.name.toLowerCase().includes(queryLower) ||
    preset.description.toLowerCase().includes(queryLower) ||
    preset.tags.some(tag => tag.toLowerCase().includes(queryLower))
  );
}

/**
 * Get a random shader preset
 * Useful for demos and testing
 */
export function getRandomPreset(): ShaderPreset {
  const index = MathUtils.randInt(0, shaderPresets.length - 1);
  return shaderPresets[index];
}
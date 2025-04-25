import { FormulaInput } from "@/types";

/**
 * Template interface for mathematical formula templates
 */
export interface FormulaTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'trig' | 'complex' | 'statistical' | 'physics';
  thumbnail?: string;
  formula: FormulaInput;
  tags: string[];
}

/**
 * Library of formula templates for common mathematical visualizations
 */
export const formulaTemplates: FormulaTemplate[] = [
  // Basic Functions
  {
    id: 'basic-plane',
    name: 'Simple Plane',
    description: 'A flat plane extending in the x and y directions',
    category: 'basic',
    formula: {
      expression: 'x + y',
      variables: {
        x: { min: -5, max: 5, steps: 50 },
        y: { min: -5, max: 5, steps: 50 }
      }
    },
    tags: ['basic', 'plane', 'linear']
  },
  {
    id: 'basic-parabola',
    name: 'Parabola',
    description: 'Parabolic surface showing a simple quadratic function',
    category: 'basic',
    formula: {
      expression: 'x^2 + y^2',
      variables: {
        x: { min: -5, max: 5, steps: 50 },
        y: { min: -5, max: 5, steps: 50 }
      }
    },
    tags: ['basic', 'parabola', 'quadratic']
  },
  {
    id: 'basic-cubic',
    name: 'Cubic Function',
    description: 'Surface showing a cubic function',
    category: 'basic',
    formula: {
      expression: 'x^3 - y^3',
      variables: {
        x: { min: -3, max: 3, steps: 50 },
        y: { min: -3, max: 3, steps: 50 }
      }
    },
    tags: ['basic', 'cubic', 'polynomial']
  },
  {
    id: 'basic-hyperbolic',
    name: 'Hyperbolic Paraboloid',
    description: 'Saddle-shaped surface (hyperbolic paraboloid)',
    category: 'basic',
    formula: {
      expression: 'x^2 - y^2',
      variables: {
        x: { min: -3, max: 3, steps: 50 },
        y: { min: -3, max: 3, steps: 50 }
      }
    },
    tags: ['basic', 'hyperbolic', 'saddle']
  },

  // Trigonometric Functions
  {
    id: 'trig-sine-wave',
    name: 'Sine Wave',
    description: 'Classic sine wave surface',
    category: 'trig',
    formula: {
      expression: 'sin(x) * cos(y)',
      variables: {
        x: { min: -3 * Math.PI, max: 3 * Math.PI, steps: 50 },
        y: { min: -3 * Math.PI, max: 3 * Math.PI, steps: 50 }
      }
    },
    tags: ['trigonometric', 'sine', 'wave', 'periodic']
  },
  {
    id: 'trig-ripple',
    name: 'Ripple Effect',
    description: 'Circular ripple effect using cosine of distance',
    category: 'trig',
    formula: {
      expression: 'cos(sqrt(x^2 + y^2))',
      variables: {
        x: { min: -5, max: 5, steps: 50 },
        y: { min: -5, max: 5, steps: 50 }
      }
    },
    tags: ['trigonometric', 'ripple', 'wave', 'circular']
  },
  {
    id: 'trig-sin-product',
    name: 'Sine Product',
    description: 'Product of sine functions creating a grid pattern',
    category: 'trig',
    formula: {
      expression: 'sin(x) * sin(y)',
      variables: {
        x: { min: -3 * Math.PI, max: 3 * Math.PI, steps: 50 },
        y: { min: -3 * Math.PI, max: 3 * Math.PI, steps: 50 }
      }
    },
    tags: ['trigonometric', 'sine', 'product', 'grid']
  },
  {
    id: 'trig-damped-wave',
    name: 'Damped Wave',
    description: 'Damped sine wave that decreases in amplitude with distance',
    category: 'trig',
    formula: {
      expression: 'sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.5)',
      variables: {
        x: { min: -10, max: 10, steps: 50 },
        y: { min: -10, max: 10, steps: 50 }
      }
    },
    tags: ['trigonometric', 'damped', 'wave', 'decay']
  },

  // Complex Mathematical Surfaces
  {
    id: 'complex-sinc',
    name: 'Sinc Function (3D)',
    description: 'The 3D sinc function used in signal processing and optics',
    category: 'complex',
    formula: {
      expression: 'sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.1)',
      variables: {
        x: { min: -15, max: 15, steps: 75 },
        y: { min: -15, max: 15, steps: 75 }
      }
    },
    tags: ['complex', 'sinc', 'signal processing']
  },
  {
    id: 'complex-sombrero',
    name: 'Sombrero Function',
    description: 'A sombrero-shaped function using Bessel approximation',
    category: 'complex',
    formula: {
      expression: 'cos(sqrt(x^2 + y^2)) * exp(-0.1 * (x^2 + y^2))',
      variables: {
        x: { min: -10, max: 10, steps: 75 },
        y: { min: -10, max: 10, steps: 75 }
      }
    },
    tags: ['complex', 'sombrero', 'bessel']
  },
  {
    id: 'complex-peaks',
    name: 'Multi-peak Surface',
    description: 'Surface with multiple peaks resembling a mountain range',
    category: 'complex',
    formula: {
      expression: '3 * (1-x)^2 * exp(-x^2 - (y+1)^2) - 10 * (x/5 - x^3 - y^5) * exp(-x^2-y^2) - 1/3 * exp(-(x+1)^2 - y^2)',
      variables: {
        x: { min: -3, max: 3, steps: 50 },
        y: { min: -3, max: 3, steps: 50 }
      }
    },
    tags: ['complex', 'peaks', 'matlab']
  },
  {
    id: 'complex-wave-interference',
    name: 'Wave Interference',
    description: 'Simulation of two interfering circular waves',
    category: 'complex',
    formula: {
      expression: 'sin(3 * sqrt((x-2)^2 + y^2)) + sin(3 * sqrt((x+2)^2 + y^2))',
      variables: {
        x: { min: -6, max: 6, steps: 75 },
        y: { min: -6, max: 6, steps: 75 }
      }
    },
    tags: ['complex', 'wave', 'interference', 'physics']
  },
  
  // Physics & Natural Phenomena
  {
    id: 'physics-droplet',
    name: 'Water Droplet',
    description: 'Simulation of a water droplet impact',
    category: 'physics',
    formula: {
      expression: 'exp(-0.5 * (x^2 + y^2)) * cos(5 * sqrt(x^2 + y^2))',
      variables: {
        x: { min: -3, max: 3, steps: 60 },
        y: { min: -3, max: 3, steps: 60 }
      }
    },
    tags: ['physics', 'water', 'droplet', 'wave']
  },
  {
    id: 'physics-potential',
    name: 'Electric Potential',
    description: 'Electric potential field between two charges',
    category: 'physics',
    formula: {
      expression: '1/sqrt((x-2)^2 + y^2 + 0.5) - 1/sqrt((x+2)^2 + y^2 + 0.5)',
      variables: {
        x: { min: -4, max: 4, steps: 60 },
        y: { min: -4, max: 4, steps: 60 }
      }
    },
    tags: ['physics', 'electric', 'potential', 'field']
  },
  {
    id: 'physics-gravitational',
    name: 'Gravitational Well',
    description: 'Representation of a gravitational potential well',
    category: 'physics',
    formula: {
      expression: '-1 / sqrt(x^2 + y^2 + 0.5)',
      variables: {
        x: { min: -3, max: 3, steps: 60 },
        y: { min: -3, max: 3, steps: 60 }
      }
    },
    tags: ['physics', 'gravity', 'potential', 'well']
  },
  
  // Statistical & Data-oriented
  {
    id: 'statistical-gaussian',
    name: 'Gaussian Distribution (2D)',
    description: 'Two-dimensional normal distribution (bell curve)',
    category: 'statistical',
    formula: {
      expression: 'exp(-(x^2 + y^2) / 2) / (2 * PI)',
      variables: {
        x: { min: -3, max: 3, steps: 50 },
        y: { min: -3, max: 3, steps: 50 }
      }
    },
    tags: ['statistical', 'gaussian', 'normal', 'bell curve']
  },
  {
    id: 'statistical-bimodal',
    name: 'Bimodal Distribution',
    description: 'Distribution with two peaks (bimodal)',
    category: 'statistical',
    formula: {
      expression: 'exp(-((x-1.5)^2 + y^2) / 2) / 4 + exp(-((x+1.5)^2 + y^2) / 2) / 4',
      variables: {
        x: { min: -4, max: 4, steps: 50 },
        y: { min: -4, max: 4, steps: 50 }
      }
    },
    tags: ['statistical', 'bimodal', 'distribution']
  },
  {
    id: 'statistical-correlation',
    name: 'Correlated Variables',
    description: 'Gaussian distribution with correlated variables',
    category: 'statistical',
    formula: {
      expression: 'exp(-((x^2) - (x*y) + (y^2)))',
      variables: {
        x: { min: -2, max: 2, steps: 50 },
        y: { min: -2, max: 2, steps: 50 }
      }
    },
    tags: ['statistical', 'correlation', 'covariance', 'multivariate']
  }
];

/**
 * Find a formula template by its ID
 */
export function getFormulaById(id: string): FormulaTemplate | undefined {
  return formulaTemplates.find(template => template.id === id);
}

/**
 * Group formula templates by category
 */
export function getFormulasByCategory() {
  return formulaTemplates.reduce<Record<string, FormulaTemplate[]>>((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});
}

/**
 * Search formula templates by name, description or tags
 */
export function searchFormulas(query: string): FormulaTemplate[] {
  if (!query) return formulaTemplates;
  
  const lowercaseQuery = query.toLowerCase();
  return formulaTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
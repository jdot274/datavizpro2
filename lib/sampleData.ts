/**
 * Sample data for visualizations
 * This file contains pre-defined data sets for demos and testing
 */

import { DataSource, VisualizationData, VisualizationType } from '@/types';

// Helper functions to generate sample data

/**
 * Generate a sine wave surface 
 */
export function generateSineWaveData(width: number, height: number): number[][] {
  const data: number[][] = [];
  
  for (let x = 0; x < width; x++) {
    const row: number[] = [];
    for (let y = 0; y < height; y++) {
      // Convert to range -5 to 5
      const xPos = (x / (width - 1)) * 10 - 5;
      const yPos = (y / (height - 1)) * 10 - 5;
      
      // Calculate distance from origin
      const distance = Math.sqrt(xPos * xPos + yPos * yPos);
      
      // Sine wave that decreases with distance
      const value = Math.sin(distance) / (1 + distance * 0.4);
      
      row.push(value);
    }
    data.push(row);
  }
  
  return data;
}

/**
 * Generate financial bar chart data
 */
export function generateBarData(count: number): number[][] {
  const data: number[][] = [];
  
  // Start with a base value
  let value = 100;
  
  for (let i = 0; i < count; i++) {
    // Random fluctuation between -15% and +20%
    const change = value * (Math.random() * 0.35 - 0.15);
    value += change;
    
    // Ensure value stays positive
    value = Math.max(20, value);
    
    // Add point [x, y, z] for 3D visualization
    // Use z value to enhance 3D effect (based on the value)
    data.push([i, value, value * 0.5]);
  }
  
  return data;
}

/**
 * Generate 3D scatter plot data
 */
export function generateScatterData(count: number): number[][] {
  const data: number[][] = [];
  
  for (let i = 0; i < count; i++) {
    // Random values between -5 and 5
    const x = Math.random() * 10 - 5;
    const y = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;
    
    data.push([x, y, z]);
  }
  
  return data;
}

// Create the actual sample data

/**
 * Sine wave surface sample
 */
export const sampleSineWaveSurface = {
  data: generateSineWaveData(20, 20),
  dimensions: {
    xRange: [-5, 5],
    yRange: [-5, 5],
    zRange: [-1, 1]
  },
  metadata: {
    title: 'Sine Wave Surface',
    xLabel: 'X Axis',
    yLabel: 'Y Axis',
    zLabel: 'Z Value',
    formula: 'sin(√(x²+y²))'
  }
};

/**
 * Financial data sample
 */
export const sampleFinancialData = {
  data: generateBarData(20),
  dimensions: {
    xRange: [0, 19],
    yRange: [0, 200],
    zRange: [0, 100]  // Updated Z range for 3D visualization
  },
  metadata: {
    title: 'Financial Performance',
    xLabel: 'Month',
    yLabel: 'Revenue',
    zLabel: 'Value'
  }
};

/**
 * Scatter data sample
 */
export const sampleScatterData = {
  data: generateScatterData(100),
  dimensions: {
    xRange: [-5, 5],
    yRange: [-5, 5],
    zRange: [-5, 5]
  },
  metadata: {
    title: '3D Scatter Plot',
    xLabel: 'X Value',
    yLabel: 'Y Value',
    zLabel: 'Z Value'
  }
};

/**
 * Sample data sets for the application
 * Used by SampleDataButton and other components
 */
export const sampleDataSets = [
  {
    id: 'sineWaveSurface',
    name: 'Sine Wave Surface',
    description: 'A 3D sine wave surface visualization',
    type: 'surface' as VisualizationType,
    source: 'sample' as DataSource,
    data: sampleSineWaveSurface.data,
    dimensions: sampleSineWaveSurface.dimensions,
    metadata: sampleSineWaveSurface.metadata
  },
  {
    id: 'financialData',
    name: 'Financial Bar Chart',
    description: 'Financial performance data as a bar chart',
    type: 'bar' as VisualizationType,
    source: 'sample' as DataSource,
    data: sampleFinancialData.data,
    dimensions: sampleFinancialData.dimensions,
    metadata: sampleFinancialData.metadata
  },
  {
    id: 'scatterData',
    name: '3D Scatter Plot',
    description: 'Randomly distributed points in 3D space',
    type: 'scatter' as VisualizationType,
    source: 'sample' as DataSource,
    data: sampleScatterData.data,
    dimensions: sampleScatterData.dimensions,
    metadata: sampleScatterData.metadata
  }
];
/**
 * Utilities for transforming visualization data between 2D and 3D formats
 */
import { VisualizationData } from '@/types';

/**
 * Transform visualization data from one type to another
 * This is particularly useful for converting 2D visualizations to 3D
 */
export function transformVisualizationData(
  sourceData: VisualizationData,
  targetType: 'surface' | 'scatter' | 'bar' | 'line' | 'heatmap'
): VisualizationData {
  // If target type is the same as source type, return the original data
  if (sourceData.type === targetType) {
    return sourceData;
  }

  console.log(`Transforming visualization from ${sourceData.type} to ${targetType}`);

  // Create a new data object to return (preserving the original)
  const newData: VisualizationData = {
    ...sourceData,
    type: targetType,
    // We'll update these values as needed
    data: sourceData.data,
    dimensions: { ...sourceData.dimensions },
    metadata: { ...sourceData.metadata }
  };

  // Handle different source/target type combinations
  switch (sourceData.type) {
    case 'bar':
      if (targetType === 'surface') {
        newData.data = transformBarToSurface(sourceData.data as number[][]);
        newData.metadata = {
          ...sourceData.metadata,
          title: `${sourceData.metadata?.title || 'Bar Chart'} (3D Surface)`,
          zLabel: sourceData.metadata?.yLabel || 'Value'
        };
      }
      break;
      
    case 'line':
      if (targetType === 'surface') {
        newData.data = transformLineToSurface(sourceData.data as number[][]);
        newData.metadata = {
          ...sourceData.metadata,
          title: `${sourceData.metadata?.title || 'Line Chart'} (3D Surface)`,
          zLabel: sourceData.metadata?.yLabel || 'Value'
        };
      }
      break;
      
    case 'scatter':
      // Scatter data is generally already in the right format for 3D scatter
      break;
      
    case 'heatmap':
      if (targetType === 'surface') {
        // Heatmaps are already in a format suitable for surface visualization
        newData.metadata = {
          ...sourceData.metadata,
          title: `${sourceData.metadata?.title || 'Heatmap'} (3D Surface)`,
          zLabel: sourceData.metadata?.zLabel || 'Value'
        };
      }
      break;
  }

  // Calculate dimensions for 3D visualization
  if (newData.data && Array.isArray(newData.data)) {
    calculateDimensions(newData);
  }

  return newData;
}

/**
 * Transform a bar chart data format to a surface visualization format
 */
function transformBarToSurface(data: number[][]): number[][] {
  // For bar charts, we want to create a 3D surface with discrete steps
  // to represent the bars
  
  // If data is already in a grid format, it might be suitable as is
  if (data.length > 0 && Array.isArray(data[0]) && data[0].length > 2) {
    return data;
  }
  
  // Convert bar data to a grid format suitable for surface visualization
  // We'll create a grid where each bar is represented as a raised platform
  const gridSize = Math.ceil(Math.sqrt(data.length));
  const result: number[][] = [];
  
  // Initialize the grid with zeros
  for (let i = 0; i < gridSize; i++) {
    const row: number[] = [];
    for (let j = 0; j < gridSize; j++) {
      const dataIndex = i * gridSize + j;
      
      // If we have data for this position, use it, otherwise use 0
      if (dataIndex < data.length) {
        const value = data[dataIndex].length > 1 ? data[dataIndex][1] : 0;
        row.push(value);
      } else {
        row.push(0);
      }
    }
    result.push(row);
  }
  
  return result;
}

/**
 * Transform a line chart data format to a surface visualization format
 */
function transformLineToSurface(data: number[][]): number[][] {
  // For line charts, we can create a surface by extruding the line
  // or by creating a terrain-like surface
  
  // If data is already in a grid format, it might be suitable as is
  if (data.length > 0 && Array.isArray(data[0]) && data[0].length > 2) {
    return data;
  }
  
  // Sort data by x value to ensure continuous line
  const sortedData = [...data].sort((a, b) => a[0] - b[0]);
  
  // For a simple approach, we'll create a grid where the line
  // forms a ridge in the surface
  const gridSize = Math.max(20, sortedData.length);
  const result: number[][] = [];
  
  // Create x values evenly spaced across the range
  const xValues: number[] = [];
  const xMin = sortedData[0][0];
  const xMax = sortedData[sortedData.length - 1][0];
  const xStep = (xMax - xMin) / (gridSize - 1);
  
  for (let i = 0; i < gridSize; i++) {
    xValues.push(xMin + i * xStep);
  }
  
  // Create a function to interpolate y values
  const interpolateY = (x: number): number => {
    // Find the two points that bracket x
    for (let i = 0; i < sortedData.length - 1; i++) {
      if (x >= sortedData[i][0] && x <= sortedData[i + 1][0]) {
        const x1 = sortedData[i][0];
        const y1 = sortedData[i][1];
        const x2 = sortedData[i + 1][0];
        const y2 = sortedData[i + 1][1];
        
        // Linear interpolation
        return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
      }
    }
    
    // If x is outside the range, return the y value of the closest endpoint
    return x < sortedData[0][0] ? sortedData[0][1] : sortedData[sortedData.length - 1][1];
  };
  
  // Build the grid with the line as a ridge
  for (let i = 0; i < gridSize; i++) {
    const row: number[] = [];
    const y = interpolateY(xValues[i]);
    
    // We'll use 10 points on either side of the center line
    for (let j = 0; j < gridSize; j++) {
      // Create a ridge by having the center of the grid (j = gridSize/2)
      // be the height of the line, and the edges taper down
      const distanceFromCenter = Math.abs(j - gridSize / 2);
      const falloff = Math.exp(-distanceFromCenter * 0.5);
      row.push(y * falloff);
    }
    
    result.push(row);
  }
  
  return result;
}

/**
 * Calculate dimensions for 3D visualization
 */
function calculateDimensions(data: VisualizationData): void {
  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    return;
  }
  
  let xMin = Number.MAX_VALUE;
  let xMax = Number.MIN_VALUE;
  let yMin = Number.MAX_VALUE;
  let yMax = Number.MIN_VALUE;
  let zMin = Number.MAX_VALUE;
  let zMax = Number.MIN_VALUE;
  
  // Handling different data formats
  if (data.type === 'surface' || data.type === 'heatmap') {
    // For surface and heatmap, data is often a 2D grid
    const grid = data.data as number[][];
    
    // X dimension is the row index
    xMin = 0;
    xMax = grid.length - 1;
    
    // Y dimension is the column index
    if (grid.length > 0 && Array.isArray(grid[0])) {
      yMin = 0;
      yMax = grid[0].length - 1;
    }
    
    // Z dimension is the value at each grid point
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const value = grid[i][j];
        zMin = Math.min(zMin, value);
        zMax = Math.max(zMax, value);
      }
    }
  } else {
    // For scatter, bar, line, etc., data is often a list of points
    const points = data.data as number[][];
    
    for (const point of points) {
      if (point.length > 0) {
        xMin = Math.min(xMin, point[0]);
        xMax = Math.max(xMax, point[0]);
      }
      
      if (point.length > 1) {
        yMin = Math.min(yMin, point[1]);
        yMax = Math.max(yMax, point[1]);
      }
      
      if (point.length > 2) {
        zMin = Math.min(zMin, point[2]);
        zMax = Math.max(zMax, point[2]);
      }
    }
  }
  
  // Update the dimensions in the data object
  data.dimensions = {
    xRange: [xMin, xMax],
    yRange: [yMin, yMax],
    zRange: [zMin, zMax]
  };
}
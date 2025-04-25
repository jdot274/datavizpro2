import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RotateCw, RotateCcw, BarChart, Fingerprint, Grid3X3 } from 'lucide-react';
import ForceThreeVisualization from '../components/ForceThreeVisualization';
import { motion } from 'framer-motion';

// Visualization types
type VisualizationType = 'bar' | 'scatter' | 'surface';

// 2D Bar Chart Component (simple implementation)
const BasicBarChart: React.FC<{ data: number[][] }> = ({ data }) => {
  // Calculate max height for normalization
  const maxHeight = data.reduce((max, point) => {
    return Math.max(max, point[1] || 0);
  }, 0);
  
  const maxWidth = 800;
  const height = 400;
  const padding = 40;
  const barPadding = 2;
  const chartWidth = maxWidth - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <svg width={maxWidth} height={height}>
        {/* Axes */}
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={maxWidth - padding} 
          y2={height - padding} 
          stroke="currentColor" 
          strokeWidth={2} 
        />
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={height - padding} 
          stroke="currentColor"
          strokeWidth={2} 
        />
        
        {/* Bars */}
        {data.map((point, i) => {
          const barWidth = (chartWidth / data.length) - barPadding;
          const barHeight = (point[1] / maxHeight) * chartHeight;
          const xPosition = padding + (i * (chartWidth / data.length));
          const yPosition = height - padding - barHeight;
          
          // HSL color based on value (similar to 3D version)
          const hue = (point[1] / maxHeight) * 0.6 + 0.2;
          const color = `hsl(${hue * 360}deg, 80%, 50%)`;
          
          return (
            <rect
              key={i}
              x={xPosition}
              y={yPosition}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={2}
              ry={2}
            />
          );
        })}
      </svg>
    </div>
  );
};

// Basic 2D Scatter Plot
const BasicScatterPlot: React.FC<{ data: number[][] }> = ({ data }) => {
  // Find ranges to normalize points
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  
  data.forEach(point => {
    if (point[0] < minX) minX = point[0];
    if (point[0] > maxX) maxX = point[0];
    if (point[1] < minY) minY = point[1];
    if (point[1] > maxY) maxY = point[1];
  });
  
  const maxWidth = 800;
  const height = 400;
  const padding = 40;
  const chartWidth = maxWidth - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  const normalizeX = (x: number) => {
    return padding + ((x - minX) / (maxX - minX)) * chartWidth;
  };
  
  const normalizeY = (y: number) => {
    return (height - padding) - ((y - minY) / (maxY - minY)) * chartHeight;
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <svg width={maxWidth} height={height}>
        {/* Axes */}
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={maxWidth - padding} 
          y2={height - padding} 
          stroke="currentColor" 
          strokeWidth={2} 
        />
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={height - padding} 
          stroke="currentColor"
          strokeWidth={2} 
        />
        
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yPos = padding + (i * (chartHeight / 4));
          return (
            <line
              key={`grid-y-${i}`}
              x1={padding}
              y1={yPos}
              x2={maxWidth - padding}
              y2={yPos}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="4"
              opacity={0.3}
            />
          );
        })}
        
        {Array.from({ length: 5 }).map((_, i) => {
          const xPos = padding + (i * (chartWidth / 4));
          return (
            <line
              key={`grid-x-${i}`}
              x1={xPos}
              y1={padding}
              x2={xPos}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="4"
              opacity={0.3}
            />
          );
        })}
        
        {/* Points */}
        {data.map((point, i) => {
          const x = normalizeX(point[0]);
          const y = normalizeY(point[1]);
          
          // Color based on point position (z value if available, or y otherwise)
          const zValue = point[2] !== undefined ? point[2] : point[1];
          const normalizedZ = (zValue - minY) / (maxY - minY);
          const hue = normalizedZ * 0.6 + 0.2;
          const color = `hsl(${hue * 360}deg, 80%, 50%)`;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={6}
              fill={color}
              opacity={0.7}
            />
          );
        })}
      </svg>
    </div>
  );
};

// Basic 2D Heat Map (for surface data)
const BasicHeatMap: React.FC<{ data: number[][] }> = ({ data }) => {
  // For a heat map we need structured grid data
  // Let's assume our surface data is already organized in a grid-like fashion
  const maxWidth = 800;
  const height = 400;
  const padding = 40;
  const chartWidth = maxWidth - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // Find min/max z values for color normalization
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  
  data.forEach(point => {
    const z = point.length > 2 ? point[2] : point[1];
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  });
  
  // Calculate grid size - assume we have a square grid
  const gridSize = Math.sqrt(data.length);
  const isGrid = Math.floor(gridSize) === gridSize;
  
  const cellSize = Math.min(chartWidth, chartHeight) / (isGrid ? gridSize : 10);
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <svg width={maxWidth} height={height}>
        {/* Axes and border */}
        <rect 
          x={padding} 
          y={padding} 
          width={chartWidth} 
          height={chartHeight}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
        
        {/* Heat Map Cells */}
        {isGrid ? (
          // Structured grid
          Array.from({ length: gridSize }).map((_, row) =>
            Array.from({ length: gridSize }).map((_, col) => {
              const index = row * gridSize + col;
              const point = data[index];
              
              if (!point) return null;
              
              const z = point.length > 2 ? point[2] : point[1];
              const normalizedZ = (z - minZ) / (maxZ - minZ);
              const hue = normalizedZ * 0.6 + 0.2;
              const color = `hsl(${hue * 360}deg, 80%, 50%)`;
              
              const x = padding + (col * cellSize);
              const y = padding + (row * cellSize);
              
              return (
                <rect
                  key={`${row}-${col}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={color}
                />
              );
            })
          )
        ) : (
          // Otherwise just distribute points in a grid
          data.map((point, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            
            const z = point.length > 2 ? point[2] : point[1];
            const normalizedZ = (z - minZ) / (maxZ - minZ);
            const hue = normalizedZ * 0.6 + 0.2;
            const color = `hsl(${hue * 360}deg, 80%, 50%)`;
            
            const x = padding + (col * cellSize);
            const y = padding + (row * cellSize);
            
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={color}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};

/**
 * Side by Side Demo Page
 * 
 * Shows both 2D and 3D visualizations of the same data side by side
 * Cycles through different visualization types
 */
export default function SideBySideDemo() {
  // Demo state
  const [currentType, setCurrentType] = useState<VisualizationType>('bar');
  const [data, setData] = useState<number[][]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to generate sample data
  function generateBarData(count: number): number[][] {
    const data: number[][] = [];
    let value = 100;
  
    for (let i = 0; i < count; i++) {
      const change = value * (Math.random() * 0.35 - 0.15);
      value += change;
      value = Math.max(20, value);
      data.push([i, value, value * 0.5]); // Add z value for true 3D
    }
  
    return data;
  }

  function generateScatterData(count: number): number[][] {
    const data: number[][] = [];
  
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 10 - 5;
      const y = Math.random() * 10 - 5;
      const z = Math.random() * 10 - 5;
      data.push([x, y, z]);
    }
  
    return data;
  }

  function generateSurfaceData(width: number, height: number): number[][] {
    const data: number[][] = [];
  
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const xPos = (x / (width - 1)) * 10 - 5;
        const yPos = (y / (height - 1)) * 10 - 5;
        const distance = Math.sqrt(xPos * xPos + yPos * yPos);
        const value = Math.sin(distance) / (1 + distance * 0.4);
        
        data.push([xPos, yPos, value]);
      }
    }
  
    return data;
  }

  // Generate random data for selected type
  const generateData = (type: VisualizationType): number[][] => {
    switch (type) {
      case 'bar':
        return generateBarData(20);
      case 'scatter':
        return generateScatterData(100);
      case 'surface':
        return generateSurfaceData(20, 20);
      default:
        return [];
    }
  };

  // Process data for 3D visualization to ensure it matches 2D representation
  const process3DData = (data: number[][], type: VisualizationType): number[][] => {
    switch (type) {
      case 'bar':
        // For bar chart, format data properly for 3D bar visualization
        // Need to preserve original x positions but normalize heights
        let maxHeight = 0;
        data.forEach(point => {
          if (point[1] > maxHeight) maxHeight = point[1];
        });
        
        return data.map((point, index) => {
          const x = point[0]; // Keep original x for proper indexing
          const height = point[1]; // Preserve actual height value
          const z = 0; // Position all bars at z=0 by default
          return [x, height, z];
        });
      
      case 'scatter':
        // For scatter plot, we may need to add z dimension if missing
        if (data[0] && data[0].length >= 3) {
          return data; // Already has 3D coordinates
        } else {
          // Convert 2D points to 3D by adding random z values
          return data.map(point => {
            // Create a z-value that correlates somewhat with y for visual interest
            const z = point[1] * 0.3 + (Math.random() - 0.5) * 2;
            return [point[0], point[1], z];
          });
        }
        
      case 'surface':
        // For surface plots, grid data works best
        if (data[0] && data[0].length >= 3) {
          return data; // Data already has z-values
        } else {
          // Create a more appropriate surface dataset if we only have 2D points
          const surfaceData: number[][] = [];
          const gridSize = 20;
          
          // Generate a grid-based surface (sine wave)
          for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
              const x = (i / (gridSize - 1)) * 10 - 5;
              const y = (j / (gridSize - 1)) * 10 - 5;
              const distance = Math.sqrt(x * x + y * y);
              const z = Math.sin(distance) / (1 + distance * 0.4);
              
              surfaceData.push([x, y, z]);
            }
          }
          
          return surfaceData;
        }
        
      default:
        return data;
    }
  };

  // Change visualization type and generate new data
  const changeVisualizationType = (type: VisualizationType) => {
    setLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      setCurrentType(type);
      setData(generateData(type));
      setLoading(false);
    }, 500);
  };

  // Initialize on mount
  useEffect(() => {
    // Generate initial data
    setData(generateData('bar'));
    setLoading(false);
  }, []);

  // Render appropriate 2D visualization based on type
  const render2DVisualization = () => {
    switch (currentType) {
      case 'bar':
        return <BasicBarChart data={data} />;
      case 'scatter':
        return <BasicScatterPlot data={data} />;
      case 'surface':
        return <BasicHeatMap data={data} />;
      default:
        return null;
    }
  };

  const getTypeTitle = (type: VisualizationType): string => {
    switch (type) {
      case 'bar':
        return 'Bar Chart';
      case 'scatter':
        return 'Scatter Plot';
      case 'surface':
        return 'Surface Plot';
      default:
        return 'Visualization';
    }
  };

  const getTypeIcon = (type: VisualizationType) => {
    switch (type) {
      case 'bar':
        return <BarChart className="h-5 w-5" />;
      case 'scatter':
        return <Fingerprint className="h-5 w-5" />;
      case 'surface':
        return <Grid3X3 className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">2D vs 3D Visualization Demo</h1>
          <p className="text-muted-foreground mb-6">
            Compare traditional 2D visualizations with interactive 3D visualizations of the same data.
          </p>
          
          {/* Visualization Type Selector */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={currentType === 'bar' ? 'default' : 'outline'}
              onClick={() => changeVisualizationType('bar')}
              className="flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              Bar Chart
            </Button>
            
            <Button
              variant={currentType === 'scatter' ? 'default' : 'outline'}
              onClick={() => changeVisualizationType('scatter')}
              className="flex items-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              Scatter Plot
            </Button>
            
            <Button
              variant={currentType === 'surface' ? 'default' : 'outline'}
              onClick={() => changeVisualizationType('surface')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Surface Plot
            </Button>
          </div>
          
          {/* Main visualization area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 2D Visualization */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getTypeIcon(currentType)}
                  2D {getTypeTitle(currentType)}
                </h2>
              </div>
              
              <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    {render2DVisualization()}
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* 3D Visualization */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {getTypeIcon(currentType)}
                  3D {getTypeTitle(currentType)}
                </h2>
                <div className="bg-green-500/10 px-2 py-1 rounded text-xs font-semibold text-green-500 flex items-center">
                  <RotateCw className="h-3 w-3 mr-1" />
                  Interactive
                </div>
              </div>
              
              <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                  >
                    <ForceThreeVisualization
                      data={process3DData(data, currentType)}
                      type={currentType}
                      options={{
                        color: currentType === 'bar' ? '#6A45D9' :
                              currentType === 'scatter' ? '#00AAFF' : '#1E90FF',
                        wireframe: false,
                        lighting: 'realistic',
                        shape: currentType === 'bar' ? 'cube' :
                               currentType === 'scatter' ? 'sphere' : 'ripple',
                        pointCloud: currentType === 'scatter'
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-8 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Currently viewing: <span className="font-semibold">{getTypeTitle(currentType)}</span>
              </span>
            </div>
            
            <Button 
              onClick={() => {
                const types: VisualizationType[] = ['bar', 'scatter', 'surface'];
                const currentIndex = types.indexOf(currentType);
                const nextIndex = (currentIndex + 1) % types.length;
                changeVisualizationType(types[nextIndex]);
              }}
              variant="outline"
              className="flex items-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Next Visualization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
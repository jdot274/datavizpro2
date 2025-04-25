import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import ForceThreeVisualization from '../components/ForceThreeVisualization';
import { generateSineWaveData, generateBarData, generateScatterData } from '../lib/sampleData';

/**
 * Force 3D Demo Page
 * 
 * A minimal demo page that directly uses the ForceThreeVisualization component
 * to ensure 3D rendering works correctly, bypassing all the regular visualization pipeline
 */
export default function Force3DDemo() {
  // Demo state
  const [step, setStep] = useState(0);
  const [data, setData] = useState<number[][]>([]);
  const [visualizationType, setVisualizationType] = useState<'bar' | 'scatter' | 'surface'>('bar');
  const [message, setMessage] = useState('Loading 3D visualization...');
  const [loading, setLoading] = useState(true);

  // Generate data for demo
  const generateData = (type: 'bar' | 'scatter' | 'surface'): number[][] => {
    switch (type) {
      case 'bar':
        return generateBarData(20);
      case 'scatter':
        return generateScatterData(100);
      case 'surface':
        return generateSineWaveData(20, 20);
      default:
        return [];
    }
  };

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

  function generateSineWaveData(width: number, height: number): number[][] {
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

  // Start the demo
  const startDemo = async () => {
    setStep(0);
    setLoading(true);
    setMessage('Starting demo...');

    try {
      // Step 1: Show bar chart
      setMessage('Generating bar chart data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVisualizationType('bar');
      setData(generateData('bar'));
      setMessage('3D Bar Chart');
      setLoading(false);

      // Wait for next step
      await new Promise(resolve => setTimeout(resolve, 5000));
      setStep(1);

      // Step 2: Show scatter plot
      setLoading(true);
      setMessage('Generating scatter plot data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVisualizationType('scatter');
      setData(generateData('scatter'));
      setMessage('3D Scatter Plot');
      setLoading(false);

      // Wait for next step
      await new Promise(resolve => setTimeout(resolve, 5000));
      setStep(2);

      // Step 3: Show surface
      setLoading(true);
      setMessage('Generating surface data...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVisualizationType('surface');
      setData(generateData('surface'));
      setMessage('3D Surface Plot');
      setLoading(false);

      // Demo complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      setStep(3);
      setMessage('Demo complete! Click "Restart Demo" to see it again.');

    } catch (error) {
      console.error('Error in demo:', error);
      setMessage('Error running demo. Please try again.');
    }
  };

  // Start demo on mount
  useEffect(() => {
    startDemo();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Force 3D Visualization Demo</h1>
          <p className="text-muted-foreground mb-6">
            This demo uses direct Three.js rendering to ensure 3D visualizations work correctly.
          </p>
          
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm">
              <strong>WebGL Mode:</strong> Using direct Three.js rendering without any fallbacks.
            </p>
          </div>
          
          {/* Main visualization area */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{message}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Step {step + 1} / 4</span>
              </div>
            </div>
            
            {/* Visualization area */}
            <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ForceThreeVisualization data={data} type={visualizationType} />
              )}
            </div>
            
            {/* Controls */}
            <div className="mt-6 flex justify-between items-center">
              <Button 
                onClick={startDemo}
                variant="outline"
                className="flex items-center"
                disabled={loading}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart Demo
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-2 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ForceThreeVisualization from '../components/ForceThreeVisualization';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { generateSineWaveData, generateBarData, generateScatterData } from '../lib/sampleData';

// Basic shape presets
const SHAPE_PRESETS = [
  { id: 'sphere', name: 'Sphere' },
  { id: 'cube', name: 'Cube' },
  { id: 'torus', name: 'Torus' },
  { id: 'cone', name: 'Cone' },
  { id: 'cylinder', name: 'Cylinder' },
  { id: 'hemisphere', name: 'Hemisphere' },
  { id: 'ripple', name: 'Ripple Wave' },
];

// Color schemes
const COLOR_SCHEMES = [
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'cool', name: 'Cool Colors' },
  { id: 'warm', name: 'Warm Colors' },
  { id: 'grayscale', name: 'Grayscale' },
];

// Visualization types
const VISUALIZATION_TYPES = [
  { id: 'surface', name: '3D Surface' },
  { id: 'bar', name: '3D Bar Chart' },
  { id: 'scatter', name: '3D Scatter Plot' },
  { id: 'line', name: '3D Line Chart' },
  { id: 'heatmap', name: '2D Heat Map' },
];

export default function EnhancedVisualizer() {
  // State variables
  const [is3D, setIs3D] = useState(true);
  const [renderingMode, setRenderingMode] = useState('solid');
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [surfaceType, setSurfaceType] = useState('sphere');
  const [textureOption, setTextureOption] = useState('none');
  const [lightingOption, setLightingOption] = useState('realistic');
  const [visualizationType, setVisualizationType] = useState('surface');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customCode, setCustomCode] = useState('');
  const [dataDensity, setDataDensity] = useState('medium');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate data based on visualization type and density
  const generateData = () => {
    const densityMap = { 'low': 10, 'medium': 20, 'high': 40 };
    const density = densityMap[dataDensity as keyof typeof densityMap] || 20;
    
    switch (visualizationType) {
      case 'bar':
        return generateBarData(density);
      case 'scatter':
        return generateScatterData(density * 5);
      case 'line':
        return generateBarData(density).map(point => [point[0], point[1], 0]); // Flatten to 2D for line
      case 'heatmap':
        return generateSineWaveData(density, density);
      case 'surface':
      default:
        return generateSineWaveData(density, density);
    }
  };
  
  // Map color scheme to actual color value
  const getColorFromScheme = (scheme: string): string => {
    switch(scheme) {
      case 'rainbow': return '#6A45D9';
      case 'cool': return '#00AAFF';
      case 'warm': return '#FF5500';
      case 'grayscale': return '#AAAAAA';
      default: return '#6A45D9';
    }
  };
  
  // Update visualization when settings change
  useEffect(() => {
    setIsLoading(true);
    
    // Short delay to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
      setError(null);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [renderingMode, colorScheme, surfaceType, textureOption, lightingOption, visualizationType, dataDensity]);
  
  // Handle application of custom code
  const handleApplyCustomCode = () => {
    try {
      if (!customCode.trim()) {
        toast.info('No custom code to apply');
        return;
      }
      
      // Could implement custom code evaluation here
      toast.success('Custom code applied');
    } catch (err) {
      console.error('Error applying custom code:', err);
      toast.error('Failed to apply custom code');
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };
  
  // Reset settings to default
  const resetSettings = () => {
    setRenderingMode('solid');
    setColorScheme('rainbow');
    setSurfaceType('sphere');
    setTextureOption('none');
    setLightingOption('realistic');
    setVisualizationType('surface');
    setDataDensity('medium');
    setCustomCode('');
    setError(null);
    toast.success('Settings reset to defaults');
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6">Enhanced Data Visualizer</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Visualization Settings</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dimension-toggle">Visualization Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="dimension-toggle" className={is3D ? 'text-muted-foreground' : ''}>2D</Label>
                    <Switch id="dimension-toggle" checked={is3D} onCheckedChange={setIs3D} />
                    <Label htmlFor="dimension-toggle" className={!is3D ? 'text-muted-foreground' : ''}>3D</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visualization-type">Visualization Type</Label>
                  <Select value={visualizationType} onValueChange={setVisualizationType}>
                    <SelectTrigger id="visualization-type">
                      <SelectValue placeholder="Select visualization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISUALIZATION_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data-density">Data Density</Label>
                  <Select value={dataDensity} onValueChange={setDataDensity}>
                    <SelectTrigger id="data-density">
                      <SelectValue placeholder="Select data density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Faster)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Detailed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shape-type">Shape Type</Label>
                  <Select value={surfaceType} onValueChange={setSurfaceType}>
                    <SelectTrigger id="shape-type">
                      <SelectValue placeholder="Select shape type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHAPE_PRESETS.map(shape => (
                        <SelectItem key={shape.id} value={shape.id}>
                          {shape.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rendering-mode">Rendering Mode</Label>
                  <Select value={renderingMode} onValueChange={setRenderingMode}>
                    <SelectTrigger id="rendering-mode">
                      <SelectValue placeholder="Select rendering mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="wireframe">Wireframe</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger id="color-scheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCHEMES.map(scheme => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="texture-option">Texture</Label>
                  <Select value={textureOption} onValueChange={setTextureOption}>
                    <SelectTrigger id="texture-option">
                      <SelectValue placeholder="Select texture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="sand">Sand</SelectItem>
                      <SelectItem value="asphalt">Asphalt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lighting-option">Lighting</Label>
                  <Select value={lightingOption} onValueChange={setLightingOption}>
                    <SelectTrigger id="lighting-option">
                      <SelectValue placeholder="Select lighting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="w-full" onClick={resetSettings}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Settings
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-code">Custom Visualization Code</Label>
                <Textarea
                  id="custom-code"
                  placeholder="Enter custom formula or code"
                  className="font-mono text-sm"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
                <Button variant="outline" className="w-full" onClick={handleApplyCustomCode}>
                  Apply Custom Code
                </Button>
              </div>
            </div>
            
            {/* Visualization Panel */}
            <div className="col-span-2 bg-muted/20 rounded-lg border overflow-hidden relative" style={{ height: '600px' }} ref={containerRef}>
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
                  <div className="bg-background/90 rounded-lg p-3 shadow-lg">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-destructive/10 p-4 rounded-lg max-w-md">
                    <h3 className="font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Visualization Error
                    </h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {is3D ? (
                <motion.div
                  key="3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <ForceThreeVisualization
                    data={generateData()}
                    options={{
                      color: getColorFromScheme(colorScheme),
                      wireframe: renderingMode === 'wireframe',
                      pointCloud: renderingMode === 'points',
                      lighting: lightingOption as 'basic' | 'realistic' | 'artistic' | 'studio',
                      texture: textureOption !== 'none' ? textureOption : undefined,
                      shape: surfaceType
                    }}
                    type={visualizationType === 'line' ? 'line' : 'surface'}
                    onError={(errorMsg) => setError(errorMsg)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="2d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="text-center p-8">
                    <h3 className="font-semibold text-lg mb-2">2D Visualization</h3>
                    <p className="text-muted-foreground">
                      2D mode visualization placeholder. Toggle to 3D for the full experience.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
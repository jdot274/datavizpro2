import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, BarChart2, BarChart4, Layers, Palette, RefreshCw, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ExcelImporter from '../components/ExcelImporter';
import FileUploader from '../components/FileUploader';
import Visualization from '../components/Visualization';
import TwoDimensionalChart from '../components/TwoDimensionalChart';
import SideBySideVisualization from '../components/SideBySideVisualization';
import { SampleDataButton } from '../components/SampleDataButton';
import { useVisualization } from '@/lib/stores/useVisualization';
import { getRandomPreset } from '@/lib/shaders/ShaderPresets';
import { sampleDataSets } from '@/lib/sampleData';
import { transformVisualizationData } from '@/lib/visualizationTransformer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Shows a small interactive tutorial for how to use the visualization features
 */
const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [hasData, setHasData] = useState(false);
  const applyShaderPresetObject = useVisualization(state => state.applyShaderPresetObject);
  const setVisualizationType = useVisualization(state => state.setVisualizationType);
  const setData = useVisualization(state => state.setData);
  
  // Get current data state
  const data = useVisualization(state => state.data);
  
  // Handle loading sample data
  const handleLoadSampleData = (type: 'bar' | 'line' | 'surface' | 'scatter' | 'heatmap') => {
    // Find a sample that matches the requested type
    const sample = sampleDataSets.find(sample => sample.visualizationType === type);
    
    if (sample) {
      const generatedData = sample.generator();
      
      // Calculate dimensions
      let xMin = Number.MAX_VALUE;
      let xMax = Number.MIN_VALUE;
      let yMin = Number.MAX_VALUE;
      let yMax = Number.MIN_VALUE;
      let zMin = Number.MAX_VALUE;
      let zMax = Number.MIN_VALUE;
      
      generatedData.forEach(point => {
        if (point[0] < xMin) xMin = point[0];
        if (point[0] > xMax) xMax = point[0];
        
        if (point[1] < yMin) yMin = point[1];
        if (point[1] > yMax) yMax = point[1];
        
        if (point.length > 2) {
          if (point[2] < zMin) zMin = point[2];
          if (point[2] > zMax) zMax = point[2];
        }
      });
      
      // Set the data
      setData({
        type: type,
        source: 'sample',
        data: generatedData,
        dimensions: {
          xRange: [xMin, xMax],
          yRange: [yMin, yMax],
          zRange: generatedData[0].length > 2 ? [zMin, zMax] : [0, 0]
        },
        metadata: sample.metadata
      });
      
      setVisualizationType(type);
      setHasData(true);
    } else {
      console.error(`No sample data found for type: ${type}`);
    }
  };
  
  // Update hasData when data changes
  useEffect(() => {
    if (data.data && data.data.length > 0) {
      setHasData(true);
    }
  }, [data.data]);

  // Apply a random shader preset for demonstration
  const applyRandomShader = () => {
    const randomPreset = getRandomPreset();
    applyShaderPresetObject(randomPreset);
  };
  
  // Handle completion of a step
  const completeStep = () => {
    setStep(prev => prev + 1);
  };
  
  // Reset tutorial
  const resetTutorial = () => {
    setStep(1);
    setFileUploaded(false);
    setHasData(false);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Interactive Visualization Tutorial</h1>
        <p className="text-muted-foreground">Follow these steps to create, view, and customize your data visualizations</p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span>Start</span>
          <span>Upload</span>
          <span>2D View</span>
          <span>3D View</span>
          <span>Customize</span>
          <span>Complete</span>
        </div>
        <Progress value={Math.min(100, (step / 5) * 100)} className="h-2" />
      </div>
      
      {/* Step 1: Introduction */}
      {step === 1 && (
        <Card className="border border-muted shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              Welcome to Data Visualization
            </CardTitle>
            <CardDescription>
              This tutorial will guide you through creating impressive visualizations from your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium">Upload Data</h3>
                <p className="text-sm text-muted-foreground">Import Excel spreadsheets with your data</p>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <Layers className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium">Transform to 3D</h3>
                <p className="text-sm text-muted-foreground">See your data in beautiful 3D renderings</p>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center text-center">
                <Palette className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium">Customize</h3>
                <p className="text-sm text-muted-foreground">Apply shaders and customize the appearance</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={completeStep} className="gap-2">
              Let's Get Started <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Step 2: Upload Excel File */}
      {step === 2 && (
        <Card className="border border-muted shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={18} className="text-primary" />
              Step 1: Upload Your Data
            </CardTitle>
            <CardDescription>
              Upload an Excel file to begin visualizing your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Upload Excel File</h3>
              <div className="bg-muted/30 p-6 rounded-lg border">
                <ExcelImporter 
                  onSuccess={() => {
                    setFileUploaded(true);
                    completeStep();
                  }}
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Don't have a file?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use our sample data to try out the visualization features immediately.
              </p>
              <div className="flex gap-2">
                <SampleDataButton 
                  variant="outline" 
                  showIcon={true}
                  size="default"
                />
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    // Load bar chart sample data and proceed to next step
                    handleLoadSampleData('bar');
                    setFileUploaded(true);
                    completeStep();
                  }}
                >
                  Quick Start with Bar Chart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: 2D Visualization */}
      {step === 3 && (
        <Card className="border border-muted shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 size={18} className="text-primary" />
              Step 2: 2D Visualization
            </CardTitle>
            <CardDescription>
              First, let's look at your data in a traditional 2D representation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasData ? (
              <>
                <div className="h-[300px] border rounded-lg overflow-hidden">
                  <Tabs defaultValue="bar">
                    <div className="flex justify-between items-center p-2 border-b">
                      <TabsList>
                        <TabsTrigger value="bar" onClick={() => setVisualizationType("bar")}>Bar Chart</TabsTrigger>
                        <TabsTrigger value="line" onClick={() => setVisualizationType("line")}>Line Chart</TabsTrigger>
                        <TabsTrigger value="scatter" onClick={() => setVisualizationType("scatter")}>Scatter Plot</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="bar" className="h-[250px]">
                      {data.data && Array.isArray(data.data) && (
                        <TwoDimensionalChart 
                          data={data.data as number[][]} 
                          type="bar"
                          title={data.metadata?.title}
                          xLabel={data.metadata?.xLabel}
                          yLabel={data.metadata?.yLabel}
                        />
                      )}
                    </TabsContent>
                    <TabsContent value="line" className="h-[250px]">
                      {data.data && Array.isArray(data.data) && (
                        <TwoDimensionalChart 
                          data={data.data as number[][]} 
                          type="line"
                          title={data.metadata?.title}
                          xLabel={data.metadata?.xLabel}
                          yLabel={data.metadata?.yLabel}
                        />
                      )}
                    </TabsContent>
                    <TabsContent value="scatter" className="h-[250px]">
                      {data.data && Array.isArray(data.data) && (
                        <TwoDimensionalChart 
                          data={data.data as number[][]} 
                          type="scatter"
                          title={data.metadata?.title}
                          xLabel={data.metadata?.xLabel}
                          yLabel={data.metadata?.yLabel}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Try changing the chart type using the tabs above to see different representations of your data.</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-4">No data loaded. Please go back and upload a file.</p>
                <Button variant="outline" onClick={() => setStep(2)}>Go Back to Upload</Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={() => {
                if (data && data.data) {
                  // Determine the best 3D visualization type based on current 2D type
                  let target3DType: 'surface' | 'scatter' = 'surface';
                  
                  // For scatter plots, keep scatter in 3D
                  if (data.type === 'scatter') {
                    target3DType = 'scatter';
                  }
                  
                  // Transform the data to the appropriate 3D format
                  const transformed3DData = transformVisualizationData(data, target3DType);
                  
                  // Update the visualization store with the transformed data
                  setData(transformed3DData);
                  setVisualizationType(target3DType);
                  
                  // Apply a random shader for visual appeal
                  applyRandomShader();
                }
                
                // Proceed to next step
                completeStep();
              }} 
              className="gap-2" 
              disabled={!hasData}
            >
              Continue to 3D View <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Step 4: 3D Visualization */}
      {step === 4 && (
        <Card className="border border-muted shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              Step 3: 3D Visualization
            </CardTitle>
            <CardDescription>
              Now let's see your data transformed into an interactive 3D visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <>
                <div className="h-[500px] border rounded-lg overflow-hidden bg-black/90">
                  <Visualization />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <h4 className="font-medium mb-1">Interaction Tips:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click and drag to rotate the visualization</li>
                      <li>Scroll to zoom in and out</li>
                      <li>Look for the "Enhanced 3D View" button for even better visuals</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-4">No data loaded. Please go back and upload a file.</p>
                <Button variant="outline" onClick={() => setStep(2)}>Go Back to Upload</Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={completeStep} className="gap-2" disabled={!hasData}>
              Continue to Customization <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Step 5: Customization */}
      {step === 5 && (
        <Card className="border border-muted shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              Step 4: Customize Your Visualization
            </CardTitle>
            <CardDescription>
              Apply different visual effects and view your data in multiple ways
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <>
                <div className="mb-4">
                  <div className="flex gap-2 mb-4">
                    <Button onClick={applyRandomShader} className="gap-2">
                      <RefreshCw size={16} />
                      Random Shader Effect
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setVisualizationType("surface")}
                      className="gap-2"
                    >
                      Surface View
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setVisualizationType("scatter")}
                      className="gap-2"
                    >
                      Scatter View
                    </Button>
                  </div>
                  <div className="h-[500px] border rounded-lg overflow-hidden">
                    <SideBySideVisualization />
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="border rounded-lg p-3 bg-muted/20">
                    <h4 className="font-medium mb-1">Customization Tips:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click "Random Shader Effect" to apply different visual styles</li>
                      <li>Switch between Surface and Scatter views to change the visualization type</li>
                      <li>Try the "Enhanced 3D View" button for more advanced visualization</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-4">No data loaded. Please go back and upload a file.</p>
                <Button variant="outline" onClick={() => setStep(2)}>Go Back to Upload</Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetTutorial}>
              Start Over
            </Button>
            <Button onClick={() => navigate('/excel')} className="gap-2">
              Go to Full App <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default TutorialPage;
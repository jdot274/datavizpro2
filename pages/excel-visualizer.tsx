import React, { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import ExcelImporter from "@/components/ExcelImporter";
import Visualization from "@/components/Visualization";
import TwoDimensionalChart from "@/components/TwoDimensionalChart";
import SideBySideVisualization from "../components/SideBySideVisualization";
import { EnhancedDataAnalysis } from "@/components/EnhancedDataAnalysis";
import { useVisualization } from "@/lib/stores/useVisualization";
import { VisualizationType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, Camera, RefreshCw, LineChart, BarChart2 } from "lucide-react";

const ExcelVisualizer: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    setVisualizationType,
    shader,
    updateShaderParam,
    resetCamera
  } = useVisualization();
  
  const [visualizationType, setVisualizationTypeLocal] = useState<VisualizationType>("surface");
  
  // Handle visualization type change
  const handleVisualizationTypeChange = (type: VisualizationType) => {
    setVisualizationTypeLocal(type);
    setVisualizationType(type);
  };
  
  // Take a snapshot of the visualization
  const takeSnapshot = () => {
    // Dispatch a custom event that the visualization component will listen for
    window.dispatchEvent(new CustomEvent('takeSnapshot'));
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Excel Data Visualization</h1>
      <p className="text-muted-foreground">
        Import and visualize Excel data in 3D. Transform your spreadsheets into interactive visualizations.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="space-y-6">
          {/* Excel Import Card */}
          <ExcelImporter />
          
          {/* Visualization Controls */}
          {data.data && (
            <Card>
              <CardHeader>
                <CardTitle>Visualization Controls</CardTitle>
                <CardDescription>
                  Customize your visualization
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Visualization Type Select */}
                <div className="space-y-2">
                  <Label htmlFor="viz-type">Visualization Type</Label>
                  <Select
                    value={visualizationType}
                    onValueChange={(value) => handleVisualizationTypeChange(value as VisualizationType)}
                  >
                    <SelectTrigger id="viz-type">
                      <SelectValue placeholder="Select visualization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surface">Surface (3D)</SelectItem>
                      <SelectItem value="scatter">Scatter (3D)</SelectItem>
                      <SelectItem value="line">Line (2D)</SelectItem>
                      <SelectItem value="bar">Bar (2D)</SelectItem>
                      <SelectItem value="heatmap">Heatmap (2D)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Shader Controls */}
                <div className="space-y-2">
                  <Label htmlFor="shader-type">Shader Effect</Label>
                  <Select
                    value={shader.type}
                    onValueChange={(value) => updateShaderParam("type", value)}
                  >
                    <SelectTrigger id="shader-type">
                      <SelectValue placeholder="Select shader effect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Shader Intensity */}
                {shader.type !== "none" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="intensity">Effect Intensity</Label>
                      <span className="text-xs text-muted-foreground">
                        {shader.params.intensity?.toFixed(1)}
                      </span>
                    </div>
                    <Slider 
                      id="intensity"
                      min={0} 
                      max={2} 
                      step={0.1} 
                      value={[shader.params.intensity || 1]} 
                      onValueChange={(values) => updateShaderParam("intensity", values[0])}
                    />
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-col space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={takeSnapshot}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Take Screenshot
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetCamera}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Camera
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main visualization area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Visualization Tabs for 2D and 3D views */}
          <Tabs defaultValue="both" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="2d">2D Visualization</TabsTrigger>
              <TabsTrigger value="3d">3D Visualization</TabsTrigger>
              <TabsTrigger value="both">Split View</TabsTrigger>
            </TabsList>
            
            {/* 2D View Only */}
            <TabsContent value="2d" className="h-[600px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-card rounded-lg border">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">Processing data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center bg-card rounded-lg border">
                  <div className="text-center max-w-md p-6">
                    <h3 className="text-xl font-bold text-destructive mb-2">Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button variant="destructive" onClick={() => window.location.reload()}>
                      Reload Page
                    </Button>
                  </div>
                </div>
              ) : data.data ? (
                <div className="h-full rounded-lg border overflow-hidden">
                  <TwoDimensionalChart 
                    data={data.data as number[][]} 
                    type={visualizationType}
                    title={data.metadata?.title || "2D Visualization"}
                    xLabel={data.metadata?.xLabel}
                    yLabel={data.metadata?.yLabel}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-card rounded-lg border">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-bold mb-2">No Data Loaded</h3>
                    <p className="text-muted-foreground">
                      Import Excel data or load a sample to begin visualization
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* 3D View Only */}
            <TabsContent value="3d" className="h-[600px] rounded-lg border overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-card">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">Processing data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center bg-card">
                  <div className="text-center max-w-md p-6">
                    <h3 className="text-xl font-bold text-destructive mb-2">Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button variant="destructive" onClick={() => window.location.reload()}>
                      Reload Page
                    </Button>
                  </div>
                </div>
              ) : (
                <Visualization />
              )}
            </TabsContent>
            
            {/* Interactive Split View (Both 2D and 3D) */}
            <TabsContent value="both" className="h-[600px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-card rounded-lg border">
                  <div className="text-center space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">Processing data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center bg-card rounded-lg border">
                  <div className="text-center max-w-md p-6">
                    <h3 className="text-xl font-bold text-destructive mb-2">Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button variant="destructive" onClick={() => window.location.reload()}>
                      Reload Page
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full rounded-lg border overflow-hidden">
                  <SideBySideVisualization />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Data info and Enhanced Analysis */}
      {data.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Dataset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Source</h4>
                <p className="text-muted-foreground capitalize">{data.source}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Dimensions</h4>
                <p className="text-muted-foreground">
                  X: {data.dimensions.xRange[0].toFixed(2)} to {data.dimensions.xRange[1].toFixed(2)}
                  <br />
                  Y: {data.dimensions.yRange[0].toFixed(2)} to {data.dimensions.yRange[1].toFixed(2)}
                  <br />
                  Z: {data.dimensions.zRange[0].toFixed(2)} to {data.dimensions.zRange[1].toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Metadata</h4>
                <p className="text-muted-foreground">
                  Title: {data.metadata?.title || "N/A"}
                  <br />
                  X-Axis: {data.metadata?.xLabel || "X"}
                  <br />
                  Y-Axis: {data.metadata?.yLabel || "Y"}
                  <br />
                  Z-Axis: {data.metadata?.zLabel || "Z"}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced Data Analysis */}
          <div className="md:col-span-2">
            <EnhancedDataAnalysis />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelVisualizer;
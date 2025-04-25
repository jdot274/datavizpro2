import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Visualization from "@/components/Visualization";
import FormulaEditor from "@/components/FormulaEditor";
import FileUploader from "@/components/FileUploader";
import ControlPanel from "@/components/ControlPanel";
import { useVisualization } from "@/lib/stores/useVisualization";
import { CornerLeftUp, AlertCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Visualizer: React.FC = () => {
  const { error, isLoading, data } = useVisualization();
  const [pythonCode, setPythonCode] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">DataViz3D</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHelpOpen(true)}
            >
              Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              as={Link}
              to="/"
              className="flex items-center gap-2"
            >
              <CornerLeftUp className="h-4 w-4" /> Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel - Inputs */}
        <div className="md:col-span-1 space-y-4">
          <Tabs defaultValue="formula" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="formula">Formula</TabsTrigger>
              <TabsTrigger value="excel">Excel</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formula" className="p-4 border rounded-md bg-card">
              <h2 className="text-lg font-semibold mb-4">Formula Input</h2>
              <FormulaEditor />
            </TabsContent>
            
            <TabsContent value="excel" className="p-4 border rounded-md bg-card">
              <h2 className="text-lg font-semibold mb-4">Excel Upload</h2>
              <FileUploader type="excel" />
            </TabsContent>
            
            <TabsContent value="python" className="p-4 border rounded-md bg-card">
              <h2 className="text-lg font-semibold mb-4">Python Script</h2>
              <div className="space-y-4">
                <textarea
                  className="w-full h-40 p-3 rounded-md bg-background border font-mono text-sm"
                  placeholder="# Enter your Python code here
import numpy as np

# Create a grid of x, y values
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)

# Calculate z values (example: a sine wave)
Z = np.sin(np.sqrt(X**2 + Y**2))

# Set the output data for visualization
data = Z

# Optional metadata
title = 'Sine Wave'
x_label = 'X Axis'
y_label = 'Y Axis'
z_label = 'Z Axis'"
                  value={pythonCode}
                  onChange={(e) => setPythonCode(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={isLoading || !pythonCode.trim()}
                  onClick={() => {/* Process Python code */}}
                >
                  {isLoading ? "Processing..." : "Run Python Code"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Control panel */}
          <ControlPanel />
          
          {/* Error display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive">Error</h3>
                  <p className="text-destructive/90">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right panel - Visualization */}
        <div className="md:col-span-2 bg-black rounded-lg overflow-hidden border border-border h-[calc(100vh-10rem)]">
          <Visualization />
        </div>
      </main>

      {/* Help dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>DataViz3D Help</DialogTitle>
            <DialogDescription>
              Learn how to use the 3D data visualization tool
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <h3 className="text-lg font-medium">Formula Input</h3>
              <p className="text-muted-foreground mt-1">
                Enter mathematical expressions with x and y variables. The tool will evaluate the formula
                and create a 3D surface visualization.
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Use standard JavaScript math syntax</li>
                <li>Available functions: sin, cos, tan, sqrt, pow, exp, log, abs</li>
                <li>Example: sin(x) * cos(y) or Math.exp(-(x*x + y*y)/5)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Excel Upload</h3>
              <p className="text-muted-foreground mt-1">
                Upload Excel files (.xlsx, .xls) or CSV files to visualize your data.
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>For grid data: Arrange your data in a grid format (matrix)</li>
                <li>For point data: Organize columns as X, Y, Z coordinates</li>
                <li>Headers will be used as axis labels if present</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Python Script</h3>
              <p className="text-muted-foreground mt-1">
                Write Python code to generate visualization data using NumPy or Pandas.
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Your code must define a 'data' variable containing the visualization data</li>
                <li>Optionally define 'title', 'x_label', 'y_label', 'z_label' variables</li>
                <li>NumPy and Pandas are available for data manipulation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Shader Effects</h3>
              <p className="text-muted-foreground mt-1">
                Apply custom shader effects to enhance your visualizations.
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Basic: Simple color gradient based on height</li>
                <li>Wave: Animated wave effect with customizable speed</li>
                <li>Gradient: Dynamic color transitions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Camera Controls</h3>
              <p className="text-muted-foreground mt-1">
                Navigate in the 3D space to explore your visualization.
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Left click + drag: Rotate the camera</li>
                <li>Right click + drag: Pan the camera</li>
                <li>Scroll: Zoom in/out</li>
                <li>Double click: Reset the camera position</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Visualizer;

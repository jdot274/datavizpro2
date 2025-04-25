import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { useVisualization } from "@/lib/stores/useVisualization";
import { 
  CornerRightUp, FileImage, Table, ChevronRight, FileBarChart, 
  Image, Upload, Clipboard, LineChart, BarChart4
} from "lucide-react";
import FinancialGraph from "@/components/FinancialGraph";

// Component for handling image uploads and pastes
const ImageUploader: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setData } = useVisualization();
  
  // Configure dropzone for image files
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1
  });

  // Handle clipboard paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setPreview(previewUrl);
          break;
        }
      }
    }
  }, []);

  // Process the image into a 3D visualization
  const processImage = useCallback(() => {
    if (!preview) return;
    
    setIsProcessing(true);
    
    // Create a new image to load the preview
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = preview || '';
    
    img.onload = () => {
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setIsProcessing(false);
        return;
      }
      
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Create a height map based on pixel brightness
      const width = Math.min(canvas.width, 100); // Limit size for performance
      const height = Math.min(canvas.height, 100);
      const gridData: number[][] = [];
      
      // Sample the image to create a grid
      const stepX = canvas.width / width;
      const stepY = canvas.height / height;
      
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          // Sample pixel at this coordinate
          const pixelX = Math.floor(x * stepX);
          const pixelY = Math.floor(y * stepY);
          const pixelIndex = (pixelY * canvas.width + pixelX) * 4;
          
          // Calculate brightness (0-255)
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const brightness = (r + g + b) / 3;
          
          // Add to our grid
          row.push(brightness);
        }
        gridData.push(row);
      }
      
      // Find min and max values for normalization
      let minVal = 255;
      let maxVal = 0;
      for (let y = 0; y < gridData.length; y++) {
        for (let x = 0; x < gridData[y].length; x++) {
          minVal = Math.min(minVal, gridData[y][x]);
          maxVal = Math.max(maxVal, gridData[y][x]);
        }
      }
      
      // Set the data in our visualization store
      setData({
        type: "surface",
        source: "image",
        data: gridData,
        dimensions: {
          xRange: [0, width - 1],
          yRange: [0, height - 1],
          zRange: [minVal, maxVal]
        },
        metadata: {
          title: "Image Height Map",
          xLabel: "X",
          yLabel: "Y",
          zLabel: "Height"
        }
      });
      
      setIsProcessing(false);
    };
    
    img.onerror = () => {
      console.error("Error loading image");
      setIsProcessing(false);
    };
  }, [preview, setData]);

  // Clear the preview
  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Paste area */}
      <div 
        className="border-2 border-dashed p-6 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary" 
        onPaste={handlePaste}
        tabIndex={0}
      >
        <Clipboard className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
        <p className="text-sm text-muted-foreground">
          Paste an image from your clipboard (Ctrl+V)
        </p>
      </div>
      
      {/* Drag & drop area */}
      <div 
        {...getRootProps()} 
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
          ${preview ? "bg-muted/10" : ""}`}
      >
        <input {...getInputProps()} />
        {!preview ? (
          <div className="space-y-2">
            <Image className="h-10 w-10 mx-auto text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-xs text-muted-foreground/70">
              Supported formats: PNG, JPG, GIF, BMP
            </p>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-40 mx-auto rounded-md"
            />
            <Button 
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
            >
              &times;
            </Button>
          </div>
        )}
      </div>
      
      {/* Process button */}
      {preview && (
        <Button 
          className="w-full"
          onClick={processImage}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Transform to 3D"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Main Dashboard component
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">DataViz3D Dashboard</h1>
          <Link to="/visualizer">
            <Button variant="outline" className="flex items-center gap-2">
              Go to Visualizer <CornerRightUp className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Create New Visualization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Image to 3D Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-primary" />
                Image to 3D
              </CardTitle>
              <CardDescription>
                Transform an image into a 3D height map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader />
            </CardContent>
          </Card>
          
          {/* Excel Data Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-primary" />
                Excel/CSV Data
              </CardTitle>
              <CardDescription>
                Convert spreadsheet data into 3D visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/visualizer">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Excel or CSV
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Formula Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-primary" />
                Mathematical Formula
              </CardTitle>
              <CardDescription>
                Create 3D visualizations from math expressions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/visualizer">
                <Button variant="outline" className="w-full">
                  Create Formula Visualization
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Financial Graph Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Financial Data Visualization</h2>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <FinancialGraph
              onVisualize={() => {
                // Navigate to visualizer automatically when the data is ready
                window.location.href = '/visualizer';
              }}
            />
          </div>
        </div>

        {/* Recent Visualizations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Visualizations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for recent visualizations - these would be populated dynamically */}
            <Card className="border border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <p className="text-muted-foreground text-sm">
                  Your recent visualizations will appear here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
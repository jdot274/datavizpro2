import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Suspense, useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import "@fontsource/inter";
import { AlertCircle, Info } from "lucide-react";
import { Toaster, toast } from "sonner";

// Pages
import Home from "./pages/home";
import Visualizer from "./pages/visualizer";
import Dashboard from "./pages/dashboard";
import ExcelVisualizer from "./pages/excel-visualizer";
import TutorialPage from "./pages/tutorial";
import AutoDemoPage from "./pages/auto-demo";
import Force3DDemo from "./pages/force-3d-demo";
import SideBySideDemo from "./pages/side-by-side-demo";
import EnhancedVisualizer from "./pages/enhanced-visualizer";
import NotFound from "./pages/not-found";

// State and Components
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";

// WebGL context error detection function
const checkWebGLSupport = (): boolean => {
  try {
    // Try to create a WebGL canvas
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const { reportContextError, optimizeForWebGL } = useGame();
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  // Check for WebGL support
  useEffect(() => {
    const hasWebGL = checkWebGLSupport();
    setWebGLSupported(hasWebGL);
    
    if (!hasWebGL) {
      reportContextError("WebGL is not supported or disabled in your browser");
      toast.error("3D visualization may not work properly on your device", {
        description: "Try using a different browser or enabling hardware acceleration"
      });
    }
    
    // Listen for WebGL context lost events
    const handleContextLost = () => {
      console.error("THREE.WebGLRenderer: Context Lost.");
      reportContextError("WebGL context lost");
      
      // Show a toast notification
      toast.warning("3D rendering context lost", {
        description: "Try switching to basic visualization mode for better stability."
      });
    };
    
    window.addEventListener('webglcontextlost', handleContextLost);
    
    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, [reportContextError]);

  // Initialize sound effects
  useEffect(() => {
    try {
      // Load background music
      const bgMusic = new Audio("/sounds/background.mp3");
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      setBackgroundMusic(bgMusic);

      // Load sound effects
      const hit = new Audio("/sounds/hit.mp3");
      setHitSound(hit);

      const success = new Audio("/sounds/success.mp3");
      setSuccessSound(success);
    } catch (e) {
      console.error("Failed to initialize audio:", e);
    }
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {webGLSupported === false && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Visualization Compatibility Issue</AlertTitle>
            <AlertDescription>
              Your browser does not support WebGL, which is required for 3D visualizations.
              Try using an updated browser or enabling hardware acceleration.
            </AlertDescription>
          </Alert>
        )}
        
        {webGLSupported === true && (
          <Alert variant="default" className="m-4">
            <Info className="h-4 w-4" />
            <AlertTitle>3D Visualization Ready</AlertTitle>
            <AlertDescription>
              WebGL is supported in your browser. You can use advanced 3D visualizations.
            </AlertDescription>
          </Alert>
        )}
        
        <Router>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/visualizer" element={<Visualizer />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/excel" element={<ExcelVisualizer />} />
              <Route path="/tutorial" element={<TutorialPage />} />
              <Route path="/auto-demo" element={<AutoDemoPage />} />
              <Route path="/force-3d-demo" element={<Force3DDemo />} />
              <Route path="/side-by-side" element={<SideBySideDemo />} />
              <Route path="/enhanced" element={<EnhancedVisualizer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        
        {/* Global toast notifications */}
        <Toaster position="top-right" />
        {/* Resource preloader */}
        <script src="/loader.js"></script>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

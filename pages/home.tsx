import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/stores/useAudio";

const Home: React.FC = () => {
  const { toggleMute, isMuted, backgroundMusic } = useAudio();

  // Start background music when user interacts with the page
  const handleStart = () => {
    if (isMuted && backgroundMusic) {
      toggleMute();
      backgroundMusic.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">DataViz3D</h1>
          <Button variant="ghost" onClick={toggleMute}>
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col items-center justify-center text-center p-6"
      >
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Transform Your Data Into Beautiful 3D Visualizations
          </motion.h1>
          
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-muted-foreground mb-8"
          >
            Visualize mathematical equations, Python data, and Excel sheets with powerful 
            shader-based 3D graphics.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Enhanced Visualizer - Highest Priority */}
            <div className="bg-purple-500/10 p-6 rounded-lg border-2 border-purple-500/40 max-w-2xl mx-auto mb-6 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 bg-purple-500 text-white px-4 py-1 rotate-12 shadow-lg text-sm font-bold">
                NEW
              </div>
              <h3 className="text-xl font-bold mb-2 text-purple-500">✨ Enhanced Visualizer</h3>
              <p className="text-muted-foreground mb-4">
                <strong>Our most powerful tool yet!</strong> Create beautiful visualizations from math formulas, Python code, or Excel data with customizable settings and seamless 2D/3D transitions.
              </p>
              <Link to="/enhanced" onClick={handleStart}>
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg w-full sm:w-auto"
                  variant="default"
                  style={{ backgroundColor: "#9333ea" }}
                >
                  <span className="mr-2">✨</span> Launch Enhanced Visualizer
                </Button>
              </Link>
            </div>
            
            {/* Special Force 3D Demo */}
            <div className="bg-green-500/10 p-6 rounded-lg border-2 border-green-500/40 max-w-2xl mx-auto mb-6 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-1 rotate-12 shadow-lg text-sm font-bold">
                NEW
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-500">🚀 Force 3D Visualization</h3>
              <p className="text-muted-foreground mb-4">
                <strong>Having trouble with 3D visuals?</strong> This special demo uses direct Three.js rendering with no fallbacks to ensure maximum WebGL compatibility.
              </p>
              <Link to="/force-3d-demo" onClick={handleStart}>
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg w-full sm:w-auto"
                  variant="default"
                  style={{ backgroundColor: "#22c55e" }}
                >
                  <span className="mr-2">⚡</span> Launch Force 3D Demo
                </Button>
              </Link>
            </div>

            {/* Side-by-Side Demo visualization */}
            <div className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20 max-w-2xl mx-auto mb-6">
              <h3 className="text-xl font-semibold mb-2">2D vs 3D Comparison</h3>
              <p className="text-muted-foreground mb-4">
                See both 2D and 3D visualizations side-by-side with the same data. Compare the difference between traditional charts and interactive 3D visualizations.
              </p>
              <Link to="/side-by-side" onClick={handleStart}>
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg w-full sm:w-auto"
                  variant="default"
                  style={{ backgroundColor: "#3b82f6" }}
                >
                  <span className="mr-2">↔</span> Side-by-Side Demo
                </Button>
              </Link>
            </div>
            
            {/* Auto Demo button - quick showcase */}
            <div className="bg-orange-500/10 p-6 rounded-lg border border-orange-500/20 max-w-2xl mx-auto mb-6">
              <h3 className="text-xl font-semibold mb-2">Quick Demo</h3>
              <p className="text-muted-foreground mb-4">
                Watch an automatic demo that shows how 2D data transforms into beautiful 3D visualizations with no user interaction required.
              </p>
              <Link to="/auto-demo" onClick={handleStart}>
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg w-full sm:w-auto"
                  variant="default"
                  style={{ backgroundColor: "#f97316" }}
                >
                  <span className="mr-2">▶</span> Watch Auto Demo
                </Button>
              </Link>
            </div>
            
            {/* Tutorial button - most prominent */}
            <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 max-w-2xl mx-auto mb-6">
              <h3 className="text-xl font-semibold mb-2">New to Data Visualization?</h3>
              <p className="text-muted-foreground mb-4">
                Follow our step-by-step tutorial to learn how to transform your data into beautiful 3D visualizations.
              </p>
              <Link to="/tutorial" onClick={handleStart}>
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg w-full sm:w-auto"
                  variant="default"
                >
                  Interactive Tutorial
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" onClick={handleStart}>
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                >
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/visualizer" onClick={handleStart}>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg"
                >
                  Visualizer
                </Button>
              </Link>
              
              <Link to="/excel" onClick={handleStart}>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg"
                >
                  Excel Visualizer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="py-12 bg-muted/20"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Mathematical Formulas</h3>
              <p className="text-muted-foreground">
                Enter mathematical expressions and visualize them in 3D space with custom parameters.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Excel Data Integration</h3>
              <p className="text-muted-foreground">
                Import your Excel spreadsheets and instantly transform them into interactive 3D visualizations.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Python Script Support</h3>
              <p className="text-muted-foreground">
                Execute Python scripts to generate complex data visualizations with NumPy and Pandas.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} DataViz3D. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

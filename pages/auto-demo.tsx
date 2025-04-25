import React from 'react';
import AutoDemoVisualizer from '@/components/AutoDemoVisualizer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Auto Demo Page
 * 
 * This page contains the automatic demonstration of the platform's capabilities,
 * showing the transition from 2D to 3D visualizations without requiring any user interaction.
 */
export default function AutoDemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with navigation */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-4 flex items-center">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link to="/tutorial">
              <Button variant="outline" size="sm">
                Interactive Tutorial
              </Button>
            </Link>
            <Link to="/visualizer">
              <Button variant="outline" size="sm">
                Visualizer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <AutoDemoVisualizer />
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DataViz3D. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
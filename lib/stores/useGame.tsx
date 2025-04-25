import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended" | "error";
export type RendererType = "standard" | "enhanced" | "fallback";
export type WebGLPerformanceMode = "balanced" | "performance" | "battery-saving";

interface GameState {
  phase: GamePhase;
  rendererType: RendererType;
  contextErrors: number;
  errorMessage: string | null;
  webGLPerformanceMode: WebGLPerformanceMode;
  isWebGLOptimized: boolean;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  
  // 3D context handling
  reportContextError: (error?: string) => void;
  resetContextErrors: () => void;
  setRendererType: (type: RendererType) => void;
  fallbackToBasicRenderer: () => void;
  
  // WebGL optimization
  setWebGLPerformanceMode: (mode: WebGLPerformanceMode) => void;
  optimizeForWebGL: () => void;
  
  // WebGL memory tracking (from the screenshot)
  monitorGPUMemory: (renderer: any) => void;
  setGPUQueryLimits: (gl: any) => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    rendererType: "standard",
    contextErrors: 0, // Reset to ensure WebGL renderer is used
    errorMessage: null,
    webGLPerformanceMode: "balanced",
    isWebGLOptimized: false,
    
    // GPU memory tracking methods based on the screenshot
    monitorGPUMemory: (renderer) => {
      if (!renderer?.info) return;
      
      // From the screenshot: Log before and after each frame
      console.log('Geoms:', renderer.info.memory.geometries, 
                  'Texs:', renderer.info.memory.textures);
      
      // Setup a frame-based memory monitor (30 frames interval check)
      let frameCount = 0;
      const trackMemory = () => {
        frameCount++;
        
        // Every 30 frames, check if memory is increasing
        if (frameCount % 30 === 0) {
          console.log('Geoms:', renderer.info.memory.geometries, 
                      'Texs:', renderer.info.memory.textures);
          
          // If that keeps climbing, you're still holding onto something (from screenshot)
          // Here we could add additional leak detection logic if needed
        }
        
        requestAnimationFrame(trackMemory);
      };
      
      trackMemory();
    },
    
    // Query driver limits at startup - from screenshot part 2
    setGPUQueryLimits: (gl) => {
      if (!gl) return;
      
      try {
        // From the screenshot: query these limits and print them
        console.log('WEBGL_debug_renderer_info:', gl.getParameter(
          gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL
        ));
        console.log('MAX_TEXTURE_SIZE:', gl.getParameter(gl.MAX_TEXTURE_SIZE));
        console.log('MAX_RENDERBUFFER_SIZE:', gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
        console.log('MAX_TEXTURE_IMAGE_UNITS:', gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
        console.log('MAX_VERTEX_UNIFORM_VECTORS:', gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
        
        // If you're near any of these, you'll need to cut back further (from screenshot advice)
      } catch (e) {
        console.error('Failed to query WebGL limits:', e);
      }
    },
    
    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready" || state.phase === "error") {
          return { phase: "playing", errorMessage: null };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ 
        phase: "ready", 
        contextErrors: 0,
        errorMessage: null 
      }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    },
    
    reportContextError: (error) => {
      const { contextErrors, rendererType } = get();
      const newErrorCount = contextErrors + 1;
      
      // If we've had too many errors, switch to fallback renderer
      if (newErrorCount >= 3 && rendererType !== "fallback") {
        set({
          contextErrors: newErrorCount,
          rendererType: "fallback",
          errorMessage: error || "Too many WebGL context errors. Switched to fallback renderer."
        });
        console.error("Too many WebGL context errors, switching to fallback renderer");
      } else {
        set({
          contextErrors: newErrorCount,
          errorMessage: error || "WebGL context error occurred"
        });
      }
    },
    
    resetContextErrors: () => {
      set({
        contextErrors: 0,
        errorMessage: null
      });
    },
    
    setRendererType: (type) => {
      set({
        rendererType: type
      });
    },
    
    fallbackToBasicRenderer: () => {
      set({
        rendererType: "fallback",
        errorMessage: "Using fallback renderer for better compatibility"
      });
    },
    
    // WebGL performance optimization
    setWebGLPerformanceMode: (mode) => {
      set({ webGLPerformanceMode: mode });
    },
    
    optimizeForWebGL: () => {
      const { isWebGLOptimized } = get();
      
      // Only apply optimizations once
      if (isWebGLOptimized) return;
      
      // Apply optimizations for WebGL rendering
      set({ 
        webGLPerformanceMode: "battery-saving",  // Most conservative mode
        isWebGLOptimized: true 
      });
      
      console.log("Applying WebGL performance optimizations");
      
      // Apply global WebGL optimizations
      if (typeof window !== 'undefined') {
        try {
          // Force a lower pixel ratio for better performance
          if (window.devicePixelRatio > 1) {
            // @ts-ignore - Add a property to store the original pixelRatio
            window._originalPixelRatio = window.devicePixelRatio;
            // @ts-ignore - Mock the devicePixelRatio getter
            Object.defineProperty(window, 'devicePixelRatio', {
              get: function() { return 1; }
            });
          }
          
          // Apply a throttled requestAnimationFrame
          const originalRequestAnimationFrame = window.requestAnimationFrame;
          let lastFrameTime = 0;
          const targetFPS = 30; // 30 FPS for better balance of performance and smoothness (from screenshot)
          const frameInterval = 1000 / targetFPS;
          
          // @ts-ignore - TypeScript doesn't like us modifying built-ins
          window.requestAnimationFrame = function(callback) {
            const currentTime = performance.now();
            const delta = currentTime - lastFrameTime;
            
            if (delta < frameInterval) {
              // Skip this frame to maintain target FPS
              // We need to cast to number to satisfy the return type
              return setTimeout(() => {
                lastFrameTime = performance.now();
                callback(lastFrameTime);
              }, frameInterval - delta) as unknown as number;
            }
            
            lastFrameTime = currentTime;
            return originalRequestAnimationFrame(callback);
          };
          
          // Add a flag to indicate whether WebGL is usable
          // @ts-ignore - Add property to window
          window.__WEBGL_OPTIMIZED = true;
          
          // From the screenshot: Manual cleaning + Context Handlers
          // Track consecutive failures for context loss
          let consecutiveFailures = 0;
          const maxConsecutiveFailures = 3;
          
          // Add a global error handler for WebGL context loss events
          window.addEventListener('webglcontextlost', (event) => {
            // This is critical - preventDefault allows context to be restored later
            event.preventDefault();
            
            console.warn('WebGL context lost - pausing render loop');
            consecutiveFailures++;
            
            if (consecutiveFailures >= maxConsecutiveFailures) {
              // @ts-ignore - Mark WebGL as unreliable
              window.__WEBGL_RELIABLE = false;
              console.error('Too many WebGL context errors, switching to fallback renderer');
              get().reportContextError('WebGL context lost detected in Visualization component');
            }
          });
          
          // Handle context restoration (clean up and reinitialize resources)
          window.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored - resuming render loop');
            consecutiveFailures = 0;
            
            // Re-optimizing after context restore
            setTimeout(() => {
              // Force garbage collection (indirectly, this is the best we can do)
              try {
                const arr = new Array(100).fill(new Array(1000000));
                arr.length = 0;
              } catch (e) {
                // Ignore allocation errors
              }
            }, 100);
          });
          
          console.log("Successfully applied WebGL throttling for stability");
        } catch (err) {
          console.error("Failed to apply WebGL optimizations:", err);
        }
      }
    }
  }))
);

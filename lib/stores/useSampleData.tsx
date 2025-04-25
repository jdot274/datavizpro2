import { create } from 'zustand';
import { useVisualization } from './useVisualization';
import { DataSource, VisualizationType } from '@/types';
import { sampleSineWaveSurface, sampleFinancialData, sampleScatterData } from '../sampleData';

interface SampleDataState {
  isLoading: boolean;
  currentSample: string | null;
  setSampleData: (sampleName: 'sineWaveSurface' | 'financialData' | 'scatterData', type?: VisualizationType) => void;
}

/**
 * Store for handling sample data
 * 
 * This store manages loading sample data into the visualization
 */
export const useSampleData = create<SampleDataState>((set, get) => ({
  isLoading: false,
  currentSample: null,
  
  setSampleData: (sampleName, type) => {
    // Get the visualization store function to update the data
    const visualizationStore = useVisualization.getState();
    
    set({ isLoading: true });
    
    // First clear the current data to properly clean up WebGL contexts
    visualizationStore.setData({
      ...visualizationStore.data,
      data: null
    });
    
    // Add a delay before setting new data to ensure contexts are properly disposed
    setTimeout(() => {
      let data;
      let visualizationType = type;
      
      switch(sampleName) {
        case 'sineWaveSurface':
          data = sampleSineWaveSurface;
          visualizationType = visualizationType || 'surface';
          break;
        case 'financialData':
          data = sampleFinancialData;
          visualizationType = visualizationType || 'bar';
          break;
        case 'scatterData':
          data = sampleScatterData;
          visualizationType = visualizationType || 'scatter';
          break;
        default:
          data = sampleSineWaveSurface;
          visualizationType = visualizationType || 'surface';
      }
      
      // Update the visualization using the store functions
      visualizationStore.setVisualizationType(visualizationType);
      
      // Update the visualization data
      // Making sure dimensions are in the correct format with tuple notation
      const dimensions = {
        xRange: data.dimensions.xRange as [number, number],
        yRange: data.dimensions.yRange as [number, number],
        zRange: data.dimensions.zRange as [number, number]
      };
      
      visualizationStore.setData({
        type: visualizationType,
        source: 'sample',
        data: data.data,
        dimensions: dimensions,
        metadata: data.metadata
      });
      
      // Reset errors the proper way through state
      useVisualization.setState({ error: null });
      
      // Add a small delay before marking loading as complete
      // This ensures all data is properly loaded and rendered
      setTimeout(() => {
        set({ 
          isLoading: false,
          currentSample: sampleName
        });
      }, 300);
    }, 800);
  }
}));
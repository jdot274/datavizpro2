// This is a client-side wrapper around the server Excel parsing API
// The actual parsing will be done on the server

import { ExcelParseResult } from "../../types";

// Utility to prepare Excel file for upload
export async function prepareExcelFile(file: File): Promise<{ file: File; sheet?: string }> {
  // Validate file type
  if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
    throw new Error("Invalid file format. Please upload an Excel or CSV file.");
  }
  
  return { file };
}

// Function to extract sheet names from Excel file (if needed in the future)
// This would be a server-side operation but we're providing a client interface
export async function getExcelSheets(file: File): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await fetch("/api/excel/sheets", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get Excel sheets: ${errorText}`);
    }
    
    const result = await response.json();
    return result.sheets || [];
  } catch (error) {
    console.error("Error getting Excel sheets:", error);
    return [];
  }
}

// Utility to convert raw Excel data to 3D visualization format
export function processExcelData(data: any[][], options: { 
  xColumn?: number; 
  yColumn?: number; 
  zColumn?: number;
  hasHeaders?: boolean;
} = {}): ExcelParseResult {
  // Default options
  const {
    xColumn = 0,
    yColumn = 1,
    zColumn = 2,
    hasHeaders = true
  } = options;
  
  if (!data || data.length === 0) {
    return {
      success: false,
      error: "No data found in the Excel file"
    };
  }
  
  try {
    let headers: string[] = [];
    let startRow = 0;
    
    // Extract headers if present
    if (hasHeaders) {
      headers = data[0].map(cell => cell?.toString() || "");
      startRow = 1;
    } else {
      // Generate default headers
      headers = ["X", "Y", "Z"];
    }
    
    // Check if we have enough columns
    const maxColumn = Math.max(xColumn, yColumn, zColumn);
    const hasEnoughColumns = data.some(row => row.length > maxColumn);
    
    if (!hasEnoughColumns) {
      return {
        success: false,
        error: "The data doesn't have enough columns for 3D visualization"
      };
    }
    
    // Extract data points
    const xValues: number[] = [];
    const yValues: number[] = [];
    const zValues: number[] = [];
    
    // For matrix-style data (already in a grid format)
    if (data[0].length > 3 && data.length > 3) {
      // Assume it's already in a grid format suitable for surface plotting
      const processedData: number[][] = [];
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        const processedRow: number[] = [];
        
        for (let j = 0; j < row.length; j++) {
          const value = parseFloat(row[j]);
          if (!isNaN(value)) {
            processedRow.push(value);
            zValues.push(value);
          } else {
            processedRow.push(0);
          }
        }
        
        if (processedRow.length > 0) {
          processedData.push(processedRow);
        }
      }
      
      // Generate x and y ranges
      for (let i = 0; i < processedData.length; i++) {
        xValues.push(i);
      }
      
      for (let j = 0; j < processedData[0].length; j++) {
        yValues.push(j);
      }
      
      return {
        success: true,
        data: processedData,
        headers,
        dimensions: {
          xRange: [Math.min(...xValues), Math.max(...xValues)],
          yRange: [Math.min(...yValues), Math.max(...yValues)],
          zRange: [Math.min(...zValues), Math.max(...zValues)]
        }
      };
    } else {
      // Process as scatter data points
      // Extract X, Y, Z columns
      for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        
        const x = parseFloat(row[xColumn]);
        const y = parseFloat(row[yColumn]);
        const z = parseFloat(row[zColumn]);
        
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          xValues.push(x);
          yValues.push(y);
          zValues.push(z);
        }
      }
      
      // Convert scatter data to a grid for surface visualization
      if (xValues.length > 0) {
        // For scatter data, we'll need to interpolate to get a surface
        // This is a simplified approach - in a real app, you'd use proper interpolation
        
        // Sort unique x and y values
        const uniqueX = Array.from(new Set(xValues)).sort((a, b) => a - b);
        const uniqueY = Array.from(new Set(yValues)).sort((a, b) => a - b);
        
        // Create a grid
        const gridData: number[][] = [];
        
        for (let i = 0; i < uniqueX.length; i++) {
          const row: number[] = [];
          for (let j = 0; j < uniqueY.length; j++) {
            // Find the closest data point
            let closestIdx = 0;
            let minDist = Infinity;
            
            for (let k = 0; k < xValues.length; k++) {
              const dist = Math.sqrt(
                Math.pow(xValues[k] - uniqueX[i], 2) + 
                Math.pow(yValues[k] - uniqueY[j], 2)
              );
              
              if (dist < minDist) {
                minDist = dist;
                closestIdx = k;
              }
            }
            
            row.push(zValues[closestIdx]);
          }
          
          gridData.push(row);
        }
        
        return {
          success: true,
          data: gridData,
          headers,
          dimensions: {
            xRange: [Math.min(...xValues), Math.max(...xValues)],
            yRange: [Math.min(...yValues), Math.max(...yValues)],
            zRange: [Math.min(...zValues), Math.max(...zValues)]
          }
        };
      }
    }
    
    return {
      success: false,
      error: "Could not extract usable 3D data from the file"
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error processing Excel data"
    };
  }
}

/**
 * Excel Service
 * Handles the processing and parsing of Excel files for data visualization
 */

import * as XLSX from 'xlsx';
import { ExcelParseResult } from '../types';

/**
 * Get sheet names from an Excel file
 */
export async function getExcelSheets(fileBuffer: Buffer): Promise<string[]> {
  try {
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // Return the sheet names
    return workbook.SheetNames;
  } catch (error) {
    console.error('Error getting Excel sheets:', error);
    throw new Error('Failed to read Excel file');
  }
}

/**
 * Parse an Excel file and extract data for visualization
 */
export async function parseExcelFile(fileBuffer: Buffer, sheetName?: string): Promise<ExcelParseResult> {
  try {
    // Read the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // If sheet name is not provided, use the first sheet
    const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
    
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName || 'First sheet'}`);
    }
    
    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Check if there's any data
    if (!jsonData || jsonData.length === 0) {
      return {
        success: false,
        error: 'No data found in the Excel file'
      };
    }
    
    // Process the data
    return processExcelData(jsonData as any[][]);
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing Excel file'
    };
  }
}

/**
 * Process the Excel data for visualization
 */
function processExcelData(data: any[][]): ExcelParseResult {
  // Remove empty rows
  const filteredData = data.filter(row => row.length > 0);
  
  if (filteredData.length === 0) {
    return {
      success: false,
      error: 'No data found after filtering empty rows'
    };
  }
  
  // Check if the first row contains headers
  const hasHeaders = isHeaderRow(filteredData[0]);
  
  // Extract headers and data
  let headers: string[] = [];
  let numericData: number[][] = [];
  
  if (hasHeaders) {
    headers = filteredData[0].map(header => header?.toString() || '');
    numericData = filteredData.slice(1).map(row => 
      row.map(cell => parseFloat(cell) || 0)
    );
  } else {
    // Generate default headers (Column1, Column2, etc.)
    headers = Array.from({ length: filteredData[0].length }, (_, i) => `Column${i+1}`);
    numericData = filteredData.map(row => 
      row.map(cell => parseFloat(cell) || 0)
    );
  }
  
  // Determine if this is grid data (suitable for surface plot)
  const isGrid = isGridData(numericData);
  
  if (isGrid) {
    // For grid data, we will create a surface visualization
    return processGridData(numericData, headers);
  } else {
    // For non-grid data, we will create a scatter or line visualization
    return processScatterData(numericData, headers);
  }
}

/**
 * Check if the data is in a grid format (suitable for surface plots)
 */
function isGridData(data: number[][]): boolean {
  // Grid data should have consistent row lengths and at least 3x3 dimensions
  if (data.length < 3) return false;
  
  const firstRowLength = data[0].length;
  if (firstRowLength < 3) return false;
  
  // Check if all rows have the same length
  return data.every(row => row.length === firstRowLength);
}

/**
 * Check if a row is likely to be a header row
 */
function isHeaderRow(row: any[]): boolean {
  // A header row is likely to contain string values
  return row.some(cell => 
    typeof cell === 'string' && 
    isNaN(parseFloat(cell)) && 
    cell.trim() !== ''
  );
}

/**
 * Process grid data for surface visualization
 */
function processGridData(data: number[][], headers: string[]): ExcelParseResult {
  // Calculate the min/max values for each dimension
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const row of data) {
    for (const value of row) {
      minZ = Math.min(minZ, value);
      maxZ = Math.max(maxZ, value);
    }
  }
  
  return {
    success: true,
    data: data,
    headers: headers,
    dimensions: {
      xRange: [0, data.length - 1],
      yRange: [0, data[0].length - 1],
      zRange: [minZ, maxZ]
    },
    metadata: {
      title: 'Excel Data Visualization',
      xLabel: headers[0] || 'X',
      yLabel: headers[1] || 'Y',
      zLabel: headers[2] || 'Z'
    }
  };
}

/**
 * Process scatter data for point-based visualization
 */
function processScatterData(data: number[][], headers: string[]): ExcelParseResult {
  // For scatter plots, we need at least 2 columns (X and Y)
  if (data[0].length < 2) {
    return {
      success: false,
      error: 'At least 2 columns are required for visualization'
    };
  }
  
  // Calculate the min/max values for each dimension
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  const is3D = data[0].length >= 3;
  
  // Convert the columnar data to [x,y,z] format
  const pointsData: number[][] = [];
  
  for (const row of data) {
    const x = row[0];
    const y = row[1];
    const z = is3D ? row[2] : 0;
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    
    if (is3D) {
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    
    pointsData.push(is3D ? [x, y, z] : [x, y, 0]);
  }
  
  // If Z is not present, set sensible defaults
  if (!is3D) {
    minZ = 0;
    maxZ = 0;
  }
  
  return {
    success: true,
    data: pointsData,
    headers: headers,
    dimensions: {
      xRange: [minX, maxX],
      yRange: [minY, maxY],
      zRange: [minZ, maxZ]
    },
    metadata: {
      title: 'Excel Data Visualization',
      xLabel: headers[0] || 'X',
      yLabel: headers[1] || 'Y',
      zLabel: headers[2] || 'Z'
    }
  };
}

export const excelService = {
  getExcelSheets,
  parseExcelFile
};
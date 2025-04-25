import * as XLSX from 'xlsx';
import { ExcelParseResult } from '../../client/src/types';

class DataService {
  /**
   * Parse Excel file and extract data for visualization
   */
  async parseExcelFile(fileBuffer: Buffer, sheetName?: string): Promise<ExcelParseResult> {
    try {
      // Read the workbook from buffer
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Get sheet (use specified sheet or first sheet)
      const sheet = sheetName 
        ? workbook.Sheets[sheetName]
        : workbook.Sheets[workbook.SheetNames[0]];
      
      if (!sheet) {
        return {
          success: false,
          error: `Sheet ${sheetName || 'not found'}`
        };
      }
      
      // Convert sheet to JSON (array format)
      const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
      
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No data found in Excel file'
        };
      }
      
      // Check if data is a grid (appropriate for surface visualization)
      const isGrid = this.isGridData(data);
      
      // Extract headers if present (first row)
      const hasHeaders = this.hasHeaders(data);
      let headers: string[] = [];
      
      if (hasHeaders) {
        headers = data[0].map((cell: any) => String(cell || ''));
        data.shift(); // Remove header row from data
      } else {
        // Generate default headers
        headers = ['X', 'Y', 'Z'];
      }
      
      // Process data based on format
      if (isGrid) {
        // For grid data, process as a surface
        return this.processGridData(data, headers);
      } else {
        // For column data, process as points
        return this.processColumnData(data, headers);
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error parsing Excel file'
      };
    }
  }
  
  /**
   * Get list of sheet names from an Excel file
   */
  async getExcelSheets(fileBuffer: Buffer): Promise<string[]> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      return workbook.SheetNames;
    } catch (error) {
      console.error('Error getting Excel sheets:', error);
      return [];
    }
  }
  
  /**
   * Check if data is in a grid format (appropriate for surface)
   */
  private isGridData(data: any[][]): boolean {
    // Check if all rows have the same length
    if (data.length < 2) return false;
    
    const firstRowLength = data[0].length;
    if (firstRowLength < 2) return false;
    
    // Check if most cells contain numeric values
    let numericCount = 0;
    let totalCount = 0;
    
    for (let i = 0; i < Math.min(10, data.length); i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (data[i][j] !== undefined) {
          totalCount++;
          if (typeof data[i][j] === 'number' || !isNaN(Number(data[i][j]))) {
            numericCount++;
          }
        }
      }
    }
    
    const numericRatio = numericCount / (totalCount || 1);
    return numericRatio > 0.8;
  }
  
  /**
   * Check if data has headers
   */
  private hasHeaders(data: any[][]): boolean {
    if (data.length < 2) return false;
    
    // Check if first row has string values and second row has numeric values
    const firstRow = data[0];
    const secondRow = data[1];
    
    let firstRowStrings = 0;
    let secondRowNumbers = 0;
    
    for (let i = 0; i < firstRow.length; i++) {
      if (typeof firstRow[i] === 'string') {
        firstRowStrings++;
      }
      
      if (secondRow && typeof secondRow[i] === 'number' || !isNaN(Number(secondRow[i]))) {
        secondRowNumbers++;
      }
    }
    
    return firstRowStrings > 0 && secondRowNumbers > 0;
  }
  
  /**
   * Process grid data for surface visualization
   */
  private processGridData(data: any[][], headers: string[]): ExcelParseResult {
    try {
      // Convert all values to numbers
      const numericData: number[][] = data.map(row => 
        row.map((cell: any) => {
          const num = Number(cell);
          return isNaN(num) ? 0 : num;
        })
      );
      
      // Find ranges
      let minValue = Number.POSITIVE_INFINITY;
      let maxValue = Number.NEGATIVE_INFINITY;
      
      for (const row of numericData) {
        for (const value of row) {
          if (!isNaN(value)) {
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
          }
        }
      }
      
      return {
        success: true,
        data: numericData,
        headers,
        dimensions: {
          xRange: [0, numericData.length - 1],
          yRange: [0, numericData[0].length - 1],
          zRange: [minValue, maxValue]
        },
        metadata: {
          title: 'Excel Data Visualization',
          xLabel: headers[0] || 'X',
          yLabel: headers[1] || 'Y',
          zLabel: headers[2] || 'Z'
        }
      };
    } catch (error) {
      console.error('Error processing grid data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing grid data'
      };
    }
  }
  
  /**
   * Process column data for point-based visualization
   */
  private processColumnData(data: any[][], headers: string[]): ExcelParseResult {
    try {
      // Extract X, Y, Z columns (assuming first 3 columns)
      const pointData: number[][] = [];
      
      for (const row of data) {
        if (row.length >= 3) {
          const x = Number(row[0]);
          const y = Number(row[1]);
          const z = Number(row[2]);
          
          if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
            pointData.push([x, y, z]);
          }
        }
      }
      
      if (pointData.length === 0) {
        return {
          success: false,
          error: 'Could not extract valid X, Y, Z points from data'
        };
      }
      
      // Find ranges
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      let minZ = Number.POSITIVE_INFINITY;
      let maxZ = Number.NEGATIVE_INFINITY;
      
      for (const [x, y, z] of pointData) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
      
      // For point data, create a grid by interpolating points
      const gridSize = 50;
      const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
      
      // Normalize data to fit grid
      const normalizeX = (x: number) => Math.floor(((x - minX) / (maxX - minX)) * (gridSize - 1));
      const normalizeY = (y: number) => Math.floor(((y - minY) / (maxY - minY)) * (gridSize - 1));
      
      // Fill grid with data points
      for (const [x, y, z] of pointData) {
        const gridX = normalizeX(x);
        const gridY = normalizeY(y);
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
          grid[gridX][gridY] = z;
        }
      }
      
      return {
        success: true,
        data: grid,
        headers,
        dimensions: {
          xRange: [minX, maxX],
          yRange: [minY, maxY],
          zRange: [minZ, maxZ]
        },
        metadata: {
          title: 'Excel Point Data Visualization',
          xLabel: headers[0] || 'X',
          yLabel: headers[1] || 'Y',
          zLabel: headers[2] || 'Z'
        }
      };
    } catch (error) {
      console.error('Error processing column data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing column data'
      };
    }
  }
}

export const dataService = new DataService();

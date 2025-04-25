// Script to create a sample Excel file for 3D visualization
import * as XLSX from 'xlsx';
import * as fs from 'fs';

// Create a sine wave surface
function createSineWaveSurface() {
  const workbook = XLSX.utils.book_new();
  const sheetData = [];

  // Add header row with x coordinates
  const headerRow = [''];
  for (let x = -5; x <= 5; x += 0.5) {
    headerRow.push(x.toFixed(1));
  }
  sheetData.push(headerRow);

  // Create the data grid
  for (let y = -5; y <= 5; y += 0.5) {
    const row = [y.toFixed(1)]; // First column is y coordinate
    for (let x = -5; x <= 5; x += 0.5) {
      // Calculate z using the sine function
      const z = Math.sin(Math.sqrt(x * x + y * y)) * Math.cos(y * 0.5);
      row.push(z.toFixed(4));
    }
    sheetData.push(row);
  }

  // Create worksheet and add to workbook
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "SineWaveSurface");

  return workbook;
}

// Create a financial data sheet with multiple datasets
function createFinancialData() {
  const workbook = XLSX.utils.book_new();
  const sheetData = [
    ["Date", "Stock A", "Stock B", "Stock C", "Stock D"]
  ];

  // Base values for stocks
  let stockA = 100;
  let stockB = 150;
  let stockC = 85;
  let stockD = 200;

  // Generate 100 days of stock data with some patterns
  const startDate = new Date(2023, 0, 1); // January 1, 2023
  for (let i = 0; i < 100; i++) {
    // Calculate date for this row
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Add some randomness and trends to stock values
    stockA += (Math.random() - 0.48) * 5; // Slight upward trend
    stockB += (Math.random() - 0.5) * 8; // More volatile
    stockC += (Math.random() - 0.52) * 3 + Math.sin(i/10) * 2; // Cyclical pattern
    stockD += (Math.random() - 0.45) * 6 - (i > 50 ? 1 : 0); // Upward then downward
    
    // Ensure stocks don't go negative
    stockA = Math.max(stockA, 10);
    stockB = Math.max(stockB, 10);
    stockC = Math.max(stockC, 10);
    stockD = Math.max(stockD, 10);
    
    sheetData.push([
      dateString,
      stockA.toFixed(2),
      stockB.toFixed(2),
      stockC.toFixed(2),
      stockD.toFixed(2)
    ]);
  }

  // Create worksheet and add to workbook
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "StockData");

  return workbook;
}

// Create a heatmap dataset
function createHeatmapData() {
  const workbook = XLSX.utils.book_new();
  const sheetData = [];

  // Create a grid of values that will form a heatmap
  for (let y = 0; y < 20; y++) {
    const row = [];
    for (let x = 0; x < 20; x++) {
      // Create an interesting pattern for the heatmap
      const value = 50 + 
                   40 * Math.sin(x / 3) * Math.cos(y / 2) + 
                   10 * Math.random();
      row.push(value.toFixed(1));
    }
    sheetData.push(row);
  }

  // Create worksheet and add to workbook
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "HeatmapData");

  return workbook;
}

// Create a combined workbook with all sheets
function createSampleWorkbook() {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Add sine wave surface sheet
  const sineWaveWB = createSineWaveSurface();
  const sineWaveSheet = sineWaveWB.Sheets["SineWaveSurface"];
  XLSX.utils.book_append_sheet(workbook, sineWaveSheet, "SineWaveSurface");
  
  // Add financial data sheet
  const financialWB = createFinancialData();
  const financialSheet = financialWB.Sheets["StockData"];
  XLSX.utils.book_append_sheet(workbook, financialSheet, "StockData");
  
  // Add heatmap data sheet
  const heatmapWB = createHeatmapData();
  const heatmapSheet = heatmapWB.Sheets["HeatmapData"];
  XLSX.utils.book_append_sheet(workbook, heatmapSheet, "HeatmapData");
  
  return workbook;
}

// Execute the creation process
console.log("Creating sample Excel file...");
const workbook = createSampleWorkbook();

// Save the workbook to a file
const outputPath = './client/public/samples/sample_data_for_viz.xlsx';
XLSX.writeFile(workbook, outputPath);

console.log(`Sample Excel file created at ${outputPath}`);
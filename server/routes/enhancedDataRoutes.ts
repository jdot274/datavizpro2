/**
 * Enhanced Data Processing Routes - API endpoints for advanced data processing
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Set up multer for file uploads
const upload = multer({ dest: 'temp/' });
const router = Router();

// Define project root path based on current file location 
// (for ES modules where __dirname is not available)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Helper function to call Python script and get results
async function callPythonScript(scriptPath: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(`Running python script: ${scriptPath} with args: ${args.join(', ')}`);
    // Try 'python3' instead of 'python' which may be required on some systems
    const process = spawn('python3', [scriptPath, ...args]);
    let result = '';
    let error = '';

    process.stdout.on('data', (data) => {
      result += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
      console.error(`Python error: ${error}`);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
      } else {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${result}`));
        }
      }
    });
  });
}

/**
 * Enhanced Excel processing with advanced analytics
 * POST /api/enhanced/excel
 */
router.post('/excel', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  try {
    const filePath = req.file.path;
    const sheetName = req.body.sheet || '';
    
    // Call Python script to process the Excel file
    const scriptPath = path.join(PROJECT_ROOT, 'server', 'services', 'enhancedDataService.py');
    const args = ['process_excel', filePath, sheetName];
    console.log(`Full script path: ${scriptPath}`);
    
    const result = await callPythonScript(scriptPath, args);
    
    // Clean up the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    return res.json({ ...result, success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing Excel file'
    });
  }
});

/**
 * Statistical analysis of data
 * POST /api/enhanced/stats
 */
router.post('/stats', async (req: Request, res: Response) => {
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ success: false, error: 'Invalid data format' });
  }
  
  try {
    // Save data to a temporary JSON file
    const tempFile = path.join('temp', `data_${uuidv4()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(req.body.data));
    
    // Call Python script for statistical analysis
    const scriptPath = path.join(PROJECT_ROOT, 'server', 'services', 'enhancedDataService.py');
    const args = ['stats', tempFile];
    console.log(`Full script path: ${scriptPath}`);
    
    const result = await callPythonScript(scriptPath, args);
    
    // Clean up the temporary file
    fs.unlink(tempFile, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    return res.json({ ...result, success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during statistical analysis'
    });
  }
});

/**
 * Trend analysis with curve fitting
 * POST /api/enhanced/trend
 */
router.post('/trend', async (req: Request, res: Response) => {
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ success: false, error: 'Invalid data format' });
  }
  
  try {
    // Save data to a temporary JSON file
    const tempFile = path.join('temp', `data_${uuidv4()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(req.body.data));
    
    // Call Python script for trend analysis
    const scriptPath = path.join(PROJECT_ROOT, 'server', 'services', 'enhancedDataService.py');
    const args = ['trend', tempFile];
    console.log(`Full script path: ${scriptPath}`);
    
    const result = await callPythonScript(scriptPath, args);
    
    // Clean up the temporary file
    fs.unlink(tempFile, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    return res.json({ ...result, success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during trend analysis'
    });
  }
});

/**
 * Generate enhanced heatmap data
 * POST /api/enhanced/heatmap
 */
router.post('/heatmap', async (req: Request, res: Response) => {
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ success: false, error: 'Invalid data format' });
  }
  
  try {
    // Save data to a temporary JSON file
    const tempFile = path.join('temp', `data_${uuidv4()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(req.body.data));
    
    // Call Python script for heatmap generation
    const scriptPath = path.join(PROJECT_ROOT, 'server', 'services', 'enhancedDataService.py');
    const args = ['heatmap', tempFile];
    console.log(`Full script path: ${scriptPath}`);
    
    const result = await callPythonScript(scriptPath, args);
    
    // Clean up the temporary file
    fs.unlink(tempFile, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    return res.json({ ...result, success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating heatmap data'
    });
  }
});

/**
 * Generate enhanced surface plot with interpolation
 * POST /api/enhanced/surface
 */
router.post('/surface', async (req: Request, res: Response) => {
  if (!req.body.data || !Array.isArray(req.body.data)) {
    return res.status(400).json({ success: false, error: 'Invalid data format' });
  }
  
  try {
    // Save data to a temporary JSON file
    const tempFile = path.join('temp', `data_${uuidv4()}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(req.body.data));
    
    // Call Python script for surface plot generation
    const scriptPath = path.join(PROJECT_ROOT, 'server', 'services', 'enhancedDataService.py');
    const args = ['surface', tempFile];
    console.log(`Full script path: ${scriptPath}`);
    
    const result = await callPythonScript(scriptPath, args);
    
    // Clean up the temporary file
    fs.unlink(tempFile, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    return res.json({ ...result, success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating surface plot data'
    });
  }
});

export default router;
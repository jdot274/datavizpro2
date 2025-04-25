/**
 * Excel Routes - API endpoints for Excel file processing
 */

import { Router } from 'express';
import multer from 'multer';
import { excelService } from '../services/excelService';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * Get sheet names from an Excel file
 * POST /api/excel/sheets
 */
router.post('/sheets', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Get sheet names from the Excel file
    const sheets = await excelService.getExcelSheets(req.file.buffer);
    
    res.json({
      success: true,
      sheets
    });
  } catch (error) {
    console.error('Error getting Excel sheets:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting Excel sheets'
    });
  }
});

/**
 * Parse Excel file for visualization
 * POST /api/excel/parse
 */
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Get the sheet name from the request body
    const sheetName = req.body.sheet;
    
    // Parse the Excel file
    const result = await excelService.parseExcelFile(req.file.buffer, sheetName);
    
    res.json(result);
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing Excel file'
    });
  }
});

export default router;
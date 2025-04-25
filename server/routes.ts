import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { dataService } from "./services/dataService";
import { executePythonCode } from "./services/pythonService";
import enhancedDataRouter from "./routes/enhancedDataRoutes";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register enhanced data routes
  app.use("/api/enhanced", enhancedDataRouter);
  
  // API routes
  
  // Python code execution endpoint
  app.post("/api/python/execute", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: "No Python code provided"
        });
      }
      
      // Execute Python code
      const result = await executePythonCode(code);
      res.json(result);
    } catch (error) {
      console.error("Error executing Python code:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error executing Python code"
      });
    }
  });
  
  // Excel file parsing endpoint
  app.post("/api/excel/parse", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded"
        });
      }
      
      // Parse Excel file
      const result = await dataService.parseExcelFile(req.file.buffer);
      res.json(result);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error parsing Excel file"
      });
    }
  });
  
  // Excel sheet names endpoint
  app.post("/api/excel/sheets", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded"
        });
      }
      
      // Get Excel sheet names
      const sheets = await dataService.getExcelSheets(req.file.buffer);
      res.json({ success: true, sheets });
    } catch (error) {
      console.error("Error getting Excel sheets:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting Excel sheets"
      });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}

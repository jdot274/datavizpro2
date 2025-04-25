import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const, // Fix TypeScript error by specifying 'true' as const
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Add route to handle the generated-icon.png
  app.get('/generated-icon.png', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'generated-icon.png'));
  });
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Use a more reliable path replacement to ensure script loading works
      template = template.replace(
        /src=["']\/src\/main\.tsx[^"']*["']/g,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      
      // Ensure base path is correctly set
      if (!template.includes('<base href="/"')) {
        template = template.replace('</head>', '<base href="/" /></head>');
      }
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      const error = e as Error;
      console.error("Error serving HTML:", error.message);
      vite.ssrFixStacktrace(error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    try {
      res.sendFile(path.resolve(distPath, "index.html"));
    } catch (error) {
      console.error("Error serving static index.html:", error);
      res.status(500).send("Error loading application. Please try again.");
    }
  });
  
  // Log that static serving is enabled
  log("Static file serving enabled from: " + distPath, "static");
}

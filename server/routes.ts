import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { randomUUID } from "crypto";
import mime from "mime-types";

// Custom share ID generator for branded URLs
async function generateCustomShareId(): Promise<string> {
  const prefix = "Astra"; // Astra personal branding
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    let result = "";
    
    // Generate 6 character code
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const shareId = `${prefix}-${result}`;
    
    // Check if this shareId already exists
    try {
      const existing = await storage.getFileByShareId(shareId);
      if (!existing) {
        return shareId; // Unique ID found
      }
    } catch (error) {
      return shareId; // If error checking, assume it's unique
    }
    
    attempts++;
  }
  
  // Fallback to UUID if we can't generate unique custom ID
  return `Astra-${randomUUID().slice(0, 8).toUpperCase()}`;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, (storage as any).getUploadsDir());
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Upload files
  app.post("/api/files/upload", upload.array("files"), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const createdFiles = [];
      for (const file of files) {
        const shareId = await generateCustomShareId();
        const createdFile = await storage.createFile({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          shareId,
          isFolder: false,
          parentId: req.body.parentId || undefined,
        });
        createdFiles.push(createdFile);
      }

      res.json(createdFiles);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Get file by share ID
  app.get("/api/share/:shareId", async (req, res) => {
    try {
      const file = await storage.getFileByShareId(req.params.shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  // Download file by share ID
  app.get("/api/share/:shareId/download", async (req, res) => {
    try {
      const file = await storage.getFileByShareId(req.params.shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Stream file content (for previews)
  app.get("/api/share/:shareId/content", async (req, res) => {
    try {
      const file = await storage.getFileByShareId(req.params.shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.setHeader('Content-Type', file.mimeType);
      
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Content streaming error:", error);
      res.status(500).json({ message: "Failed to stream file content" });
    }
  });

  // Download all files as ZIP
  app.get("/api/files/download-all", async (req, res) => {
    try {
      const files = await storage.getFiles();
      if (files.length === 0) {
        return res.status(404).json({ message: "No files to download" });
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="files.zip"');

      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      archive.on('error', (err) => {
        console.error('Archive error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to create archive" });
        }
      });

      archive.pipe(res);

      for (const file of files) {
        if (fs.existsSync(file.path) && !file.isFolder) {
          archive.file(file.path, { name: file.originalName });
        }
      }

      await archive.finalize();
    } catch (error) {
      console.error("Bulk download error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to download files" });
      }
    }
  });

  // Delete file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Delete all files
  app.delete("/api/files", async (req, res) => {
    try {
      await storage.deleteAllFiles();
      res.json({ message: "All files deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete files" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

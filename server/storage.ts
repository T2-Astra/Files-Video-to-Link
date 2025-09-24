import { type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

export interface IStorage {
  getFile(id: string): Promise<File | undefined>;
  getFileByShareId(shareId: string): Promise<File | undefined>;
  getFiles(): Promise<File[]>;
  getFilesByParent(parentId?: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<boolean>;
  deleteAllFiles(): Promise<void>;
}

export class MemStorage implements IStorage {
  private files: Map<string, File>;
  private uploadsDir: string;

  constructor() {
    this.files = new Map();
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByShareId(shareId: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.shareId === shareId
    );
  }

  async getFiles(): Promise<File[]> {
    return Array.from(this.files.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getFilesByParent(parentId?: string): Promise<File[]> {
    return Array.from(this.files.values())
      .filter((file) => file.parentId === parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const file: File = { 
      ...insertFile,
      isFolder: insertFile.isFolder ?? false,
      parentId: insertFile.parentId ?? null,
      id,
      createdAt: new Date()
    };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: string): Promise<boolean> {
    const file = this.files.get(id);
    if (!file) return false;

    // Delete physical file
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    this.files.delete(id);
    return true;
  }

  async deleteAllFiles(): Promise<void> {
    // Delete all physical files
    for (const file of Array.from(this.files.values())) {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting physical file:', error);
      }
    }
    
    this.files.clear();
  }

  getUploadsDir(): string {
    return this.uploadsDir;
  }
}

export const storage = new MemStorage();

import { nanoid } from "nanoid";

export interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  shareId: string;
  isFolder: boolean;
  parentId?: string;
  createdAt: string;
  dataUrl?: string; // For storing file content as base64
}

// Custom share ID generator for branded URLs
function generateCustomShareId(): string {
  const prefix = "Astra"; // Astra personal branding
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  
  // Generate 6 character code
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${result}`;
}

class ClientStorage {
  private storageKey = 'mediacraft-files';

  private getFiles(): FileItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveFiles(files: FileItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(files));
  }

  async uploadFiles(files: File[]): Promise<FileItem[]> {
    const existingFiles = this.getFiles();
    const newFiles: FileItem[] = [];

    for (const file of files) {
      const shareId = generateCustomShareId();
      const fileId = nanoid();
      
      // Convert file to base64 for storage
      const dataUrl = await this.fileToBase64(file);
      
      const fileItem: FileItem = {
        id: fileId,
        filename: `${Date.now()}-${fileId}${this.getFileExtension(file.name)}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        shareId,
        isFolder: false,
        createdAt: new Date().toISOString(),
        dataUrl
      };
      
      newFiles.push(fileItem);
    }

    const allFiles = [...existingFiles, ...newFiles];
    this.saveFiles(allFiles);
    return newFiles;
  }

  async getFilesList(): Promise<FileItem[]> {
    return this.getFiles().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getFileByShareId(shareId: string): Promise<FileItem | null> {
    const files = this.getFiles();
    return files.find(file => file.shareId === shareId) || null;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const files = this.getFiles();
    const filteredFiles = files.filter(file => file.id !== fileId);
    this.saveFiles(filteredFiles);
    return true;
  }

  async deleteAllFiles(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot) : '';
  }

  // Create download URL from base64 data
  createDownloadUrl(file: FileItem): string {
    if (!file.dataUrl) return '';
    return file.dataUrl;
  }
}

export const clientStorage = new ClientStorage();

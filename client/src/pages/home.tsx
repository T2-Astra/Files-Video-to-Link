import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UploadZone } from "@/components/upload-zone";
import { FileGrid } from "@/components/file-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, Share, Trash2, HelpCircle, Sparkles, Sun, Moon } from "lucide-react";

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  shareId: string;
  isFolder: boolean;
  parentId?: string;
  createdAt: string;
}

export default function Home() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { data: files = [], isLoading, refetch } = useQuery<FileItem[]>({
    queryKey: ["/api/files"],
  });

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleFilesUploaded = async () => {
    await refetch();
    setIsUploading(false);
    setUploadProgress(0);
    toast({
      title: "Upload complete",
      description: "Your files have been uploaded successfully",
    });
  };

  const handleDownloadAll = async () => {
    try {
      const response = await fetch('/api/files/download-all');
      if (!response.ok) {
        throw new Error('Failed to download files');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'files.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your files are being downloaded as a ZIP package",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await apiRequest("DELETE", "/api/files");
      await refetch();
      toast({
        title: "Files cleared",
        description: "All files have been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Failed to clear files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MediaCraft</h1>
                <p className="text-sm text-muted-foreground">Beautiful graphics made simple</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-help">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button 
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0"
                data-testid="button-theme-toggle"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <section className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">Upload Your Content</h2>
            <p className="text-muted-foreground text-lg">Drag and drop files or folders to get started. No design skills required!</p>
          </div>

          <UploadZone
            onFilesUploaded={handleFilesUploaded}
            onUploadStart={() => setIsUploading(true)}
            onUploadProgress={setUploadProgress}
          />

          {/* Upload Progress */}
          {isUploading && (
            <Card className="mt-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">Uploading Files</h4>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Please wait while your files are being uploaded...
              </div>
            </Card>
          )}
        </section>

        {/* Actions Bar */}
        {files.length > 0 && (
          <section className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Your Files</h3>
                  <p className="text-sm text-muted-foreground">
                    {files.length} files • {formatFileSize(totalSize)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleDownloadAll}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    data-testid="button-download-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                  <Button variant="secondary" data-testid="button-share-collection">
                    <Share className="h-4 w-4 mr-2" />
                    Share Collection
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearAll}
                    data-testid="button-clear-all"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Files Grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No files uploaded yet</h3>
              <p className="text-muted-foreground">Start by uploading some files using the drag and drop zone above</p>
            </div>
          ) : (
            <FileGrid files={files} onFileDeleted={refetch} />
          )}
        </section>
      </main>
    </div>
  );
}

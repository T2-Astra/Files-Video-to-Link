import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoPlayer } from "@/components/video-player";
import { Download, Share, Eye, FileText, Image, Video, File } from "lucide-react";
import { useState } from "react";
import { clientStorage } from "@/lib/clientStorage";

interface SharedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  shareId: string;
  isFolder: boolean;
  parentId?: string;
  createdAt: string;
  dataUrl?: string;
}

export default function Shared() {
  const { shareId } = useParams();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: file, isLoading, error } = useQuery<SharedFile>({
    queryKey: ["shared-file", shareId],
    queryFn: () => clientStorage.getFileByShareId(shareId!),
    enabled: !!shareId,
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return File;
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');
  const isPDF = (mimeType: string) => mimeType.includes('pdf');

  const handleDownload = () => {
    if (!file || !file.dataUrl) return;
    
    // Create download link from base64 data
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/s/${file?.shareId}`;
    await navigator.clipboard.writeText(shareUrl);
    // Show toast notification
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 p-8 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <File className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">File Not Found</h1>
          <p className="text-muted-foreground">
            The file you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  const FileIcon = getFileIcon(file.mimeType);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground truncate max-w-md">
                  {file.originalName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)} • Shared via MediaCraft
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleShare} variant="ghost" size="sm" data-testid="button-share">
                <Share className="h-5 w-5" />
              </Button>
              <Button onClick={handleDownload} data-testid="button-download">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          {/* Preview Area */}
          <div className="bg-muted min-h-[400px] flex items-center justify-center">
            {isVideo(file.mimeType) && file.dataUrl ? (
              <VideoPlayer
                src={file.dataUrl}
                poster={undefined}
                className="max-w-full max-h-[600px]"
              />
            ) : isImage(file.mimeType) && file.dataUrl ? (
              <img
                src={file.dataUrl}
                alt={file.originalName}
                className="max-w-full max-h-[600px] object-contain"
                data-testid="img-preview"
              />
            ) : isPDF(file.mimeType) ? (
              <div className="text-center py-12">
                <FileText className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">PDF Preview</p>
                <Button onClick={() => setIsPreviewOpen(true)} data-testid="button-preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Open Preview
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
                <Button onClick={handleDownload} data-testid="button-download-preview">
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {file.originalName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {file.mimeType} • {formatFileSize(file.size)} • 
                  Uploaded {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handleDownload} data-testid="button-download-info">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleShare} variant="outline" data-testid="button-share-info">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* PDF Embed Preview */}
        {isPDF(file.mimeType) && isPreviewOpen && file.dataUrl && (
          <Card className="mt-6 overflow-hidden">
            <iframe
              src={file.dataUrl}
              className="w-full h-[800px]"
              title={file.originalName}
            />
          </Card>
        )}
      </main>
    </div>
  );
}

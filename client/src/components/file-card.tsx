import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PreviewModal } from "./preview-modal";
import { ShareModal } from "./share-modal";
import { VideoPlayer } from "./video-player";
import { 
  Download, 
  Link, 
  Eye, 
  Play, 
  FileText, 
  Image, 
  Video, 
  Folder, 
  File,
  FolderOpen
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface FileCardProps {
  file: FileItem;
  onFileDeleted: () => void;
}

export function FileCard({ file, onFileDeleted }: FileCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return Folder;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return File;
  };

  const getFileTypeLabel = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return 'FOLDER';
    const ext = mimeType.split('/')[1]?.toUpperCase();
    return ext || 'FILE';
  };

  const getFileTypeColor = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return 'bg-blue-500';
    if (mimeType.startsWith('video/')) return 'bg-red-500';
    if (mimeType.startsWith('image/')) return 'bg-green-500';
    if (mimeType.includes('pdf')) return 'bg-red-500';
    if (mimeType.includes('adobe')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');
  const isPDF = (mimeType: string) => mimeType.includes('pdf');
  const isAdobe = (mimeType: string) => mimeType.includes('adobe') || file.originalName.endsWith('.psd');

  const FileIcon = getFileIcon(file.mimeType, file.isFolder);
  const timeAgo = new Date(file.createdAt).toLocaleDateString();

  const handleDownload = async () => {
    try {
      if (!file.dataUrl) {
        toast({
          title: "Download failed",
          description: "File data not available",
          variant: "destructive",
        });
        return;
      }
      
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `${file.originalName} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/s/${file.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share URL copied to clipboard",
      });
    } catch (error) {
      setIsShareOpen(true);
    }
  };

  const handlePreview = () => {
    if (file.isFolder) {
      // Handle folder opening logic here
      return;
    }
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Card className="file-card bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {/* Preview Area */}
        <div className="aspect-square relative overflow-hidden">
          {isVideo(file.mimeType) ? (
            <div className="relative w-full h-full bg-gray-900">
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Button
                  onClick={handlePreview}
                  size="lg"
                  className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
                  data-testid={`button-play-${file.id}`}
                >
                  <Play className="h-6 w-6 text-primary-foreground ml-1" />
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Video
              </div>
            </div>
          ) : isImage(file.mimeType) ? (
            <img
              src={`/api/share/${file.shareId}/content`}
              alt={file.originalName}
              className="w-full h-full object-cover"
              data-testid={`img-${file.id}`}
            />
          ) : file.isFolder ? (
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 w-full h-full flex items-center justify-center">
              <Folder className="h-16 w-16 text-blue-600" />
            </div>
          ) : isPDF(file.mimeType) ? (
            <div className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 w-full h-full flex items-center justify-center">
              <FileText className="h-16 w-16 text-red-600" />
            </div>
          ) : isAdobe(file.mimeType) ? (
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 w-full h-full flex items-center justify-center">
              <FileIcon className="h-16 w-16 text-purple-600" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 w-full h-full flex items-center justify-center">
              <FileIcon className="h-16 w-16 text-gray-600" />
            </div>
          )}
          
          {/* File Type Badge */}
          <div className={`absolute top-2 right-2 ${getFileTypeColor(file.mimeType, file.isFolder)} text-white px-2 py-1 rounded text-xs`}>
            {getFileTypeLabel(file.mimeType, file.isFolder)}
          </div>
        </div>

        {/* File Info */}
        <div className="p-4">
          <h4 className="font-semibold text-foreground mb-1 truncate" title={file.originalName}>
            {file.originalName}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {file.isFolder ? `Folder` : formatFileSize(file.size)} • {timeAgo}
          </p>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button 
              onClick={file.isFolder ? handlePreview : handleDownload}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
              data-testid={`button-${file.isFolder ? 'open' : 'download'}-${file.id}`}
            >
              {file.isFolder ? (
                <>
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Open
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
              title="Copy shareable link"
              data-testid={`button-copy-link-${file.id}`}
            >
              <Link className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
              title="Preview"
              data-testid={`button-preview-${file.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <PreviewModal
        file={file}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <ShareModal
        file={file}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
}

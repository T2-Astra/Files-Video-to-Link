import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./video-player";
import { Download, Link } from "lucide-react";
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

interface PreviewModalProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ file, isOpen, onClose }: PreviewModalProps) {
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');
  const isPDF = (mimeType: string) => mimeType.includes('pdf');

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
      toast({
        title: "Copy failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareUrl = `${window.location.origin}/s/${file.shareId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" data-testid="preview-modal">
        <DialogHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                {file.originalName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} • {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Preview Content */}
          <div className="bg-muted rounded-lg flex items-center justify-center min-h-[300px] mb-6">
            {isVideo(file.mimeType) && file.dataUrl ? (
              <VideoPlayer
                src={file.dataUrl}
                className="max-w-full max-h-[500px]"
              />
            ) : isImage(file.mimeType) && file.dataUrl ? (
              <img
                src={file.dataUrl}
                alt={file.originalName}
                className="max-w-full max-h-[500px] object-contain rounded"
                data-testid="preview-image"
              />
            ) : isPDF(file.mimeType) && file.dataUrl ? (
              <iframe
                src={file.dataUrl}
                className="w-full h-[500px] rounded"
                title={file.originalName}
                data-testid="preview-pdf"
              />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8" />
                </div>
                <p className="mb-4">Preview not available for this file type</p>
                <Button onClick={handleDownload} data-testid="button-download-preview">
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button onClick={handleDownload} data-testid="button-download-modal">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleCopyLink} variant="outline" data-testid="button-copy-link-modal">
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
            <div className="text-sm text-muted-foreground max-w-xs truncate">
              {shareUrl}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Copy, Mail } from "lucide-react";
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

interface ShareModalProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ file, isOpen, onClose }: ShareModalProps) {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/s/${file.shareId}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share URL copied to clipboard",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this file: ${file.originalName}`);
    const body = encodeURIComponent(`Hi,\n\nI wanted to share this file with you:\n\n${file.originalName}\n${shareUrl}\n\nShared via MediaCraft`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out this file I'm sharing: ${file.originalName}`);
    const url = encodeURIComponent(shareUrl);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(file.originalName);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="share-modal">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Share File</DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            data-testid="button-close-share"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shareable Link */}
          <div>
            <Label htmlFor="share-url" className="text-sm font-medium text-foreground mb-2 block">
              Shareable Link
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
                data-testid="input-share-url"
              />
              <Button onClick={handleCopyUrl} data-testid="button-copy-url">
                Copy
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">Share Options</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-3"
                data-testid="button-share-twitter"
              >
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-sm">
                  T
                </div>
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                onClick={handleLinkedInShare}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-3"
                data-testid="button-share-linkedin"
              >
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-sm">
                  in
                </div>
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button
                onClick={handleEmailShare}
                variant="outline"
                className="flex flex-col items-center space-y-2 h-auto py-3"
                data-testid="button-share-email"
              >
                <Mail className="w-6 h-6 text-gray-600" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

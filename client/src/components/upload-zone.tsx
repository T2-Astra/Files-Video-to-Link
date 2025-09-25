import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloudUpload, Plus, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onFilesUploaded: (files: File[]) => void;
  onUploadStart: () => void;
  onUploadProgress: (progress: number) => void;
}

export function UploadZone({ onFilesUploaded, onUploadStart, onUploadProgress }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    onUploadStart();

    try {
      let uploadedBytes = 0;
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

      // Simulate upload progress for UX
      const progressInterval = setInterval(() => {
        uploadedBytes += totalBytes * 0.1;
        const progress = Math.min((uploadedBytes / totalBytes) * 100, 90);
        onUploadProgress(progress);
      }, 100);

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 500));

      clearInterval(progressInterval);
      onUploadProgress(100);

      // Call the parent handler with the files
      onFilesUploaded(files);
      
      // Don't show success toast here - let parent handle it
    } catch (error) {
      console.error('Upload error in UploadZone:', error);
      
      // Don't show error toast here - let parent handle it
      // Just reset progress
      onUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragOver(false);
    uploadFiles(acceptedFiles);
  }, []);

  const onDragEnter = useCallback(() => {
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    noClick: true,
    multiple: true,
  });

  return (
    <Card 
      {...getRootProps()}
      className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragOver 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      }`}
      data-testid="upload-zone"
    >
      <input {...getInputProps()} data-testid="file-input" />
      <div className="upload-zone-content">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <CloudUpload className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Drop files anywhere</h3>
        <p className="text-muted-foreground mb-6">Support for images, videos, documents, and folders</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={open}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-choose-files"
          >
            <Plus className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
          <Button 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.webkitdirectory = true;
              input.multiple = true;
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                uploadFiles(files);
              };
              input.click();
            }}
            variant="secondary"
            data-testid="button-choose-folder"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Choose Folder
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Supported formats: JPG, PNG, GIF, MP4, MOV, PDF, PSD, AI, and more
        </p>
      </div>
    </Card>
  );
}

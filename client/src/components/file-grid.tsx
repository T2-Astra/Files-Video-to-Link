import { FileCard } from "./file-card";

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

interface FileGridProps {
  files: FileItem[];
  onFileDeleted: () => void;
}

export function FileGrid({ files, onFileDeleted }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file) => (
        <FileCard 
          key={file.id} 
          file={file} 
          onFileDeleted={onFileDeleted}
        />
      ))}
    </div>
  );
}

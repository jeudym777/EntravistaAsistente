import { useState, useRef } from 'react';
import type { AttachedFile } from '../types/index';

interface FileUploadAreaProps {
  attachments: AttachedFile[];
  onAddAttachment: (file: AttachedFile) => void;
  onRemoveAttachment: (fileId: string) => void;
}

export default function FileUploadArea({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  const processFile = (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large: ${file.name} (max 20MB)`);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`File type not supported: ${file.name}. Only images and PDFs allowed.`);
      return;
    }

    // Read file as data URL for images, file metadata for PDF
    const reader = new FileReader();
    reader.onload = (e) => {
      const attachedFile: AttachedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: file.type.startsWith('image/') ? (e.target?.result as string) : undefined,
        addedAt: new Date(),
      };
      onAddAttachment(attachedFile);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just store metadata
      const attachedFile: AttachedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        addedAt: new Date(),
      };
      onAddAttachment(attachedFile);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className="space-y-2">
      {/* Upload Button & Drop Zone - Minimal */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded p-2 text-center transition cursor-pointer ${
          isDragging
            ? 'border-blue-500/50 bg-blue-900/10'
            : 'border-gray-600/50 bg-gray-800/10 hover:border-gray-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1 text-gray-400 hover:text-gray-300 transition text-sm"
        >
          <span>➕</span>
          <span>{isDragging ? 'Drop here' : 'Add files'}</span>
        </button>
      </div>

      {/* Attached Files List - Compact */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 pl-1">📎 {attachments.length} file(s)</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-1.5 bg-gray-700/20 border border-gray-600/30 rounded text-xs group hover:bg-gray-700/30 transition"
              >
                {/* Preview for images */}
                {file.dataUrl && (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-6 h-6 object-cover rounded"
                  />
                )}

                {/* Icon for PDFs */}
                {!file.dataUrl && (
                  <span className="text-sm">{getFileIcon(file.type)}</span>
                )}

                {/* File name only */}
                <span className="text-gray-400 truncate text-xs flex-1">{file.name}</span>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveAttachment(file.id)}
                  className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

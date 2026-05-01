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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className="space-y-3">
      {/* Upload Button & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
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
          className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-blue-400 transition"
        >
          <span className="text-2xl">➕</span>
          <span className="text-sm font-semibold">
            {isDragging ? 'Drop files here' : 'Add images or PDFs'}
          </span>
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Drag & drop or click • Images & PDFs • Max 20MB each
        </p>
      </div>

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400">
            📎 Attached ({attachments.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-gray-700/50 border border-gray-600 rounded text-sm group hover:bg-gray-700/70 transition"
              >
                {/* Preview for images */}
                {file.dataUrl && (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}

                {/* Icon + Name for PDFs */}
                {!file.dataUrl && (
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate font-medium">{file.name}</p>
                  <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveAttachment(file.id)}
                  className="px-2 py-1 bg-red-600/0 hover:bg-red-600/50 text-red-400 hover:text-red-300 rounded transition opacity-0 group-hover:opacity-100"
                  title="Remove file"
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

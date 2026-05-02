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
    <div className="space-y-1">
      {/* Upload Zone - Compact drag and drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded p-2 transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20'
            : 'border-gray-600/40 bg-gray-800/20 hover:border-gray-500/60 hover:bg-gray-800/30'
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
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium transition-colors duration-200 py-0.5"
        >
          <span className={isDragging ? 'text-blue-400 text-base' : 'text-gray-400 hover:text-gray-300 text-base'}>{isDragging ? '📥' : '📎'}</span>
          <span className={isDragging ? 'text-blue-300 font-semibold' : 'text-gray-400 hover:text-gray-300 hidden sm:inline'}>
            {isDragging ? 'Drop' : 'Add'}
          </span>
        </button>
      </div>

      {/* Attached Files List - Compact and scrollable */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400">📎 Files ({attachments.length})</p>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 p-1.5 bg-gray-700/20 border border-gray-600/30 hover:border-gray-600/50 rounded text-xs group transition-all duration-200 hover:bg-gray-700/30"
              >
                {/* Preview for images */}
                {file.dataUrl ? (
                  <div className="flex-shrink-0 w-5 h-5 rounded overflow-hidden border border-gray-600/50">
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-sm">{getFileIcon(file.type)}</span>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate font-medium text-xs">{file.name}</p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onRemoveAttachment(file.id)}
                  className="flex-shrink-0 p-1 text-gray-500 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Remove"
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

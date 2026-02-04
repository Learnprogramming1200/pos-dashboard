"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, X, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadSuperAdminFileAction, uploadAdminFileAction } from "@/lib/server-actions";

interface FileUploadRowProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: React.ReactNode;
  id?: string;
  onChange: (value: File | string | null) => void;
  accept?: string;
  icon?: React.ReactNode;
  className?: string;
  value?: File | string | null;
  currentFileUrl?: string; // For displaying existing uploaded files
  showImagePreview?: boolean; // Enable image preview for image files
  imagePreviewSize?: { width: number; height: number }; // Custom preview size
  useAdminUpload?: boolean;
}

export function FileUploadRow({
  label,
  id,
  onChange,
  accept,
  icon,
  className,
  value,
  currentFileUrl,
  showImagePreview = false,
  imagePreviewSize = { width: 200, height: 200 },
  useAdminUpload = false,
  ...rest
}: FileUploadRowProps) {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (showImagePreview && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      }

      setUploading(true);
      try {
        const uploadAction = useAdminUpload ? uploadAdminFileAction : uploadSuperAdminFileAction;
        const result = await uploadAction(file);

        if (result.success && result.data) {
          onChange(result.data);
          // If we have a remote URL, we might want to use that for preview too, 
          // but keeping the local object URL for immediate feedback is often smoother.
        } else {
          console.error("Upload failed", result.error);
          onChange(file); // Fallback to file object
        }
      } catch (error) {
        console.error("Error uploading file", error);
        onChange(file); // Fallback to file object
      } finally {
        setUploading(false);
      }

    } else {
      onChange(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    // Reset the input
    const input = document.getElementById(id || '') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  /* Helper to render image preview - extracted for cleaner render */
  const renderImagePreview = (imageSrc: string, alt: string = "Preview") => {
    const { width, height } = imagePreviewSize;

    return (
      <div className="relative inline-block group">
        <div
          className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: '100%'
          }}
        >
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={`(max-width: ${width}px) 100vw, ${width}px`}
            onError={(e) => {
              console.error('Image failed to load:', e);
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="bg-white/90 text-red-600 dark:bg-gray-800/90 hover:bg-red-600 hover:text-white rounded-full p-2 transition-colors transform hover:scale-110 shadow-lg"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [internalId] = useState(() => `file-upload-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = id || internalId;

  return (
    <div className={"flex flex-col gap-3 " + (className || "")}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Image Preview Area */}
      {showImagePreview && (
        <div className="flex flex-col gap-3">
          {value && imagePreviewUrl && renderImagePreview(imagePreviewUrl, "Uploaded Image")}

          {typeof value === 'string' && !imagePreviewUrl && renderImagePreview(value, "Uploaded Image")}

          {!value && currentFileUrl && renderImagePreview(currentFileUrl, "Current Image")}

          {/* Placeholder for when no image is selected yet */}
          {!value && !currentFileUrl && (
            <div
              className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{
                width: `${imagePreviewSize.width}px`,
                height: `${imagePreviewSize.height}px`,
                maxWidth: '100%'
              }}
            >
              <div className="text-center text-gray-400 dark:text-gray-500 p-4">
                <ImageIcon className="mx-auto h-10 w-10 mb-3 opacity-80" />
                <p className="text-xs font-medium">No image selected</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Upload Control */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="sr-only"
            disabled={uploading}
            {...rest}
          />
          <label
            htmlFor={inputId}
            className={`
                flex items-center gap-2 px-4 py-2.5 
                bg-white dark:bg-gray-800 
                border border-gray-300 dark:border-gray-600 
                rounded-lg shadow-sm 
                text-sm font-medium text-gray-700 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-400 dark:hover:border-gray-500
                focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500
                cursor-pointer transition-all duration-200 ease-in-out
                ${uploading ? 'opacity-75 cursor-wait' : ''}
              `}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
            <span>{uploading ? 'Uploading...' : (value || currentFileUrl ? 'Change File' : 'Choose File')}</span>
          </label>
        </div>

        {/* File Info Display (Non-Image Mode) */}
        {!showImagePreview && (
          <div className="flex-1 min-w-0 py-2">
            {value ? (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 max-w-fit animate-in fade-in slide-in-from-left-2 duration-300">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs block">
                  {typeof value === 'string' ? (value.split('/').pop() || value) : value.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : currentFileUrl ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-900/20 max-w-fit">
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs block">
                  {currentFileUrl.split('/').pop() || 'Current File'}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center h-full pt-0.5">
                No file chosen
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info footer for image preview mode */}
      {showImagePreview && value && typeof value !== 'string' && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-1">
          <span>{(value.size / 1024 / 1024).toFixed(2)} MB</span>
          <span>•</span>
          <span className="truncate max-w-[200px]">{value.name}</span>
        </div>
      )}

      {/* Helper text if needed */}
      {showImagePreview && !value && !currentFileUrl && (
        <p className="text-xs text-gray-400 dark:text-gray-500 ml-1">
          Max 10MB. Recommended size {imagePreviewSize.width}x{imagePreviewSize.height}px.
        </p>
      )}
    </div>
  );
} 
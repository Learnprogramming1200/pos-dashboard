"use client";

import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadSectionProps {
  label?: string;
  id: string;
  accept?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  currentFileUrl?: string;
  required?: boolean;
  error?: string;
}

export function ImageUploadSection({
  label = "Product Image",
  id,
  accept = "image/*",
  onChange,
  value,
  currentFileUrl,
  required = false,
  error
}: ImageUploadSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        onChange(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        onChange(null);
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    onChange(file);
  };


  // Handle click to open file dialog
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get the display image (preview, current file, or placeholder)
  const displayImage = previewUrl || currentFileUrl;

  return (
    <div className="space-y-4">
      {/* Image Preview Area */}
      <div className="relative">
        {displayImage ? (
          // Show uploaded image with remove button
          <div className="relative w-full h-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
            <Image
              src={displayImage}
              alt="Product preview"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
            {/* Remove button in top-right corner */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Show placeholder when no image
          <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No image selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Upload Button */}
        <button
          type="button"
          onClick={handleClick}
          className="flex-1 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          Upload
        </button>
        
        {/* Remove All Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          Remove All
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
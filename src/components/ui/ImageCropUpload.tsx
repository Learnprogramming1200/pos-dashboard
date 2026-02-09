"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Cropper, { ReactCropperElement } from "react-cropper";
import Image from "next/image";
import "cropperjs/dist/cropper.css";
import { uploadSuperAdminFileAction, uploadAdminFileAction } from "@/lib/server-actions";

type ImageCropUploadProps = {
  value?: string | File | null;
  onChange: (value: string | File | null) => void;
  accept?: string;
  aspect?: number; // e.g., 1 for square
  viewSize?: number; // px of cropper viewport side
  previewSize?: { width: number; height: number };
  shape?: "circle" | "rect"; // crop shape mask
  previewMask?: "circle" | "rect"; // visual mask for preview only
  layout?: "vertical" | "horizontal"; // UI layout
  uploadButtonText?: string;
  removeButtonText?: string;
  id?: string;
  disabled?: boolean;
  maxSize?: { width: number; height: number; sizeKB: number }; // Max image size
  useAdminUpload?: boolean; // Use admin upload endpoint (/admin/upload with productImage)
  compact?: boolean; // Compact UI variant for tight spaces
};

export default function ImageCropUpload({
  value,
  onChange,
  accept = "image/*",
  aspect = 1,
  viewSize = 300,
  previewSize = { width: 96, height: 96 },
  shape = "rect",
  previewMask = "circle",
  layout = "vertical",
  uploadButtonText = "Upload",
  removeButtonText = "Remove",
  id,
  disabled = false,
  maxSize = { width: 256, height: 256, sizeKB: 10 },
  useAdminUpload = false,
  compact = false,
}: ImageCropUploadProps) {
  const isValidUrl = (url: any) => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url === 'null' || url === 'undefined') return false;
    // Basic check for relative path or absolute URL
    return url.startsWith('/') || url.startsWith('http');
  };

  const [previewSrc, setPreviewSrc] = useState<string | null>(
    typeof value === "string" && isValidUrl(value) ? value : null
  );
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [zoom, setZoom] = useState(1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cropperRef = useRef<ReactCropperElement | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  useEffect(() => {
    if (typeof value === "string") {
      setPreviewSrc(isValidUrl(value) ? value : null);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewSrc(isValidUrl(url) ? url : null);
      return () => URL.revokeObjectURL(url);
    } else if (!value) {
      setPreviewSrc(null);
    }
  }, [value]);


  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const readFileAsDataUrl = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const onFilePicked = useCallback(
    async (file: File | null) => {
      if (!file) return;
      try {
        setRawFile(file);
        const dataUrl = await readFileAsDataUrl(file);
        setRawImageUrl(dataUrl);
        setShowCropper(true);
        setZoom(1);
      } catch (error) {
        console.error("Unable to read file", error);
      }
    },
    [readFileAsDataUrl]
  );

  const onCropConfirm = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !rawImageUrl) return;
    setUploading(true);
    try {
      const canvas = cropper.getCroppedCanvas({
        imageSmoothingQuality: "high",
      });
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl && rawFile) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], rawFile.name, { type: blob.type });

          // Upload file to server - use admin upload if specified
          const uploadAction = useAdminUpload ? uploadAdminFileAction : uploadSuperAdminFileAction;
          const uploadResult = await uploadAction(file);
          if (uploadResult.success && uploadResult.data) {
            // Use the uploaded URL
            onChange(uploadResult.data);
            setPreviewSrc(uploadResult.data);
          } else {
            // Fallback to data URL if upload fails
            onChange(dataUrl);
            setPreviewSrc(dataUrl);
            console.error('Upload failed:', uploadResult.error);
          }
        } catch (e) {
          // Fallback to data URL on error
          onChange(dataUrl);
          setPreviewSrc(dataUrl);
          console.error('Error processing file:', e);
        }
      } else {
        onChange(dataUrl);
        setPreviewSrc(dataUrl);
      }
      setShowCropper(false);
      setRawImageUrl(null);
    } catch (error) {
      console.error('Error in crop confirm:', error);
    } finally {
      setUploading(false);
    }
  }, [onChange, rawFile, rawImageUrl, useAdminUpload]);

  const onRemove = useCallback(() => {
    setPreviewSrc(null);
    setRawFile(null);
    setRawImageUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFilePicked(file);
      }
    }
  }, [disabled, onFilePicked]);

  const containerPadding = compact ? "p-2" : "p-6";
  const boxSize = compact ? "w-[72px] h-[72px]" : "w-[120px] h-[120px]";

  return (
    <div>
      <div
        className={`bg-white dark:bg-[#242424] rounded-md border border-[#D8D9D9] dark:border-[#616161] overflow-hidden ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!previewSrc ? openFileDialog : undefined}
        style={{ cursor: !previewSrc && !disabled ? 'pointer' : 'default' }}
      >
        <div className={`${containerPadding} flex flex-col items-center`}>
          {previewSrc ? (
            <>
              <div className="w-full flex flex-col items-center justify-center">
                <div className={`${boxSize} bg-gray-100 dark:bg-[#1b1b1b] rounded-md flex items-center justify-center relative`}>
                  <Image
                    src={previewSrc as string}
                    alt="Preview"
                    fill
                    className="object-contain rounded-md"
                    sizes="120px"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    disabled={disabled}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Remove image"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!compact && (
                  <>
                    <p className="text-textMain dark:text-white text-[12px] font-normal pt-2 text-center">
                      Max. Image Size: {maxSize.sizeKB} MB
                    </p>

                    <p className="text-textMain dark:text-white text-sm font-semibold pt-2 text-center">
                      Drag or select your image
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                      disabled={disabled}
                      className="text-primary text-sm font-bold hover:text-primaryHover cursor-pointer pt-1"
                    >
                      Click to browse
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-full flex flex-col items-center justify-center">
                <div className={`${boxSize} bg-textMain2 dark:bg-[#1B1B1B] rounded-md flex items-center justify-center relative`}>
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    {/* Background */}
                    <rect width="120" height="120" rx="8" fill="#F3F4F6" className="dark:fill-gray-700" />

                    {/* Plus icon in top left */}
                    <g transform="translate(16, 16)">
                      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
                      <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Mountains/Hills */}
                    <path d="M20 80 L50 50 L80 60 L100 40 L100 120 L20 120 Z" fill="#3B82F6" opacity="0.8" />
                    <path d="M30 90 L60 60 L90 70 L100 60 L100 120 L30 120 Z" fill="#2563EB" opacity="0.9" />

                    {/* Sun/Moon */}
                    <circle cx="90" cy="30" r="12" fill="white" />
                  </svg>
                </div>

                {!compact && (
                  <>
                    <p className="text-textMain dark:text-white text-[12px] font-normal pt-2 text-center">
                      Max. Image Size: {maxSize.sizeKB} MB
                    </p>

                    <p className="text-textMain dark:text-white text-sm font-semibold pt-2 text-center">
                      Drag or select your image
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                      disabled={disabled}
                      className="text-primary text-sm font-bold hover:text-primaryHover cursor-pointer pt-1"
                    >
                      Click to browse
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFilePicked(e.target.files?.[0] || null)}
        disabled={disabled}
      />

      {showCropper && rawImageUrl && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-[#242424] rounded-lg border border-[#D8D9D9] dark:border-[#616161] p-3 sm:p-4 md:p-5 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">Crop Image</h3>
            <div
              className="mx-auto relative rounded-[2px] border border-[#D8D9D9] dark:border-[#616161] w-full"
              style={{
                aspectRatio: '1 / 1',
                maxWidth: '100%',
                height: windowSize.width > 0
                  ? `${Math.min(viewSize, windowSize.width * 0.8, windowSize.height * 0.5)}px`
                  : '300px'
              }}
            >
              <Cropper
                ref={cropperRef}
                src={rawImageUrl}
                aspectRatio={shape === "circle" ? aspect : undefined}
                viewMode={1}
                guides
                dragMode="move"
                background={false}
                responsive
                checkOrientation={false}
                autoCropArea={1}
                initialAspectRatio={aspect}
                style={{ width: "100%", height: "100%", borderRadius: shape === "circle" ? "999px" : undefined }}
                cropBoxResizable
                cropBoxMovable
                zoomOnTouch
                zoomOnWheel
                preview=".crop-preview-pane"
              />
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
                Preview
              </p>
              <div className="crop-preview-pane w-full h-36 sm:h-48 border border-dashed border-gray-300 dark:border-gray-700 rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => {
                  const nextZoom = parseFloat(e.target.value);
                  setZoom(nextZoom);
                  const cropper = cropperRef.current?.cropper;
                  if (cropper) {
                    cropper.zoomTo(nextZoom);
                  }
                }}
                className="flex-1"
              />
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowCropper(false)}
                className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary hover:bg-primaryHover text-white w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                onClick={onCropConfirm}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Crop & Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

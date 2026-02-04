"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadSuperAdminFileAction, uploadAdminFileAction } from "@/lib/server-actions";

type VideoCropUploadProps = {
  value?: string | File | null;
  onChange: (value: string | File | null) => void;
  accept?: string;
  previewSize?: { width: number; height: number };
  layout?: "vertical" | "horizontal"; // UI layout
  uploadButtonText?: string;
  removeButtonText?: string;
  id?: string;
  disabled?: boolean;
  maxSize?: { sizeMB: number }; // Max video size in MB
  maxDuration?: number; // Max duration in seconds
  showTrimControls?: boolean; // Whether to show trim controls
  showControls?: boolean; // Whether to show native video controls (default: true)
  useAdminUpload?: boolean; // Use admin upload endpoint (/admin/upload with productImage)
};

export default function VideoCropUpload({
  value,
  onChange,
  accept = "video/*",
  previewSize = { width: 320, height: 180 },
  layout = "vertical",
  uploadButtonText = "Upload",
  removeButtonText = "Remove",
  id,
  disabled = false,
  maxSize = { sizeMB: 100 },
  maxDuration,
  showTrimControls = false,
  showControls = true,
  useAdminUpload = false,
}: VideoCropUploadProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const [rawVideoUrl, setRawVideoUrl] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (typeof value === "string") {
      setPreviewSrc(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewSrc(url);
      return () => URL.revokeObjectURL(url);
    } else if (!value) {
      setPreviewSrc(null);
    }
  }, [value]);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const onFilePicked = useCallback((file: File | null) => {
    if (!file) return;

    setError(null);

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize.sizeMB) {
      setError(`File size exceeds maximum allowed size of ${maxSize.sizeMB} MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Use local url variable (avoid relying on state in the onloadedmetadata closure)
    const localUrl = URL.createObjectURL(file);
    setRawFile(file);
    setRawVideoUrl(localUrl);

    // Create detached video element to read metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = localUrl;

    // Add a console log so we can confirm this handler runs in console

    video.onloadedmetadata = async () => {

      const duration = video.duration;
      setVideoDuration(duration);
      setTrimStart(0);
      setTrimEnd(duration);

      if (maxDuration && duration > maxDuration) {
        setError(`Video duration (${Math.round(duration)}s) exceeds maximum allowed duration of ${maxDuration}s`);
        if (showTrimControls) {
          setShowTrimmer(true);
        } else {
          // cleanup localUrl safely
          URL.revokeObjectURL(localUrl);
          setRawVideoUrl(null);
          setRawFile(null);
        }
        return;
      }

      if (showTrimControls) {
        setShowTrimmer(true);
        return;
      }

      // Auto-upload if no trimmer required
      setUploading(true);
      try {
        const uploadAction = useAdminUpload ? uploadAdminFileAction : uploadSuperAdminFileAction;

        const uploadResult = await uploadAction(file);

        if (uploadResult?.success && uploadResult?.data) {
          onChange(uploadResult.data);
          setPreviewSrc(uploadResult.data);
        } else {
          // fallback to local blob URL so UI still shows the video
          onChange(file);
          setPreviewSrc(localUrl);
          setError('Upload failed: ' + (uploadResult?.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('[VideoCropUpload] Error uploading video:', err);
        onChange(file);
        setPreviewSrc(localUrl);
        setError('Error uploading video');
      } finally {
        setUploading(false);
        // cleanup local url that we created here (only revoke if still a blob)
        if (localUrl && localUrl.startsWith('blob:')) {
          URL.revokeObjectURL(localUrl);
        }
        setRawVideoUrl(null);
      }
    };

    video.onerror = () => {
      console.error('[VideoCropUpload] Failed to load video metadata');
      setError('Failed to load video file');
      URL.revokeObjectURL(localUrl);
      setRawVideoUrl(null);
      setRawFile(null);
    };
  }, [maxSize, maxDuration, showTrimControls, onChange, useAdminUpload]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const onTrimConfirm = useCallback(async () => {
    if (!rawFile) return;

    setUploading(true);
    try {
      const uploadAction = useAdminUpload ? uploadAdminFileAction : uploadSuperAdminFileAction;

      const uploadResult = await uploadAction(rawFile);

      if (uploadResult?.success && uploadResult?.data) {
        onChange(uploadResult.data);
        setPreviewSrc(uploadResult.data);
      } else {
        onChange(rawFile);
        // rawVideoUrl may have been revoked, so show fallback preview if possible
        setPreviewSrc(rawVideoUrl || URL.createObjectURL(rawFile));
        setError('Upload failed: ' + (uploadResult?.error || 'Unknown error'));
      }
      setShowTrimmer(false);
    } catch (err) {
      console.error('[VideoCropUpload] Error uploading trimmed video:', err);
      onChange(rawFile);
      setPreviewSrc(rawVideoUrl || URL.createObjectURL(rawFile));
      setError('Error uploading video');
    } finally {
      setUploading(false);
    }
  }, [rawFile, rawVideoUrl, onChange, useAdminUpload]);

  const onTrimCancel = useCallback(() => {
    setShowTrimmer(false);
    if (rawVideoUrl) {
      URL.revokeObjectURL(rawVideoUrl);
      setRawVideoUrl(null);
    }
    setRawFile(null);
    setError(null);
  }, [rawVideoUrl]);

  const onRemove = useCallback(() => {
    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
    }
    if (rawVideoUrl) {
      URL.revokeObjectURL(rawVideoUrl);
    }
    setPreviewSrc(null);
    setRawFile(null);
    setRawVideoUrl(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange, previewSrc, rawVideoUrl]);

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
      if (file.type.startsWith('video/')) {
        onFilePicked(file);
      } else {
        setError('Please drop a valid video file');
      }
    }
  }, [disabled, onFilePicked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewSrc && previewSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previewSrc);
      }
      if (rawVideoUrl) {
        URL.revokeObjectURL(rawVideoUrl);
      }
    };
  }, [previewSrc, rawVideoUrl]);

  return (
    <div>
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!previewSrc ? openFileDialog : undefined}
        style={{ cursor: !previewSrc && !disabled ? 'pointer' : 'default' }}
      >
        <div className="p-6 flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {previewSrc ? (
            <>
              <div className="w-full flex flex-col items-center justify-center">
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative overflow-hidden"
                  style={{ width: previewSize.width, height: previewSize.height }}
                >
                  <video
                    src={previewSrc}
                    controls={showControls}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain rounded-md"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    disabled={disabled}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                    aria-label="Remove video"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-[12px] font-normal pt-2 text-center">
                  Max. Video Size: {maxSize.sizeMB} MB
                  {maxDuration && ` • Max. Duration: ${maxDuration}s`}
                </p>

                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold pt-2 text-center">
                  Drag or select your video
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  disabled={disabled}
                  className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer pt-1"
                >
                  Click to browse
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full flex flex-col items-center justify-center">
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center relative"
                  style={{ width: previewSize.width, height: previewSize.height }}
                >
                  <svg
                    width={previewSize.width}
                    height={previewSize.height}
                    viewBox="0 0 320 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    {/* Background */}
                    <rect width="320" height="180" rx="8" fill="#F3F4F6" className="dark:fill-gray-700" />

                    {/* Video camera icon */}
                    <g transform="translate(120, 60)">
                      <rect x="20" y="10" width="40" height="30" rx="4" fill="#3B82F6" opacity="0.2" />
                      <rect x="25" y="15" width="30" height="20" rx="2" fill="#3B82F6" />
                      <circle cx="40" cy="25" r="8" fill="white" />
                      <circle cx="40" cy="25" r="4" fill="#3B82F6" />
                      <rect x="55" y="20" width="8" height="10" rx="1" fill="#3B82F6" />
                    </g>

                    {/* Play button */}
                    <circle cx="160" cy="90" r="25" fill="#3B82F6" opacity="0.9" />
                    <path d="M152 80 L152 100 L172 90 Z" fill="white" />
                  </svg>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-[12px] font-normal pt-2 text-center">
                  Max. Video Size: {maxSize.sizeMB} MB
                  {maxDuration && ` • Max. Duration: ${maxDuration}s`}
                </p>

                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold pt-2 text-center">
                  Drag or select your video
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  disabled={disabled}
                  className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer pt-1"
                >
                  Click to browse
                </button>
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

      {showTrimmer && rawVideoUrl && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-5 w-full max-w-2xl">
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">Trim Video</h3>

            <div className="relative rounded-md border border-gray-200 dark:border-gray-700 w-full mb-4">
              <video
                ref={videoRef}
                src={rawVideoUrl}
                className="w-full h-auto rounded-md"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setVideoDuration(videoRef.current.duration);
                    setTrimEnd(videoRef.current.duration);
                  }
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <span className="text-white text-xs">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>
            </div>

            {showTrimControls && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 block">
                    Start Time: {formatTime(trimStart)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const start = parseFloat(e.target.value);
                      setTrimStart(start);
                      if (start >= trimEnd) {
                        setTrimEnd(Math.min(start + 1, videoDuration));
                      }
                      handleSeek(start);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 block">
                    End Time: {formatTime(trimEnd)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => {
                      const end = parseFloat(e.target.value);
                      setTrimEnd(end);
                      if (end <= trimStart) {
                        setTrimStart(Math.max(end - 1, 0));
                      }
                      handleSeek(end);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Duration: {formatTime(trimEnd - trimStart)}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={onTrimCancel}
                className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary hover:bg-primaryHover text-white w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                onClick={onTrimConfirm}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : (showTrimControls ? 'Trim & Save' : 'Save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";
import React from "react";
import { X } from "lucide-react";
import { WebComponents } from "@/components";

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  confirmButtonText: string;
}

export default function CancellationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmButtonText
}: CancellationDialogProps) {
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1F1F1F] rounded-lg overflow-hidden w-full max-w-md mx-6 shadow-xl dark:shadow-2xl dark:border dark:border-[#2F2F2F]">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-white truncate">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white dark:bg-[#1F1F1F]">
          <div className="mb-6">
            <WebComponents.UiComponents.UiWebComponents.Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={4}
              className="w-full dark:bg-[#1B1B1B] dark:border-[#616161] dark:text-white dark:placeholder-gray-400"
              charLength={250}
              charCounter={true}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={!reason.trim()}
              className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

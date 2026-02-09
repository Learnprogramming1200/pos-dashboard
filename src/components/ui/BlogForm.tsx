"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { LabeledInput } from "./LabeledInput";
import { LabeledTextarea } from "./LabeledTextarea";
import { FileUploadRow } from "./FileUploadRow";
import { Toggle } from "./toggle";
import RichTextEditor from "./RichTextEditor";

interface BlogFormProps {
  blog?: {
    title: string;
    image: string;
    description: string;
    author: string;
    status: boolean;
  };
  onSubmit: (data: { title: string; image: string; description: string; author: string; status: boolean }) => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

export default function BlogForm({ blog, onSubmit, onCancel, mode }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    image: blog?.image || "",
    description: blog?.description || "",
    author: blog?.author || "",
    status: blog?.status ?? true
  });

  const [selectedFile, setSelectedFile] = useState<File | string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If there's a selected file, we would typically upload it first
    // For now, we'll use the existing image URL or a placeholder
    const imageUrl = selectedFile
      ? (typeof selectedFile === 'string' ? selectedFile : URL.createObjectURL(selectedFile))
      : formData.image;
    onSubmit({
      ...formData,
      image: imageUrl
    });
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {mode === "create" ? "Create Blog" : "Edit Blog"}
        </h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <LabeledInput
              label="Title *"
              value={formData.title}
              onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="The Future of AI & Automation in Salons"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Image</label>
            <FileUploadRow
              label="Choose File"
              onChange={setSelectedFile}
              accept="image/*"
              className="mt-2"
              currentFileUrl={formData.image}
              showImagePreview={true}
              imagePreviewSize={{ width: 200, height: 150 }}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Description
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="AI is revolutionizing the beauty industry! Here's what's coming next:"
            height={300}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Author *</label>
            <select
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              required
            >
              <option value="">Select Author</option>
              <option value="Chris Brown">Chris Brown</option>
              <option value="Michael Brown">Michael Brown</option>
              <option value="Emily Davis">Emily Davis</option>
              <option value="Alex Johnson">Alex Johnson</option>
              <option value="Sarah Wilson">Sarah Wilson</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
            <div className="flex items-center space-x-3">
              <Toggle
                checked={formData.status}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, status: checked }))}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {mode === "create" ? "Create Blog" : "Update Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}

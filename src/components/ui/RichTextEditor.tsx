"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
export interface RichTextEditorRef {
  insertContent: (content: string) => void;
  insertGiftCardImage: () => void;
  getContent: () => string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  onFocus?: () => void;
  gift_card_image?: string;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = "Enter your content here...",
  height = 400,
  className = "",
  onFocus,
  gift_card_image
}, ref) => {
  const [isDark, setIsDark] = useState(false);
  const [key, setKey] = useState(0);
  const editorInstanceRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    insertContent: (content: string) => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.insertContent(content);
      }
    },
    insertGiftCardImage: () => {
      if (editorInstanceRef.current && gift_card_image) {
        const imgHtml = `<img src="${gift_card_image}" alt="Gift Card" style="max-width: 100%; height: auto; display: block; margin: 12px 0;">`;
        editorInstanceRef.current.insertContent(imgHtml);
      }
    },
    getContent: () => {
      return editorInstanceRef.current ? editorInstanceRef.current.getContent() : "";
    }
  }));

  useEffect(() => {
    // Initial theme detection
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const handleMutation = (mutations: MutationRecord[]) => {
      const classChanged = mutations.some(m => m.attributeName === 'class');
      if (classChanged) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
        // Force re-render of editor with new theme
        setKey(prev => prev + 1);
      }
    };

    const observer = new MutationObserver(handleMutation);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const initConfig = React.useMemo(() => ({
    height: height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
      'directionality', 'visualchars', 'nonbreaking',
      'pagebreak'
    ],
    toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
      'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image media | table | ' +
      'charmap emoticons | code | searchreplace | ' +
      'insertdatetime | preview | help',
    skin: isDark ? 'oxide-dark' : 'oxide',
    content_css: isDark ? 'dark' : 'default',
    content_style: `
      body { 
        font-family: 'Inter Tight', Helvetica, Arial, sans-serif; 
        font-size: 14px;
        background-color: ${isDark ? '#1B1B1B' : '#ffffff'};
        color: ${isDark ? '#ffffff' : '#111636'};
        padding: 12px;
      }
      p { margin: 0; }
      img { 
        max-width: 100%; 
        height: auto; 
        display: block;
        margin: 12px 0;
      }
      .mce-content-body:not([dir=rtl])[data-mce-placeholder]:before {
        left: 12px !important;
        top: 12px !important;
      }
    `,
    placeholder: placeholder,
    branding: false,
    promotion: false,
    image_advtab: true,
    image_uploadtab: true,
    images_upload_handler: (blobInfo: any, progress: any) => new Promise((resolve, reject) => {
      // Convert blob to base64 for immediate display
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => {
        reject('Image upload failed');
      };
      reader.readAsDataURL(blobInfo.blob());
    }),
    automatic_uploads: false,
    contextmenu: 'link image table | cell row column deletetable',
    paste_data_images: true,
    paste_as_text: false,
    browser_spellcheck: true,
    resize: true,
    statusbar: true,
    elementpath: true,
    wordcount_count: true,
  }), [height, isDark, placeholder]);

  return (
    <>
      <style>
        {`
          .tox .tox-toolbar,
          .tox .tox-toolbar__overflow,
          .tox .tox-toolbar__primary {
            background-color: ${isDark ? '#1F1F1F' : '#ffffff'} !important;
            border-bottom: 1px solid ${isDark ? '#2A2A2A' : '#D8D9D9'} !important;
          }
          .tox .tox-tbtn {
            background-color: ${isDark ? '#1F1F1F' : '#ffffff'} !important;
            color: ${isDark ? '#F2F2F2' : '#111636'} !important;
          }
          .tox .tox-tbtn svg {
            fill: ${isDark ? '#F2F2F2' : '#111636'} !important;
          }
          .tox .tox-tbtn:hover {
            background-color: ${isDark ? '#2A2A2A' : '#e5e7eb'} !important;
          }
          .tox .tox-tbtn--enabled,
          .tox .tox-tbtn--enabled:hover {
            background-color: ${isDark ? '#2A2A2A' : '#e5e7eb'} !important;
          }
          .tox .tox-split-button {
            background-color: ${isDark ? '#1F1F1F' : '#ffffff'} !important;
            border-color: transparent !important;
          }
          .tox .tox-split-button:hover {
            background-color: ${isDark ? '#2A2A2A' : '#e5e7eb'} !important;
          }
          .tox .tox-menu {
            background-color: ${isDark ? '#1F1F1F' : '#ffffff'} !important;
            border: 1px solid ${isDark ? '#2A2A2A' : '#D8D9D9'} !important;
          }
          .tox .tox-collection__item {
            color: ${isDark ? '#F2F2F2' : '#111636'} !important;
          }
          .tox .tox-collection__item--active {
            background-color: ${isDark ? '#2A2A2A' : '#e5e7eb'} !important;
          }
          .tox .tox-collection__item:hover {
            background-color: ${isDark ? '#2A2A2A' : '#e5e7eb'} !important;
          }
        `}
      </style>
      <div className={`rounded-[4px] overflow-hidden border border-[#D8D9D9] dark:border-[#2A2A2A] ${className}`}>
        <Editor
          key={key}
          apiKey="repgl7nuakgcf0oyxikx1bns9lum376b2l9u5fkfitho681q"
          value={value}
          onEditorChange={(content) => onChange(content)}
          onFocus={onFocus}
          onInit={(evt, editor) => editorInstanceRef.current = editor}
          init={initConfig}
        />
      </div>
    </>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;

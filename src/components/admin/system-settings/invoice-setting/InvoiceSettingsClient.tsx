"use client";

import React, { useState, useEffect, useRef } from "react";
import InvoiceControls from "./InvoiceControls";
import InvoiceTemplateSelector from "./InvoiceTemplateSelector";
import InvoicePreview from "./InvoicePreview";
import { InvoiceDesignTypes } from "@/types/admin";
import { Loader2, Settings2, LayoutTemplate, Eye, X } from "lucide-react";
import Swal from 'sweetalert2';
import { updateInvoiceDesignAction } from "@/lib/server-actions";

type Tab = 'customize' | 'preview' | 'templates';

interface InvoiceSettingsClientProps {
    initialConfig: InvoiceDesignTypes.InvoiceDesignConfig | null;
    initialTemplate: number;
}

const InvoiceSettingsClient = ({ initialConfig, initialTemplate }: InvoiceSettingsClientProps) => {
  // 1. STATE
  // Use server data if available, otherwise default
  const [selectedTemplate, setSelectedTemplate] = useState<number>(initialTemplate || 1);
  const [config, setConfig] = useState<InvoiceDesignTypes.InvoiceDesignConfig>(initialConfig || InvoiceDesignTypes.DEFAULT_DESIGN_CONFIG);
  const [loading, setLoading] = useState(false); // No loading needed initially as we have data
  const [activeTab, setActiveTab] = useState<Tab>('customize'); // For Mobile
  const [showRightPanel, setShowRightPanel] = useState(false); // For Tablet Drawer

  
  useEffect(() => {
    if (!config.logo) {
       const savedConfig = localStorage.getItem("invoice-design-config");
       if (savedConfig) {
         try {
           const parsed = JSON.parse(savedConfig);
           if (parsed.logo) {
             setConfig(prev => ({ ...prev, logo: parsed.logo }));
           }
         } catch (e) { /* ignore */ }
       }
    }
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Try saving to server using Server Action (Fixes 401 Error)
      try {
        const result = await updateInvoiceDesignAction({
          ...config,
          config,
          selectedTemplate: String(selectedTemplate),
          templateId: `template${selectedTemplate}`
        });

        if (result.success && result.data?.data) {
             const serverConfig = result.data.data;
             // Preserve local logo if server returns null
             if (!serverConfig.logo && config.logo) {
                 serverConfig.logo = config.logo;
             }
             setConfig(serverConfig);
        } else if (!result.success) {
           throw new Error(result.error || "Server Action failed");
        }
      } catch (apiError: any) {
        console.warn("Primary save failed, attempting fallback...", apiError);
      }

      // Always save to local storage (Success path)
      localStorage.setItem("invoice-design-config", JSON.stringify(config));
      localStorage.setItem("invoice-template-id", selectedTemplate.toString());
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Invoice design saved successfully!',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } catch (error) {
      console.error("Unexpected error in save flow", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong while saving.',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will reset all your invoice customizations to default.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, reset it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setConfig(InvoiceDesignTypes.DEFAULT_DESIGN_CONFIG);
        setSelectedTemplate(1);
        localStorage.removeItem("invoice-design-config");
        localStorage.removeItem("invoice-template-id");
        Swal.fire({
          icon: 'success',
          title: 'Reset!',
          text: 'Settings have been reset to default.',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      }
    });
  };

  // --- SCALING LOGIC ---
  const [scale, setScale] = useState(0.57); // Safe initial scale
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scale based on container size vs Invoice A4 size
  const calculateScale = () => {
      if (!containerRef.current) return;
      
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Standard A4 Dimensions in Pixels (96 DPI)
      const invoiceBaseWidth = 794;
      const invoiceBaseHeight = 1123;
      
      // Padding around the invoice
      const paddingX = 40; 
      const paddingY = 40; 
      
      const availableWidth = Math.max(0, clientWidth - paddingX);
      const availableHeight = Math.max(0, clientHeight - paddingY);

      const scaleX = availableWidth / invoiceBaseWidth;
      const scaleY = availableHeight / invoiceBaseHeight;
      
      // Fit contained
      const fitScale = Math.min(scaleX, scaleY, 1);
      
      setScale(fitScale);
  };

  useEffect(() => {
    // Initial calculation
    calculateScale();

    // Watch for container resize
    const observer = new ResizeObserver(() => {
        window.requestAnimationFrame(calculateScale);
    });

    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [showRightPanel, activeTab]); // Recalculate if UI panels change state

  // Also recalculate if template/config changes (optional but safe)
  useEffect(() => {
    calculateScale();
  }, [config, selectedTemplate]);


  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    )
  }

  // --- RESPONSIVE LAYOUT HELPERS ---
  const isMobile = false; 
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100 dark:bg-[#333333] relative">
      
      {/* --- DESKTOP/TABLET LAYOUT AREA --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 1. LEFT PANEL (Customize) */}
        {/* Visible on Desktop/Tablet. On Mobile ONLY if activeTab === 'customize' */}
        <div className={`
            w-full md:w-[340px] xl:w-[360px] flex-shrink-0 bg-white dark:bg-[#333333] border-r border-gray-200 dark:border-gray-700 h-full z-20
            ${activeTab === 'customize' ? 'block' : 'hidden md:block'}
        `}>
          <InvoiceControls
            config={config}
            setConfig={setConfig}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>

        {/* 2. CENTER PANEL (Preview) */}
        {/* Visible on Desktop/Tablet. On Mobile ONLY if activeTab === 'preview' */}
        <div 
           ref={containerRef}
           className={`
             flex-1 bg-gray-100/50 dark:bg-[#111111] relative flex items-center justify-center overflow-hidden
             ${activeTab === 'preview' ? 'block' : 'hidden md:flex'}
           `}
        >
             {/* The Scaled Paper */}
             <div 
               style={{ 
                 transform: `scale(${scale})`, 
                 width: '794px', // Fixed A4 Width
                 height: '1123px', // Fixed A4 Height
                 boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)',
               }}
               className="bg-white origin-center transition-transform duration-200 ease-out backface-visibility-hidden"
             >
                <InvoicePreview
                  selectedTemplate={selectedTemplate}
                  config={config}
                />
             </div>
             
             {/* Tablet: Toggle Right Panel Button */}
             <button 
                onClick={() => setShowRightPanel((prev) => !prev)}
                className="absolute top-4 right-4 md:flex lg:hidden bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 z-30"
             >
                {showRightPanel ? <X className="w-5 h-5"/> : <LayoutTemplate className="w-5 h-5"/>}
             </button>
        </div>

        {/* 3. RIGHT PANEL (Templates) */}
        {/* Desktop: Fixed Column. Tablet: Drawer. Mobile: Tab View. */}
        <div className={`
             lg:w-[280px] xl:w-[320px] bg-white dark:bg-[#333333] border-l border-gray-200 dark:border-gray-700 h-full z-20
             lg:static lg:block
             ${activeTab === 'templates' ? 'block w-full absolute inset-0' : 'hidden'}
             ${/* Tablet Drawer Logic */ ''}
             md:absolute md:right-0 md:top-0 md:bottom-0 md:shadow-2xl md:w-[320px] transition-transform duration-300
             ${(showRightPanel && activeTab !== 'templates') ? 'md:translate-x-0' : 'md:translate-x-full lg:translate-x-0'}
        `}>
           <InvoiceTemplateSelector 
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={(id) => { setSelectedTemplate(id); if(window.innerWidth < 1024) setShowRightPanel(false); }}
           />
        </div>

      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around z-50 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('templates')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'templates' ? 'text-blue-600' : 'text-gray-500'}`}
          >
             <LayoutTemplate className="w-5 h-5" />
             <span className="text-[10px] font-medium">Templates</span>
          </button>
          <button 
            onClick={() => setActiveTab('customize')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'customize' ? 'text-blue-600' : 'text-gray-500'}`}
          >
             <Settings2 className="w-5 h-5" />
             <span className="text-[10px] font-medium">Customize</span>
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'preview' ? 'text-blue-600' : 'text-gray-500'}`}
          >
             <Eye className="w-5 h-5" />
             <span className="text-[10px] font-medium">Preview</span>
          </button>
      </div>

    </div>
  );
};

export default InvoiceSettingsClient;

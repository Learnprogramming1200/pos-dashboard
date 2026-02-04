import { InvoiceDesignTypes } from "@/types/admin";
import React from "react";
import { TEMPLATE } from "./templates";

interface InvoicePreviewProps {
  selectedTemplate: number;
  config: InvoiceDesignTypes.InvoiceDesignConfig;
}

import { invoicePreviewData } from "@/constant/dummy-data/invoice";

const mockData = invoicePreviewData;

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  selectedTemplate,
  config,
}) => {

  // Map font names to CSS variables defined in layout.tsx
  const getFontFamily = (fontName: string) => {
    const fontMap: Record<string, string> = {
      'Roboto': 'var(--font-roboto)',
      'Poppins': 'var(--font-poppins)',
      'Montserrat': 'var(--font-montserrat)',
      'Lato': 'var(--font-lato)',
      'Merriweather': 'var(--font-merriweather)',
      'Playfair Display': 'var(--font-playfair-display)',
      'Caveat': 'var(--font-caveat)',
      'DM Sans': 'var(--font-dm-sans)',
    };
    return fontMap[fontName] || fontName;
  };

  const renderTemplate = () => {
    // We will update templates to accept 'design' prop
    const commonProps = {
      data: mockData,
      design: config,
      styles: { 
        font: getFontFamily(config.fontFamily), 
        color: config.primaryColor, 
        logo: config.logo 
      },
    };

    switch (selectedTemplate) {
      case 1:
        return <TEMPLATE.template.Template1 {...commonProps} />;
      case 2:
        return <TEMPLATE.template.Template2 {...commonProps} />;
      case 3:
        return <TEMPLATE.template.Template3 {...commonProps} />;
      case 4:
        return <TEMPLATE.template.Template4 {...commonProps} />;
      case 5:
        return <TEMPLATE.template.Template5 {...commonProps} />;
      default:
        return <TEMPLATE.template.Template1 {...commonProps} />;
    }
  };

    const calculateScale = () => {
    return 1.05; // Standard fit for screen
  };
    const calculateContentZoom = () => {
      if (config.fontSizeScale === 'small') return 0.9;
      if (config.fontSizeScale === 'large') return 1.1;
      return 1;
  };

  const scale = calculateScale();

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent relative transition-colors duration-300">
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100/20 dark:bg-blue-900/10 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-gray-200/30 dark:bg-gray-800/10 blur-3xl rounded-full pointer-events-none"></div>

      <div 
        style={{ 
          width: `${200 * scale}mm`, 
          height: `${300 * scale}mm`,
          position: 'relative'
        }}
        className="shadow-2xl bg-white transition-all duration-500 ease-in-out"
      >
        {/* Main A4 Document Container - Scaled from Top Left */}
        <div
          className="bg-white overflow-hidden origin-top-left"
          style={{
            width: "200mm",
            height: "300mm",
            fontFamily: getFontFamily(config.fontFamily),
            transform: `scale(${scale})`,
          }}
        > 
          <div style={{ width: '100%', height: '100%' }}>
               {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;

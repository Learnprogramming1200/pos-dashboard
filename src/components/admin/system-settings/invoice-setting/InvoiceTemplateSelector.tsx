import React from "react";
import { CheckCircle2, LayoutTemplate } from "lucide-react";
import {TEMPLATE} from "./templates"
import { invoiceThumbnailData } from "@/constant/dummy-data/invoice";

interface InvoiceTemplateSelectorProps {
  selectedTemplate: number;
  setSelectedTemplate: (templateId: number) => void;
}

const InvoiceTemplateSelector: React.FC<InvoiceTemplateSelectorProps> = ({
  selectedTemplate,
  setSelectedTemplate,
}) => {
const thumbnailData = invoiceThumbnailData;

  const renderThumbnailContent = (id: number) => {
    const props = { data: thumbnailData, design: undefined, styles: undefined };
    switch (id) {
      case 1: return <TEMPLATE.template.Template1 {...props} />;
      case 2: return <TEMPLATE.template.Template2 {...props} />;
      case 3: return <TEMPLATE.template.Template3 {...props} />;
      case 4: return <TEMPLATE.template.Template4 {...props} />;
      case 5: return <TEMPLATE.template.Template5 {...props} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#333333] border-l border-gray-100 dark:border-darkBorder">
      <div className="p-4 border-b border-gray-100 dark:border-darkBorder">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <LayoutTemplate className="w-3 h-3" /> Templates
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
           {[1, 2, 3, 4, 5].map((id) => (
            <div key={id} className="flex flex-col items-center gap-1.5 group relative">
              <button
                onClick={() => setSelectedTemplate(id)}
                className={`
                  relative w-full aspect-[228/265] rounded-[6px] overflow-hidden transition-all duration-200 flex items-center justify-center p-[4px] bg-gray-50 dark:bg-gray-700
                  ${selectedTemplate === id ? "ring-2 ring-blue-600 dark:ring-blue-500 shadow-lg" : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-blue-400 hover:shadow-md"}
                `}
              >
                <div className="w-full h-full pointer-events-none select-none relative bg-white overflow-hidden rounded-[3px] shadow-sm">
                  {/* Scale down the invoice to fit thumbnail */}
                  <div className="absolute top-0 left-0 w-[221mm] h-[265mm] origin-top-left scale-[0.14]">
                    {renderThumbnailContent(id)}
                  </div>
                </div>
                <div className={`absolute inset-0 bg-blue-600/5 dark:bg-blue-400/5 transition-opacity ${selectedTemplate === id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}></div>
                
                {selectedTemplate === id && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-0.5 rounded-full shadow-md z-10 animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
              
              <span className={`text-[10px] font-semibold transition-colors ${selectedTemplate === id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                Template {id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplateSelector;

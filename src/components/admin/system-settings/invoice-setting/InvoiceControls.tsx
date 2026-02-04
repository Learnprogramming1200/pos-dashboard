import React from "react";
import { CheckCircle2, Upload, ChevronDown, LayoutTemplate, Palette, Type, Layout, Bold, Italic, Underline, Scaling, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { InvoiceDesignTypes } from "@/types/admin";

// Internal Accordion Component
const AccordionItem = ({ title, icon, isOpen, onToggle, children }: { title: string, icon: React.ReactNode, isOpen: boolean, onToggle: () => void, children: React.ReactNode }) => {
  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-[#333333] shadow-sm ring-1 ring-blue-50 dark:ring-blue-900/20' : 'border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-[#333333]/50 hover:bg-white dark:hover:bg-[#333333] hover:border-blue-100 dark:hover:border-gray-600'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${isOpen ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400'}`}>
            {icon}
          </div>
          <span className={`text-sm font-bold tracking-wide transition-colors duration-300 ${isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
            {title}
          </span>
        </div>
        <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'bg-transparent text-gray-300 group-hover:text-gray-500 dark:text-gray-600'}`}>
           <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="p-4 pt-0 border-t border-dashed border-gray-100 dark:border-gray-700/50">
           <div className={`pt-4 ${isOpen ? 'max-h-[350px]  custom-scrollbar pr-1' : ''}`}>
             {children}
           </div>
        </div>
      </div>
    </div>
  );
};

interface InvoiceControlsProps {
  // Removing them to force parent update
  config: InvoiceDesignTypes.InvoiceDesignConfig;
  setConfig: (config: InvoiceDesignTypes.InvoiceDesignConfig) => void;
  onSave: () => void;
  onReset: () => void;
}


const InvoiceControls: React.FC<InvoiceControlsProps> = ({
  config,
  setConfig,
  onSave,
  onReset
}) => {
  // Accordion State
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    themes: false,
    colors: false,
    typography: false,
    layout: false,
    logo: false
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
       // If the clicked section is already open, just close it (and keep others closed)
       if (prev[key]) {
         return {
           themes: false,
           colors: false,
           typography: false,
           layout: false,
           logo: false
         };
       }
       
       // Otherwise, open only the clicked section and close all others
       return {
         themes: key === 'themes',
         colors: key === 'colors',
         typography: key === 'typography',
         layout: key === 'layout',
         logo: key === 'logo'
       };
    });
  };


  const handleThemeApply = (preset: InvoiceDesignTypes.ThemePreset) => {
    setConfig({
      ...config,
      ...preset.config,
    });
  };

  const updateConfig = (key: keyof InvoiceDesignTypes.InvoiceDesignConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const [uploading, setUploading] = React.useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: client-side size check (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      return;
    }

    try {
      setUploading(true);
      const { commonAPI } = await import("@/lib/api");
      const response = await commonAPI.uploadFile(file, 'file');
      
      if (response.data && response.data.data && response.data.data.secureUrl) {
        updateConfig('logo', response.data.data.secureUrl);
      }
    } catch (error) {
      console.error("Logo upload failed", error);
      alert("Failed to upload logo to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#333333] transition-colors duration-300 overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">
          Customization
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Adjust brand colors, fonts, and layout settings.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-[14px] custom-scrollbar">
        
        {/* Loading Spinner for Upload */}
        {uploading && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium dark:text-white">Uploading Logo...</span>
             </div>
           </div>
        )}


        {/* --- Accordion Component --- */}

        
        {/* --- 2. Brand Themes --- */}
        <AccordionItem
          title="Brand Themes"
          icon={<Palette className="w-4 h-4 text-blue-500" />}
          isOpen={openSections['themes']}
          onToggle={() => toggleSection('themes')}
        >
          <div className="grid grid-cols-1 gap-2 pt-2">
            {InvoiceDesignTypes.THEME_PRESETS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeApply(theme)}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left group"
              >
                <div className="flex -space-x-2">
                   <div style={{ backgroundColor: theme.config.primaryColor }} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700"></div>
                   <div style={{ backgroundColor: theme.config.secondaryColor }} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700"></div>
                   <div style={{ backgroundColor: theme.config.highlightColor }} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700"></div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block group-hover:text-blue-600 transition-colors">{theme.name}</span>
                </div>
              </button>
            ))}
          </div>
        </AccordionItem>

         {/* --- 3. Color Palette --- */}
        <AccordionItem
          title="Color Palette"
          icon={<Palette className="w-4 h-4 text-purple-500" />}
          isOpen={openSections['colors']}
          onToggle={() => toggleSection('colors')}
        >
          <div className="grid grid-cols-2 gap-3 pt-2">
             {[
               { label: "Primary", key: "primaryColor" },
               { label: "Secondary", key: "secondaryColor" },
               { label: "Headings", key: "headingsColor" },
               { label: "Body Text", key: "textColor" },
               { label: "Table Header", key: "tableHeaderBg" },
               { label: "Table Text", key: "tableHeaderText" },
               { label: "Table Border", key: "tableBorder" },
               { label: "Highlighter", key: "highlightColor" },
             ].map((colorItem) => (
               <div key={colorItem.key} className="flex flex-col gap-1.5 group">
                 <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 ml-0.5 group-hover:text-blue-500 transition-colors">{colorItem.label}</label>
                 <div className="flex items-center gap-2 h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 px-2 bg-white dark:bg-gray-900 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                    <div className="relative w-6 h-6 rounded overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                      <input 
                        type="color" 
                        value={config[colorItem.key as keyof InvoiceDesignTypes.InvoiceDesignConfig] as string}
                        onChange={(e) => updateConfig(colorItem.key as keyof InvoiceDesignTypes.InvoiceDesignConfig, e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0" 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase flex-1 text-right select-all">
                       {config[colorItem.key as keyof InvoiceDesignTypes.InvoiceDesignConfig] as string}
                    </span>
                 </div>
               </div>
             ))}
          </div>
        </AccordionItem>

        {/* --- 4. Typography --- */}
        <AccordionItem
           title="Typography"
           icon={<Type className="w-4 h-4 text-orange-500" />}
           isOpen={openSections['typography']}
           onToggle={() => toggleSection('typography')}
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Font Family</label>
              <div className="relative group">
                <select 
                  value={config.fontFamily}
                  onChange={(e) => updateConfig('fontFamily', e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-3 pr-10 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lato">Lato</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
              </div>
            </div>
            
             <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Font Scale</label>
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
                 {['small', 'medium', 'large'].map((size) => (
                   <button 
                    key={size}
                    onClick={() => updateConfig('fontSizeScale', size)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${config.fontSizeScale === size ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-500/30' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                   >
                     {size}
                   </button>
                 ))}
              </div>
            </div>
            
             <div className="space-y-3 pt-2">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Text Styling</label>
              <div className="grid grid-cols-2 gap-2">
                 {/* Font Weight */}
                 <div className="relative group">
                    <select 
                      value={config.fontWeight}
                      onChange={(e) => updateConfig('fontWeight', e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                      <option value="extrabold">Extra Bold</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                 </div>

                  {/* Text Transform */}
                 <div className="relative group">
                    <select 
                      value={config.textTransform}
                      onChange={(e) => updateConfig('textTransform', e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <option value="none">Normal Case</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                 </div>
              </div>

              <div className="flex gap-2">
                  {/* Italic Toggle */}
                  <button
                    onClick={() => updateConfig('fontStyle', config.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all ${
                      config.fontStyle === 'italic' 
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  {/* Underline Toggle */}
                  <button
                    onClick={() => updateConfig('textDecoration', config.textDecoration === 'underline' ? 'none' : 'underline')}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all ${
                      config.textDecoration === 'underline' 
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400' 
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
              </div>
              
              <div className="space-y-2 pt-1">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 ml-1">Letter Spacing</label>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 rounded">{config.letterSpacing}em</span>
                   </div>
                   <input 
                      type="range" 
                      min="-0.05" 
                      max="0.5" 
                      step="0.01"
                      value={config.letterSpacing}
                      onChange={(e) => updateConfig('letterSpacing', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500"
                   />
              </div>
            </div>
          </div>
        </AccordionItem>
          
         {/* --- 5. Layout --- */}
         <AccordionItem
            title="Layout & Content"
            icon={<Layout className="w-4 h-4 text-pink-500" />}
            isOpen={openSections['layout']}
            onToggle={() => toggleSection('layout')}
         >
            <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
               {/* Date Format */}
               <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Date Format</label>
                  <div className="relative group">
                    <select 
                      value={config.dateFormat}
                      onChange={(e) => updateConfig('dateFormat', e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                      <option value="MMM DD, YYYY">Oct 24, 2024</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                 </div>
               </div>

                <div className="space-y-1">
                   <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Currency Symbol</label>
                   <div className="relative group">
                     <select 
                       value={config.currencySymbol}
                       onChange={(e) => updateConfig('currencySymbol', e.target.value)}
                       className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                     >
                       <option value="₹">INR (₹)</option>
                       <option value="$">USD ($)</option>
                       <option value="€">EUR (€)</option>
                       <option value="£">GBP (£)</option>
                     </select>
                     <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                   </div>
                </div>
            </div>
            </div>
         </AccordionItem>

         {/* --- 6. Logo Settings Accordion --- */}
         <AccordionItem
            title="Logo Settings"
            icon={<LayoutTemplate className="w-4 h-4 text-green-500" />}
            isOpen={openSections['logo']}
            onToggle={() => toggleSection('logo')}
         >
           <div className="space-y-4 pt-2">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">App Logo</label>
                
                <div className="flex items-center gap-4">
                   {/* Preview Circle */}
                   {config.logo ? (
                     <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-white shadow-sm flex items-center justify-center p-2 relative group overflow-hidden">
                        <img src={config.logo} alt="Logo" className="w-full h-full object-contain" />
                        <button 
                          onClick={() => updateConfig('logo', null)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]"
                          title="Remove Logo"
                        >
                           <div className="text-white text-[10px] font-bold uppercase tracking-wide">Remove</div>
                        </button>
                     </div>
                   ) : (
                      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center group-hover:border-blue-300 transition-colors">
                         <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                   )}

                   {/* Upload Button */}
                   <div className="flex-1">
                      <label className="flex flex-col gap-1 cursor-pointer group">
                        <span className="py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/80 group-hover:border-blue-200 dark:group-hover:border-blue-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 text-center transition-all shadow-sm">
                          Upload Logo
                        </span>
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/svg+xml"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <span className="text-[10px] text-gray-400 text-center group-hover:text-blue-400 transition-colors">
                          PNG, JPG, SVG up to 2MB
                        </span>
                      </label>
                   </div>
                </div>
              </div>

               {/* Logo Controls */}
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Logo Position</label>
                     <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
                        {[
                            { value: 'left', icon: <AlignLeft className="w-4 h-4" /> },
                            { value: 'center', icon: <AlignCenter className="w-4 h-4" /> },
                            { value: 'right', icon: <AlignRight className="w-4 h-4" /> }
                        ].map((option) => (
                          <button 
                             key={option.value}
                             onClick={() => updateConfig('logoPosition', option.value)}
                             className={`flex-1 py-2 flex items-center justify-center rounded transition-all ${config.logoPosition === option.value ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-500/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                             title={option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                          >
                             {option.icon}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block ml-1">Logo Size</label>
                    <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
                       {['small', 'medium', 'large', 'xl'].map((size) => (
                         <button 
                          key={size}
                          onClick={() => updateConfig('logoSize', size)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${config.logoSize === size ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-500/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-gray-200'}`}
                         >
                           {size === 'xl' ? 'XL' : size}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
           </div>
         </AccordionItem>

        {/* --- 6. Actions --- */}
      </div>

      {/* Footer Actions (Fixed at Bottom) */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#333333] flex-shrink-0 flex gap-3 z-10">
          <button 
            onClick={onReset}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
              Reset Defaults
          </button>
          <button 
            onClick={onSave}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
              Save Changes
          </button>
      </div>
    </div>
  );
};

export default InvoiceControls;

import { InvoiceDesignTypes } from "@/types/admin";
import React from "react";
import { Mail, MapPin, Globe, Phone } from "lucide-react";
import { customHooks } from "@/hooks";
import { InvoiceProductTable } from "../shared/InvoiceProductTable";

interface TemplateProps {
  data: any;
  design?: InvoiceDesignTypes.InvoiceDesignConfig;
  styles?: {
    font?: string;
    color?: string;
    logo?: string | null;
  };
}

const Template2: React.FC<TemplateProps> = ({ data, design, styles }) => {
  // Helper to determine text color (Black or White) based on background brightness
  const getContrastColor = (hexColor: string) => {
    // Remove hash if present
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (standard formula)
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return black for bright colors, white for dark colors
    // Threshold of 128 is standard, but 180 prefers white text unless very bright
    return brightness > 180 ? '#000000' : '#ffffff';
  };

  const tokens = customHooks.getInvoiceDesignTokens(design, styles);
  const { colors, typography, baseFontSize, logoSize, fontFamily } = tokens;

  // Calculate dynamic text colors
  const headerTextColor = getContrastColor(colors.primary);
  const totalsTextColor = getContrastColor(colors.secondary);

  return (
    <div
      className="w-full h-full bg-white relative flex flex-col"
      style={{ fontFamily, color: colors.text, fontSize: baseFontSize }}
    >
      {/* Header Section */}
      <div 
        className="w-full relative flex flex-row overflow-hidden"
        style={{ height: '180px', backgroundColor: colors.totalsBoxBg }} 
      >
         {/* Dynamic Content Generation for Swap Logic */}
         {(() => {
             const isSwap = design?.logoPosition === 'right';
             
             // Define Colors based on placement
             // If NOT swapped: Brand is on White (Left), Invoice on Blue (Right) -> Default settings
             // If SWAPPED: Brand is on Blue (Right), Invoice on White (Left) -> Inverted color logic needed
             
             const brandOnBlue = isSwap; 
             const invoiceOnBlue = !isSwap;

             const brandHeadingColor = brandOnBlue ? '#ffffff' : colors.headings;
             const brandTextColor = brandOnBlue ? 'rgba(255,255,255,0.95)' : colors.text;
             const brandIconColor = brandOnBlue ? '#ffffff' : colors.primary;
             
             const invoiceTitleColor = invoiceOnBlue ? '#ffffff' : colors.primary;
             const invoiceLabelColor = invoiceOnBlue ? 'rgba(255,255,255,0.8)' : colors.secondary;
             const invoiceValueColor = invoiceOnBlue ? '#ffffff' : colors.headings;

             // --- BRAND SECTION COMPONENT ---
             const BrandSection = (
                <div className="w-full h-full flex flex-col justify-center">
                   {/* Center Logic (Only valid if NOT swapped/on Left, because Center implies centered on page/white area) 
                       If we are on Blue (Right), we likely want Right alignment logic.
                   */}
                   {design?.logoPosition === 'center' && !brandOnBlue ? (
                        <div className="grid grid-cols-4 items-center w-full">
                           <div className="flex flex-col text-left col-span-2">
                               <h1 style={{ ...typography.companyName, color: brandHeadingColor, lineHeight: '1.1' }}>{data.companyName}</h1>
                                <div style={{ ...typography.small, color: brandTextColor, marginTop: '4px' }}>
                                   <p className="flex items-start gap-2">
                                       <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: brandIconColor }} />
                                       <span className="break-all">{data.companyAddress}</span>
                                   </p>
                                   {data.companyEmail && (
                                     <p className="flex items-start gap-2 mt-1">
                                         <Mail size={16} className="shrink-0 mt-0.5" style={{ color: brandIconColor }} />
                                           <span className="break-all">{data.companyEmail}</span>
                                       </p> 
                                   )}
                               </div>
                           </div>
                           <div className="flex justify-center col-span-1">
                                <div className="flex items-center justify-center p-2 " style={{ width: logoSize, height: logoSize }}>
                                   {styles?.logo ? <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-gray-300 font-bold text-xs">LOGO</span>}
                                </div>
                           </div>
                           <div className="col-span-1"></div>
                        </div>
                   ) : (
                        // Left or Right Alignment Logic
                        // If Brand is on Blue (Right Side), force the "Logo Right" layout
                        <div className={`flex w-full items-center gap-4 min-w-0 ${brandOnBlue ? 'justify-end' : 'justify-start'}`}>
                           
                           {/* Logo First (If Left/Standard) */}
                           {!brandOnBlue && (
                               <div className="shrink-0 flex items-center justify-center p-2" style={{ width: logoSize, height: logoSize }}>
                                   {styles?.logo ? <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-gray-300 font-bold text-xs">LOGO</span>}
                               </div>
                           )}

                           {/* Text Group */}
                           <div className={`flex flex-col min-w-0 flex-1 ${brandOnBlue ? 'items-end text-right' : 'items-start text-left'}`}>
                               <h1 className="w-full truncate" style={{ ...typography.companyName, color: brandHeadingColor, lineHeight: '1.1' }}>{data.companyName}</h1>
                               <div style={{ ...typography.small, color: brandTextColor, marginTop: '4px' }}>
                                   <p className={`flex items-start gap-1 ${brandOnBlue ? 'justify-end text-right' : 'justify-start text-left'}`}>
                                       <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: brandIconColor }} />
                                       <span className="break-all">{data.companyAddress}</span>
                                   </p>
                                   {data.companyEmail && (
                                       <p className={`flex items-start gap-1 mt-1 ${brandOnBlue ? 'justify-end text-right' : 'justify-start text-left'}`}>
                                           <Mail size={16} className="shrink-0 mt-0.5" style={{ color: brandIconColor }} />
                                           <span className="break-all">{data.companyEmail}</span>
                                       </p>
                                   )}
                               </div>
                           </div>
                           
                           {/* Logo Second (If Right/Blue) */}
                           {brandOnBlue && (
                               <div className="shrink-0 flex items-center justify-center p-2" style={{ width: logoSize, height: logoSize }}>
                                   {styles?.logo ? <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-gray-300 font-bold text-xs">LOGO</span>}
                               </div>
                           )}
                        </div>
                   )}
                </div>
             );

             // --- INVOICE SECTION COMPONENT ---
             const InvoiceSection = (
                <div className={`flex flex-col justify-center h-full ${invoiceOnBlue ? 'items-end text-right' : 'items-start text-left'}`}>
                    <h2 style={{ ...typography.invoiceTitle, color: invoiceTitleColor, marginBottom: '0.2em' }}>{data.invoiceTitle}</h2>
                    <div className={invoiceOnBlue ? 'text-right' : 'text-left'} style={{ ...typography.body, color: invoiceValueColor }}>
                        <p className={`flex items-center gap-2 mb-0.5 ${invoiceOnBlue ? 'justify-end' : 'justify-start'}`}>
                           <span style={{ fontSize: '0.9em', color: invoiceLabelColor }}>Invoice No:</span>
                           <span className="font-bold">{data.invoiceNumber}</span>
                        </p>
                        <p className={`flex items-center gap-2 mb-0.5 ${invoiceOnBlue ? 'justify-end' : 'justify-start'}`}>
                           <span style={{ fontSize: '0.9em', color: invoiceLabelColor }}>Date:</span>
                           <span className="font-bold">{tokens.formatDate(data.date)}</span>
                        </p>
                        {data.dueDate && (
                           <p className={`flex items-center gap-2 mb-0.5 ${invoiceOnBlue ? 'justify-end' : 'justify-start'}`}>
                              <span style={{ fontSize: '0.9em', color: invoiceLabelColor }}>Due Date:</span>
                              <span className="font-bold">{tokens.formatDate(data.dueDate)}</span>
                           </p>
                        )}
                        <p className={`flex items-center gap-2 ${invoiceOnBlue ? 'justify-end' : 'justify-start'}`}>
                           <span style={{ fontSize: '0.9em', color: invoiceLabelColor }}>Order No:</span>
                           <span className="font-bold">{data.orderNumber}</span>
                        </p>
                    </div>
                </div>
             );

             return (
                <>
                    {/* LEFT CONTAINER (White) */}
                    <div className="w-[55%] h-full flex flex-col justify-center pl-10 pr-4 relative z-10">
                        {isSwap ? InvoiceSection : BrandSection}
                    </div>

                    {/* RIGHT CONTAINER (Blue, Diagonal) */}
                    <div 
                        className="absolute -top-[1px] -right-[1px] -bottom-[1px] w-[55%] flex flex-col justify-center items-end pr-10 pl-16 z-20"
                        style={{ 
                            backgroundColor: colors.primary,
                            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"
                        }} 
                    >
                         
                         <div className="w-full h-full flex flex-col justify-center">
                            {isSwap ? BrandSection : InvoiceSection}
                         </div>
                    </div>
                </>
             );
         })()}
         
         {/* White Triangle Notch at bottom for the 'Line' effect */}
      </div>

      <div 
        className="flex flex-col gap-8 flex-1"
        style={{ padding: `30px` }}
      >
        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 
              className="pb-1"
              style={{ ...typography.sectionTitle, color: colors.primary, borderBottom: `2px solid ${colors.tableBorder}` }}
            >
              Invoice To
            </h3>
            <div>
              <p style={{ ...typography.body, fontWeight: 700, color: colors.headings }}>
                {data.billingTo.name}
              </p>
              <div style={typography.body}>
                <p className="mt-1">{data.billingTo.address}</p>
                <p>{data.billingTo.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 
              className="pb-1"
              style={{ ...typography.sectionTitle, color: colors.primary, borderBottom: `2px solid ${colors.tableBorder}` }}
            >
              Ship From
            </h3>
            <div>
              <p style={{ ...typography.body, fontWeight: 700, color: colors.headings }}>
                {data.shipFrom.name}
              </p>
               <div style={typography.body}>
                <p className="mt-1">{data.shipFrom.address}</p>
                <p>{data.shipFrom.phone}</p>
              </div>
            </div>
          </div>


        </div>

        {/* Table Section */}
        <div className="flex-1">
          <InvoiceProductTable 
             data={data}
             tokens={tokens}
             showAlternateRows={true}
          />
        </div>

        {/* Totals Section */}
        <div className="flex justify-between items-start gap-12 mt-4">
          <div className="flex-1">
            <h4 style={{ ...typography.sectionTitle, color: colors.headings, opacity: 0.6, marginBottom: '0.5em' }}>
              Terms & Conditions
            </h4>
            <p 
              className="p-4 rounded border-l-2"
              style={{ 
                ...typography.small,
                borderColor: colors.primary, 
                backgroundColor: colors.totalsBoxBg, 
                color: colors.text 
              }}
            >
              {data.footerMessage || "All payments must be made within 15 days of invoice date. Check standard warranty terms for details."}
            </p>
          </div>

          <div className="w-[40%] space-y-4">
             {/* Total Box - Dark Theme for T2 */}
            <div 
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{ backgroundColor: colors.secondary, color: totalsTextColor }}
            >
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between" style={typography.body}>
                  <span>Subtotal</span>
                  <span>{tokens.currencySymbol}{data.subTotal}</span>
                </div>
                <div className="flex justify-between" style={{ ...typography.body, opacity: 0.9 }}>
                  <span>Discount</span>
                  <span>{tokens.currencySymbol}{data.discount}</span>
                </div>
                <div className="flex justify-between pb-3 border-b" style={{ ...typography.body, borderColor: totalsTextColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
                  <span>Tax Amount</span>
                  <span>{tokens.currencySymbol}{data.tax || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span style={{ ...typography.totalLabel, color: totalsTextColor }}>
                    Total
                  </span>
                  <span style={{ ...typography.totalValue, color: totalsTextColor }}>{tokens.currencySymbol}{data.total}</span>
                </div>
              </div>
            </div>
            
            <div 
              className="flex justify-between items-center px-4 py-2 rounded-lg"
              style={{ ...typography.body, backgroundColor: colors.totalsBoxBg }}
            >
              <span className="uppercase tracking-widest" style={{ color: colors.secondary, fontSize: '0.8em', fontWeight: 'bold' }}>
                Due Amount
              </span>
              <span className="font-black" style={{ color: colors.highlight }}>{tokens.currencySymbol}{data.dueAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="bg-white border-t flex justify-between items-center"
        style={{ padding: `20px`, borderColor: colors.tableBorder }}
      >
        <div>
          <p className="uppercase tracking-[0.2em] mb-1" style={{ ...typography.small, color: colors.headings, fontWeight: 900 }}>
            Thank You For Your Business
          </p>
          <div className="flex items-center gap-4 font-medium" style={{ ...typography.small, color: colors.text }}>
            <span className="flex items-center gap-1.5">
              <Phone size={12} style={{ color: colors.primary }} />{" "}
              {data.companyPhone || "+91 1122 3344 55"}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={12} style={{ color: colors.primary }} />{" "}
              www.yourbusiness.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template2;

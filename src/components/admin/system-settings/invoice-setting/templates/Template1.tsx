import { InvoiceDesignTypes } from "@/types/admin";
import React from "react";
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

const Template1: React.FC<TemplateProps> = ({ data, design, styles }) => {
  // Use the shared design logic
  const tokens = customHooks.getInvoiceDesignTokens(design, styles);
  const { colors, typography, baseFontSize, logoSize, fontFamily } = tokens;
  
  // Helper for contrast (keeping locally as it's specific to this template's total box)
  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  return (
    <div
      className="w-full h-full bg-white relative flex flex-col"
      style={{ fontFamily, color: colors.text, fontSize: baseFontSize }}
    >
      {/* --- Top Strip --- */}
      <div className="w-full h-4" style={{ backgroundColor: colors.primary }}></div>

      {/* --- Header Section --- */}
      <div 
        className={`${
            design?.logoPosition === 'center' ? 'grid grid-cols-3 items-start' : 
            'flex justify-between items-start'
        }`}
        style={{ padding: `2.5em` }}
      >
        {/* Left Side: Company Details (or Brand Area if Left/Right) */}
        <div className={`flex flex-col gap-2 ${
            design?.logoPosition === 'center' ? 'text-left order-1' : ''
        }`}>
          {/* If Logo Position is Left or Right, Logo is inside here. If Center, Logo is separate. */}
          {design?.logoPosition !== 'center' && (
              <div 
                className={`flex items-center gap-3 ${
                    design?.logoPosition === 'right' ? 'flex-row-reverse text-right' : 
                    'flex-row text-left'
                }`}
              >
                {/* Logo Box */}
                <div 
                  className="flex items-center justify-center overflow-hidden"
                  style={{ width: logoSize, height: logoSize }}
                >
                  {styles?.logo ? (
                    <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    "LOGO"
                  )}
                </div>
                {/* Brand Name */}
                <h1 style={{ ...typography.companyName, color: colors.headings }}>
                  {data.companyName}
                </h1>
              </div>
          )}
          
          {/* If Center, Company Name is just text here */}
          {design?.logoPosition === 'center' && (
              <h1 style={{ ...typography.companyName, color: colors.headings }}>
                  {data.companyName}
              </h1>
          )}

          <div 
            className={`max-w-[200px] mt-1 ${
                design?.logoPosition === 'right' ? 'text-right ms-auto' : 
                'text-left'
            }`} 
            style={{ ...typography.small, color: colors.secondary }}
          >
            <p>{data.companyAddress}</p>
            <p>{data.companyEmail}</p>
            {data.companyPhone && <p>{data.companyPhone}</p>}
            {data.companyWebsite && <p>{data.companyWebsite}</p>}
          </div>
        </div>

        {/* Center: Logo (Only visible if position is center) */}
        {design?.logoPosition === 'center' && (
            <div className="flex justify-center order-2">
                <div 
                  className=" flex items-center justify-center text-xs text-gray-400  overflow-hidden"
                  style={{ width: logoSize, height: logoSize }}
                >
                  {styles?.logo ? (
                    <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    "LOGO"
                  )}
                </div>
            </div>
        )}

        {/* Right Side: Invoice Label & Number */}
        <div className={`${
            design?.logoPosition === 'center' ? 'text-right order-3' : 
            design?.logoPosition === 'right' ? 'text-left' : 
            'text-right'
        }`}>
          <h2 style={{ ...typography.invoiceTitle, color: colors.headings, opacity: 0.9 }}>
            {data.invoiceTitle || "INVOICE"}
          </h2>
          <div className={`flex flex-col mt-2 gap-1 ${
               design?.logoPosition === 'right' ? 'items-start' : 
               'items-end'
          }`}>
            <div className="flex items-center gap-4">
              <span style={{ ...typography.sectionTitle, color: colors.secondary }}>
                Invoice No
              </span>
              <span style={{ ...typography.body, fontWeight: 'bold', color: colors.headings }}>
                {data.invoiceNumber}
              </span>
            </div>
            <div className="flex items-center gap-4">
               <span style={{ ...typography.sectionTitle, color: colors.secondary }}>
                Date
              </span>
              <span style={{ ...typography.body, fontWeight: 500 }}>{tokens.formatDate(data.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Addresses Section --- */}
      <div 
        className="flex justify-between items-start gap-8"
        style={{ padding: `0 2.5em 2.5em` }}
      >
        {/* Left: Invoice To */}
        <div className="w-[30%]">
          <h3 
            className="mb-2 inline-block pb-1"
            style={{ ...typography.sectionTitle, color: colors.headings, borderBottom: `2px solid ${colors.primary}` }}
          >
            Invoice To:
          </h3>
          <p className="mt-2 text-[1.2em] font-bold" style={{ color: colors.headings }}>
            {data.billingTo.name}
          </p>
          <div className="mt-1" style={typography.body}>
            <p className="whitespace-pre-line">{data.billingTo.address}</p>
            <p>{data.billingTo.phone}</p>
          </div>
        </div>

         {/* Middle: Ship From */}
         <div className="w-[30%]">
          <h3 
            className="mb-2 inline-block pb-1"
            style={{ ...typography.sectionTitle, color: colors.headings, borderBottom: `2px solid ${colors.tableBorder}` }}
          >
            Ship From:
          </h3>
          <p className="mt-2 text-[1.1em] font-bold" style={{ color: colors.headings }}>
            {data.shipFrom.name}
          </p>
          <div className="mt-1" style={typography.body}>
            <p className="whitespace-pre-line">{data.shipFrom.address}</p>
            <p>{data.shipFrom.phone}</p>
          </div>
        </div>

        {/* Right: Order Details */}
        <div className="w-[30%] text-right">
          <div className="flex justify-end gap-2 mb-2">
            <span style={{ color: colors.secondary }}>Order No:</span>
            <span style={{ fontWeight: 'bold', color: colors.headings }}>
              {data.orderNumber}
            </span>
          </div>
          <div className="flex justify-end gap-2 mb-2">
            <span style={{ color: colors.secondary }}>Due Date:</span>
            <span style={{ fontWeight: 'bold', color: colors.headings }}>
              {tokens.formatDate(data.dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="flex-1" style={{ padding: `0 2.5em` }}>
        <InvoiceProductTable 
          data={data}
          tokens={tokens}
          showAlternateRows={true}
        />
      </div>

      {/* --- Footer / Totals Section --- */}
      <div 
        className="mt-8 flex justify-between items-end"
        style={{ padding: `2.5em` }}
      >
        {/* Left Footer Notes */}
        <div className="w-1/2">
           <h4 className="mb-2" style={{ ...typography.sectionTitle, color: colors.headings }}>
            Terms & Conditions
          </h4>
          <p className="max-w-sm mb-6" style={{ ...typography.small, color: colors.secondary }}>
            {data.paymentNote || "Please pay within 15 days. Thank you for your business."}
          </p>



          <div className="mt-8 italic" style={{ fontSize: '0.9em', color: colors.footerText }}>
            {data.footerMessage}
          </div>
        </div>

        {/* Right Totals Box */}
        <div className="w-5/12">
          <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.tableBorder }}>
            <span style={{ color: colors.secondary }}>Sub Total</span>
            <span style={{ fontWeight: 'bold', color: colors.headings }}>{tokens.currencySymbol}{data.subTotal}</span>
          </div>
           <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.tableBorder }}>
            <span style={{ color: colors.secondary }}>Discount</span>
            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{tokens.currencySymbol}{data.discount}</span>
          </div>
           <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.tableBorder }}>
            <span style={{ color: colors.secondary }}>Tax Amount</span>
            <span style={{ fontWeight: 'bold', color: colors.headings }}>{tokens.currencySymbol}{data.tax || "0.00"}</span>
          </div>

          {/* Grand Total */}
          <div 
            className="flex justify-between items-center p-3 mt-4 rounded-sm shadow-sm"
            style={{ backgroundColor: colors.primary }}
          >
            <span style={{ ...typography.totalLabel, color: getContrastColor(colors.primary) }}>
              Total:
            </span>
            <span style={{ ...typography.totalValue, color: getContrastColor(colors.primary) }}>
              {tokens.currencySymbol}{data.total}
            </span>
          </div>
          
          <div className="flex justify-between py-2 mt-2">
            <div className="flex justify-between mt-2 w-full" style={{ color: colors.secondary }}>
              <span>Due Amount</span>
              <span style={{ fontWeight: 600, color: colors.highlight }}>{tokens.currencySymbol}{data.dueAmount}</span>
            </div>
          </div>
          
           {/* Authorised Sign */}
           <div className="mt-8 text-right flex flex-col items-end">
            <div className="w-32 border-b mb-2" style={{ borderColor: colors.text }}></div>
            <span style={{ ...typography.small, textTransform: 'uppercase', color: colors.secondary }}>
              Authorised Sign
            </span>
          </div>
        </div>
      </div>

       {/* --- Bottom Strip --- */}
      <div 
        className="w-full mt-auto flex items-center justify-between uppercase tracking-wider"
        style={{ ...typography.small, backgroundColor: colors.primary, color: '#fff', padding: '10px 30px', fontWeight: 'bold' }} 
      >
        <span>Phone: +91 123 456 7890</span>
        <span>www.yourwebsite.com</span>
        <span>{data.companyEmail || "support@company.com"}</span>
      </div>
    </div>
  );
};

export default Template1;



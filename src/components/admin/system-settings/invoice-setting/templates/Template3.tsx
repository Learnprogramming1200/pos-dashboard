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

const Template3: React.FC<TemplateProps> = ({ data, design, styles }) => {
  const tokens = customHooks.getInvoiceDesignTokens(design, styles);
  const { colors, typography, baseFontSize, logoSize, fontFamily } = tokens;

  return (
    <div
      className="w-full h-full bg-white flex flex-col relative"
      style={{ fontFamily, color: colors.text, fontSize: baseFontSize }}
    >
      <div 
        className="flex-grow flex flex-col"
        style={{ padding: "30px" }}
      >

        {/* Header */}
        <div className={`${
            design?.logoPosition === 'center' ? 'grid grid-cols-3 items-start mb-8' : 
            design?.logoPosition === 'right' ? 'flex flex-row-reverse justify-between items-start mb-8' : 
            'flex flex-row justify-between items-start mb-8'
        }`}>
          {/* Left Side (or Brand Area) */}
          <div className={`flex flex-col gap-2 ${
            design?.logoPosition === 'center' ? 'text-left order-1' : 
            design?.logoPosition === 'right' ? 'items-end text-right' : 
            'items-start text-left'
          }`}>
            {design?.logoPosition !== 'center' && (
                <div className={`flex items-center gap-4 ${
                    design?.logoPosition === 'right' ? 'flex-row-reverse' : 
                    'flex-row'
                }`}>
                 <div 
                   className=" flex items-center justify-center overflow-hidden"
                   style={{ width: logoSize, height: logoSize }}
                 >
                   {styles?.logo ? (
                     <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                   ) : (
                     <span style={{ fontSize: '0.8em', fontWeight: 'bold', color: colors.secondary }}>LOGO</span>
                   )}
                 </div>
                 {!styles?.logo && (
                    <div style={{ ...typography.companyName, color: colors.primary }}>
                       {data.companyName}
                    </div>
                 )}
                </div>
            )}
            
            {/* If Center, Company Name is text only here */}
            {design?.logoPosition === 'center' && (
                 <div style={{ ...typography.companyName, color: colors.primary }}>
                    {data.companyName}
                 </div>
            )}

            {/* Added Company Address & Email */}
            <div 
              className={`mt-2 max-w-[250px] leading-relaxed ${design?.logoPosition === 'right' ? 'text-right' : 'text-left'}`}
              style={{ ...typography.small, color: colors.secondary }}
            >
              <p style={{ ...typography.body, fontWeight: 'bold', color: colors.headings }}>{data.companyName}</p>
              <p>{data.companyAddress}</p>
              <p>{data.companyEmail}</p>
            </div>
          </div>
          
           {/* Center Logo */}
           {design?.logoPosition === 'center' && (
              <div className="flex justify-center order-2">
                 <div 
                   className="flex items-center justify-center overflow-hidden"
                   style={{ width: logoSize, height: logoSize }}
                 >
                   {styles?.logo ? (
                     <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                   ) : (
                     <span style={{ fontSize: '0.8em', fontWeight: 'bold', color: colors.secondary }}>LOGO</span>
                   )}
                 </div>
              </div>
           )}

          <div className={`${
            design?.logoPosition === 'center' ? 'text-right order-3' : 
            design?.logoPosition === 'right' ? 'text-left' : 
            'text-right'
          }`}>
            <h1 style={{ ...typography.invoiceTitle, fontWeight: 300, letterSpacing: '0.1em', color: colors.tableBorder }}>
              {data.invoiceTitle}
            </h1>
            <p className="mt-2 font-medium" style={{ ...typography.body, color: colors.secondary }}>#{data.invoiceNumber}</p>
            
            {/* Added Order Details to Header Right */}
            <div className="flex flex-col gap-1 mt-4" style={typography.small}>
              <div className={`flex gap-3 ${
                  design?.logoPosition === 'right' ? 'justify-start' : 
                  'justify-end'
              }`}>
                 <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.secondary }}>Date</span>
                 <span style={{ fontWeight: 600, color: colors.text }}>{tokens.formatDate(data.date)}</span>
              </div>
              <div className={`flex gap-3 ${
                  design?.logoPosition === 'right' ? 'justify-start' : 
                  'justify-end'
              }`}>
                 <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.secondary }}>Due Date</span>
                 <span style={{ fontWeight: 600, color: colors.text }}>{tokens.formatDate(data.dueDate)}</span>
              </div>
              <div className={`flex gap-3 ${
                  design?.logoPosition === 'right' ? 'justify-start' : 
                  'justify-end'
              }`}>
                 <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: colors.secondary }}>Order No</span>
                 <span style={{ fontWeight: 600, color: colors.text }}>{data.orderNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex mb-12 gap-8">
          <div className="w-1/2 pr-8 border-r" style={{ borderColor: colors.tableBorder }}>
            <h4 
              className="mb-4 border-b pb-2 inline-block" 
              style={{ ...typography.sectionTitle, color: colors.secondary, borderColor: colors.primary }}
            >
              Invoiced To
            </h4>
            <p style={{ ...typography.body, fontSize: '1.2em', fontWeight: 'bold', color: colors.headings }}>{data.billingTo.name}</p>
            <div style={{ ...typography.body, marginTop: '0.25em', color: colors.secondary }}>
               <p className="whitespace-pre-line">{data.billingTo.address}</p>
               <p>{data.billingTo.phone}</p>
            </div>
          </div>
          
          <div className="w-1/2 pl-4">
            <h4 
              className="mb-4 border-b pb-2 inline-block" 
              style={{ ...typography.sectionTitle, color: colors.secondary, borderColor: colors.primary }}
            >
              Ship From
            </h4>
            <div style={typography.body}>
              <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: colors.headings }}>{data.shipFrom.name}</p>
               <div style={{ marginTop: '0.25em', color: colors.secondary }}>
                  <p className="whitespace-pre-line">{data.shipFrom.address}</p>
                  <p>{data.shipFrom.phone}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Table */}
       <div className="flex-1 mb-8">
            <InvoiceProductTable 
               data={data}
               tokens={{
                   ...tokens,
               }}
               showAlternateRows={true}
            />
        </div>

        {/* Footer Section - Pushed to bottom via flex-col parent and flex-1 on table container or mt-auto here */}
        <div className="flex justify-between items-end mt-auto">
          
          {/* Left Side: Payment Info & Terms */}
          <div className="w-5/12">
             <div className="mb-6">
                <h5 className="mb-2" style={{ ...typography.sectionTitle, color: colors.headings }}>Terms & Conditions</h5>
                <p style={{ ...typography.small, color: colors.secondary }}>
                  {data.paymentNote || "Please pay within 15 days. Thank you for your business."}
                </p>
             </div>
             
          </div>

          {/* Right Side: Totals */}
          <div
            className="w-5/12 p-6 rounded"
            style={{ 
              backgroundColor: colors.totalsBoxBg, 
              borderLeft: `4px solid ${colors.primary}` 
            }}
          >
            <div className="flex justify-between mb-2" style={{ ...typography.body, color: colors.secondary }}>
              <span>Sub Total</span>
              <span className="font-medium" style={{ color: colors.text }}>{tokens.currencySymbol}{data.subTotal}</span>
            </div>
            <div className="flex justify-between mb-2" style={{ ...typography.body, color: colors.secondary }}>
              <span>Discount</span>
              <span className="font-medium text-red-500">{tokens.currencySymbol}{data.discount}</span>
            </div>
             <div className="flex justify-between mb-3" style={{ ...typography.body, color: colors.secondary }}>
              <span>Tax Amount</span>
              <span className="font-medium" style={{ color: colors.text }}>{tokens.currencySymbol}{data.tax || "0.00"}</span>
            </div>
            <div
              className="flex justify-between pt-3 border-t"
              style={{ ...typography.totalLabel, color: colors.primary, borderColor: colors.tableBorder }}
            >
              <span>Total</span>
              <span style={typography.totalValue}>{tokens.currencySymbol}{data.total}</span>
            </div>
            <div className="flex justify-between mt-2" style={{ ...typography.body, color: colors.secondary }}>
              <span>Due Amount</span>
              <span style={{ fontWeight: 600, color: colors.headings }}>{tokens.currencySymbol}{data.dueAmount}</span>
            </div>
            
            {/* Authorised Sign */}
            <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: colors.tableBorder }}>
              <span style={{ ...typography.small, fontWeight: 'bold', textTransform: 'uppercase', color: colors.secondary }}>
                Authorised Sign
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center italic" style={{ ...typography.small, color: colors.secondary }}>
          {data.footerMessage}
        </div>
      </div>
      
      {/* Bottom Checkered/Colored Strip for consistency with data content (Phone/Web) */}
      <div 
        className="w-full py-3 px-10 flex justify-between uppercase tracking-wider"
        style={{ ...typography.small, fontWeight: 'bold', backgroundColor: colors.primary, color: '#fff', paddingLeft: "30px", paddingRight: "30px" }}
      >
         <span>Phone: +91 123 456 7890</span>
         <span>www.yourwebsite.com</span>
         <span>support@company.com</span>
      </div>
    </div>
  );
};

export default Template3;

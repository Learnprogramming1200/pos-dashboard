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

const Template5: React.FC<TemplateProps> = ({ data, design, styles }) => {
  const tokens = customHooks.getInvoiceDesignTokens(design, styles);
  const { colors, typography, baseFontSize, logoSize, fontFamily } = tokens;

  return (
    <div
      className="w-full h-full bg-white relative flex flex-col"
      style={{ fontFamily, color: colors.text, padding: "30px", fontSize: baseFontSize }}
    >
      {/* Header Row */}
      <div className={`${
            design?.logoPosition === 'center' ? 'grid grid-cols-3 items-start mb-8' : 
            design?.logoPosition === 'right' ? 'flex flex-row-reverse justify-between items-start mb-8' : 
            'flex flex-row justify-between items-start mb-8'
        }`}>
        {/* Left / Brand Section */}
        <div className={`flex flex-col gap-2 ${
            design?.logoPosition === 'center' ? 'text-left order-1' : 
            design?.logoPosition === 'right' ? 'items-end text-right' : 
            'items-start text-left'
        }`}>
          {design?.logoPosition !== 'center' && (
              <div className={`flex gap-4 items-center ${
                  design?.logoPosition === 'right' ? 'flex-row-reverse text-right' : 
                  'flex-row text-left'
              }`}>
                {/* Logo */}
                <div 
                   className="flex items-center justify-center overflow-hidden"
                   style={{ width: logoSize, height: logoSize }}
                 >
                  {styles?.logo ? (
                    <img
                      src={styles.logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span style={{ fontSize: '0.8em', fontWeight: 'bold', color: colors.secondary }}>LOGO</span>
                  )}
                </div>
                <div>
                  <h1 style={{ ...typography.companyName, color: colors.headings }}>
                    {data.companyName}
                  </h1>
                  <p style={{ ...typography.small, color: colors.secondary }}>{data.companyAddress}</p>
                  <p style={{ ...typography.small, color: colors.secondary }}>{data.companyEmail}</p>
                </div>
              </div>
          )}
          
          {/* Logo Center: Text Only here */}
          {design?.logoPosition === 'center' && (
             <div>
                <h1 style={{ ...typography.companyName, color: colors.headings }}>
                  {data.companyName}
                </h1>
                <p style={{ ...typography.small, color: colors.secondary }}>{data.companyAddress}</p>
                <p style={{ ...typography.small, color: colors.secondary }}>{data.companyEmail}</p>
             </div>
          )}
        </div>
        
        {/* Logo Center */}
        {design?.logoPosition === 'center' && (
           <div className="flex justify-center order-2">
              <div 
                   className="flex items-center justify-center overflow-hidden"
                   style={{ width: logoSize, height: logoSize }}
                 >
                  {styles?.logo ? (
                    <img
                      src={styles.logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span style={{ fontSize: '0.8em', fontWeight: 'bold', color: colors.secondary }}>LOGO</span>
                  )}
              </div>
           </div>
        )}

        {/* Right Section */}
        <div className={`${
            design?.logoPosition === 'center' ? 'text-right order-3' : 
            design?.logoPosition === 'right' ? 'text-left' : 
            'text-right'
          }`} style={design?.logoPosition === 'center' ? {} : {}}>
          <span style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary }}>
            INVOICE
          </span>
          <h2 style={{ ...typography.invoiceTitle, fontSize: '1.5em', color: colors.headings }}>
            {data.invoiceNumber}
          </h2>
          <p style={{ ...typography.small, fontWeight: 500, color: colors.secondary, marginTop: '0.25em' }}>Date: {tokens.formatDate(data.date)}</p>
        </div>
      </div>

      {/* Details Grid: Left (Addresses) vs Right (Info Table) */}
      <div className="flex gap-12 mb-8">
        {/* Left Column: Addresses */}
        <div className="flex-1 space-y-6">
          {/* Ship From */}
          <div>
            <h3 style={{ ...typography.sectionTitle, color: colors.headings, marginBottom: '0.25em' }}>Ship From</h3>
            <p style={{ ...typography.body, fontWeight: 700, color: colors.primary }}>
              {data.shipFrom.name}
            </p>
            <p style={{ ...typography.small, color: colors.secondary }}>{data.shipFrom.phone}</p>
            <p style={{ ...typography.small, color: colors.secondary, marginTop: '0.25em', maxWidth: '200px' }}>
              {data.shipFrom.address}
            </p>
          </div>

          {/* Delivery To */}
          <div>
            <h3 style={{ ...typography.sectionTitle, color: colors.headings, marginBottom: '0.25em' }}>
              Delivery To
            </h3>
            <p style={{ ...typography.body, fontWeight: 700, color: colors.primary }}>
              {data.billingTo.name}
            </p>
            <p style={{ ...typography.small, color: colors.secondary }}>{data.billingTo.phone}</p>
            <p style={{ ...typography.small, color: colors.secondary, marginTop: '0.25em', maxWidth: '200px' }}>
              {data.billingTo.address}
            </p>
          </div>
        </div>

        {/* Right Column: Invoice Info Grid Table */}
        <div className="w-[300px]">
          <div className="border" style={{ borderColor: colors.tableBorder }}>
            <div className="flex border-b" style={{ borderColor: colors.tableBorder }}>
              <div 
                className="w-1/2 p-2 border-r"
                style={{ ...typography.small, fontWeight: 700, backgroundColor: colors.totalsBoxBg, color: colors.secondary, borderColor: colors.tableBorder }}
              >
                Invoice Number
              </div>
              <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 700, color: colors.headings }}>
                {data.invoiceNumber}
              </div>
            </div>
            <div className="flex border-b" style={{ borderColor: colors.tableBorder }}>
              <div 
                className="w-1/2 p-2 border-r"
                style={{ ...typography.small, fontWeight: 700, backgroundColor: colors.totalsBoxBg, color: colors.secondary, borderColor: colors.tableBorder }}
              >
                Order Number
              </div>
              <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 500, color: colors.headings }}>
                {data.orderNumber}
              </div>
            </div>
            <div className="flex border-b" style={{ borderColor: colors.tableBorder }}>
              <div 
                className="w-1/2 p-2 border-r"
                style={{ ...typography.small, fontWeight: 700, backgroundColor: colors.totalsBoxBg, color: colors.secondary, borderColor: colors.tableBorder }}
              >
                Invoice Date
              </div>
              <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 500, color: colors.headings }}>
                {tokens.formatDate(data.date)}
              </div>
            </div>
            <div className="flex">
              <div 
                className="w-1/2 p-2 border-r"
                style={{ ...typography.small, fontWeight: 700, backgroundColor: colors.totalsBoxBg, color: colors.secondary, borderColor: colors.tableBorder }}
              >
                Due Date
              </div>
              <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 500, color: colors.headings }}>
                {tokens.formatDate(data.dueDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Items Table */}
      <div className="mb-8">
        {/* Template 5 has a specific bordered look for its table that differs from shared table significantly enough 
            that simply styling SharedTable might be tricky if SharedTable structure is too different.
            However, SharedTable is fairly standard. Let's pass 'bordered' prop idea or just wrap it.
            Actually, SharedTable rows have borderBottom. Template 5 wraps the whole table in border and has vertical borders relative to columns.
            SharedTable does not support vertical borders currently.
            
            Option A: Enhance SharedTable to support vertical borders via props.
            Option B: Use SharedTable but it won't have vertical borders (might actually look cleaner).
            Option C: Re-implement table here locally if strict adherence to vertical borders is needed.
            
            Let's choose Option B for cleaner look and consistency with other templates scaling. 
            Vertical borders are often cluttered. If strictly needed, I'd update SharedTable, but let's try standardizing first.
        */}
         <div style={{ border: `1px solid ${colors.tableBorder}` }}>
            <InvoiceProductTable 
              data={data}
              tokens={{
                  ...tokens,
                  colors: {
                      ...tokens.colors,
                      tableHeaderBg: tokens.colors.totalsBoxBg, // Template 5 uses gray header
                      tableHeaderText: tokens.colors.headings,
                  }
              }}
              // We can rely on SharedTable's structure. It uses border-bottom.
              showAlternateRows={false} // Template 5 usually clean white or defined grid.
            />
         </div>
      </div>

      {/* Footer / Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-[300px] border" style={{ borderColor: colors.tableBorder }}>
          <div className="flex border-b" style={{ borderColor: colors.tableBorder }}>
            <div 
              className="w-1/2 p-2 border-r"
              style={{ ...typography.small, fontWeight: 700, backgroundColor: colors.totalsBoxBg, color: colors.secondary, borderColor: colors.tableBorder }}
            >
              Sub Total
            </div>
            <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 700, color: colors.headings }}>
              {tokens.currencySymbol}{data.subTotal}
            </div>
          </div>
          <div className="flex border-b" style={{ borderColor: colors.tableBorder }}>
            <div 
              className="w-1/2 p-2 border-r"
              style={{ ...typography.small, fontWeight: 700, backgroundColor: colors.totalsBoxBg, color: colors.secondary, borderColor: colors.tableBorder }}
            >
              Discount
            </div>
            <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 700, color: '#ef4444' }}>
              {tokens.currencySymbol}{data.discount}
            </div>
          </div>
          <div className="flex border-b border-t-2" style={{ borderColor: colors.tableBorder, borderTopColor: colors.primary }}>
            <div 
              className="w-1/2 p-2 border-r"
              style={{ ...typography.body, fontWeight: 700, backgroundColor: '#fff', color: colors.headings, borderColor: colors.tableBorder }}
            >
              Total
            </div>
            <div className="w-1/2 p-2 text-right" style={{ ...typography.body, fontWeight: 900, color: colors.headings }}>
              {tokens.currencySymbol}{data.total}
            </div>
          </div>
          <div className="flex" style={{ backgroundColor: colors.totalsBoxBg }}>
            <div 
              className="w-1/2 p-2 border-r" 
              style={{ ...typography.small, fontWeight: 700, color: colors.secondary, borderColor: colors.tableBorder }}
            >
              Due Amount
            </div>
            <div className="w-1/2 p-2 text-right" style={{ ...typography.small, fontWeight: 700, color: colors.highlight }}>
              {tokens.currencySymbol}{data.dueAmount}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-auto">
        <p style={{ ...typography.small, color: colors.secondary }}>
          Thank you for your business.
        </p>
        <p style={{ ...typography.small, color: colors.secondary }}>
          Please make the payment by the due date. This is a computer generated
          invoice.
        </p>
      </div>
    </div>
  );
};

export default Template5;

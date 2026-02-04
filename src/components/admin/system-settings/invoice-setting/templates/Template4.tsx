import { InvoiceDesignTypes } from "@/types/admin";
import React from "react";
import { Globe, MapPin, Phone } from "lucide-react";
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

const Template4: React.FC<TemplateProps> = ({ data, design, styles }) => {
  const tokens = customHooks.getInvoiceDesignTokens(design, styles);
  const { colors, typography, baseFontSize, logoSize, fontFamily } = tokens;

  return (
    <div
      className="w-full h-full bg-white relative flex flex-col justify-between overflow-hidden"
      style={{ fontFamily, color: colors.text, fontSize: baseFontSize }}
    >
      {/* Main Content Container */}
      <div 
        className="pb-4 z-10 flex-1 flex flex-col"
        style={{ padding: `32px` }}
      >
        {/* Header Section - 3 Column Layout updated for dynamic positioning */}
        {design?.logoPosition === 'center' ? (
             /* Center Layout: 
                Col 1: Company Details (Left)
                Col 2: Logo (Center)
                Col 3: Invoice Title/Details (Right)
             */
             <div className="flex items-start justify-between mb-8 relative z-20">
                {/* Left: Company Details */}
                <div className="w-1/3 text-left">
                    <h1 style={{ ...typography.companyName, color: colors.headings }}>{data.companyName}</h1>
                    <div style={{ ...typography.small, color: colors.secondary, marginTop: '0.5em', maxWidth: '20em', lineHeight: 1.5 }}>
                        <p>{data.companyAddress}</p>
                        <p>{data.companyEmail}</p>
                    </div>
                </div>

                {/* Center: Logo Only */}
                <div className="w-1/3 text-center pt-2 flex flex-col items-center">
                    <div 
                        className="flex items-center justify-center text-xs text-gray-400 font-medium overflow-hidden"
                        style={{ width: logoSize, height: logoSize }}
                    >
                        {styles?.logo ? (
                            <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span style={{ color: colors.secondary }}>LOGO</span>
                        )}
                    </div>
                </div>

                {/* Right: Invoice Title - moved here to balance */}
                <div className="w-1/3 text-right pt-2">
                    <h2 
                        className="italic"
                        style={{ ...typography.invoiceTitle, color: colors.primary, fontSize: '2.5em', lineHeight: 1 }}
                    >
                        Invoice
                    </h2>
                </div>
             </div>
        ) : design?.logoPosition === 'left' ? (
            /* Left Layout: Logo Left (Col 1), Title Center (Col 2), Company Right (Col 3) */
            <div className="flex items-start justify-between mb-8 relative z-20">
                {/* Left: Logo */}
                <div className="w-1/3 text-left">
                    <div 
                        className="flex items-center justify-center text-xs text-gray-400 font-medium overflow-hidden"
                        style={{ width: logoSize, height: logoSize }}
                    >
                        {styles?.logo ? (
                            <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span style={{ color: colors.secondary }}>LOGO</span>
                        )}
                    </div>
                </div>

                {/* Center: Title */}
                <div className="w-1/3 text-center pt-2">
                    <h2 
                    className="italic"
                    style={{ ...typography.invoiceTitle, color: colors.primary, fontSize: '2.5em', lineHeight: 1 }}
                    >
                    Invoice
                    </h2>
                </div>

                {/* Right: Company Details */}
                <div className="w-1/3 flex flex-col items-end text-right">
                    <h1 style={{ ...typography.companyName, color: colors.headings }}>{data.companyName}</h1>
                    <div style={{ ...typography.small, color: colors.secondary, marginTop: '0.5em', maxWidth: '20em', lineHeight: 1.5 }}>
                    <p>{data.companyAddress}</p>
                    <p>{data.companyEmail}</p>
                    </div>
                </div>
            </div>
        ) : (
             /* Right Layout (Default T4): Company Left, Title Center, Logo Right */
             <div className="flex items-start justify-between mb-8 relative z-20">
                {/* Left: Company Details */}
                <div className="w-1/3 text-left">
                    <h1 style={{ ...typography.companyName, color: colors.headings }}>{data.companyName}</h1>
                    <div style={{ ...typography.small, color: colors.secondary, marginTop: '0.5em', maxWidth: '20em', lineHeight: 1.5 }}>
                    <p>{data.companyAddress}</p>
                    <p>{data.companyEmail}</p>
                    </div>
                </div>

                {/* Center: Invoice Title */}
                <div className="w-1/3 text-center pt-2">
                    <h2 
                    className="italic"
                    style={{ ...typography.invoiceTitle, color: colors.primary, fontSize: '2.5em', lineHeight: 1 }}
                    >
                    Invoice
                    </h2>
                </div>

                {/* Right: Logo */}
                <div className="w-1/3 flex justify-end">
                    <div 
                    className="flex items-center justify-center text-xs text-gray-400 font-medium overflow-hidden"
                    style={{ width: logoSize, height: logoSize }}
                    >
                    {styles?.logo ? (
                        <img src={styles.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <span style={{ color: colors.secondary }}>LOGO</span>
                    )}
                    </div>
                </div>
            </div>
        )}

        {/* Divider */}
        <div className="w-full h-0.5 mb-8" style={{ backgroundColor: colors.tableBorder }}></div>

        {/* Info Blocks */}
        <div className="flex justify-between items-start mb-10 gap-8">
          {/* Bill To */}
          <div className="w-[30%]">
            <h3 style={{ ...typography.sectionTitle, color: colors.headings, marginBottom: '0.5em' }}>
              Invoice To:
            </h3>
            <p style={{ ...typography.body, fontWeight: 700, color: colors.primary, marginBottom: '0.25em' }}>
              {data.billingTo.name}
            </p>
            <div style={{ ...typography.body, color: colors.secondary }}>
              <p>{data.billingTo.address}</p>
              <p>{data.billingTo.phone}</p>
            </div>
          </div>

          {/* Ship From details */}
          <div className="w-[30%]">
            <h3 style={{ ...typography.sectionTitle, color: colors.headings, marginBottom: '0.5em' }}>Ship From:</h3>
            <p style={{ ...typography.body, fontWeight: 700, color: colors.primary, marginBottom: '0.25em' }}>
              {data.shipFrom.name}
            </p>
            <div style={{ ...typography.body, color: colors.secondary }}>
              <p>{data.shipFrom.address}</p>
              <p>{data.shipFrom.phone}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="w-[35%] text-right self-start">
            <div className="mb-2">
              <span style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary, display: 'block' }}>
                Invoice No
              </span>
              <p style={{ ...typography.body, fontSize: '1.25em', fontWeight: 700, color: colors.headings }}>
                #{data.invoiceNumber}
              </p>
            </div>
            <div className="mb-2">
              <span style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary, display: 'block' }}>
                Date
              </span>
              <p style={{ ...typography.body, fontWeight: 700, color: colors.headings }}>{tokens.formatDate(data.date)}</p>
            </div>
            <div className="flex justify-end gap-6 mt-4">
              <div>
                <span style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary, display: 'block' }}>
                  Order No
                </span>
                <p style={{ ...typography.body, fontWeight: 700, color: colors.headings }}>
                  {data.orderNumber}
                </p>
              </div>
              <div>
                <span style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary, display: 'block' }}>
                  Due Date
                </span>
                <p style={{ ...typography.body, fontWeight: 700, color: colors.headings }}>
                  {tokens.formatDate(data.dueDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-auto">
          <InvoiceProductTable 
             data={data}
             tokens={{
                ...tokens,
                colors: {
                  ...tokens.colors,
                  tableHeaderBg: colors.primary, // Template 4 wants Primary header
                  tableHeaderText: '#ffffff',
                }
             }}
             showAlternateRows={true}
          />
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-start mt-8">
          {/* Left: Payment Info & Terms */}
          <div className="w-1/2 pr-8 flex flex-col justify-between h-full space-y-6">
            {/* Payment Info Box */}


            <div>
              <h4 style={{ ...typography.sectionTitle, color: colors.primary, marginBottom: '0.25em' }}>
                Terms & Conditions
              </h4>
              <p className="text-justify max-w-sm ml-0" style={{ ...typography.small, color: colors.secondary }}>
                {data.footerMessage ||
                  "Before requesting any service or product, please verify specs and standard conditions."}
              </p>
            </div>

            <div className="flex items-end gap-2 mt-4">
              <div>
                <div className="mb-1 w-32 h-8 border-b border-gray-400 flex items-end justify-center pb-1">
                  <span className="font-script text-xl italic opacity-50" style={{ color: colors.secondary }}>
                    Sign
                  </span>
                </div>
                <p style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary }}>
                  Authorised Sign
                </p>
              </div>
            </div>
          </div>

          {/* Right: Totals */}
          <div className="w-5/12 ml-auto space-y-2">
            <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.tableBorder }}>
              <span style={{ ...typography.body, fontWeight: 700, color: colors.secondary }}>Subtotal</span>
              <span style={{ ...typography.body, fontWeight: 500, color: colors.headings }}>{tokens.currencySymbol}{data.subTotal}</span>
            </div>
            <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.tableBorder }}>
              <span style={{ ...typography.body, fontWeight: 700, color: colors.secondary }}>Discount</span>
              <span style={{ ...typography.body, fontWeight: 700, color: '#ef4444' }}>
                {tokens.currencySymbol}{data.discount}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b" style={{ borderColor: colors.tableBorder }}>
              <span style={{ ...typography.body, fontWeight: 700, color: colors.secondary }}>
                Tax Amount
              </span>
              <span style={{ ...typography.body, fontWeight: 500, color: colors.headings }}>
                {tokens.currencySymbol}{data.tax || "0.00"}
              </span>
            </div>

            <div 
              className="flex justify-between items-center p-3 rounded mt-2"
              style={{ backgroundColor: colors.totalsBoxBg }}
            >
              <span style={{ ...typography.totalLabel, textTransform: 'uppercase', color: colors.primary }}>
                Total
              </span>
              <span style={{ ...typography.totalValue, color: colors.primary }}>
                {tokens.currencySymbol}{data.total}
              </span>
            </div>

            <div className="flex justify-between mt-2">
              <span style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase', color: colors.secondary }}>
                Due Amount:
              </span>
              <span style={{ ...typography.body, fontWeight: 700, color: colors.highlight }}>
                {tokens.currencySymbol}{data.dueAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div 
        className="px-12 pb-8 pt-4 flex justify-between items-center z-20 relative border-t-4 rounded-br-[4rem]"
        style={{ backgroundColor: '#fff', borderColor: colors.primary, color: colors.secondary }}
      >
        {/* Decorative Bottom Corner */}
        <div 
          className="absolute -bottom-[1px] -right-[1px] w-32 h-32 rounded-tl-[100%] z-0 translate-y-16 translate-x-12 opacity-80"
          style={{ backgroundColor: colors.primary, filter: 'brightness(1.2)' }}
        ></div>
        <div 
          className="absolute -bottom-[1px] -left-[1px] w-48 h-48 rounded-tr-[100%] -z-10 translate-y-24 -translate-x-12 opacity-50"
          style={{ backgroundColor: colors.primary, filter: 'brightness(1.5)' }}
        ></div>

        <div className="flex items-center gap-2 z-10" style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase' }}>
          <Globe className="w-3 h-3" style={{ color: colors.primary }} />
          <span>www.business.com</span>
        </div>
        <div className="flex items-center gap-2 z-10" style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase' }}>
          <MapPin className="w-3 h-3" style={{ color: colors.primary }} />
          <span>123 Main Street, Los Angeles, Ca.</span>
        </div>
        <div className="flex items-center gap-2 z-10" style={{ ...typography.small, fontWeight: 700, textTransform: 'uppercase' }}>
          <Phone className="w-3 h-3" style={{ color: colors.primary }} />
          <span>123 456 789</span>
        </div>
      </div>
    </div>
  );
};

export default Template4;

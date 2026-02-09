import React from "react";
import { InvoiceDesignTypes } from "@/types/admin";
import { customHooks } from "@/hooks";

interface SharedInvoiceTableProps {
  data: any; // The invoice data object containing 'items'
  tokens: ReturnType<typeof customHooks.getInvoiceDesignTokens>; // Use the return type of our logic helper
  className?: string; // Optional wrapper class
  showAlternateRows?: boolean; // Option for striped rows
}

export const InvoiceProductTable: React.FC<SharedInvoiceTableProps> = ({
  data,
  tokens,
  className = "",
  showAlternateRows = false,
}) => {
  const { colors, typography } = tokens;

  return (
    <div className={`w-full ${className}`}>
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr
            style={{
              backgroundColor: colors.tableHeaderBg,
              color: colors.tableHeaderText,
              borderBottom: `1px solid ${colors.tableBorder}`,
            }}
          >
            <th className="py-3 px-3 text-left w-[8%]" style={typography.tableHeader}>
              #
            </th>
            <th className="py-3 px-3 text-left w-[32%]" style={typography.tableHeader}>
              Product Items
            </th>
            <th className="py-3 px-3 text-center w-[10%]" style={typography.tableHeader}>
              Qty
            </th>
            <th className="py-3 px-3 text-right w-[15%]" style={typography.tableHeader}>
              Price
            </th>
            <th className="py-3 px-3 text-right w-[10%]" style={typography.tableHeader}>
              Disc.
            </th>
            <th className="py-3 px-3 text-right w-[10%]" style={typography.tableHeader}>
              Tax
            </th>
            <th className="py-3 px-3 text-right w-[15%]" style={typography.tableHeader}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, index: number) => {
            const isAlternate = index % 2 !== 0;
            const rowBg = showAlternateRows && isAlternate ? colors.totalsBoxBg : "transparent";
            
            return (
              <tr
                key={index}
                style={{
                  backgroundColor: rowBg,
                  borderBottom: `1px solid ${colors.tableBorder}`,
                  color: colors.text,
                }}
              >
                <td className="py-3 px-3 text-left" style={{ ...typography.lineItem, color: colors.secondary }}>
                  {item.sr}
                </td>
                <td className="py-3 px-3 text-left">
                  <p style={{ ...typography.lineItem, fontWeight: 700, color: colors.headings }}>
                    {item.name}
                  </p>
                  {/* Optional Description if data has it, assume small */}
                 {/* <p style={{ ...typography.small, color: colors.secondary }}>Desc...</p> */}
                </td>
                <td className="py-3 px-3 text-center" style={typography.lineItem}>
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-right" style={typography.lineItem}>
                  {tokens.currencySymbol}{item.unitPrice}
                </td>
                <td className="py-3 px-3 text-right text-red-500" style={typography.lineItem}>
                  {tokens.currencySymbol}{item.discountAmount}
                </td>
                <td className="py-3 px-3 text-right" style={{ ...typography.lineItem, color: colors.secondary }}>
                  {tokens.currencySymbol}{item.taxAmount}
                </td>
                <td className="py-3 px-3 text-right" style={{ ...typography.lineItem, fontWeight: 700, color: colors.headings }}>
                   {tokens.currencySymbol}{item.lineTotal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

"use client";

import React from "react";
import SwalHelper from "@/components/ui/swal";
import { Payroll } from "@/types/admin/hrm/Payroll";
import { Constants } from "@/constant";

interface SalarySlipProps {
  payroll: Payroll;
  onClose: () => void;
}

export function SalarySlip({ payroll, onClose }: SalarySlipProps) {
  const handleGeneratePDF = async () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        SwalHelper.error({ text: 'Please allow pop-ups to generate PDF' });
        return;
      }

      const monthYear = `${payroll.month} ${payroll.year}`;
      const status = payroll.status || 'Pending';
      const generatedDate = new Date().toLocaleDateString();

      // Format dates
      const paidAtDate = payroll.paidAt
        ? (typeof payroll.paidAt === 'string' && payroll.paidAt.includes('/')
          ? payroll.paidAt
          : new Date(payroll.paidAt).toLocaleDateString())
        : 'N/A';

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Salary Slip - ${payroll.staffName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 15px;
      color: #333;
      font-size: 14px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
    }
    .header h1 {
      color: #1f2937;
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 3px 0;
      color: #6b7280;
    }
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 15px;
    }
    .info-box {
      flex: 1;
      background-color: #f9fafb;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .info-box h3 {
      border-bottom: 1px solid #3b82f6;
      padding-bottom: 5px;
      margin: 0 0 8px 0;
      color: #1f2937;
      font-size: 16px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      padding: 2px 0;
    }
    .info-label {
      font-weight: 600;
      color: #4b5563;
      font-size: 13px;
    }
    .info-value {
      color: #1f2937;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      font-size: 13px;
    }
    th {
      background-color: #3b82f6;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .section {
      margin: 15px 0;
      page-break-inside: avoid;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 5px;
      margin-bottom: 10px;
      color: #1f2937;
    }
    .total-section {
      text-align: right;
      margin-top: 15px;
      background-color: #f9fafb;
      padding: 10px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .total-row {
      margin: 5px 0;
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    .total-label {
      font-weight: 600;
      display: inline-block;
      width: 200px;
      text-align: right;
      color: #4b5563;
    }
    .total-value {
      color: #1f2937;
      font-weight: 600;
    }
    .net-salary-row {
      font-size: 1.2em;
      font-weight: bold;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #3b82f6;
      color: #2563eb;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      ${status === 'Paid' ? 'background-color: #d1fae5; color: #065f46;' :
          status === 'Pending' ? 'background-color: #fef3c7; color: #92400e;' :
            'background-color: #fee2e2; color: #991b1b;'}
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
      page-break-inside: avoid;
    }
    .attendance-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .attendance-card {
      text-align: center;
      padding: 10px;
      background-color: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .attendance-value {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .attendance-label {
      font-size: 11px;
      color: #6b7280;
    }
    @media print {
      body {
        margin: 10mm;
      }
      .no-print {
        display: none;
      }
      .info-box, .section, .total-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>POS DASHBOARD</h1>
    <p style="font-size: 20px; font-weight: 600; margin-top: 10px;">SALARY SLIP</p>
    <p>For the month of ${monthYear}</p>
    <p>Status: <span class="status-badge">${status}</span></p>
  </div>
  
  <div class="info-section">
    <div class="info-box">
      <h3>Employee Information</h3>
      <div class="info-row">
        <span class="info-label">Employee Name:</span>
        <span class="info-value">${payroll.staffName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Employee ID:</span>
        <span class="info-value">${payroll.staffId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Designation:</span>
        <span class="info-value">${payroll.designation || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Store:</span>
        <span class="info-value">${payroll.branchName || 'N/A'}</span>
      </div>
    </div>
    <div class="info-box">
      <h3>Payment Details</h3>
      <div class="info-row">
        <span class="info-label">Payment Status:</span>
        <span class="info-value"><span class="status-badge">${status}</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Paid Date:</span>
        <span class="info-value">${paidAtDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${payroll.paymentMethod || 'N/A'}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Earnings</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td style="text-align: right;">₹${Number(payroll.basicSalary || 0).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Attendance Details</div>
    <div class="attendance-grid">
      <div class="attendance-card">
        <div class="attendance-value" style="color: #2563eb;">${payroll.daysWorked || 0}</div>
        <div class="attendance-label">Days Worked</div>
      </div>
      <div class="attendance-card">
        <div class="attendance-value" style="color: #6b7280;">${payroll.totalDays || 0}</div>
        <div class="attendance-label">Total Days</div>
      </div>
      <div class="attendance-card">
        <div class="attendance-value" style="color: #10b981;">${payroll.paidLeaves || 0}</div>
        <div class="attendance-label">Paid Leaves</div>
      </div>
      <div class="attendance-card">
        <div class="attendance-value" style="color: #ef4444;">${payroll.unpaidDays || 0}</div>
        <div class="attendance-label">Unpaid Days</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Deductions</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Unpaid Days Deduction</td>
          <td style="text-align: right;">₹${Number(payroll.deductions || 0).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="total-section">
    <div class="total-row net-salary-row">
      <span class="total-label">Net Salary:</span>
      <span class="total-value" style="color: #2563eb; font-size: 1.3em;">₹${Number(payroll.netSalary || 0).toLocaleString()}</span>
    </div>
  </div>

  ${payroll.remarks ? `
    <div class="section">
      <div class="section-title">Remarks</div>
      <p style="padding: 10px; background-color: #f9fafb; border-radius: 4px; border-left: 4px solid #3b82f6;">
        ${payroll.remarks}
      </p>
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>This is a computer generated salary slip and does not require signature.</strong></p>
    <p>Generated on: ${generatedDate}</p>
  </div>
</body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } catch (err: any) {
      SwalHelper.error({ text: err?.message || 'Failed to generate PDF' });
    }
  };

  const handleEmail = () => {
    // In a real application, this would send an email via API
    alert(`Email functionality would send salary slip to ${payroll.staffName} via email.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-xl relative">
        <div className="flex justify-between items-center border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.posDashboard}</h1>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{Constants.adminConstants.salarySlipStrings.salarySlip}</h2>
            <p className="text-gray-600 dark:text-gray-400">{Constants.adminConstants.salarySlipStrings.forTheMonthOf} {payroll.month} {payroll.year}</p>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.employeeNameLabel}:</span>
                <span className="text-gray-700 dark:text-gray-300">{payroll.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.employeeIdLabel}:</span>
                <span className="text-gray-700 dark:text-gray-300">{payroll.staffId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.designationLabel}:</span>
                <span className="text-gray-700 dark:text-gray-300">{payroll.designation || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.storeLabel}:</span>
                <span className="text-gray-700 dark:text-gray-300">{payroll.branchName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.statusLabel}:</span>
                <span className={`px-2 py-1 rounded-full text-sm ${payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                  payroll.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {payroll.status}
                </span>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{Constants.adminConstants.salarySlipStrings.earningsLabel}</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-t font-semibold text-lg">
                <span className="text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.salaryLabel}</span>
                <span className="text-green-600">₹{payroll.basicSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{Constants.adminConstants.salarySlipStrings.attendanceDetailsLabel}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{payroll.daysWorked}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{Constants.adminConstants.salarySlipStrings.daysWorkedLabel}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{payroll.totalDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{Constants.adminConstants.salarySlipStrings.totalDaysLabel}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{payroll.paidLeaves}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{Constants.adminConstants.salarySlipStrings.paidLeavesLabel}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{payroll.unpaidDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{Constants.adminConstants.salarySlipStrings.unpaidDaysLabel}</div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{Constants.adminConstants.salarySlipStrings.deductionsLabel}</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-700 dark:text-gray-300">{Constants.adminConstants.salarySlipStrings.unpaidDaysLabel}</span>
                <span className="font-medium text-red-600">₹{payroll.deductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="border-t pt-4">
            <div className="flex justify-between py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{Constants.adminConstants.salarySlipStrings.netSalaryLabel}</span>
              <span className="text-2xl font-bold text-blue-600">₹{payroll.netSalary.toLocaleString()}</span>
            </div>
          </div>

          {/* Remarks */}
          {payroll.remarks && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{Constants.adminConstants.salarySlipStrings.remarksLabel}</h3>
              <p className="text-gray-700 dark:text-gray-300">{payroll.remarks}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              onClick={handleGeneratePDF}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {Constants.adminConstants.salarySlipStrings.downloadPdfLabel}
            </button>
            <button
              onClick={handleEmail}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {Constants.adminConstants.salarySlipStrings.emailToEmployeeLabel}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {Constants.adminConstants.cancelLabel}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
            <p> {Constants.adminConstants.salarySlipStrings.generatedOnLabelText}</p>
            <p>{Constants.adminConstants.salarySlipStrings.generatedOnLabel}: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Performance Migration Script
 * 
 * This script updates all dashboard pages to use direct imports instead of 
 * barrel exports, which dramatically improves page load times by enabling
 * proper code-splitting.
 * 
 * Run with: node scripts/migrate-imports.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const DASHBOARD_DIR = './src/app/dashboard';

// Mapping of barrel export paths to direct import paths
const COMPONENT_MAPPINGS = {
    // Inventory
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.Products': '@/components/admin/inventory/products',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.CategoryComponent': '@/components/admin/inventory/category',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.SubCategoryComponent': '@/components/admin/inventory/subcategory',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.BrandsComponent': '@/components/admin/inventory/brand',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.UnitsComponent': '@/components/admin/inventory/unit',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.VariationComponent': '@/components/admin/inventory/variant',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.WarrantyComponent': '@/components/admin/inventory/warranty',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.LowStockComponent': '@/components/admin/inventory/low-stock',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.ExpiredStockComponent': '@/components/admin/inventory/expired-stock',
    'WebComponents.AdminComponents.AdminWebComponents.InventoryWebComponents.PrintLabels': '@/components/admin/inventory/print-labels',

    // Stock
    'WebComponents.AdminComponents.AdminWebComponents.AdminStockWebComponents.StockAdjustments': '@/components/admin/stock/StockAdjustments',
    'WebComponents.AdminComponents.AdminWebComponents.AdminStockWebComponents.StockTransfers': '@/components/admin/stock/StockTransfers',

    // HRM
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.StaffManagement': '@/components/admin/hrm/StaffManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.Attendance': '@/components/admin/hrm/Attendance',
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.LeaveManagement': '@/components/admin/hrm/LeaveManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.LeaveTypeManagement': '@/components/admin/hrm/LeaveTypeManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.HolidayManagement': '@/components/admin/hrm/HolidayManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.ShiftManagement': '@/components/admin/hrm/ShiftManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminHRMWebComponents.PayrollManagement': '@/components/admin/hrm/PayrollManagement',
    'WebComponents.AdminComponents.AdminWebComponents.ShiftCalendar': '@/components/admin/shift-calendar',

    // Finance
    'WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.TaxManagement': '@/components/admin/finance/TaxManagement',
    'WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.ExpenseManagement': '@/components/admin/finance/ExpenseManagement',
    'WebComponents.AdminComponents.AdminWebComponents.FinanceAdminWebComponents.ExpenseCategoryManagement': '@/components/admin/finance/ExpenseCategoryManagement',

    // Purchase
    'WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.PurchaseOrderManagement': '@/components/admin/purchase/PurchaseOrderManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.PurchaseReturnManagement': '@/components/admin/purchase/PurchaseReturnManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.SupplierManagement': '@/components/admin/purchase/SupplierManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPurchaseWebComponents.PurchaseOverview': '@/components/admin/purchase/PurchaseOverview',

    // Sales
    'WebComponents.AdminComponents.AdminWebComponents.AdminSalesWebComponents.SalesManagement': '@/components/admin/sales/SalesManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminSalesWebComponents.SalesReturnManagement': '@/components/admin/sales/SalesReturnManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminSalesWebComponents.POSManagement': '@/components/admin/sales/POSManagement',

    // Promo
    'WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.CouponManagement': '@/components/admin/promo/CouponManagement',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.GiftCardConfig': '@/components/admin/promo/GiftCardConfig',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.LoyaltyPointsConfig': '@/components/admin/promo/LoyaltyPointsConfig',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.LoyaltyPointsHistory': '@/components/admin/promo/LoyaltyPointsHistory',
    'WebComponents.AdminComponents.AdminWebComponents.AdminPromoWebComponents.GiftCardHistory': '@/components/admin/promo/GiftCardHistory',

    // People
    'WebComponents.AdminComponents.AdminWebComponents.AdminCustomerWebComponents.CustomerManagement': '@/components/admin/people/CustomerManagement',

    // Reports
    'WebComponents.AdminComponents.AdminWebComponents.Reports.SalesReport': '@/components/admin/reports/SalesReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.PurchaseReport': '@/components/admin/reports/PurchaseReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.ExpensesReport': '@/components/admin/reports/ExpensesReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.AnnualReport': '@/components/admin/reports/AnnualReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.ProfitLossReport': '@/components/admin/reports/ProfitLossReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.TaxReport': '@/components/admin/reports/TaxReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.PayrollReport': '@/components/admin/reports/PayrollReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.TransactionReport': '@/components/admin/reports/TransactionReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.UserLoginReport': '@/components/admin/reports/UserLoginReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.UserActivityReport': '@/components/admin/reports/UserActivityReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.DailyCashierReport': '@/components/admin/reports/DailyCashierReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.StockHistoryReport': '@/components/admin/reports/StockHistoryReport',
    'WebComponents.AdminComponents.AdminWebComponents.Reports.CustomerReport': '@/components/admin/reports/CustomerReport',

    // Store Management
    'WebComponents.AdminComponents.AdminWebComponents.StoreManagement.StoreManagementComponent': '@/components/admin/store/StoreManagement',

    // User Management
    'WebComponents.AdminComponents.AdminWebComponents.AdminUserManagementWebComponents.RolesPermission': '@/components/admin/user-management/RolesPermission',

    // Notifications
    'WebComponents.AdminComponents.AdminWebComponents.AdminNotificationWebComponents.EmailNotificationTemplates': '@/components/admin/notifications/EmailNotificationTemplates',
    'WebComponents.AdminComponents.AdminWebComponents.AdminNotificationWebComponents.SMSNotificationTemplates': '@/components/admin/notifications/SMSNotificationTemplates',
    'WebComponents.AdminComponents.AdminWebComponents.AdminNotificationWebComponents.WhatsAppNotificationTemplates': '@/components/admin/notifications/WhatsAppNotificationTemplates',

    // System Settings
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.InvoiceSettings.InvoiceSettingsClient': '@/components/admin/settings/invoice/InvoiceSettingsClient',
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.CurrencySetting': '@/components/admin/settings/CurrencySetting',
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.MailSetting': '@/components/admin/settings/MailSetting',
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.SmsSetting': '@/components/admin/settings/SmsSetting',
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.WhatsappSetting': '@/components/admin/settings/WhatsappSetting',
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.PaymentSetting': '@/components/admin/settings/PaymentSetting',
    'WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.MiscSetting': '@/components/admin/settings/MiscSetting',
};

function getAllFiles(dir, files = []) {
    const entries = readdirSync(dir);

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            getAllFiles(fullPath, files);
        } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
            files.push(fullPath);
        }
    }

    return files;
}

function migrateFile(filePath) {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    const addedImports = new Set();

    // Check if file uses WebComponents
    if (!content.includes('WebComponents.AdminComponents')) {
        return false;
    }

    console.log(`Processing: ${relative('.', filePath)}`);

    // Replace each component usage
    for (const [barrelPath, directPath] of Object.entries(COMPONENT_MAPPINGS)) {
        const regex = new RegExp(`<${barrelPath.replace(/\./g, '\\.')}`, 'g');

        if (regex.test(content)) {
            const componentName = directPath.split('/').pop();
            const capitalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);

            // Replace JSX usage
            content = content.replace(regex, `<${capitalizedName}`);

            // Track imports to add
            addedImports.add(`import ${capitalizedName} from '${directPath}';`);
            modified = true;

            console.log(`  - Replaced ${barrelPath} with ${capitalizedName}`);
        }
    }

    if (modified) {
        // Remove old import
        content = content.replace(/import { WebComponents } from ['"]@\/components['"];?\n?/g, '');

        // Add new imports after other imports
        const importSection = Array.from(addedImports).join('\n');
        const lastImportMatch = content.match(/^import .+;?\n/gm);

        if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            const insertPos = content.lastIndexOf(lastImport) + lastImport.length;
            content = content.slice(0, insertPos) + '\n' + importSection + content.slice(insertPos);
        }

        writeFileSync(filePath, content);
        console.log(`  ✓ Updated successfully`);
        return true;
    }

    return false;
}

// Main
console.log('🚀 Starting import migration for performance optimization...\n');

const files = getAllFiles(DASHBOARD_DIR);
let updatedCount = 0;

for (const file of files) {
    if (migrateFile(file)) {
        updatedCount++;
    }
}

console.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
console.log('🔄 Please restart your dev server to see the changes.');

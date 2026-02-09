import { useEmployees } from "./useEmployees";
import { useStores } from "./useStores";
import { useShifts } from "./useShifts";
import { useAdvertisements } from "./useAdvertisements";
import { useBarcodeSuggestions } from "./useBarcodeSuggestions";
import { usePayment } from "./usePayment";
import { usePaymentGateways } from "./usePaymentGateways";
import { usePayPalPayment } from "./usePayPalPayment";
import { useRagToggle } from "./useRagToggle";
import { useRazorpayPayment } from "./useRazorpayPayment";
import { useListFilters } from "./useListFilters";
import { useProductLookup } from "./useProductLookup";
import { useShiftAssignments } from "./useShiftAssignments";
import { getInvoiceDesignTokens } from "./useInvoiceDesign";
import { useUserPermissions } from "./useUserPermissions";

export const customHooks = {
    useEmployees,
    useStores,
    useShifts,
    useAdvertisements,
    useBarcodeSuggestions,
    usePayment,
    usePaymentGateways,
    usePayPalPayment,
    useRagToggle,
    useRazorpayPayment,
    useListFilters,
    useProductLookup,
    useShiftAssignments,
    getInvoiceDesignTokens,
    useUserPermissions,
};
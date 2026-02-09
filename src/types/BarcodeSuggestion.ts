import { AdminTypes } from ".";
export interface BarcodeSuggestion {
    barcode: string;
    productName: string;
    sku: string;
    productId: string;
}

export interface UseBarcodeSuggestionsProps {
    products: AdminTypes.InventoryTypes.ProductTypes.Product[];
    debounceMs?: number;
}



export interface BarcodeSuggestionDropdownProps {
    suggestions: BarcodeSuggestion[];
    isLoading: boolean;
    onSuggestionSelect: (suggestion: BarcodeSuggestion) => void;
    onInputChange: (value: string) => void;
    value: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
  }
  
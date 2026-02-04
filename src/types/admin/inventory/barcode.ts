import { InventoryTypes } from '..';

export interface BarcodeGeneratorProps {
    product: InventoryTypes.ProductTypes.Product | null;
    className?: string;
    mode?: 'single' | 'label' | 'bulk';
    onGenerate?: (barcode: string) => void;
    onPrint?: (barcode: string) => void;
    // Live preview visibility toggles from parent (optional)
    showProductName?: boolean;
    showPrice?: boolean;
    showSKU?: boolean;
    showExpiryDate?: boolean;
    showNote?: boolean;
    showVariation?: boolean;
    fontSizeName?: number;
    fontSizeVariation?: number;
    fontSizePrice?: number;
    fontSizeSKU?: number;
    fontSizeNote?: number;
    fontSizeExpiryDate?: number;
    note?: string;
    overrideExpiry?: string;
    background?: string;
    lineColor?: string;
}

export interface BarcodeSettings {
    format: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14' | 'MSI' | 'pharmacode' | 'codabar';
    width: number;
    height: number;
    displayValue: boolean;
    fontSize: number;
    margin: number;
    background: string;
    lineColor: string;
    textAlign: 'left' | 'center' | 'right';
    textPosition: 'bottom' | 'top';
    textMargin: number;
}

export interface LabelSettings {
    showProductName: boolean;
    showPrice: boolean;
    showSKU: boolean;
    showBarcode: boolean;
    showBusinessName: boolean;
    showExpiryDate: boolean;
    showNote: boolean;
    businessName: string;
    fontSize: number;
    labelWidth: number;
    labelHeight: number;
}

export interface BarcodePreviewProps {
    showPreview: boolean;
    previewProduct: any | null;
    showName: boolean;
    showVariation: boolean;
    showPrice: boolean;
    showSKU: boolean;
    showExpiryDate: boolean;
    showNote: boolean;
    sizeName: number;
    sizeVariation: number;
    sizePrice: number;
    sizeSKU: number;
    sizeExpiryDate: number;
    sizeNote: number;
    note: string;
    overrideExpiry: string;
}

export interface LabelSettingsProps {
    isLabelSectionEnabled: boolean;
    previewProduct: any | null;
    overrideExpiry: string;
    setOverrideExpiry: (value: string) => void;
    note: string;
    setNote: (value: string) => void;
    showName: boolean;
    setShowName: (value: boolean) => void;
    sizeName: number;
    setSizeName: (value: number) => void;
    showVariation: boolean;
    setShowVariation: (value: boolean) => void;
    sizeVariation: number;
    setSizeVariation: (value: number) => void;
    showPrice: boolean;
    setShowPrice: (value: boolean) => void;
    sizePrice: number;
    setSizePrice: (value: number) => void;
    showSKU: boolean;
    setShowSKU: (value: boolean) => void;
    sizeSKU: number;
    setSizeSKU: (value: number) => void;
    showExpiryDate: boolean;
    setShowExpiryDate: (value: boolean) => void;
    sizeExpiryDate: number;
    setSizeExpiryDate: (value: number) => void;
    showNote: boolean;
    setShowNote: (value: boolean) => void;
    sizeNote: number;
    setSizeNote: (value: number) => void;
}

export interface LabelTableProps {
    labelRows: Array<{ id: string; name: string; sku?: string; labels: number; price?: number; fullProduct?: any }>;
    setLabelRows: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; sku?: string; labels: number; price?: number; fullProduct?: any }>>>;
    isLabelSectionEnabled: boolean;
    allProducts: InventoryTypes.ProductTypes.Product[];
}

export interface BarcodeSettingsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    barcodeSettings: BarcodeSettings;
    updateBarcodeSetting: <K extends keyof BarcodeSettings>(key: K, value: BarcodeSettings[K]) => void;
}

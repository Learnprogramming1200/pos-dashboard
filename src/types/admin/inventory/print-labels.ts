export interface Product {
    id: string;
    name: string;
    labels: number;
    packingDate: string;
    priceGroup: string;
    price?: number;
    variation?: string;
    barcode?: string;
  }
  export interface LabelConfig {
    productName: boolean;
    productNameSize: number;
    productVariation: boolean;
    productVariationSize: number;
    productPrice: boolean;
    productPriceSize: number;
    showPrice: 'inc' | 'exc';
    businessName: boolean;
    businessNameSize: number;
    printPackingDate: boolean;
    packingDateSize: number;
  }
  export interface SearchResult {
    id: string;
    name: string;
    price: number;
    variation: string;
    barcode: string;
  }
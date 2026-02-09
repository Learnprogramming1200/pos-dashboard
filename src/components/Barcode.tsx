"use client";

import React from 'react';
import { RefreshCw, Package, X } from "lucide-react";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { LabelTable } from './barcode/LabelTable';
import { LabelSettings } from './barcode/LabelSettings';
import { ManualProductForm } from './barcode/ManualProductForm';
import { BarcodePreview } from './barcode/BarcodePreview';
import { AdminTypes } from "@/types";
import { barcodeUtils, useBarcodeHandlers } from '@/utils/barcodeUtils';
export default function BarcodeComponent({ initialProducts }:
  { initialProducts: AdminTypes.InventoryTypes.ProductTypes.Product[] }) {

  const safeInitialProducts = Array.isArray(initialProducts) ? initialProducts : [];
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null);
  const [allProducts, setAllProducts] = React.useState<AdminTypes.InventoryTypes.ProductTypes.Product[]>(initialProducts);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState<boolean>(false);
  const [labelRows, setLabelRows] = React.useState<Array<{ id: string; name: string; sku?: string; labels: number; price?: number; fullProduct?: AdminTypes.InventoryTypes.ProductTypes.Product }>>([]);
  const [activeTab, setActiveTab] = React.useState('lookup');
  const { product, error, loading, lookupProduct, clearResult } = customHooks.useProductLookup({ products: safeInitialProducts });
  const [labelsCount, setLabelsCount] = React.useState<number>(1);
  const [showName, setShowName] = React.useState<boolean>(true);
  const [showVariation, setShowVariation] = React.useState<boolean>(true);
  const [showPrice, setShowPrice] = React.useState<boolean>(true);
  const [showSKU, setShowSKU] = React.useState<boolean>(true);
  const [sizeName, setSizeName] = React.useState<number>(15);
  const [sizeVariation, setSizeVariation] = React.useState<number>(17);
  const [sizePrice, setSizePrice] = React.useState<number>(17);
  const [sizeSKU, setSizeSKU] = React.useState<number>(12);
  const [showNote, setShowNote] = React.useState<boolean>(true);
  const [sizeNote, setSizeNote] = React.useState<number>(14);
  const [showExpiryDate, setShowExpiryDate] = React.useState<boolean>(true);
  const [sizeExpiryDate, setSizeExpiryDate] = React.useState<number>(12);
  const [previewProduct, setPreviewProduct] = React.useState<any | null>(null);
  const [showPreview, setShowPreview] = React.useState<boolean>(false);
  const [note, setNote] = React.useState<string>('');
  const [overrideExpiry, setOverrideExpiry] = React.useState<string>('');
  const [scanCode, setScanCode] = React.useState<string>('');
  const scanTimerRef = React.useRef<number | null>(null);
  const {
    searchTerm,
    setSearchTerm,
    filteredData
  } = customHooks.useListFilters(allProducts, {
    searchKeys: ['productName', 'SKU', 'barcode']
  });

  const commitScan = async (code: string) => {
    const v = code.trim();
    if (!v) return;
    setScanCode(v);
    // lookup and display
    try {
      const result = await lookupProduct(v);
      const p: any = result?.product;
      if (p) {
        setSelectedProduct(p);
        setPreviewProduct(p);
        setShowPreview(true);
        setLabelRows([{ id: p._id || p.id, name: p.productName || p.name, sku: p.SKU || p.sku, labels: labelsCount, price: barcodeUtils.getProductPrice(p) }]);
        setSearchTerm('');
        setScanCode('');
      }
    } catch { }
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on input/textarea/select to not disturb typing, except our scan input
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || (target?.isContentEditable ?? false);
      if (isInput && (target as HTMLInputElement).id !== 'barcode-scan-input') return;

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
        commitScan(scanCode);
        return;
      }
      if (e.key.length === 1) {
        setScanCode(prev => prev + e.key);
        if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
        scanTimerRef.current = window.setTimeout(() => {
          commitScan(scanCode);
        }, 120);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [scanCode]);

  React.useEffect(() => {
    if (!previewProduct) return;
    const p: any = previewProduct;
    setNote('');
    setOverrideExpiry(p.expiryDate || '');
  }, [previewProduct]);
  const filteredSuggestions = React.useMemo(() => {
    return filteredData.slice(0, 20);
  }, [filteredData]);

  React.useEffect(() => {
    if (filteredSuggestions.length === 1 && searchTerm.trim()) {
      const firstProduct = filteredSuggestions[0];
      setSelectedProduct(firstProduct);
      setPreviewProduct(firstProduct);
      setShowPreview(true);
    }
  }, [filteredSuggestions, searchTerm]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-suggestions-container')) {
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [manualProduct, setManualProduct] = React.useState({
    name: '',
    sku: '',
    barcode: '',
    price: '',
    description: '',
    category: '',
    brand: ''
  });
  const [manualProductError, setManualProductError] = React.useState<string | null>(null);
  const isLabelSectionEnabled = !!selectedProduct;
  const handleClearAll = React.useCallback(() => {
    setSelectedProduct(null);
    setPreviewProduct(null);
    setShowPreview(false);
    clearResult();
    setSearchTerm('');
    setSuggestionsOpen(false);
    setLabelRows([]);
    setNote('');
    setOverrideExpiry('');
    setScanCode('');
    setManualProduct({
      name: '', sku: '', barcode: '', price: '',
      description: '', category: '', brand: ''
    });
    setManualProductError(null);
    setActiveTab('lookup');
  }, [clearResult]);

  const handleManualProductChange = React.useCallback((field: string, value: string) => {
    setManualProduct(prev => ({ ...prev, [field]: value }));
    setManualProductError(null);
  }, []);

  const handleGenerateManualProduct = React.useCallback(() => {
    if (!manualProduct.name.trim()) {
      setManualProductError('Product name is required');
      return;
    }
    if (!manualProduct.sku.trim() && !manualProduct.barcode.trim()) {
      setManualProductError('Either SKU or Barcode is required');
      return;
    }
    const productId = `MANUAL_${Date.now()}`;
    const barcodeValue = manualProduct.barcode || manualProduct.sku;
    const newProduct: any = {
      id: productId,
      name: manualProduct.name,
      productName: manualProduct.name,
      description: manualProduct.description,
      sku: manualProduct.sku || barcodeValue,
      barcode: barcodeValue,
      category: manualProduct.category,
      brand: manualProduct.brand,
      price: parseFloat(manualProduct.price) || 0,
      sellingPrice: parseFloat(manualProduct.price) || 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variations: false
    };
    setSelectedProduct(newProduct);
    setManualProductError(null);
  }, [manualProduct]);

  const handleClearManualProduct = React.useCallback(() => {
    setManualProduct({
      name: '', sku: '', barcode: '', price: '',
      description: '', category: '', brand: ''
    });
    setManualProductError(null);
  }, []);

  const addCurrentToLabelList = React.useCallback(async () => {
    const pAny: any = selectedProduct;
    if (pAny && (pAny.uniqueId || pAny._id || pAny.id)) {
      const productId = pAny.uniqueId || pAny._id || pAny.id;
      setLabelRows([{
        id: productId,
        name: pAny.productName || pAny.name,
        sku: pAny.SKU || pAny.sku,
        labels: labelsCount,
        price: barcodeUtils.getProductPrice(pAny),
        fullProduct: pAny
      }]);
      return;
    }

    if (filteredSuggestions?.length > 0) {
      const s: any = filteredSuggestions[0];
      setSelectedProduct(s);
      const productId = s.uniqueId || s._id || s.id;
      setLabelRows([{
        id: productId,
        name: s.productName || s.name,
        sku: s.SKU || s.sku,
        labels: labelsCount,
        price: barcodeUtils.getProductPrice(s),
        fullProduct: s
      }]);
      return;
    }

    if (searchTerm.trim()) {
      const result = await lookupProduct(searchTerm.trim());
      if (result.product) {
        const rp: any = result.product;
        setSelectedProduct(rp);
        setLabelRows([{
          id: rp.uniqueId || rp._id || rp.id,
          name: rp.productName || rp.name,
          sku: rp.SKU || rp.sku,
          labels: labelsCount,
          price: barcodeUtils.getProductPrice(rp),
          fullProduct: rp
        }]);
        setSearchTerm('');
      }
    }
  }, [selectedProduct, filteredSuggestions, searchTerm, labelsCount, lookupProduct]);
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSuggestionsOpen(true);
  }, [setSearchTerm]);

  const handleSearchKeyDown = React.useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await addCurrentToLabelList();
      setSuggestionsOpen(false);
    }
    if (e.key === 'Escape') setSuggestionsOpen(false);
  }, [addCurrentToLabelList]);

  const handleSelectProduct = React.useCallback(async (p: any) => {
    setSelectedProduct(p);
    setPreviewProduct(p);
    setShowPreview(true);
    setSearchTerm('');
    setSuggestionsOpen(false);
    setLabelRows([{
      id: p._id || p.id,
      name: (p as any).productName || (p as any).name,
      sku: (p as any).SKU || (p as any).sku,
      labels: labelsCount,
      price: barcodeUtils.getProductPrice(p as any),
      fullProduct: p
    }]);
  }, [labelsCount]);

  const handlers = React.useMemo(() => ({
    handleClearAll,
    handleManualProductChange,
    handleGenerateManualProduct,
    handleClearManualProduct,
    addCurrentToLabelList,
    handleSelectProduct
  }), [handleClearAll, handleManualProductChange, handleGenerateManualProduct, handleClearManualProduct, addCurrentToLabelList, handleSelectProduct]);
  const settings = React.useMemo(() => ({
    sizeName,
    sizeVariation,
    sizePrice,
    sizeSKU,
    sizeExpiryDate,
    sizeNote,
    note
  }), [sizeName, sizeVariation, sizePrice, sizeSKU, sizeExpiryDate, sizeNote, note]);

  const showSettings = React.useMemo(() => ({
    showName,
    showVariation,
    showPrice,
    showSKU,
    showExpiryDate,
    showNote
  }), [showName, showVariation, showPrice, showSKU, showExpiryDate, showNote]);

  const { handlePrintBarcode, handleBulkPrint } = useBarcodeHandlers({
    selectedProduct,
    labelRows,
    allProducts,
    setAllProducts,
    settings,
    showSettings,
    overrideExpiry
  });

  const printUtils = { handlePrintBarcode, handleBulkPrint }; // Keep same name for compatibility with existing usage

  return (
    <>
      {/* BarcodeHeader - inlined to prevent recreation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-[30px] gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {Constants.adminConstants.BARCODE_CONSTANTS.title}
            {selectedProduct ? ` > ${(selectedProduct as any).productName || (selectedProduct as any).name}` : ""}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {Constants.adminConstants.BARCODE_CONSTANTS.scanDescription}
          </p>
        </div>
        <WebComponents.UiComponents.UiWebComponents.Button
          className="bg-primary text-white hover:bg-primaryHover w-full sm:w-auto"
          onClick={handlers.handleClearAll}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {Constants.adminConstants.BARCODE_CONSTANTS.clearAll}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>

      <div className="bg-white rounded-[8px] dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2E2E2E] shadow-sm h-full w-full">
        {/* SearchSection - inlined to prevent recreation */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-[80px] w-full min-w-0">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:flex-1">
              <div className="relative w-full sm:flex-1 sm:min-w-0 search-suggestions-container">
                <WebComponents.UiComponents.UiWebComponents.SearchBar
                  placeholder={Constants.adminConstants.BARCODE_CONSTANTS.searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
                {suggestionsOpen && filteredSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#2E2E2E] rounded-lg shadow-2xl max-h-80 overflow-auto text-sm">
                    {filteredSuggestions.map((p) => (
                      <div
                        key={(p as any)._id || (p as any).id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${(p as any).productName || (p as any).name}`}
                        className="px-3 py-3 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] cursor-pointer border-b border-gray-100 dark:border-[#2E2E2E] transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-[#333]"
                        onClick={() => handlers.handleSelectProduct(p)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlers.handleSelectProduct(p);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {(p as any).productImage || (p as any).image ? (
                              <img src={(p as any).productImage || (p as any).image} alt={(p as any).productName || (p as any).name} className="w-12 h-12 object-cover rounded border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">{(p as any).productName || (p as any).name}</div>
                            <div className="text-xs text-green-600 dark:text-green-400">Stock: {barcodeUtils.calculateStock(p)}</div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="text-xs text-gray-600 dark:text-gray-400">SKU: {(p as any).SKU || (p as any).sku || 'N/A'}</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">₹{barcodeUtils.getProductPrice(p)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchTerm.trim() && (
                  <button type="button" onClick={() => { setSearchTerm(''); setSuggestionsOpen(false); setSelectedProduct(null); setPreviewProduct(null); setShowPreview(false); }} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200 mt-4">{error}</div>}
          {loading && <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200 flex items-center gap-2 mt-4"><RefreshCw className="h-3 w-3 animate-spin" />Looking up product...</div>}
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <WebComponents.UiWebComponents.UiWebComponents.Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <WebComponents.UiWebComponents.UiWebComponents.TabsContent value="lookup" className="space-y-4">
                <div className="w-full">
                  <LabelTable
                    labelRows={labelRows}
                    setLabelRows={setLabelRows}
                    isLabelSectionEnabled={isLabelSectionEnabled}
                    allProducts={allProducts}
                  />
                  <LabelSettings
                    isLabelSectionEnabled={isLabelSectionEnabled}
                    previewProduct={previewProduct}
                    overrideExpiry={overrideExpiry}
                    setOverrideExpiry={setOverrideExpiry}
                    note={note}
                    setNote={setNote}
                    showName={showName} setShowName={setShowName} sizeName={sizeName} setSizeName={setSizeName}
                    showVariation={showVariation} setShowVariation={setShowVariation} sizeVariation={sizeVariation} setSizeVariation={setSizeVariation}
                    showPrice={showPrice} setShowPrice={setShowPrice} sizePrice={sizePrice} setSizePrice={setSizePrice}
                    showSKU={showSKU} setShowSKU={setShowSKU} sizeSKU={sizeSKU} setSizeSKU={setSizeSKU}
                    showExpiryDate={showExpiryDate} setShowExpiryDate={setShowExpiryDate} sizeExpiryDate={sizeExpiryDate} setSizeExpiryDate={setSizeExpiryDate}
                    showNote={showNote} setShowNote={setShowNote} sizeNote={sizeNote} setSizeNote={setSizeNote}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <WebComponents.UiComponents.UiWebComponents.Button onClick={printUtils.handleBulkPrint} disabled={labelRows.length === 0}>Print All</WebComponents.UiComponents.UiWebComponents.Button>
                  </div>
                </div>
              </WebComponents.UiWebComponents.UiWebComponents.TabsContent>
              <WebComponents.UiWebComponents.UiWebComponents.TabsContent value="manual" className="space-y-4">
                <div className="w-full">
                  <ManualProductForm
                    manualProduct={manualProduct}
                    manualProductError={manualProductError}
                    handlers={handlers}
                  />
                  <div className="flex justify-end">
                    <WebComponents.UiComponents.UiWebComponents.Button
                      variant="outline"
                      onClick={() => { if (selectedProduct) { setPreviewProduct(selectedProduct); setShowPreview(true); } }}
                      disabled={!selectedProduct}
                    >
                      Preview Selected
                    </WebComponents.UiComponents.UiWebComponents.Button>
                  </div>
                </div>
              </WebComponents.UiWebComponents.UiWebComponents.TabsContent>
            </WebComponents.UiWebComponents.UiWebComponents.Tabs>
          </div>
          <div className="lg:col-span-5">
            <BarcodePreview
              showPreview={showPreview}
              previewProduct={previewProduct}
              showName={showName}
              showVariation={showVariation}
              showPrice={showPrice}
              showSKU={showSKU}
              showExpiryDate={showExpiryDate}
              showNote={showNote}
              sizeName={sizeName}
              sizeVariation={sizeVariation}
              sizePrice={sizePrice}
              sizeSKU={sizeSKU}
              sizeExpiryDate={sizeExpiryDate}
              sizeNote={sizeNote}
              note={note}
              overrideExpiry={overrideExpiry}
            />
          </div>
        </div>
      </div>
    </>
  );
}
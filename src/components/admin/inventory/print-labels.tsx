'use client';

import React from 'react';
import { WebComponents } from "@/components";
import { Search, Settings, Plus, Trash2, X as CloseIcon } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Constants } from '@/constant';
import { AdminTypes } from '@/types';
import { customHooks } from "@/hooks";
export default function PrintLabels() {
  const { checkPermission } = customHooks.useUserPermissions();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<AdminTypes.InventoryTypes.PrintLabelTypes.SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [products, setProducts] = React.useState<AdminTypes.InventoryTypes.PrintLabelTypes.Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [labelConfig, setLabelConfig] = React.useState<AdminTypes.InventoryTypes.PrintLabelTypes.LabelConfig>({
    productName: true,
    productNameSize: 15,
    productVariation: true,
    productVariationSize: 17,
    productPrice: true,
    productPriceSize: 17,
    showPrice: 'inc',
    businessName: true,
    businessNameSize: 20,
    printPackingDate: true,
    packingDateSize: 12
  });

  const [barcodeSetting, setBarcodeSetting] = React.useState('20 Labels per Sheet, Sheet Size: 8.5" x 11", Label Size: 4" x 1"');
  // Mock search function - replace with actual API call
  const searchProducts = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockResults: AdminTypes.InventoryTypes.PrintLabelTypes.SearchResult[] = [
        { id: '1', name: 'Apple iPhone 8 White', price: 599, variation: '128GB', barcode: '1234567890123' },
        { id: '2', name: 'Samsung Galaxy S21', price: 699, variation: '256GB', barcode: '2345678901234' },
        { id: '3', name: 'MacBook Pro 13"', price: 1299, variation: 'M1 Chip', barcode: '3456789012345' },
        { id: '4', name: 'Dell XPS 15', price: 1499, variation: 'i7 16GB', barcode: '4567890123456' },
        { id: '5', name: 'Sony WH-1000XM4', price: 349, variation: 'Black', barcode: '5678901234567' }
      ].filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.barcode.includes(query)
      );

      setSearchResults(mockResults);
      setShowSearchResults(true);
      setIsLoading(false);
    }, 500);
  };

  const addProduct = (searchResult: AdminTypes.InventoryTypes.PrintLabelTypes.SearchResult) => {
    const newProduct: AdminTypes.InventoryTypes.PrintLabelTypes.Product = {
      id: searchResult.id,
      name: searchResult.name,
      labels: 1,
      packingDate: new Date().toISOString().split('T')[0],
      priceGroup: 'None',
      price: searchResult.price,
      variation: searchResult.variation,
      barcode: searchResult.barcode
    };

    // Restrict to only one product
    setProducts([newProduct]);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const handleProductChange = (id: string, field: keyof AdminTypes.InventoryTypes.PrintLabelTypes.Product, value: string | number) => {
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const handleConfigChange = (field: keyof AdminTypes.InventoryTypes.PrintLabelTypes.LabelConfig, value: boolean | number | string) => {
    setLabelConfig(prev => ({ ...prev, [field]: value }));
  };
  const generateBarcode = (product: AdminTypes.InventoryTypes.PrintLabelTypes.Product) => {
    // Simple barcode generation - replace with actual barcode library
    return product.barcode || `BC${product.id.padStart(8, '0')}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(searchTerm);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    // Generate all labels HTML
    const labelsHTML = products.map((product) => {
      const barcode = generateBarcode(product);
      return Array.from({ length: product.labels }, (_, index) => {
        // Generate barcode as SVG for better print compatibility
        const barcodeSVG = generateBarcodeSVG(product.barcode || '');
        return `
          <div class="label-item" style="
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 16px; 
            background: white;
            margin: 8px;
            page-break-inside: avoid;
            display: inline-block;
            width: 300px;
            vertical-align: top;
          ">
            <div style="text-align: center;">
              ${labelConfig.businessName ? `
                <div style="
                  font-weight: bold; 
                  color: #111827; 
                  font-size: ${labelConfig.businessNameSize}px;
                  margin-bottom: 8px;
                ">
                  Your Business Name
                </div>
              ` : ''}
              
              ${labelConfig.productName ? `
                <div style="
                  font-weight: 500; 
                  color: #1f2937; 
                  font-size: ${labelConfig.productNameSize}px;
                  margin-bottom: 4px;
                ">
                  ${product.name}
                </div>
              ` : ''}
              
              ${labelConfig.productVariation && product.variation ? `
                <div style="
                  color: #6b7280; 
                  font-size: ${labelConfig.productVariationSize}px;
                  margin-bottom: 4px;
                ">
                  ${product.variation}
                </div>
              ` : ''}
              
              ${labelConfig.productPrice && product.price ? `
                <div style="
                  font-weight: 600; 
                  color: #059669; 
                  font-size: ${labelConfig.productPriceSize}px;
                  margin-bottom: 8px;
                ">
                  $${product.price} ${labelConfig.showPrice === 'inc' ? '(Inc. Tax)' : '(Exc. Tax)'}
                </div>
              ` : ''}
              
              <div style="margin: 8px 0; display: flex; justify-content: center;">
                <div style="
                  background: white; 
                  padding: 8px; 
                  border: 1px solid #d1d5db; 
                  border-radius: 4px;
                ">
                  ${barcodeSVG}
                </div>
              </div>
              s
              ${labelConfig.printPackingDate ? `
                <div style="
                  color: #6b7280; 
                  font-size: ${labelConfig.packingDateSize}px;
                  margin-top: 8px;
                ">
                  Packed: ${new Date(product.packingDate).toLocaleDateString()}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }).join('');
    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .label-item { 
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f9fafb;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              justify-content: flex-start;
            }
            .label-item {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              background: white;
              margin: 8px;
              page-break-inside: avoid;
              display: inline-block;
              width: 300px;
              vertical-align: top;
            }
            @media print {
              body { background: white; }
              .labels-container { gap: 0; }
              .label-item { 
                margin: 4px;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelsHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  // Generate barcode as SVG for better print compatibility
  const generateBarcodeSVG = (barcode: string) => {
    if (!barcode) return '';

    // Create a canvas to generate the barcode
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 60;

    try {
      JsBarcode(canvas, barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: "#ffffff",
        lineColor: "#000000"
      });

      // Convert canvas to SVG
      const dataURL = canvas.toDataURL('image/png');
      return `<img src="${dataURL}" style="max-width: 100%; height: auto;" alt="Barcode: ${barcode}" />`;
    } catch (error) {
      console.error('Error generating barcode:', error);
      // Fallback to simple text representation
      return `
        <div style="
          border: 1px solid #000; 
          padding: 8px; 
          text-align: center; 
          font-family: monospace; 
          font-size: 12px;
          background: white;
        ">
          ${barcode}
        </div>
      `;
    }
  };
  React.useEffect(() => {
    if (searchTerm.length > 2) {
      searchProducts(searchTerm);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">{Constants.adminConstants.printLabels}</h1>
          <p className="text-gray-400 mt-1">Generate product labels with barcodes</p>
        </div>
        {/* Search Section */}
        {(checkPermission("inventory.printlabels", "create")) && (
          <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E] p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-4">{Constants.adminConstants.addProducts}</h2>

            {/* Search Bar */}
            <div className="relative">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={Constants.adminConstants.searchProducts}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-[#2E2E2E] border focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white placeholder:text-gray-500 rounded-[4px]"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg shadow-sm max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => addProduct(result)}
                      className="p-3 hover:bg-[#2A2A2A] cursor-pointer border-b border-[#2E2E2E] last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{result.name}</p>
                          <p className="text-xs text-gray-500">{result.variation} • {result.barcode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">${result.price}</span>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Table */}
        {products.length > 0 ? (
          <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E] p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-4">{Constants.adminConstants.selectedProducts}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2E2E2E]">
                    <th className="text-left py-3 text-sm font-medium text-gray-400">{Constants.adminConstants.product}</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">{Constants.adminConstants.labels}</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">{Constants.adminConstants.date}</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-400">{Constants.adminConstants.group}</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#2E2E2E]">
                      <td className="py-4 text-white">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.variation} • ${product.price}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <input
                          type="number"
                          min="1"
                          value={product.labels}
                          onChange={(e) => handleProductChange(product.id, 'labels', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 text-sm border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white text-center rounded-[4px]"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          type="date"
                          value={product.packingDate}
                          onChange={(e) => handleProductChange(product.id, 'packingDate', e.target.value)}
                          className="w-32 px-2 py-1 text-sm border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                        />
                      </td>
                      <td className="py-4">
                        <select
                          value={product.priceGroup}
                          onChange={(e) => handleProductChange(product.id, 'priceGroup', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-black focus:ring-0 focus:border-black-400 bg-transparent"
                        >
                          <option value="None">{Constants.adminConstants.none}</option>
                          <option value="Retail">Retail</option>
                          <option value="Wholesale">Wholesale</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <WebComponents.UiComponents.UiWebComponents.Button
                          onClick={() => removeProduct(product.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Remove product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </WebComponents.UiComponents.UiWebComponents.Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E] p-12 text-center mb-6">
            <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">{Constants.adminConstants.noProductsAddedYet}</p>
            <p className="text-sm text-gray-400">Search and add products to generate labels</p>
          </div>
        )}
        {/* Label Configuration */}
        <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E] p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-6">{Constants.adminConstants.labelConfiguration}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={labelConfig.productName}
                  onChange={(e) => handleConfigChange('productName', e.target.checked)}
                  className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-300">{Constants.adminConstants.productName}</span>
              </label>
              <div className="ml-7 flex items-center gap-2">
                <span className="text-xs text-gray-500">Size:</span>
                <input
                  type="number"
                  value={labelConfig.productNameSize}
                  onChange={(e) => handleConfigChange('productNameSize', parseInt(e.target.value) || 0)}
                  className="w-1/2 px-2 py-1 text-xs border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                />
              </div>
            </div>

            {/* Product Variation */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={labelConfig.productVariation}
                  onChange={(e) => handleConfigChange('productVariation', e.target.checked)}
                  className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-300">Product Variation</span>
              </label>
              <div className="ml-7 flex items-center gap-2">
                <span className="text-xs text-gray-500">Size:</span>
                <input
                  type="number"
                  value={labelConfig.productVariationSize}
                  onChange={(e) => handleConfigChange('productVariationSize', parseInt(e.target.value) || 0)}
                  className="w-1/2 px-2 py-1 text-xs border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                />
              </div>
            </div>
            {/* Product Price */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={labelConfig.productPrice}
                  onChange={(e) => handleConfigChange('productPrice', e.target.checked)}
                  className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-300">Product Price</span>
              </label>
              <div className="ml-7 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Size:</span>
                  <input
                    type="number"
                    value={labelConfig.productPriceSize}
                    onChange={(e) => handleConfigChange('productPriceSize', parseInt(e.target.value) || 0)}
                    className="w-1/2 px-2 py-1 text-xs border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Show:</span>
                  <select
                    value={labelConfig.showPrice}
                    onChange={(e) => handleConfigChange('showPrice', e.target.value as 'inc' | 'exc')}
                    className="w-20 px-2 py-1 text-xs border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                  >
                    <option value="inc">{Constants.adminConstants.incTax}</option>
                    <option value="exc">{Constants.adminConstants.excTax}</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Business Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={labelConfig.businessName}
                  onChange={(e) => handleConfigChange('businessName', e.target.checked)}
                  className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-300">Business Name</span>
              </label>
              <div className="ml-7 flex items-center gap-2">
                <span className="text-xs text-gray-500">Size:</span>
                <input
                  type="number"
                  value={labelConfig.businessNameSize}
                  onChange={(e) => handleConfigChange('businessNameSize', parseInt(e.target.value) || 0)}
                  className="w-1/2 px-2 py-1 text-xs border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                />
              </div>
            </div>

            {/* Packing Date */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={labelConfig.printPackingDate}
                  onChange={(e) => handleConfigChange('printPackingDate', e.target.checked)}
                  className="w-4 h-4 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                />
                <span className="text-sm font-medium text-gray-300">Packing Date</span>
              </label>
              <div className="ml-7 flex items-center gap-2">
                <span className="text-xs text-gray-500">Size:</span>
                <input
                  type="number"
                  value={labelConfig.packingDateSize}
                  onChange={(e) => handleConfigChange('packingDateSize', parseInt(e.target.value) || 0)}
                  className="w-1/2 px-2 py-1 text-xs border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Settings */}
        <div className="bg-[#1E1E1E] rounded-lg shadow-sm border border-[#2E2E2E] p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">Barcode Settings</h2>
          <select
            value={barcodeSetting}
            onChange={(e) => setBarcodeSetting(e.target.value)}
            className="w-full px-3 py-2 border border-[#2E2E2E] focus:ring-0 focus:border-[#3E3E3E] bg-[#0F0F0F] text-white rounded-[4px]"
          >
            <option value={`20 Labels per Sheet, Sheet Size: 8.5\" x 11\", Label Size: 4\" x 1\"`}>
              {Constants.adminConstants.twentyLabelsPerSheet} (4" x 1")
            </option>
            <option value={`30 Labels per Sheet, Sheet Size: 8.5\" x 11\", Label Size: 3\" x 1\"`}>
              {Constants.adminConstants.thirtyLabelsPerSheet} (3" x 1")
            </option>
            <option value={`40 Labels per Sheet, Sheet Size: 8.5\" x 11\", Label Size: 2\" x 1\"`}>
              {Constants.adminConstants.fortyLabelsPerSheet} (2" x 1")
            </option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {products.length > 0 && (
              <span>
                {products.length} {Constants.adminConstants.products} • {products.reduce((sum, product) => sum + product.labels, 0)} {Constants.adminConstants.labels}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <WebComponents.UiComponents.UiWebComponents.Button
              onClick={() => setProducts([])}
              disabled={products.length === 0}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Constants.adminConstants.clearAllProducts}
            </WebComponents.UiComponents.UiWebComponents.Button>
            {(checkPermission("inventory.printlabels", "create")) && (
              <WebComponents.UiComponents.UiWebComponents.Button
                onClick={handlePrint}
                disabled={products.length === 0}
                className="border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] hover:bg-gray-100 dark:hover:bg-[#2B2B2B] disabled:bg-gray-300 disabled:opacity-50 text-textMain dark:text-white px-6 py-2 rounded-[4px] text-sm font-medium flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4" />
                {Constants.adminConstants.printLabels}
              </WebComponents.UiComponents.UiWebComponents.Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#2E2E2E]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E]">
              <h2 className="text-xl font-medium text-white">Label Preview</h2>
              <WebComponents.UiComponents.UiWebComponents.Button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-200"
              >
                <CloseIcon className="w-6 h-6" />
              </WebComponents.UiComponents.UiWebComponents.Button>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-400">
                <p>Barcode Setting: {barcodeSetting}</p>
                <p>Total Labels: {products.reduce((sum, product) => sum + product.labels, 0)}</p>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#2E2E2E]">
                <WebComponents.UiComponents.UiWebComponents.Button
                  onClick={closePreview}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200"
                >
                  {Constants.adminConstants.closebutton}
                </WebComponents.UiComponents.UiWebComponents.Button>
                <WebComponents.UiComponents.UiWebComponents.Button
                  onClick={handlePrint}
                  className="border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] hover:bg-gray-100 dark:hover:bg-[#2B2B2B] text-textMain dark:text-white px-6 py-2 rounded-[4px] text-sm font-medium"
                >
                  {Constants.adminConstants.printLabels}
                </WebComponents.UiComponents.UiWebComponents.Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


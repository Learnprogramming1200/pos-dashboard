"use client";

import React, { useEffect, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { Download, Settings, Package, Printer, Search, CheckSquare, Square, X } from 'lucide-react';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormInput } from '@/components/ui/FormInput';
import { Badge } from '@/components/ui/badge';
import DynamicModal from '@/components/ui/DynamicModal';
import BarcodeSettingsForm from '@/components/admin/barcode/BarcodeSettingsForm';

interface BarcodeGeneratorProps {
  className?: string;
}

interface SelectedProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  category: string;
  brand: string;
  selected: boolean;
  quantity: number;
}

interface BarcodeSettings {
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
  // new fields for QR support
  codeType?: 'barcode' | 'qrcode';
  qrErrorCorrection?: 'L' | 'M' | 'Q' | 'H';
  qrMargin?: number;
  qrScale?: number;
}

const defaultSettings: BarcodeSettings = {
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 20,
  margin: 10,
  background: '#ffffff',
  lineColor: '#000000',
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 2,
  codeType: 'barcode',
  qrErrorCorrection: 'M',
  qrMargin: 2,
  qrScale: 4,
};

export default function BarcodeGenerator({ className = "" }: BarcodeGeneratorProps) {
  const [settings, setSettings] = useState<BarcodeSettings>(defaultSettings);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [bulkCanvases, setBulkCanvases] = useState<HTMLCanvasElement[]>([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  // Demo product list (can be replaced with API search later)
  const demoProducts: Array<{
    id: string;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    category?: string;
    brand?: string;
  }> = [
      { id: 'p-1001', name: 'Wireless Mouse', sku: 'MOU-001', barcode: '8901234567890', price: 799, category: 'Accessories', brand: 'Logi' },
      { id: 'p-1002', name: 'Mechanical Keyboard', sku: 'KEY-002', barcode: '8909876543210', price: 3499, category: 'Accessories', brand: 'Keychron' },
      { id: 'p-1003', name: 'Thermal Label Roll', sku: 'LBL-100', barcode: '012345678905', price: 499, category: 'Supplies', brand: 'Generic' },
      { id: 'p-1004', name: 'Barcode Scanner', sku: 'SCN-200', barcode: '978020137962', price: 2499, category: 'Hardware', brand: 'Honey' },
    ];

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Initialize selected products from demo products
  useEffect(() => {
    const initialSelectedProducts = demoProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      price: p.price,
      category: p.category || '',
      brand: p.brand || '',
      selected: false,
      quantity: 1
    } as SelectedProduct));
    setSelectedProducts(initialSelectedProducts);
  }, []);

  const filteredDemo = searchTerm
    ? demoProducts.filter((p) =>
      `${p.name} ${p.sku} ${p.barcode}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : demoProducts;

  const addNewProduct = (productData: {
    name: string;
    sku: string;
    price: number;
    category?: string;
    brand?: string;
    quantity: number;
  }) => {
    const newProduct: SelectedProduct = {
      id: `p-${Date.now()}`,
      name: productData.name,
      sku: productData.sku,
      barcode: productData.sku, // Use SKU as barcode
      price: productData.price,
      category: productData.category || '',
      brand: productData.brand || '',
      selected: false,
      quantity: productData.quantity
    };

    setSelectedProducts(prev => [...prev, newProduct]);
    setShowAddProductForm(false);
    setError(null);
  };

  // Bulk selection functions
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(prev =>
      prev.map(p => ({ ...p, selected: true }))
    );
  };

  const deselectAllProducts = () => {
    setSelectedProducts(prev =>
      prev.map(p => ({ ...p, selected: false }))
    );
  };

  const removeSelectedProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const getSelectedProducts = () => {
    return selectedProducts.filter(p => p.selected);
  };


  const generateBulkBarcodes = async () => {
    const selected = getSelectedProducts();
    if (selected.length === 0) {
      setError("No products selected for bulk generation");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const canvases: HTMLCanvasElement[] = [];

      for (const product of selected) {
        // Generate multiple barcodes based on quantity
        for (let i = 0; i < product.quantity; i++) {
          const canvas = document.createElement('canvas');
          const value = product.barcode || product.sku;

          if (!value) {
            console.warn(`No barcode or SKU available for product: ${product.name}`);
            continue;
          }

          if (settings.codeType === 'qrcode') {
            const mod = await import('qrcode');
            // @ts-ignore
            const QRCode = mod.default || mod;
            await QRCode.toCanvas(canvas, value, {
              errorCorrectionLevel: settings.qrErrorCorrection || 'M',
              margin: settings.qrMargin ?? 2,
              scale: settings.qrScale ?? 4,
              color: {
                dark: settings.lineColor || '#000000',
                light: settings.background || '#ffffff'
              }
            });
          } else {
            JsBarcode(canvas, value, {
              format: settings.format,
              width: settings.width,
              height: settings.height,
              displayValue: settings.displayValue,
              fontSize: settings.fontSize,
              margin: settings.margin,
              background: settings.background,
              lineColor: settings.lineColor,
              textAlign: settings.textAlign,
              textPosition: settings.textPosition,
              textMargin: settings.textMargin,
              valid: (valid: boolean) => {
                if (!valid) {
                  console.warn(`Invalid barcode format for value: ${value}`);
                }
              }
            });
          }

          canvases.push(canvas);
        }
      }

      setBulkCanvases(canvases);
    } catch (err) {
      console.error("Error generating bulk codes:", err);
      setError("Failed to generate bulk codes. Please check the values and format.");
    } finally {
      setLoading(false);
    }
  };


  const downloadBulkBarcodes = () => {
    if (bulkCanvases.length === 0) return;

    const selected = getSelectedProducts();
    bulkCanvases.forEach((canvas, index) => {
      const product = selected[index];
      if (product) {
        const link = document.createElement('a');
        link.download = `${product.name}_${settings.codeType === 'qrcode' ? 'qrcode' : 'barcode'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    });
  };

  const downloadBulkAsZip = async () => {
    if (bulkCanvases.length === 0) return;

    try {
      // Dynamic import for JSZip - fallback to individual downloads if not available
      let JSZip: any;
      try {
        // @ts-ignore - JSZip may not be available
        JSZip = (await import('jszip')).default;
      } catch (importError) {
        console.warn('JSZip not available, falling back to individual downloads');
        downloadBulkBarcodes();
        return;
      }

      const zip = new JSZip();
      const selected = getSelectedProducts();

      bulkCanvases.forEach((canvas, index) => {
        const product = selected[index];
        if (product) {
          const dataURL = canvas.toDataURL('image/png');
          const base64Data = dataURL.split(',')[1];
          zip.file(`${product.name}_${settings.codeType === 'qrcode' ? 'qrcode' : 'barcode'}.png`, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `bulk_${settings.codeType === 'qrcode' ? 'qrcodes' : 'barcodes'}.zip`;
      link.click();
    } catch (err) {
      console.error('Error creating zip file:', err);
      setError('Failed to create zip file. Please try individual downloads.');
    }
  };


  const printBulkBarcodes = () => {
    if (bulkCanvases.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selected = getSelectedProducts();
    const codesHTML = bulkCanvases.map((canvas, index) => {
      const product = selected[index];
      if (!product) return '';

      const dataURL = canvas.toDataURL('image/png');
      return `
        <div class="code-container">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p><strong>SKU:</strong> ${product.sku}</p>
            <p><strong>${settings.codeType === 'qrcode' ? 'QR Value' : 'Barcode'}:</strong> ${product.barcode || product.sku}</p>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            ${product.category ? `<p><strong>Category:</strong> ${product.category}</p>` : ''}
            ${product.brand ? `<p><strong>Brand:</strong> ${product.brand}</p>` : ''}
          </div>
          <img src="${dataURL}" alt="${settings.codeType === 'qrcode' ? 'QR Code' : 'Barcode'}" style="max-width: 100%; height: auto;" />
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Bulk ${settings.codeType === 'qrcode' ? 'QR Codes' : 'Barcodes'}</title>
          <style>
            @media print { 
              body { margin: 0; padding: 10px; } 
              .code-container { 
                text-align: center; 
                page-break-inside: avoid; 
                margin-bottom: 30px;
                border: 1px solid #ddd; 
                padding: 15px; 
              } 
              .product-info { 
                margin-bottom: 15px; 
                text-align: center; 
                font-size: 12px;
              }
              .product-info h3 { margin: 0 0 10px 0; font-size: 16px; }
              .product-info p { margin: 2px 0; }
            }
            body { font-family: Arial, sans-serif; margin: 20px; }
            .code-container { text-align: center; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
            .product-info { margin-bottom: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Bulk ${settings.codeType === 'qrcode' ? 'QR Codes' : 'Barcodes'} (${selected.length} items)</h1>
          ${codesHTML}
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const updateSetting = <K extends keyof BarcodeSettings>(key: K, value: BarcodeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSettingsUpdate = async (formData: BarcodeSettings) => {
    try {
      setLoading(true);
      setSettings(formData);
      setShowModal(false);
    } catch (error: unknown) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleDelete = async () => {
    setSettings(defaultSettings);
  };


  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal ? `Barcode Generator > Settings` : "Bulk Barcode Generator"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {showModal ? "Configure code generation settings." : "Add products and generate barcodes or QR codes in bulk"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!showModal && (
            <Button
              onClick={() => setShowAddProductForm(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Package className="w-4 h-4 mr-0" />
              Add
            </Button>
          )}
          <Button
            className="bg-primary text-white hover:bg-primaryHover w-full sm:w-auto"
            onClick={() => {
              if (showModal) {
                setShowModal(false);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal ? "Back" : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddProductForm && (
        <AddProductForm
          onAdd={addNewProduct}
          onCancel={() => setShowAddProductForm(false)}
        />
      )}

      {/* Product Management */}
      {!showModal && (
        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or barcode..."
              className="flex-1 px-[12px] py-[7px] border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Bulk Controls */}
          <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getSelectedProducts().length} of {selectedProducts.length} selected
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                • {getSelectedProducts().reduce((sum, p) => sum + p.quantity, 0)} total labels
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={selectAllProducts} variant="outline" size="sm">
                Select All
              </Button>
              <Button onClick={deselectAllProducts} variant="outline" size="sm">
                Deselect All
              </Button>
              <Button
                onClick={generateBulkBarcodes}
                disabled={getSelectedProducts().length === 0 || loading}
                size="sm"
              >
                {loading ? "Generating..." : "Generate Bulk"}
              </Button>
            </div>
          </div>

          {/* Product List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            {selectedProducts
              .filter(p =>
                searchTerm ?
                  `${p.name} ${p.sku} ${p.barcode}`.toLowerCase().includes(searchTerm.toLowerCase()) :
                  true
              )
              .map((p) => {
                const isSelected = p.selected;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-md border transition ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2 flex-1">
                        <div
                          className="mt-1 cursor-pointer"
                          onClick={() => toggleProductSelection(p.id)}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">SKU: {p.sku}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-gray-500">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={p.quantity}
                            onChange={(e) => updateProductQuantity(p.id, parseInt(e.target.value) || 1)}
                            className="w-12 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">₹{p.price}</span>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedProduct(p.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="p-1 h-6 w-6"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Show code display only when modal is not open */}
      {!showModal && (
        <>
          {/* Bulk Code Display */}
          {bulkCanvases.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Bulk {settings.codeType === 'qrcode' ? 'QR Codes' : 'Barcodes'} ({bulkCanvases.length} items)
                </h3>
                <div className="flex gap-2">
                  <Button onClick={downloadBulkBarcodes} size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download All
                  </Button>
                  <Button onClick={downloadBulkAsZip} size="sm" variant="outline">
                    <Package className="w-4 h-4 mr-1" />
                    Download ZIP
                  </Button>
                  <Button onClick={printBulkBarcodes} size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-1" />
                    Print All
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bulkCanvases.map((canvas, index) => {
                  // Find which product this canvas belongs to based on cumulative quantity
                  let productIndex = 0;
                  let cumulativeQuantity = 0;
                  const selected = getSelectedProducts();

                  for (let i = 0; i < selected.length; i++) {
                    cumulativeQuantity += selected[i].quantity;
                    if (index < cumulativeQuantity) {
                      productIndex = i;
                      break;
                    }
                  }

                  const product = selected[productIndex];
                  if (!product) return null;

                  return (
                    <div key={`${product.id}-${index}`} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="text-center mb-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">SKU: {product.sku}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">Qty: {product.quantity}</div>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={canvas.toDataURL()}
                          alt={`${settings.codeType === 'qrcode' ? 'QR Code' : 'Barcode'} for ${product.name}`}
                          className="max-w-full h-auto border border-gray-200 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings Summary */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Settings</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <Badge className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {settings.codeType === 'qrcode' ? 'QR Code' : 'Barcode'}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Format:</span>
                <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {settings.codeType === 'qrcode' ? 'N/A' : settings.format}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{settings.codeType === 'qrcode' ? `${settings.qrScale}× scale` : `${settings.width}×${settings.height}`}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Selected Products:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {getSelectedProducts().length} of {selectedProducts.length} products
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Labels:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {getSelectedProducts().reduce((sum, p) => sum + p.quantity, 0)} labels
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Show modal when open */}
      {showModal && (
        <DynamicModal
          isOpen={showModal}
          onOpenChange={(open) => setShowModal(open)}
          title="Barcode Settings"
        >
          <BarcodeSettingsForm
            initial={settings as BarcodeSettings}
            onSubmit={handleSettingsUpdate}
            onCancel={() => setShowModal(false)}
          />
        </DynamicModal>
      )}
    </div>
  );
}

function AddProductForm({ onAdd, onCancel }: {
  onAdd: (productData: {
    name: string;
    sku: string;
    price: number;
    category?: string;
    brand?: string;
    quantity: number;
  }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    category: '',
    brand: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      setFormData({
        name: '',
        sku: '',
        price: 0,
        category: '',
        brand: '',
        quantity: 1
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="name">Product Name *</FormLabel>
            <FormInput
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="sku">SKU *</FormLabel>
            <FormInput
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              placeholder="Enter SKU (will be used as barcode)"
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="quantity">Quantity *</FormLabel>
            <FormInput
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>
          <div>
            <FormLabel htmlFor="price">Price</FormLabel>
            <FormInput
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
          </div>


        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name || !formData.sku || !formData.quantity}>
            {loading ? "Adding..." : "Add "}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  RefreshCw,
  Settings,
  Package,
  Printer,
  Eye,
  Grid3X3,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Zap
} from 'lucide-react';


interface BulkBarcodeItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  generated: boolean;
  barcodeData?: string;
  description?: string;
  expiryDate?: string;
}

interface BulkBarcodeGeneratorProps {
  className?: string;
}

interface BulkBarcodeSettings {
  format: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
  margin: number;
  background: string;
  lineColor: string;
  labelsPerRow: number;
  labelWidth: number;
  labelHeight: number;
  showProductName: boolean;
  showPrice: boolean;
  showSKU: boolean;
  showBusinessName: boolean;
  showExpiryDate: boolean;
  showDescription: boolean;
  businessName: string;
}

const defaultBulkSettings: BulkBarcodeSettings = {
  format: 'CODE128',
  width: 2,
  height: 40,
  displayValue: true,
  fontSize: 12,
  margin: 5,
  background: '#ffffff',
  lineColor: '#000000',
  labelsPerRow: 3,
  labelWidth: 300,
  labelHeight: 150,
  showProductName: true,
  showPrice: true,
  showSKU: false, // Hide SKU from printed labels
  showBusinessName: false, // Hide business name from printed labels
  showExpiryDate: true,
  showDescription: true,
  businessName: 'Your Business Name',
};

export default function BulkBarcodeGenerator({
  className = ""
}: BulkBarcodeGeneratorProps) {
  const [items, setItems] = useState<BulkBarcodeItem[]>([]);
  const [settings, setSettings] = useState<BulkBarcodeSettings>(defaultBulkSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Add product to bulk list
  const addProduct = (productData: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }) => {
    const newItem: BulkBarcodeItem = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: productData.name,
      sku: productData.sku,
      price: productData.price,
      quantity: productData.quantity,
      generated: false
    };
    setItems(prev => [...prev, newItem]);
    setShowAddForm(false);
    setError(null);
  };

  // Remove product from bulk list
  const removeProduct = (productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  // Generate barcode for single item
  const generateItemBarcode = (item: BulkBarcodeItem): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 60;

      try {
        const barcodeValue = item.sku; // Use SKU as barcode
        if (!barcodeValue) {
          reject(new Error('No SKU available'));
          return;
        }

        JsBarcode(canvas, barcodeValue, {
          format: settings.format,
          width: settings.width,
          height: settings.height,
          displayValue: settings.displayValue,
          fontSize: settings.fontSize,
          margin: settings.margin,
          background: settings.background,
          lineColor: settings.lineColor
        });

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Generate all barcodes
  const generateAllBarcodes = async () => {
    if (items.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const barcodeData = await generateItemBarcode(item);
            return { ...item, generated: true, barcodeData };
          } catch (error) {
            console.error(`Error generating barcode for ${item.name}:`, error);
            return { ...item, generated: false };
          }
        })
      );

      setItems(updatedItems);
      const successCount = updatedItems.filter(item => item.generated).length;
      setSuccess(`Generated ${successCount} out of ${items.length} barcodes successfully!`);
    } catch (error) {
      setError('Failed to generate barcodes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Print all barcodes
  const printAllBarcodes = () => {
    if (items.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const generatedItems = items.filter(item => item.generated && item.barcodeData);
    if (generatedItems.length === 0) {
      setError('No barcodes generated yet. Please generate barcodes first.');
      return;
    }

    const labelsHTML = generatedItems.map((item) => {
      return Array.from({ length: item.quantity }, (_, index) => {
        return `
          <div class="label-item" style="
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 16px; 
            background: white;
            margin: 8px;
            page-break-inside: avoid;
            display: inline-block;
            width: ${settings.labelWidth}px;
            height: ${settings.labelHeight}px;
            vertical-align: top;
          ">
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              ${settings.showBusinessName ? `
                <div style="
                  font-weight: bold; 
                  color: #111827; 
                  font-size: 18px; 
                  margin-bottom: 8px;
                ">
                  ${settings.businessName}
                </div>
              ` : ''}
              
              ${settings.showProductName ? `
                <div style="
                  font-weight: 500; 
                  color: #1f2937; 
                  font-size: 16px; 
                  margin-bottom: 4px;
                ">
                  ${item.name}
                </div>
              ` : ''}
              
              ${settings.showSKU ? `
                <div style="
                  color: #6b7280; 
                  font-size: 12px; 
                  margin-bottom: 4px;
                ">
                  SKU: ${item.sku}
                </div>
              ` : ''}
              
              ${settings.showDescription ? `
                <div style="
                  color: #6b7280; 
                  font-size: 12px; 
                  margin-bottom: 4px;
                ">
                  ${item.description || 'Product description'}
                </div>
              ` : ''}
              
              ${settings.showPrice ? `
                <div style="
                  font-weight: 600; 
                  color: #059669; 
                  font-size: 16px; 
                  margin-bottom: 4px;
                ">
                  MRP: ₹${item.price.toFixed(2)}
                </div>
              ` : ''}
              
              ${settings.showExpiryDate ? `
                <div style="
                  color: #6b7280; 
                  font-size: 12px; 
                  margin-bottom: 8px;
                ">
                  Exp: ${item.expiryDate || '2025-12-31'}
                </div>
              ` : ''}
              
              <div style="margin: 8px 0; display: flex; justify-content: center;">
                <div style="
                  background: white; 
                  padding: 8px; 
                  border: 1px solid #d1d5db; 
                  border-radius: 4px;
                ">
                  <img src="${item.barcodeData}" alt="Barcode" style="max-width: 100%; height: auto;" />
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk Print Barcodes</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .label-item { 
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
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
              width: ${settings.labelWidth}px;
              height: ${settings.labelHeight}px;
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

  // Download all barcodes as ZIP
  const downloadAllBarcodes = async () => {
    const generatedItems = items.filter(item => item.generated && item.barcodeData);
    if (generatedItems.length === 0) {
      setError('No barcodes generated yet. Please generate barcodes first.');
      return;
    }

    // For now, we'll download individual images
    // In a real implementation, you'd use a library like JSZip
    generatedItems.forEach((item, index) => {
      const link = document.createElement('a');
      link.download = `${item.name.replace(/[^a-z0-9]/gi, '_')}_barcode.png`;
      link.href = item.barcodeData!;
      link.click();
    });
  };

  // Clear all items
  const clearAll = () => {
    setItems([]);
    setError(null);
    setSuccess(null);
  };

  // Update settings
  const updateSetting = <K extends keyof BulkBarcodeSettings>(key: K, value: BulkBarcodeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const generatedCount = items.filter(item => item.generated).length;
  const totalLabels = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Barcode Generator</h2>
          <p className="text-gray-600">Add products and generate multiple barcodes at once</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={clearAll} variant="ghost" disabled={items.length === 0}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <AddProductForm
          onAdd={addProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      {items.length > 0 && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Products ({items.length})
            </CardTitle>
            <CardDescription>
              {generatedCount} generated • {totalLabels} total labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items
                .filter(item =>
                  searchTerm ?
                    `${item.name} ${item.sku}`.toLowerCase().includes(searchTerm.toLowerCase()) :
                    true
                )
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            SKU: {item.sku} • Price: ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qty-${item.id}`} className="text-sm font-medium">Qty:</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                      </div>
                      <Badge variant={item.generated ? "default" : "secondary"} className="px-3 py-1">
                        {item.generated ? "Generated" : "Pending"}
                      </Badge>
                      <Button
                        onClick={() => removeProduct(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No products added</p>
            <p className="text-gray-500">Click "Add Product" to start bulk generation</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {items.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {items.length} items • {totalLabels} total labels
          </div>
          <div className="flex gap-3">
            <Button
              onClick={generateAllBarcodes}
              disabled={isGenerating || items.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate All
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              disabled={generatedCount === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={downloadAllBarcodes}
              variant="outline"
              disabled={generatedCount === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={printAllBarcodes}
              disabled={generatedCount === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print All
            </Button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Bulk Settings
            </CardTitle>
            <CardDescription>Configure barcode and label settings for bulk generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Barcode Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Barcode Settings</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="bulk-format">Format</Label>
                    <select
                      id="bulk-format"
                      value={settings.format}
                      onChange={(e) => updateSetting('format', e.target.value as BulkBarcodeSettings['format'])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="CODE128">CODE128</option>
                      <option value="CODE39">CODE39</option>
                      <option value="EAN13">EAN13</option>
                      <option value="EAN8">EAN8</option>
                      <option value="UPC">UPC</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="bulk-width">Width</Label>
                    <Input
                      id="bulk-width"
                      type="number"
                      value={settings.width}
                      onChange={(e) => updateSetting('width', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bulk-height">Height</Label>
                    <Input
                      id="bulk-height"
                      type="number"
                      value={settings.height}
                      onChange={(e) => updateSetting('height', parseInt(e.target.value))}
                      min="20"
                      max="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bulk-fontSize">Font Size</Label>
                    <Input
                      id="bulk-fontSize"
                      type="number"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                      min="8"
                      max="20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 border rounded-md">
                  <Label htmlFor="bulk-displayValue">Display Value</Label>
                  <Switch id="bulk-displayValue" checked={settings.displayValue} onCheckedChange={(checked) => updateSetting('displayValue', checked)} />
                </div>
              </div>

              {/* Label Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Label Settings</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <Label htmlFor="bulk-showProductName">Show Product Name</Label>
                    <Switch id="bulk-showProductName" checked={settings.showProductName} onCheckedChange={(checked) => updateSetting('showProductName', checked)} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <Label htmlFor="bulk-showPrice">Show Price</Label>
                    <Switch id="bulk-showPrice" checked={settings.showPrice} onCheckedChange={(checked) => updateSetting('showPrice', checked)} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <Label htmlFor="bulk-showSKU">Show SKU</Label>
                    <Switch id="bulk-showSKU" checked={settings.showSKU} onCheckedChange={(checked) => updateSetting('showSKU', checked)} />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <Label htmlFor="bulk-showBusinessName">Show Business Name</Label>
                    <Switch id="bulk-showBusinessName" checked={settings.showBusinessName} onCheckedChange={(checked) => updateSetting('showBusinessName', checked)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bulk-businessName">Business Name</Label>
                  <Input
                    id="bulk-businessName"
                    value={settings.businessName}
                    onChange={(e) => updateSetting('businessName', e.target.value)}
                    placeholder="Enter business name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="bulk-labelWidth">Label Width (px)</Label>
                    <Input
                      id="bulk-labelWidth"
                      type="number"
                      value={settings.labelWidth}
                      onChange={(e) => updateSetting('labelWidth', parseInt(e.target.value))}
                      min="200"
                      max="600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulk-labelHeight">Label Height (px)</Label>
                    <Input
                      id="bulk-labelHeight"
                      type="number"
                      value={settings.labelHeight}
                      onChange={(e) => updateSetting('labelHeight', parseInt(e.target.value))}
                      min="100"
                      max="400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">Bulk Barcode Preview</h2>
              <Button onClick={() => setShowPreview(false)} variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.filter(item => item.generated && item.barcodeData).map((item) => {
                  return Array.from({ length: item.quantity }, (_, index) => (
                    <div key={`${item.id}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="text-center space-y-2">
                        {settings.showBusinessName && (
                          <div className="font-bold text-gray-900 text-lg">
                            {settings.businessName}
                          </div>
                        )}

                        {settings.showProductName && (
                          <div className="font-medium text-gray-800 text-base">
                            {item.name}
                          </div>
                        )}

                        {settings.showSKU && (
                          <div className="text-gray-600 text-sm">
                            SKU: {item.sku}
                          </div>
                        )}

                        {settings.showPrice && (
                          <div className="font-semibold text-green-600 text-base">
                            ${item.price.toFixed(2)}
                          </div>
                        )}

                        <div className="flex justify-center my-2">
                          <div className="bg-white p-2 border border-gray-300 rounded">
                            <Image src={item.barcodeData || ''} alt="Barcode" style={{ maxWidth: '100%', height: 'auto' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button onClick={() => setShowPreview(false)} variant="outline">
                  Close
                </Button>
                <Button onClick={printAllBarcodes}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AddProductForm component
function AddProductForm({ onAdd, onCancel }: {
  onAdd: (productData: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
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
        quantity: 1
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Product
        </CardTitle>
        <CardDescription>Add a product to generate barcodes for</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
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
              <Label htmlFor="sku">SKU *</Label>
              <Input
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
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
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
              <Label htmlFor="price">Price</Label>
              <Input
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
            <Button type="submit" disabled={loading || !formData.name || !formData.sku}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Export the addProduct function for use in parent components
export { BulkBarcodeGenerator };

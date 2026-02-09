"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Plus,
  Minus,
  Calendar,
  Package,
  DollarSign,
  Hash,
  Tag,
  Eye,
  Printer
} from 'lucide-react';

import { AdminTypes } from '@/types';
import Image from 'next/image';

interface LabelConfigurationProps {
  product: AdminTypes.InventoryTypes.ProductTypes.Product | null;
  onConfigurationChange: (config: LabelConfig) => void;
  onPreview: () => void;
  onPrint: () => void;
  disabled?: boolean;
}

export interface LabelConfig {
  quantity: number;
  variations: Array<{
    id: string;
    name: string;
    value: string;
    enabled: boolean;
  }>;
  price: {
    show: boolean;
    value: number;
    includeCost: boolean;
    includeSelling: boolean;
  };
  packing: {
    show: boolean;
    weight: number;
    dimensions: string;
    unit: string;
  };
  expiryDate: {
    show: boolean;
    date: string;
    format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
  labelSize: 'small' | 'medium' | 'large';
  includeBarcode: boolean;
  includeQRCode: boolean;
  includeProductImage: boolean;
  storeInfo: {
    show: boolean;
    includeAddress: boolean;
    includePhone: boolean;
  };
}

const defaultConfig: LabelConfig = {
  quantity: 1,
  variations: [],
  price: {
    show: true,
    value: 0,
    includeCost: false,
    includeSelling: true,
  },
  packing: {
    show: true,
    weight: 0,
    dimensions: '',
    unit: 'kg',
  },
  expiryDate: {
    show: false,
    date: '',
    format: 'MM/DD/YYYY',
  },
  labelSize: 'medium',
  includeBarcode: true,
  includeQRCode: false,
  includeProductImage: false,
  storeInfo: {
    show: true,
    includeAddress: false,
    includePhone: false,
  },
};

export default function LabelConfiguration({
  product,
  onConfigurationChange,
  onPreview,
  onPrint,
  disabled = false
}: LabelConfigurationProps) {
  const [config, setConfig] = useState<LabelConfig>(defaultConfig);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (product) {
      setConfig(prev => ({
        ...prev,
        price: {
          ...prev.price,
          value: product.sellingPrice,
        },
        packing: {
          ...prev.packing,
          weight: product.weight,
          dimensions: product.dimensions,
        },
        variations: [
          { id: 'category', name: 'Category', value: typeof product.category === 'object' ? product.category.categoryName : product.category ?? '', enabled: true },
          { id: 'brand', name: 'Brand', value: typeof product.brand === 'object' ? product.brand.brand : product.brand ?? '', enabled: true },
          { id: 'sku', name: 'SKU', value: product.SKU ?? '', enabled: true },
          { id: 'barcode', name: 'Barcode', value: product.barcode ?? '', enabled: true },
        ],
      }));
    }
  }, [product]);

  useEffect(() => {
    onConfigurationChange(config);
  }, [config, onConfigurationChange]);

  const updateConfig = <K extends keyof LabelConfig>(key: K, value: LabelConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedConfig = <K extends keyof LabelConfig, N extends keyof LabelConfig[K]>(
    key: K,
    nestedKey: N,
    value: LabelConfig[K][N]
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as any),
        [nestedKey]: value,
      },
    }));
  };

  const addVariation = () => {
    const newVariation = {
      id: `custom_${Date.now()}`,
      name: '',
      value: '',
      enabled: true,
    };
    setConfig(prev => ({
      ...prev,
      variations: [...prev.variations, newVariation],
    }));
  };

  const updateVariation = (id: string, field: 'name' | 'value' | 'enabled', value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      variations: prev.variations.map(variation =>
        variation.id === id ? { ...variation, [field]: value } : variation
      ),
    }));
  };

  const removeVariation = (id: string) => {
    setConfig(prev => ({
      ...prev,
      variations: prev.variations.filter(variation => variation.id !== id),
    }));
  };

  const adjustQuantity = (delta: number) => {
    setConfig(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Label Configuration
          </CardTitle>
          <CardDescription>
            Select a product to configure label settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No product selected for label generation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Selected Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {product.productImage && (
              <Image
                src={product.productImage}
                alt={product.productName}
                className="w-16 h-16 object-cover rounded-lg border"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{product.productName}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">SKU: {product.SKU}</Badge>
                <Badge variant="outline">${product.sellingPrice}</Badge>
                <Badge variant="outline">{typeof product.category === 'object' ? product.category.categoryName : product.category}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
          <CardDescription>
            Configure basic label information and quantity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quantity */}
          <div className="flex items-center gap-4">
            <Label className="font-medium min-w-20">Quantity:</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustQuantity(-1)}
                disabled={config.quantity <= 1 || disabled}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={config.quantity}
                onChange={(e) => updateConfig('quantity', parseInt(e.target.value) || 1)}
                className="w-20 text-center"
                min="1"
                disabled={disabled}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustQuantity(1)}
                disabled={disabled}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Label Size */}
          <div className="flex items-center gap-4">
            <Label className="font-medium min-w-20">Label Size:</Label>
            <Select
              value={config.labelSize}
              onValueChange={(value: 'small' | 'medium' | 'large') => updateConfig('labelSize', value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (2" x 1")</SelectItem>
                <SelectItem value="medium">Medium (3" x 2")</SelectItem>
                <SelectItem value="large">Large (4" x 3")</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code Options */}
          <div className="space-y-2">
            <Label className="font-medium">Include Codes:</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.includeBarcode}
                  onChange={(e) => updateConfig('includeBarcode', e.target.checked)}
                  disabled={disabled}
                />
                <span className="text-sm">Barcode</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.includeQRCode}
                  onChange={(e) => updateConfig('includeQRCode', e.target.checked)}
                  disabled={disabled}
                />
                <span className="text-sm">QR Code</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.includeProductImage}
                  onChange={(e) => updateConfig('includeProductImage', e.target.checked)}
                  disabled={disabled}
                />
                <span className="text-sm">Product Image</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Price Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.price.show}
              onChange={(e) => updateNestedConfig('price', 'show', e.target.checked)}
              disabled={disabled}
            />
            <Label>Show price on label</Label>
          </div>

          {config.price.show && (
            <div className="space-y-3 ml-6">
              <div className="flex items-center gap-4">
                <Label className="font-medium min-w-20">Price:</Label>
                <Input
                  type="number"
                  value={config.price.value}
                  onChange={(e) => updateNestedConfig('price', 'value', parseFloat(e.target.value) || 0)}
                  className="w-32"
                  step="0.01"
                  disabled={disabled}
                />
                <span className="text-sm text-gray-500">USD</span>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Include additional prices:</Label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={config.price.includeCost}
                      onChange={(e) => updateNestedConfig('price', 'includeCost', e.target.checked)}
                      disabled={disabled}
                    />
                    <span className="text-sm">Cost Price (${product.costPrice})</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={config.price.includeSelling}
                      onChange={(e) => updateNestedConfig('price', 'includeSelling', e.target.checked)}
                      disabled={disabled}
                    />
                    <span className="text-sm">Selling Price (${product.sellingPrice})</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Product Variations
          </CardTitle>
          <CardDescription>
            Select which product attributes to include on the label
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.variations.map((variation) => (
            <div key={variation.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <Checkbox
                checked={variation.enabled}
                onChange={(e) => updateVariation(variation.id, 'enabled', e.target.checked)}
                disabled={disabled}
              />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  value={variation.name}
                  onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                  placeholder="Attribute name"
                  disabled={disabled}
                />
                <Input
                  value={variation.value}
                  onChange={(e) => updateVariation(variation.id, 'value', e.target.value)}
                  placeholder="Attribute value"
                  disabled={disabled}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeVariation(variation.id)}
                disabled={disabled}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addVariation}
            className="w-full"
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Variation
          </Button>
        </CardContent>
      </Card>

      {/* Packing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Packing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.packing.show}
              onChange={(e) => updateNestedConfig('packing', 'show', e.target.checked)}
              disabled={disabled}
            />
            <Label>Show packing information</Label>
          </div>

          {config.packing.show && (
            <div className="space-y-3 ml-6">
              <div className="flex items-center gap-4">
                <Label className="font-medium min-w-20">Weight:</Label>
                <Input
                  type="number"
                  value={config.packing.weight}
                  onChange={(e) => updateNestedConfig('packing', 'weight', parseFloat(e.target.value) || 0)}
                  className="w-32"
                  step="0.01"
                  disabled={disabled}
                />
                <Select
                  value={config.packing.unit}
                  onValueChange={(value) => updateNestedConfig('packing', 'unit', value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-medium min-w-20">Dimensions:</Label>
                <Input
                  value={config.packing.dimensions}
                  onChange={(e) => updateNestedConfig('packing', 'dimensions', e.target.value)}
                  placeholder="e.g., 10x5x3 cm"
                  className="flex-1"
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiry Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Expiry Date
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.expiryDate.show}
              onChange={(e) => updateNestedConfig('expiryDate', 'show', e.target.checked)}
              disabled={disabled}
            />
            <Label>Show expiry date</Label>
          </div>

          {config.expiryDate.show && (
            <div className="space-y-3 ml-6">
              <div className="flex items-center gap-4">
                <Label className="font-medium min-w-20">Date:</Label>
                <Input
                  type="date"
                  value={config.expiryDate.date}
                  onChange={(e) => updateNestedConfig('expiryDate', 'date', e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-medium min-w-20">Format:</Label>
                <Select
                  value={config.expiryDate.format}
                  onValueChange={(value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') =>
                    updateNestedConfig('expiryDate', 'format', value)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={config.storeInfo.show}
              onChange={(e) => updateNestedConfig('storeInfo', 'show', e.target.checked)}
              disabled={disabled}
            />
            <Label>Show store information</Label>
          </div>

          {config.storeInfo.show && (
            <div className="space-y-2 ml-6">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.storeInfo.includeAddress}
                  onChange={(e) => updateNestedConfig('storeInfo', 'includeAddress', e.target.checked)}
                  disabled={disabled}
                />
                <span className="text-sm">Include store address</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.storeInfo.includePhone}
                  onChange={(e) => updateNestedConfig('storeInfo', 'includePhone', e.target.checked)}
                  disabled={disabled}
                />
                <span className="text-sm">Include store phone</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="flex-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </Button>
        <Button
          onClick={onPreview}
          variant="outline"
          className="flex-1"
          disabled={disabled}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          onClick={onPrint}
          className="flex-1"
          disabled={disabled}
        >
          <Printer className="w-4 h-4 mr-2" />
          Generate & Print
        </Button>
      </div>
    </div>
  );
}

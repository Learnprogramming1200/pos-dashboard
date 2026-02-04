"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Settings,
  Save,
  X,
  Check
} from 'lucide-react';

interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  config: {
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
    barcodeFormat: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';
    barcodeWidth: number;
    barcodeHeight: number;
    labelSize: 'small' | 'medium' | 'large';
    labelsPerRow: number;
    labelWidth: number;
    labelHeight: number;
    margin: number;
    padding: number;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
    textColor: string;
    priceColor: string;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultTemplate: LabelTemplate = {
  id: '',
  name: '',
  description: '',
  config: {
    productName: true,
    productNameSize: 15,
    productVariation: true,
    productVariationSize: 12,
    productPrice: true,
    productPriceSize: 14,
    showPrice: 'inc',
    businessName: true,
    businessNameSize: 18,
    printPackingDate: true,
    packingDateSize: 10,
    barcodeFormat: 'CODE128',
    barcodeWidth: 2,
    barcodeHeight: 40,
    labelSize: 'medium',
    labelsPerRow: 3,
    labelWidth: 300,
    labelHeight: 150,
    margin: 8,
    padding: 16,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    priceColor: '#059669'
  },
  isDefault: false,
  createdAt: '',
  updatedAt: ''
};

const predefinedTemplates: LabelTemplate[] = [
  {
    id: 'template_1',
    name: 'Standard Retail Label',
    description: 'Basic label with product name, price, and barcode',
    config: {
      productName: true,
      productNameSize: 16,
      productVariation: false,
      productVariationSize: 12,
      productPrice: true,
      productPriceSize: 16,
      showPrice: 'inc',
      businessName: true,
      businessNameSize: 20,
      printPackingDate: false,
      packingDateSize: 10,
      barcodeFormat: 'CODE128',
      barcodeWidth: 2,
      barcodeHeight: 40,
      labelSize: 'medium',
      labelsPerRow: 3,
      labelWidth: 300,
      labelHeight: 150,
      margin: 8,
      padding: 16,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      priceColor: '#059669'
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template_2',
    name: 'Minimal Label',
    description: 'Clean label with just product name and barcode',
    config: {
      productName: true,
      productNameSize: 18,
      productVariation: false,
      productVariationSize: 12,
      productPrice: false,
      productPriceSize: 14,
      showPrice: 'inc',
      businessName: false,
      businessNameSize: 18,
      printPackingDate: false,
      packingDateSize: 10,
      barcodeFormat: 'CODE128',
      barcodeWidth: 2,
      barcodeHeight: 50,
      labelSize: 'small',
      labelsPerRow: 4,
      labelWidth: 250,
      labelHeight: 100,
      margin: 4,
      padding: 12,
      borderStyle: 'none',
      borderWidth: 0,
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      priceColor: '#059669'
    },
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template_3',
    name: 'Detailed Label',
    description: 'Comprehensive label with all information',
    config: {
      productName: true,
      productNameSize: 14,
      productVariation: true,
      productVariationSize: 12,
      productPrice: true,
      productPriceSize: 14,
      showPrice: 'inc',
      businessName: true,
      businessNameSize: 16,
      printPackingDate: true,
      packingDateSize: 10,
      barcodeFormat: 'CODE128',
      barcodeWidth: 2,
      barcodeHeight: 35,
      labelSize: 'large',
      labelsPerRow: 2,
      labelWidth: 400,
      labelHeight: 200,
      margin: 12,
      padding: 20,
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: '#374151',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      priceColor: '#059669'
    },
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function LabelTemplates() {
  const [templates, setTemplates] = useState<LabelTemplate[]>(predefinedTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<LabelTemplate>(defaultTemplate);

  // Create new template
  const createTemplate = () => {
    if (!newTemplate.name.trim()) return;
    
    const template: LabelTemplate = {
      ...newTemplate,
      id: `template_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, template]);
    setNewTemplate(defaultTemplate);
    setShowCreateForm(false);
  };

  // Update template
  const updateTemplate = (id: string, updates: Partial<LabelTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, ...updates, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  // Delete template
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  // Duplicate template
  const duplicateTemplate = (template: LabelTemplate) => {
    const duplicated: LabelTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  // Set as default
  const setAsDefault = (id: string) => {
    setTemplates(prev => prev.map(template => ({
      ...template,
      isDefault: template.id === id
    })));
  };

  // Update template config
  const updateTemplateConfig = (id: string, configKey: string, value: any) => {
    updateTemplate(id, {
      config: {
        ...templates.find(t => t.id === id)?.config || defaultTemplate.config,
        [configKey]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Label Templates</h2>
          <p className="text-gray-600">Create and manage label templates for consistent printing</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {template.isDefault && (
                    <Badge variant="default" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Size:</strong> {template.config.labelWidth}×{template.config.labelHeight}px</p>
                <p><strong>Labels per row:</strong> {template.config.labelsPerRow}</p>
                <p><strong>Barcode:</strong> {template.config.barcodeFormat}</p>
                <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setSelectedTemplate(template)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
                <Button
                  onClick={() => duplicateTemplate(template)}
                  variant="ghost"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => deleteTemplate(template.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Template
            </CardTitle>
            <CardDescription>Create a custom label template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter template description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="label-width">Label Width (px)</Label>
                  <Input
                    id="label-width"
                    type="number"
                    value={newTemplate.config.labelWidth}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      config: { ...prev.config, labelWidth: parseInt(e.target.value) }
                    }))}
                    min="200"
                    max="600"
                  />
                </div>
                <div>
                  <Label htmlFor="label-height">Label Height (px)</Label>
                  <Input
                    id="label-height"
                    type="number"
                    value={newTemplate.config.labelHeight}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      config: { ...prev.config, labelHeight: parseInt(e.target.value) }
                    }))}
                    min="100"
                    max="400"
                  />
                </div>
                <div>
                  <Label htmlFor="labels-per-row">Labels per Row</Label>
                  <Input
                    id="labels-per-row"
                    type="number"
                    value={newTemplate.config.labelsPerRow}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      config: { ...prev.config, labelsPerRow: parseInt(e.target.value) }
                    }))}
                    min="1"
                    max="6"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={createTemplate} disabled={!newTemplate.name.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Configuration */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configure Template: {selectedTemplate.name}
                </CardTitle>
                <CardDescription>Customize the template settings</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setAsDefault(selectedTemplate.id)}
                  variant="outline"
                  size="sm"
                  disabled={selectedTemplate.isDefault}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Set as Default
                </Button>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Content Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-product-name"
                      checked={selectedTemplate.config.productName}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'productName', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="show-product-name">Show Product Name</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-product-price"
                      checked={selectedTemplate.config.productPrice}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'productPrice', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="show-product-price">Show Product Price</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-business-name"
                      checked={selectedTemplate.config.businessName}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'businessName', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="show-business-name">Show Business Name</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-packing-date"
                      checked={selectedTemplate.config.printPackingDate}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'printPackingDate', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="show-packing-date">Show Packing Date</Label>
                  </div>
                </div>
              </div>

              {/* Layout Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Layout Settings</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="barcode-format">Barcode Format</Label>
                    <select
                      id="barcode-format"
                      value={selectedTemplate.config.barcodeFormat}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'barcodeFormat', e.target.value)}
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
                    <Label htmlFor="label-size">Label Size</Label>
                    <select
                      id="label-size"
                      value={selectedTemplate.config.labelSize}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'labelSize', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="border-style">Border Style</Label>
                    <select
                      id="border-style"
                      value={selectedTemplate.config.borderStyle}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'borderStyle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="border-width">Border Width</Label>
                    <Input
                      id="border-width"
                      type="number"
                      value={selectedTemplate.config.borderWidth}
                      onChange={(e) => updateTemplateConfig(selectedTemplate.id, 'borderWidth', parseInt(e.target.value))}
                      min="0"
                      max="5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


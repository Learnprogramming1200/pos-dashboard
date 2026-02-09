"use client";

import React from 'react';
import JsBarcode from 'jsbarcode';
import {
  Settings,
  Package,
  AlertCircle,
  Barcode
} from 'lucide-react';
import { Constants } from '@/constant';
import { WebComponents } from "@/components";
import  { AdminTypes } from '@/types';
import { barcodeUtils } from '@/utils/barcodeUtils';

export default function EnhancedBarcodeGenerator({
  product,
  className = "",
  mode = 'single',
  onGenerate,
  showProductName = true,
  showPrice = true,
  showSKU = true,
  showExpiryDate = true,
  showNote = true,
  showVariation = true,
  fontSizeName = 14,
  fontSizeVariation = 12,
  fontSizePrice = 14,
  fontSizeSKU = 10,
  fontSizeNote = 10,
  fontSizeExpiryDate = 10,
  note = '',
  overrideExpiry = '',
  background,
  lineColor,
}: AdminTypes.InventoryTypes.BarcodeTypes.BarcodeGeneratorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [barcodeSettings, setBarcodeSettings] = React.useState<AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettings>(Constants.adminConstants.defaultBarcodeSettings);
  const [showSettings, setShowSettings] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const displaySKU = (product as any)?.SKU ?? (product as any)?.sku ?? (product as any)?.productSku ?? '';

  const finalBarcode = barcodeUtils.getProductBarcode(product);

  const displayPriceNum = (() => {
    const p: any = product || {};
    return barcodeUtils.getProductPrice(p);
  })();

  const generateBarcode = React.useCallback(() => {
    if (!product || !canvasRef.current) {
      setError("No product data available");
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      // Use the existing barcode from database or generate from SKU
      let barcodeValue = finalBarcode;
      // Convert to string and clean
      barcodeValue = barcodeValue ? barcodeValue.toString().trim() : '';

      // If no barcode available, show error
      if (!barcodeValue || barcodeValue.length === 0) {
        setError("No barcode available for this product");
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      JsBarcode(canvas, barcodeValue, {
        format: barcodeSettings.format,
        width: barcodeSettings.width,
        height: barcodeSettings.height,
        displayValue: barcodeSettings.displayValue,
        text: barcodeValue, // Use the same barcode number for display
        fontSize: barcodeSettings.fontSize,
        margin: barcodeSettings.margin,
        background: background || barcodeSettings.background,
        lineColor: lineColor || barcodeSettings.lineColor,
        textAlign: barcodeSettings.textAlign,
        textPosition: barcodeSettings.textPosition,
        textMargin: barcodeSettings.textMargin,
        valid: async (valid: boolean) => {
          if (!valid) {
            // Try with CODE128 format as fallback
            try {
              JsBarcode(canvas, barcodeValue, {
                format: 'CODE128',
                width: barcodeSettings.width,
                height: barcodeSettings.height,
                displayValue: barcodeSettings.displayValue,
                text: barcodeValue, // Use the same barcode number for display
                fontSize: barcodeSettings.fontSize,
                margin: barcodeSettings.margin,
                background: background || barcodeSettings.background,
                lineColor: lineColor || barcodeSettings.lineColor,
                textAlign: barcodeSettings.textAlign,
                textPosition: barcodeSettings.textPosition,
                textMargin: barcodeSettings.textMargin,
                valid: async (fallbackValid: boolean) => {
                  if (fallbackValid) {
                    setSuccess("Barcode generated successfully with CODE128 format!");
                    onGenerate?.(barcodeValue);

                    // Update product barcode in database if needed
                    if (barcodeUtils.needsBarcodeGeneration(product)) {
                      await barcodeUtils.updateProductBarcodeInDB(product, barcodeValue);
                    }
                  } else {
                    setError(`Unable to generate barcode for value: ${barcodeValue}`);
                  }
                }
              });
            } catch (fallbackErr) {
              setError(`Unable to generate barcode for value: ${barcodeValue}`);
            }
          } else {
            setSuccess("Barcode generated successfully!");
            onGenerate?.(barcodeValue);

            // Update product barcode in database if needed
            if (barcodeUtils.needsBarcodeGeneration(product)) {
              await barcodeUtils.updateProductBarcodeInDB(product, barcodeValue);
            }
          }
        }
      });
    } catch (err) {
      console.error("Error generating barcode:", err);
      setError("Failed to generate barcode. Please check the barcode value and format.");
    }
  }, [product, barcodeSettings, finalBarcode, onGenerate, background, lineColor]);

  // Initialize canvas dimensions
  React.useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 400;
      canvas.height = 150;
    }
  }, []);

  // Auto-generate barcode when product changes
  React.useEffect(() => {
    if (product && canvasRef.current) {
      // Small delay to ensure canvas is ready
      setTimeout(() => {
        generateBarcode();
      }, 100);
    }
  }, [product, generateBarcode]);


  const updateBarcodeSetting = <K extends keyof AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettings>(key: K, value: AdminTypes.InventoryTypes.BarcodeTypes.BarcodeSettings[K]) => {
    setBarcodeSettings(prev => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    if (product) {
      generateBarcode();
    }
  }, [product, barcodeSettings]);

  if (!product) {
    return (
      <WebComponents.UiComponents.UiWebComponents.Card className={className}>
        <WebComponents.UiComponents.UiWebComponents.CardContent className="flex flex-col items-center justify-center p-12">
          <Package className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No product selected</p>
          <p className="text-gray-500 text-sm">Select a product to generate barcode</p>
        </WebComponents.UiComponents.UiWebComponents.CardContent>
      </WebComponents.UiComponents.UiWebComponents.Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barcode Generator Card */}
      <WebComponents.UiComponents.UiWebComponents.Card className="bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2E2E2E]">
        <WebComponents.UiComponents.UiWebComponents.CardHeader className="bg-white dark:bg-[#1E1E1E]">
          <div className="flex justify-between items-center">
            <div>
              <WebComponents.UiComponents.UiWebComponents.CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Barcode className="w-5 h-5" />
                Barcode Generator
              </WebComponents.UiComponents.UiWebComponents.CardTitle>
              <WebComponents.UiComponents.UiWebComponents.CardDescription className="text-gray-600 dark:text-gray-300">
                {mode === 'single' && 'Generate and customize single barcodes'}
                {mode === 'label' && 'Generate barcodes for product labels'}
                {mode === 'bulk' && 'Generate multiple barcodes at once'}
              </WebComponents.UiComponents.UiWebComponents.CardDescription>
            </div>
            <div className="flex gap-2">
              <WebComponents.UiComponents.UiWebComponents.Button
                size="sm"
                className="bg-primary text-white hover:bg-primaryHover w-full sm:w-auto"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4 mr-2 " />
                {/* Settings */}
              </WebComponents.UiComponents.UiWebComponents.Button>
              <WebComponents.AdminComponents.AdminWebComponents.Models.BarcodeSettingsModal
                isOpen={showSettings}
                onOpenChange={setShowSettings}
                barcodeSettings={barcodeSettings}
                updateBarcodeSetting={updateBarcodeSetting}
              />
            </div>
          </div>
        </WebComponents.UiComponents.UiWebComponents.CardHeader>
        <WebComponents.UiComponents.UiWebComponents.CardContent className="bg-white dark:bg-[#1E1E1E]">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Barcode Display */}
          <div className="bg-gray-50 dark:bg-[#0F0F0F] p-6 rounded-lg text-center min-h-[380px] flex flex-col justify-center">
            {/* Live label information centered like print preview */}
            <div className="text-center mb-4 space-y-1">
              {showProductName && (
                <div
                  className="font-semibold text-gray-900 dark:text-white"
                  style={{ fontSize: `${fontSizeName}px` }}
                >
                  {(product as any)?.baseProductName || (product as any)?.productName || (product as any)?.name || '—'}
                </div>
              )}
              {showVariation && ((product as any)?.variation || (product as any)?.variantTitle) && (
                <div
                  className="text-gray-600 dark:text-gray-400"
                  style={{ fontSize: `${fontSizeVariation}px` }}
                >
                  {(product as any)?.variation || (product as any)?.variantTitle}
                </div>
              )}
              {showSKU && displaySKU && (
                <div
                  className="text-gray-500 dark:text-gray-400"
                  style={{ fontSize: `${fontSizeSKU}px` }}
                >
                  SKU: {displaySKU}
                </div>
              )}
              {showNote && note && (
                <div
                  className="text-gray-700 dark:text-gray-300"
                  style={{ fontSize: `${fontSizeNote}px` }}
                >
                  {String(note).replace(/<[^>]*>/g, '').slice(0, 50)}
                </div>
              )}
              {showPrice && (
                <div
                  className="text-gray-900 dark:text-white"
                  style={{ fontSize: `${fontSizePrice}px` }}
                >
                  <span className="font-semibold">MRP:</span> ₹{Number(displayPriceNum).toFixed(2)}
                </div>
              )}
              {showExpiryDate && (overrideExpiry || (product as any)?.expiryDate) && (
                <div
                  className="text-gray-600 dark:text-gray-300"
                  style={{ fontSize: `${fontSizeExpiryDate}px` }}
                >
                  Exp: {overrideExpiry || (product as any).expiryDate}
                </div>
              )}
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="border border-gray-300 dark:border-[#2E2E2E] rounded mx-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              {barcodeUtils.needsBarcodeGeneration(product) ?
                "* Barcode generated from SKU" :
                "* Using existing barcode from database"
              }
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
          </div>
        </WebComponents.UiComponents.UiWebComponents.CardContent>
      </WebComponents.UiComponents.UiWebComponents.Card>

    </div >
  );
}

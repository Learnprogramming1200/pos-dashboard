

import React from 'react';
import JsBarcode from 'jsbarcode';
import { AdminTypes } from '@/types';
 const PrintLabelItem = ({ product, barcode, labelConfig }: { 
    product: AdminTypes.InventoryTypes.PrintLabelTypes.Product; 
    barcode: string; 
    labelConfig: AdminTypes.InventoryTypes.PrintLabelTypes.LabelConfig; 
  }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
      if (canvasRef.current) {
        try {
          JsBarcode(canvasRef.current, product.barcode || '', {
            format: "CODE128",
            width: 1,
            height: 30,
            displayValue: true,
            fontSize: 12,
            margin: 2,
            background: "#ffffff",
            lineColor: "#000000"
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
        }
      }
    }, [barcode]);
  
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        {/* Label Content */}
        <div className="text-center space-y-2">
          {/* Business Name */}
          {labelConfig.businessName && (
            <div 
              className="font-bold text-gray-900"
              style={{ fontSize: `${labelConfig.businessNameSize}px` }}
            >
            </div>
          )}
  
          {/* Product Name */}
          {labelConfig.productName && (
            <div 
              className="font-medium text-gray-800"
              style={{ fontSize: `${labelConfig.productNameSize}px` }}
            >
              {product.name}
            </div>
          )}
  
          {/* Product Variation */}
          {labelConfig.productVariation && product.variation && (
            <div 
              className="text-gray-600"
              style={{ fontSize: `${labelConfig.productVariationSize}px` }}
            >
              {product.variation}
            </div>
          )}
  
          {/* Product Price */}
          {labelConfig.productPrice && product.price && (
            <div 
              className="font-semibold text-green-600"
              style={{ fontSize: `${labelConfig.productPriceSize}px` }}
            >
              ${product.price} {labelConfig.showPrice === 'inc' ? '(Inc. Tax)' : '(Exc. Tax)'}
            </div>
          )}
  
          {/* Barcode using jsbarcode */}
          <div className="flex justify-center my-2">
            <div className="bg-white p-2 border border-gray-300 rounded">
              <canvas
                ref={canvasRef}
                width="100"
                height="30"
                style={{ display: 'block' }}
              />
            </div>
          </div>
  
          {/* Packing Date */}
          {labelConfig.printPackingDate && (
            <div 
              className="text-gray-500"
              style={{ fontSize: `${labelConfig.packingDateSize}px` }}
            >
              Packed: {new Date(product.packingDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };
  export default PrintLabelItem
  
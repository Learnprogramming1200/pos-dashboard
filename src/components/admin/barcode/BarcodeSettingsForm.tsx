"use client";
import React from "react";
import { WebComponents } from "@/components";
import { BarcodeGenratorTypes } from "@/types";
type Props = {
  initial: BarcodeGenratorTypes.BarcodeSettings;
  onSubmit: (data: BarcodeGenratorTypes.BarcodeSettings) => void;
  onCancel: () => void;
};

export default function BarcodeSettingsForm({ initial, onSubmit, onCancel }: Props) {
  const [format, setFormat] = React.useState<BarcodeGenratorTypes.BarcodeSettings['format']>(initial.format);
  const [width, setWidth] = React.useState(initial.width);
  const [height, setHeight] = React.useState(initial.height);
  const [displayValue, setDisplayValue] = React.useState(initial.displayValue);
  const [fontSize, setFontSize] = React.useState(initial.fontSize);
  const [margin, setMargin] = React.useState(initial.margin);
  const [background, setBackground] = React.useState(initial.background);
  const [lineColor, setLineColor] = React.useState(initial.lineColor);
  const [textAlign, setTextAlign] = React.useState<BarcodeGenratorTypes.BarcodeSettings['textAlign']>(initial.textAlign);
  const [textPosition, setTextPosition] = React.useState<BarcodeGenratorTypes.BarcodeSettings['textPosition']>(initial.textPosition);
  const [textMargin, setTextMargin] = React.useState(initial.textMargin);
  const [codeType, setCodeType] = React.useState<NonNullable<BarcodeGenratorTypes.BarcodeSettings['codeType']>>(initial.codeType || 'barcode');
  const [qrErrorCorrection, setQrErrorCorrection] = React.useState<NonNullable<BarcodeGenratorTypes.BarcodeSettings['qrErrorCorrection']>>(initial.qrErrorCorrection || 'M');
  const [qrMargin, setQrMargin] = React.useState(initial.qrMargin ?? 2);
  const [qrScale, setQrScale] = React.useState(initial.qrScale ?? 4);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        format,
        width,
        height,
        displayValue,
        fontSize,
        margin,
        background,
        lineColor,
        textAlign,
        textPosition,
        textMargin,
        codeType,
        qrErrorCorrection,
        qrMargin,
        qrScale,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <form id="barcode-settings-form" onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="codeType">Code Type</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormDropdown id="codeType" name="codeType" value={codeType} onChange={e => setCodeType(e.target.value as 'barcode' | 'qrcode')}>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="barcode">Barcode (1D)</WebComponents.UiComponents.UiWebComponents.FormOption>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="qrcode">QR Code (2D)</WebComponents.UiComponents.UiWebComponents.FormOption>
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              </div>
              {codeType === 'barcode' && (
                <>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="format">Barcode Format</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown id="format" name="format" value={format} onChange={e => setFormat(e.target.value as BarcodeGenratorTypes.BarcodeSettings['format'])}>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="CODE128">CODE128</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="CODE39">CODE39</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="EAN13">EAN13</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="EAN8">EAN8</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="UPC">UPC</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="ITF14">ITF14</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="MSI">MSI</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="pharmacode">Pharmacode</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="codabar">Codabar</WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="width">Width</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="width" name="width" type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} min="1" max="10" required />
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="height">Height</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="height" name="height" type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} min="50" max="300" required />
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="fontSize">Font Size</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="fontSize" name="fontSize" type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} min="10" max="50" required />
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="margin">Margin</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="margin" name="margin" type="number" value={margin} onChange={e => setMargin(parseInt(e.target.value))} min="0" max="50" required />
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="textPosition">Text Position</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown id="textPosition" name="textPosition" value={textPosition} onChange={e => setTextPosition(e.target.value as BarcodeGenratorTypes.BarcodeSettings['textPosition'])}>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="bottom">Bottom</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="top">Top</WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="textAlign">Text Alignment</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown id="textAlign" name="textAlign" value={textAlign} onChange={e => setTextAlign(e.target.value as BarcodeGenratorTypes.BarcodeSettings['textAlign'])}>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="left">Left</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="center">Center</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="right">Right</WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="textMargin">Text Margin</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="textMargin" name="textMargin" type="number" value={textMargin} onChange={e => setTextMargin(parseInt(e.target.value))} min="0" max="20" required />
                  </div>
                </>
              )}
              {codeType === 'qrcode' && (
                <>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="qrEc">Error Correction</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown id="qrEc" name="qrEc" value={qrErrorCorrection} onChange={e => setQrErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="L">L (7%)</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="M">M (15%)</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="Q">Q (25%)</WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="H">H (30%)</WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="qrMargin">QR Margin (modules)</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="qrMargin" name="qrMargin" type="number" value={qrMargin} onChange={e => setQrMargin(parseInt(e.target.value))} min="0" max="16" required />
                  </div>
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="qrScale">QR Scale</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput id="qrScale" name="qrScale" type="number" value={qrScale} onChange={e => setQrScale(parseInt(e.target.value))} min="1" max="12" required />
                  </div>
                </>
              )}
              <div className="col-span-1">
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="background">Background Color</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <div className="flex items-center gap-2">
                  <input id="background" name="background" type="color" value={background} onChange={e => setBackground(e.target.value)} className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer" />
                  <WebComponents.UiComponents.UiWebComponents.FormInput type="text" value={background} onChange={e => setBackground(e.target.value)} placeholder="#ffffff" className="flex-1" />
                </div>
              </div>
              <div className="col-span-1">
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="lineColor">{codeType === 'qrcode' ? 'Dark Color' : 'Line Color'}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <div className="flex items-center gap-2">
                  <input id="lineColor" name="lineColor" type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer" />
                  <WebComponents.UiComponents.UiWebComponents.FormInput type="text" value={lineColor} onChange={e => setLineColor(e.target.value)} placeholder="#000000" className="flex-1" />
                </div>
              </div>
              {codeType === 'barcode' && (
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input id="displayValue" name="displayValue" type="checkbox" checked={displayValue} onChange={e => setDisplayValue(e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="displayValue" className="text-sm font-medium text-gray-900 dark:text-white">Display Value</WebComponents.UiComponents.UiWebComponents.FormLabel>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <div className="pt-[60px] flex justify-end gap-3">
        <WebComponents.UiComponents.UiWebComponents.Button variant="outline" type="button" onClick={onCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Cancel
        </WebComponents.UiComponents.UiWebComponents.Button>
        <WebComponents.UiComponents.UiWebComponents.Button className="bg-blue-600 hover:bg-blue-700 text-white" type="submit" form="barcode-settings-form" disabled={loading}>
          {loading ? "Processing..." : "Update Settings"}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>
    </>
  );
}


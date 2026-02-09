export type BarcodeSettings = {
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
  codeType?: 'barcode' | 'qrcode';
  qrErrorCorrection?: 'L' | 'M' | 'Q' | 'H';
  qrMargin?: number;
  qrScale?: number;
};

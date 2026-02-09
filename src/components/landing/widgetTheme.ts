import { WidgetSettings } from '@/lib/rag-api';

export type WidgetTheme = {
  right: boolean;
  launcherSize: number;
  borderRadius: number;
  chatWidth: number;
  chatHeight: number;
  primary: string;
  accent: string;
  shadow: boolean;
  primaryTextColor: string;
  accentTextColor: string;
};

function isColorLight(hexColor: string): boolean {
  const hex = (hexColor || '#000000').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function getWidgetTheme(settings?: WidgetSettings | null): WidgetTheme {
  const right = (settings?.position ?? 'right') !== 'left';
  const launcherSize = settings?.launcherSize ?? 56;
  const borderRadius = settings?.borderRadius ?? 12;
  const chatWidth = settings?.chatWidth ?? 320;
  const chatHeight = settings?.chatHeight ?? 420;
  const primary = settings?.primaryColor ?? '#3b82f6';
  const accent = settings?.accentColor ?? '#60A5FA';
  const shadow = settings?.shadow !== false;

  const primaryTextColor = isColorLight(primary) ? '#1f2937' : '#ffffff';
  const accentTextColor = isColorLight(accent) ? '#1f2937' : '#ffffff';

  return {
    right,
    launcherSize,
    borderRadius,
    chatWidth,
    chatHeight,
    primary,
    accent,
    shadow,
    primaryTextColor,
    accentTextColor,
  };
}



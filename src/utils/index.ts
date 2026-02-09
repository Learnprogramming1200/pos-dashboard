export function createPageUrl(page: string) {
  if (page === '/') {
    return '/';
  }
  return `/${page.toLowerCase()}`;
}
export * as formatFunctionsUtils from "./formatFunctionsUtils"
export * as barcodeUtils from './barcodeUtils';
export * as planUtils from './planUtils';

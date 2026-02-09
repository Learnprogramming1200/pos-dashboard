/**
 * POS Module - Main Entry Point
 * 
 * Architecture Overview:
 * =====================
 * 
 * ├── core/
 * │   ├── POSProvider.tsx    - React Context Provider for global POS state
 * │   ├── usePOSCore.ts      - Centralized business logic hook
 * │   ├── pos.api.ts         - API abstraction layer
 * │   └── pos.types.ts       - TypeScript type definitions
 * │
 * ├── ui/
 * │   ├── PosHeaderUI.tsx    - Header component (pure UI)
 * │   ├── PosCategoryUI.tsx  - Category selector (pure UI)
 * │   ├── PosProductUI.tsx   - Product grid (pure UI)
 * │   ├── OrderPanelUI.tsx   - Order panel (pure UI)
 * │   ├── PaymentPanelUI.tsx - Payment methods (pure UI)
 * │   ├── CalculatorUI.tsx   - Calculator overlay (pure UI)
 * │   └── PosLoadingUI.tsx   - Loading states (pure UI)
 * │
 * ├── layouts/
 * │   ├── PosLayoutRight.tsx - Layout with right sidebar
 * │   └── PosLayoutTop.tsx   - Layout with top categories
 * │
 * └── screens/
 *     ├── Pos2Screen.tsx     - Refactored pos-2 screen
 *     ├── Pos3Screen.tsx     - Refactored pos-3 screen
 *     ├── Pos4Screen.tsx     - Refactored pos-4 screen
 *     └── Pos5Screen.tsx     - Refactored pos-5 screen
 * 
 * Key Principles:
 * ==============
 * 1. ALL business logic lives in usePOSCore
 * 2. UI components are PURE - they receive data via props or context
 * 3. Store dependency flow: Stores first, then categories/products
 * 4. Products NEVER load without a valid storeId
 * 5. Role-based store control (CASHIER cannot change store)
 * 6. Store changes clear dependent data before refetch
 * 7. NO API calls in UI components
 * 8. NO duplicate logic across screens
 */

// Core exports
export * from './core';

// UI exports
export * from './ui';

// Layout exports
export * from './layouts';

// Screen exports
export * from './screens';

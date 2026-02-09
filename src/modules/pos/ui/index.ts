/**
 * POS UI Module - All UI components and configurations
 */

// Components
export { PosHeaderUI } from './PosHeaderUI';
export type { PosHeaderUIProps } from './PosHeaderUI';

export { PosCategoryUI } from './PosCategoryUI';
export type { PosCategoryUIProps } from './PosCategoryUI';

export { PosProductUI } from './PosProductUI';
export type { PosProductUIProps } from './PosProductUI';

export { OrderPanelUI } from './OrderPanelUI';
export type { OrderPanelUIProps } from './OrderPanelUI';

export { PaymentPanelUI, PaymentMethodBarUI } from './PaymentPanelUI';
export type { PaymentPanelUIProps, PaymentMethodBarUIProps } from './PaymentPanelUI';

export { CalculatorUI } from './CalculatorUI';
export type { CalculatorUIProps } from './CalculatorUI';

export { PosLoadingUI, ProductGridSkeleton, OrderPanelSkeleton } from './PosLoadingUI';
export type { PosLoadingUIProps } from './PosLoadingUI';

export { ActionPanelUI } from './ActionPanelUI';
export type { ActionPanelUIProps } from './ActionPanelUI';

// Configuration
export { POS_UI_CONFIG, getPosUIConfig, hasPosUIConfig } from './pos-ui.config';
export type {
    PosScreenUIConfig,
    PosHeaderConfig,
    PosCategorySidebarConfig,
    PosProductGridConfig,
    PosProductCardConfig,
    PosActionPanelConfig,
    PosOrderPanelConfig,
    PosLayoutConfig,
    PosMobileConfig,
    PosBottomActionBarConfig,
    PosScreenType,
} from './pos-ui.config';

export { CustomerModalUI } from './CustomerModalUI';
export type { CustomerModalUIProps } from './CustomerModalUI';

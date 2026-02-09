'use client';

import React from 'react';
import Image from 'next/image';
import {
  Search,
  Menu,
  ChevronDown,
  ShoppingCart,
} from 'lucide-react';

import type { Store, CashierInfo, RegisterInfo } from '../core/pos.types';
import type { PosHeaderConfig } from './pos-ui.config';
import { Constants } from '@/constant';

export interface PosHeaderUIProps {
  cashierInfo: CashierInfo;
  registerInfo: RegisterInfo;
  formattedDate: string;
  formattedTime: string;
  stores: Store[];
  selectedStore: Store | null;
  canChangeStore: boolean;
  onStoreChange: (storeId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isCalculatorOpen: boolean;
  onToggleCalculator: () => void;
  onBack: () => void;
  onToggleMobileMenu?: () => void;
  onToggleCart?: () => void;
  cartItemCount?: number;
  logoSrc?: string;
  uiConfig?: Partial<PosHeaderConfig>;
}

const DEFAULT_CONFIG: PosHeaderConfig = {
  wrapperClass: 'bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-2 sm:p-4',
  innerContainerClass: 'flex items-center justify-between gap-4',
  logoContainerClass: 'flex-shrink-0 w-24',
  logoImageClass: 'h-10 w-full object-contain',
  welcomeTextClass: 'hidden sm:block text-sm font-semibold text-gray-800 dark:text-gray-200',
  dateTimeContainerClass: 'bg-slate-700 dark:bg-slate-600 px-2 py-[6px] rounded-md',
  dateTimeTextClass: 'text-white font-semibold',
  storeDropdownClass: 'pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none',
  mobileMenuButtonClass: 'lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700',
  showMobileMenuButton: true,
  rightSideContainerClass: 'flex items-center gap-2',
  searchContainerClass: 'hidden md:block',
  searchInputClass: 'pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm w-48 lg:w-64',
  searchIconClass: 'absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400',
  showSearchBar: true,
  headerButtonClass: 'p-1.5 sm:p-2 rounded-md bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500',
  showDarkModeToggle: true,
  showCartButton: false,
  cartButtonClass: '',
  storeDropdownListClass: 'absolute top-full mt-1 left-0 w-full min-w-[200px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50',
  storeOptionClass: 'w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition-colors',
};

export function PosHeaderUI({
  cashierInfo,
  registerInfo,
  formattedDate,
  formattedTime,
  stores,
  selectedStore,
  canChangeStore,
  onStoreChange,
  searchQuery,
  onSearchChange,
  isFullscreen,
  onToggleFullscreen,
  darkMode,
  onToggleDarkMode,
  isCalculatorOpen,
  onToggleCalculator,
  onBack,
  onToggleMobileMenu,
  onToggleCart,
  cartItemCount = 0,
  logoSrc = Constants.assetsIcon.assets.fullLogo.src,
  uiConfig,
}: PosHeaderUIProps) {
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const config = { ...DEFAULT_CONFIG, ...uiConfig };

  return (
    <header className={config.wrapperClass}>
      <div className={config.innerContainerClass}>
        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className={config.logoContainerClass}>
            <Image
              src={logoSrc}
              alt="Logo"
              width={80}
              height={32}
              className={config.logoImageClass}
            />
          </div>

          <div className={config.welcomeTextClass} suppressHydrationWarning>
            Welcome, {cashierInfo.name}
          </div>

          <div className={config.dateTimeContainerClass}>
            <p className={config.dateTimeTextClass}>
              {formattedDate} {formattedTime}
            </p>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => canChangeStore && setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              disabled={!canChangeStore}
              className={`${config.storeDropdownClass} ${!canChangeStore ? 'opacity-60 cursor-not-allowed' : ''}`}
              suppressHydrationWarning
            >
              <span className="truncate max-w-[80px] sm:max-w-[160px]">{selectedStore?.name || 'Select Store'}</span>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
            </button>

            {isStoreDropdownOpen && (
              <div className={config.storeDropdownListClass}>
                {stores.map((store) => (
                  <button
                    key={store._id}
                    onClick={() => {
                      onStoreChange(store._id);
                      setIsStoreDropdownOpen(false);
                    }}
                    className={config.storeOptionClass}
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {config.showMobileMenuButton && onToggleMobileMenu && (
            <button onClick={onToggleMobileMenu} className={config.mobileMenuButtonClass}>
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>

        {/* Right side */}
        <div className={config.rightSideContainerClass}>
          {config.showSearchBar && (
            <div className={config.searchContainerClass}>
              <div className="relative">
                <Search className={config.searchIconClass} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search products..."
                  className={config.searchInputClass}
                />
              </div>
            </div>
          )}

          <button onClick={onBack} className={config.headerButtonClass} title="Back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M7.9763 4.94141L2.91797 9.99974L7.9763 15.0581" stroke="currentColor" strokeWidth="1.4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.0836 10H3.05859" stroke="currentColor" strokeWidth="1.4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button className={`${config.headerButtonClass} hidden sm:flex`} title={`Register: ${registerInfo.id}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M20 8.25V18C20 21 18.21 22 16 22H8C5.79 22 4 21 4 18V8.25C4 5 5.79 4.25 8 4.25C8 4.87 8.24997 5.43 8.65997 5.84C9.06997 6.25 9.63 6.5 10.25 6.5H13.75C14.99 6.5 16 5.49 16 4.25C18.21 4.25 20 5 20 8.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 4.25C16 5.49 14.99 6.5 13.75 6.5H10.25C9.63 6.5 9.06997 6.25 8.65997 5.84C8.24997 5.43 8 4.87 8 4.25C8 3.01 9.01 2 10.25 2H13.75C14.37 2 14.93 2.25 15.34 2.66C15.75 3.07 16 3.63 16 4.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 17H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button onClick={onToggleCalculator} className={config.headerButtonClass} title="Calculator">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M8.33333 18.3337H11.6667C15.8333 18.3337 17.5 16.667 17.5 12.5003V7.50033C17.5 3.33366 15.8333 1.66699 11.6667 1.66699H8.33333C4.16667 1.66699 2.5 3.33366 2.5 7.50033V12.5003C2.5 16.667 4.16667 18.3337 8.33333 18.3337Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.75 6.31641V7.14974C13.75 7.83307 13.1917 8.39974 12.5 8.39974H7.5C6.81667 8.39974 6.25 7.84141 6.25 7.14974V6.31641C6.25 5.63307 6.80833 5.06641 7.5 5.06641H12.5C13.1917 5.06641 13.75 5.62474 13.75 6.31641Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.7801 11.6667H6.78973" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.99494 11.6667H10.0046" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.2137 11.6667H13.2233" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.7801 14.5837H6.78973" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.99494 14.5837H10.0046" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.2137 14.5837H13.2233" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button onClick={onToggleFullscreen} className={`${config.headerButtonClass} hidden sm:flex`} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M7.49996 18.3337H12.5C16.6666 18.3337 18.3333 16.667 18.3333 12.5003V7.50033C18.3333 3.33366 16.6666 1.66699 12.5 1.66699H7.49996C3.33329 1.66699 1.66663 3.33366 1.66663 7.50033V12.5003C1.66663 16.667 3.33329 18.3337 7.49996 18.3337Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.0083 4.98268L10.8333 9.16602L14.175 9.16602" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.8334 9.16602L10.8334 5.82435" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.79286 15.1563L8.9762 10.9812L8.9762 14.3229" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.9762 10.9814L5.63453 10.9814" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M7.5013 18.3337H12.5013C16.668 18.3337 18.3346 16.667 18.3346 12.5003V7.50033C18.3346 3.33366 16.668 1.66699 12.5013 1.66699H7.5013C3.33464 1.66699 1.66797 3.33366 1.66797 7.50033V12.5003C1.66797 16.667 3.33464 18.3337 7.5013 18.3337Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.0013 8.33333V5H11.668" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 11.667V15.0003H8.33333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {config.showDarkModeToggle && (
            <button onClick={onToggleDarkMode} className={`hidden md:flex ${config.headerButtonClass}`} title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19.14 19.14L19.01 19.01M19.01 4.99L19.14 4.86L19.01 4.99ZM4.86 19.14L4.99 19.01L4.86 19.14ZM12 2.08V2V2.08ZM12 22V21.92V22ZM2.08 12H2H2.08ZM22 12H21.92H22ZM4.99 4.99L4.86 4.86L4.99 4.99Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M2.03009 12.42C2.39009 17.57 6.76009 21.76 11.9901 21.99C15.6801 22.15 18.9801 20.43 20.9601 17.72C21.7801 16.61 21.3401 15.87 19.9701 16.12C19.3001 16.24 18.6101 16.29 17.8901 16.26C13.0001 16.06 9.00009 11.97 8.98009 7.13996C8.97009 5.83996 9.24009 4.60996 9.73009 3.48996C10.2701 2.24996 9.62009 1.65996 8.37009 2.18996C4.41009 3.85996 1.70009 7.84996 2.03009 12.42Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}

          {config.showCartButton && onToggleCart && (
            <button onClick={onToggleCart} className={config.cartButtonClass}>
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && config.cartBadgeClass !== '' && (
                <span className={config.cartBadgeClass || "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs"}>
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default PosHeaderUI;

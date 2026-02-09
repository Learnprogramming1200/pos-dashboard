export interface PosHeaderConfig {
    wrapperClass: string;
    innerContainerClass: string;
    logoContainerClass: string;
    logoImageClass: string;
    welcomeTextClass: string;
    dateTimeContainerClass: string;
    dateTimeTextClass: string;
    storeDropdownClass: string;
    storeDropdownListClass: string;
    storeOptionClass: string;
    mobileMenuButtonClass: string;
    showMobileMenuButton: boolean;
    rightSideContainerClass: string;
    searchContainerClass: string;
    searchInputClass: string;
    searchIconClass: string;
    showSearchBar: boolean;
    headerButtonClass: string;
    showDarkModeToggle: boolean;
    showCartButton: boolean;
    cartButtonClass: string;
    cartBadgeClass?: string;
}

export interface PosCategorySidebarConfig {
    wrapperClass: string;
    innerContainerClass: string;
    categoryButtonClass: string;
    categoryButtonActiveClass: string;
    categoryIconClass: string;
    categoryTextClass: string;
    variant: 'vertical' | 'horizontal' | 'mobile';
    showMobileHorizontal: boolean;
    mobileHorizontalWrapperClass: string;
}

export interface PosProductCardConfig {
    /** Card wrapper/container class */
    wrapperClass: string;
    /** Inner padding container class (wraps image area) */
    innerPaddingClass: string;
    /** Image wrapper inside padding (for centering/sizing) */
    imageWrapperClass: string;
    /** Image container class */
    imageContainerClass: string;
    /** Image element class */
    imageClass: string;
    /** Stock badge class */
    stockBadgeClass: string;
    /** Stock badge text class */
    stockBadgeTextClass: string;
    /** Content container class */
    contentContainerClass: string;
    /** Info wrapper class (name + price row) */
    infoWrapperClass: string;
    /** Product name class */
    nameClass: string;
    /** Product price class */
    priceClass: string;
    /** Add button class */
    addButtonClass: string;
    /** Add button icon class */
    addButtonIconClass: string;
    /** Add button text */
    addButtonText: string;
    /** Whether card is clickable */
    isClickable: boolean;
    /** Show quantity controls (-, input, +) */
    showQuantityControls: boolean;
    /** Footer container class (for add button + quantity) */
    footerClass: string;
    /** Quantity controls container class */
    quantityContainerClass: string;
    /** Quantity button class (- and +) */
    quantityButtonClass: string;
    /** Quantity button icon class */
    quantityButtonIconClass: string;
    /** Quantity input class */
    quantityInputClass: string;
    /** Brand text class */
    brandClass?: string;
    /** Container for Price and Add Button row (Enables Split Layout if present) */
    priceRowClass?: string;
}

export interface PosProductGridConfig {
    wrapperClass: string;
    gridClass: string;
    /** Product card config - pixel-perfect per screen */
    card: PosProductCardConfig;
}

export interface PosActionPanelConfig {
    show: boolean;
    wrapperClass: string;
    buttonsContainerClass: string;
    containerClass?: string;
    buttonClass: string;
    buttonIconClass: string;
    buttonTextClass?: string;
}

export interface PosOrderPanelConfig {
    wrapperClass: string;
    innerContainerClass: string;
    headerClass: string;
    headerRightClass: string;
    titleClass: string;
    orderNumberClass: string;
    closeButtonClass: string;
    closeButtonIconClass: string;
    customerSectionClass: string;
    customerLabelClass: string;
    customerRowClass: string;
    customerDropdownClass: string;
    customerDropdownTextClass: string;
    customerDropdownIconClass: string;
    addCustomerButtonClass: string;
    addCustomerIconClass: string;
    // Scrollable Content
    scrollableContentClass: string;
    // Order Details Section
    orderDetailsSectionClass: string;
    orderDetailsCardClass: string;
    orderDetailsHeaderClass: string;
    orderDetailsTitleClass: string;
    orderDetailsHeaderRightClass: string;
    itemsCountClass: string;
    clearAllButtonClass: string;
    // Table
    tableClass: string;
    tableHeaderRowClass: string;
    tableHeaderCellClass: string;
    tableHeaderCellCenterClass: string;
    tableHeaderCellRightClass: string;
    // Order Items
    orderItemClass: string;
    orderItemNameClass: string;
    itemsWrapperClass?: string;
    orderItemQtyContainerClass: string;
    orderItemQtyWrapperClass: string;
    quantityButtonClass: string;
    quantityButtonIconClass: string;
    quantityTextClass: string;
    itemPriceClass: string;
    itemActionCellClass: string;
    removeButtonClass: string;
    removeButtonIconClass: string;
    // Payment Summary Section
    summarySectionClass: string;
    summaryCardClass: string;
    summaryTitleClass: string;
    summaryDividerClass: string;
    summaryContainerClass: string;
    summaryRowClass: string;
    summaryLabelClass: string;
    summaryValueClass: string;
    summaryDiscountValueClass: string;
    totalRowClass: string;
    // Payment Methods Section
    paymentSectionClass: string;
    paymentCardClass: string;
    paymentTitleClass: string;
    paymentDividerClass: string;
    paymentMethodsContainerClass: string;
    paymentMethodsGridClass: string;
    paymentMethodsGridMarginClass: string;
    paymentMethodButtonClass: string;
    paymentMethodActiveClass: string;
    // Actions Section
    actionsSectionClass: string;
    actionsCardClass: string;
    actionButtonsGridClass: string;
    actionButtonClass: string;
    actionButtonIconClass: string;
    payButtonClass: string;
    payButtonIconClass: string;
    printButtonClass: string;
    // Layout Control Flags
    variant: 'default' | 'compact' | 'table';
    showTable: boolean; // true = table layout, false = card layout
    showCustomerInHeader: boolean; // true = customer dropdown in header, false = separate section
    showGrandTotalSeparate: boolean; // true = grand total as separate styled row
    showActionButtons: boolean;
    showPaymentMethods: boolean;
    usePaymentIcons: boolean; // true = show icons with payment methods
    // Empty state
    emptyStateClass: string;
    emptyStateText: string;
    showOrderNumberInHeaderRight?: boolean;
    showAddCustomerInHeader?: boolean;
}

export interface PosLayoutConfig {
    mainContainerClass: string;
    contentAreaClass: string;
    categorySidebarClass?: string;
    productAreaClass: string;
    orderSidebarClass: string;
}

export interface PosMobileConfig {
    overlayClass: string;
    categoryDrawerClass: string;
    categoryDrawerHeaderClass: string;
    orderDrawerClass: string;
    orderDrawerHeaderClass: string;
}

export interface PosBottomActionBarConfig {
    show: boolean;
    wrapperClass: string;
    containerClass: string;
    buttonClass: string;
    buttonIconClass: string;
    buttonTextClass: string;
}

export interface PosCustomerModalConfig {
    overlayClass: string;
    modalClass: string;
    headerClass: string;
    titleClass: string;
    closeButtonClass: string;
    contentClass: string;
    formGroupClass: string;
    labelClass: string;
    inputClass: string;
    footerClass: string;
    cancelButtonClass: string;
    submitButtonClass: string;
}

export interface PosCouponPopupConfig {
    overlayClass: string;
    modalClass: string;
    headerClass: string;
    titleClass: string;
    subtitleClass: string;
    closeButtonClass: string;
    closeButtonIconClass: string;
    contentClass: string;
    // Coupon Input Section
    inputSectionClass: string;
    inputWrapperClass: string;
    inputClass: string;
    applyButtonClass: string;
    applyButtonIconClass: string;
    // Coupon List Section
    listSectionClass: string;
    listTitleClass: string;
    listContainerClass: string;
    couponCardClass: string;
    couponCardActiveClass: string;
    couponCardDisabledClass: string;
    // Coupon Card Inner Elements
    couponCodeClass: string;
    couponDiscountClass: string;
    couponDescriptionClass: string;
    couponExpiryClass: string;
    couponSelectButtonClass: string;
    couponSelectedBadgeClass: string;
    // Applied Coupon Display
    appliedSectionClass: string;
    appliedCardClass: string;
    appliedLabelClass: string;
    appliedCodeClass: string;
    appliedDiscountClass: string;
    removeButtonClass: string;
    removeButtonIconClass: string;
    // Footer
    footerClass: string;
    cancelButtonClass: string;
    confirmButtonClass: string;
    // Empty State
    emptyStateClass: string;
    emptyStateIconClass: string;
    emptyStateTextClass: string;
}

export interface PosGiftCardPopupConfig {
    overlayClass: string;
    modalClass: string;
    headerClass: string;
    titleClass: string;
    subtitleClass: string;
    closeButtonClass: string;
    closeButtonIconClass: string;
    contentClass: string;
    // Input Section
    inputSectionClass: string;
    inputWrapperClass: string;
    inputClass: string;
    searchButtonClass: string;
    searchButtonIconClass: string;
    // List Section
    listSectionClass: string;
    listTitleClass: string;
    listContainerClass: string;
    giftCardCardClass: string;
    giftCardCardActiveClass: string;
    giftCardCardDisabledClass: string;
    // Card Inner Elements
    giftCardCodeClass: string;
    giftCardBalanceClass: string;
    giftCardExpiryClass: string;
    giftCardSelectButtonClass: string;
    giftCardSelectedBadgeClass: string;
    // Applied Display
    appliedSectionClass: string;
    appliedCardClass: string;
    appliedLabelClass: string;
    appliedCodeClass: string;
    appliedBalanceClass: string;
    removeButtonClass: string;
    removeButtonIconClass: string;
    // Footer
    footerClass: string;
    cancelButtonClass: string;
    confirmButtonClass: string;
    // Empty State
    emptyStateClass: string;
    emptyStateIconClass: string;
    emptyStateTextClass: string;
}

export interface PosLoyaltyPopupConfig {
    overlayClass: string;
    modalClass: string;
    headerClass: string;
    titleClass: string;
    subtitleClass: string;
    closeButtonClass: string;
    closeButtonIconClass: string;
    contentClass: string;
    // Header Stats
    statsSectionClass: string;
    pointsBalanceClass: string;
    pointsLabelClass: string;
    // List Section
    listSectionClass: string;
    listTitleClass: string;
    listContainerClass: string;
    loyaltyCardClass: string;
    loyaltyCardActiveClass: string;
    loyaltyCardDisabledClass: string;
    // Card Inner Elements
    loyaltyRuleNameClass: string;
    loyaltyPointsCostClass: string;
    loyaltyMinAmountClass: string;
    loyaltySelectButtonClass: string;
    loyaltySelectedBadgeClass: string;
    // Applied Display
    appliedSectionClass: string;
    appliedCardClass: string;
    appliedLabelClass: string;
    appliedRuleNameClass: string;
    appliedPointsCostClass: string;
    removeButtonClass: string;
    removeButtonIconClass: string;
    // Footer
    footerClass: string;
    cancelButtonClass: string;
    confirmButtonClass: string;
    // Empty State
    emptyStateClass: string;
    emptyStateIconClass: string;
    emptyStateTextClass: string;
}

export interface PosCashPopupConfig {
    overlayClass: string;
    modalClass: string;
    headerClass: string;
    titleClass: string;
    closeButtonClass: string;
    closeButtonIconClass: string;
    contentClass: string;
    rowClass: string;
    labelClass: string;
    inputWrapperClass: string;
    inputClass: string;
    readOnlyInputClass: string;
    currencySymbolClass: string;
    footerClass: string;
    cancelButtonClass: string;
    confirmButtonClass: string;
}

export interface PosScreenUIConfig {
    screenId: string;
    header: PosHeaderConfig;
    categorySidebar: PosCategorySidebarConfig;
    productGrid: PosProductGridConfig;
    actionPanel: PosActionPanelConfig;
    orderPanel: PosOrderPanelConfig;
    customerModal: PosCustomerModalConfig;
    couponPopup: PosCouponPopupConfig;
    giftCardPopup: PosGiftCardPopupConfig;
    loyaltyPopup: PosLoyaltyPopupConfig;
    cashPopup: PosCashPopupConfig;
    layout: PosLayoutConfig;
    mobile: PosMobileConfig;
    bottomActionBar: PosBottomActionBarConfig;
}



// POS-2 Configuration (Right sidebar, horizontal categories)
const POS_2_CONFIG: PosScreenUIConfig = {
    screenId: 'POS_2',
    header: {
        wrapperClass: 'relative z-30 flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700',
        innerContainerClass: 'flex items-center justify-between gap-2 sm:gap-4',
        logoContainerClass: 'flex-shrink-0 w-16 sm:w-20 lg:w-24',
        logoImageClass: 'h-8 sm:h-10 w-full object-contain',
        welcomeTextClass: 'hidden sm:block text-sm font-semibold text-gray-800 dark:text-gray-200',
        dateTimeContainerClass: 'hidden sm:block bg-slate-700 dark:bg-slate-600 px-2 py-[6px] rounded-md',
        dateTimeTextClass: 'text-white font-semibold',
        storeDropdownClass: 'relative pl-4 pr-10 py-2 bg-white dark:bg-gray-800 rounded-full border border-blue-200 dark:border-blue-900 text-sm font-bold text-blue-700 dark:text-blue-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center',
        storeDropdownListClass: 'absolute top-full mt-2 left-0 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-200',
        storeOptionClass: 'w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2 mb-1 last:mb-0',
        mobileMenuButtonClass: 'lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700',
        showMobileMenuButton: true,
        rightSideContainerClass: 'flex items-center gap-2',
        searchContainerClass: 'hidden md:block',
        searchInputClass: 'pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm w-48 lg:w-64',
        searchIconClass: 'absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500',
        showSearchBar: true,
        headerButtonClass: 'p-2 rounded-md bg-slate-700 text-white dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500',
        showDarkModeToggle: true,
        showCartButton: true,
        cartButtonClass: 'lg:hidden p-2 rounded-md bg-slate-700 text-white hover:bg-slate-800 relative',
        cartBadgeClass: 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold',
    },
    categorySidebar: {
        wrapperClass: '',
        innerContainerClass: 'flex space-x-2 overflow-x-auto pb-2',
        categoryButtonClass: 'flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-colors bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
        categoryButtonActiveClass: '!bg-slate-700 !text-white !border-slate-700',
        categoryIconClass: 'w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0',
        categoryTextClass: 'font-medium',
        variant: 'horizontal',
        showMobileHorizontal: true,
        mobileHorizontalWrapperClass: 'mb-3 sm:mb-6',
    },
    productGrid: {
        wrapperClass: '',
        gridClass: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4',
        card: {
            wrapperClass: 'h-full flex flex-col overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md',
            innerPaddingClass: 'relative p-1.5 sm:p-2',
            imageWrapperClass: 'flex items-center justify-center overflow-hidden aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl',
            imageContainerClass: '',
            imageClass: 'w-full h-full object-contain p-2',
            stockBadgeClass: 'absolute top-2 right-2 sm:top-3 sm:right-3 bg-white dark:bg-gray-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-600',
            stockBadgeTextClass: 'text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300',
            contentContainerClass: 'flex flex-col flex-1 px-1.5 pb-3 sm:px-2 sm:pb-5 pt-1',
            infoWrapperClass: 'flex flex-col w-full mb-1',
            brandClass: 'mb-0.5 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide',
            nameClass: 'font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm leading-tight line-clamp-2',
            priceRowClass: 'flex items-end justify-between w-full mt-auto',
            priceClass: 'text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 leading-none',
            addButtonClass: 'flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-all hover:scale-105',
            addButtonIconClass: 'w-4 h-4 sm:w-5 sm:h-5 text-white',
            addButtonText: '',
            isClickable: false,
            showQuantityControls: false,
            footerClass: '',
            quantityContainerClass: '',
            quantityButtonClass: '',
            quantityButtonIconClass: '',
            quantityInputClass: '',
        },
    },
    actionPanel: {
        show: false,
        wrapperClass: '',
        buttonsContainerClass: '',
        buttonClass: '',
        buttonIconClass: '',
    },
    orderPanel: {
        wrapperClass: 'flex flex-col h-full',
        innerContainerClass: 'flex flex-col h-full p-2 sm:p-4 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        headerClass: 'flex items-center justify-between mb-2 sm:mb-4',
        headerRightClass: '',
        titleClass: 'text-lg font-semibold text-blue-600 dark:text-blue-400',
        orderNumberClass: 'text-sm text-purple-600 dark:text-purple-400',
        closeButtonClass: '',
        closeButtonIconClass: '',
        // Customer Section
        customerSectionClass: '',
        customerLabelClass: '',
        customerRowClass: '',
        customerDropdownClass: 'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
        customerDropdownTextClass: '',
        customerDropdownIconClass: '',
        addCustomerButtonClass: 'bg-slate-700 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors',
        addCustomerIconClass: '',
        // Scrollable Content
        scrollableContentClass: 'pb-4',
        // Order Details Section
        orderDetailsSectionClass: '',
        orderDetailsCardClass: 'bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6',
        orderDetailsHeaderClass: 'flex items-center justify-between p-3 border-b border-gray-100',
        orderDetailsTitleClass: 'font-semibold text-gray-900',
        orderDetailsHeaderRightClass: 'flex items-center gap-2',
        itemsCountClass: 'bg-[#334155] text-white px-3 py-1 rounded-md text-xs font-semibold',
        clearAllButtonClass: 'text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors',
        // Table
        tableClass: 'w-full',
        tableHeaderRowClass: 'bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600',
        tableHeaderCellClass: 'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        tableHeaderCellCenterClass: 'px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        tableHeaderCellRightClass: 'px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        // Order Items
        orderItemClass: 'border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors',
        orderItemNameClass: 'px-4 py-3 font-medium text-gray-900 text-sm',
        itemsWrapperClass: '',
        orderItemQtyContainerClass: 'px-4 py-3',
        orderItemQtyWrapperClass: 'flex items-center justify-center gap-2',
        quantityButtonClass: 'w-7 h-7 bg-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors',
        quantityButtonIconClass: 'w-3.5 h-3.5',
        quantityTextClass: 'w-8 text-center text-sm font-bold text-blue-600',
        itemPriceClass: 'px-4 py-3 font-bold text-gray-900 text-right',
        itemActionCellClass: 'px-4 py-3 text-center',
        removeButtonClass: 'text-red-500 hover:text-red-700 transition-colors',
        removeButtonIconClass: 'w-4 h-4',
        // Payment Summary Section
        summarySectionClass: '',
        summaryCardClass: '',
        summaryTitleClass: '',
        summaryDividerClass: '',
        summaryContainerClass: 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600',
        summaryRowClass: 'flex justify-between text-gray-700 dark:text-gray-300',
        summaryLabelClass: '',
        summaryValueClass: 'font-medium',
        summaryDiscountValueClass: '',
        totalRowClass: 'border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100',
        // Payment Methods Section
        paymentSectionClass: '',
        paymentCardClass: '',
        paymentTitleClass: '',
        paymentDividerClass: '',
        paymentMethodsContainerClass: '',
        paymentMethodsGridClass: 'grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-4',
        paymentMethodsGridMarginClass: '',
        paymentMethodButtonClass: 'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700',
        paymentMethodActiveClass: 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30',
        // Actions Section
        actionsSectionClass: '',
        actionsCardClass: '',
        actionButtonsGridClass: 'grid grid-cols-2 gap-2',
        actionButtonClass: 'flex flex-col items-center p-3 text-white rounded-lg transition-colors',
        actionButtonIconClass: '',
        payButtonClass: 'w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 dark:hover:bg-teal-600 transition-colors shadow-md',
        payButtonIconClass: '',
        printButtonClass: 'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors bg-white',
        // Layout Control Flags
        variant: 'default',
        showTable: true, // Use table layout
        showCustomerInHeader: false, // Customer dropdown separate
        showGrandTotalSeparate: false, // Grand total inside summary
        showActionButtons: true,
        showPaymentMethods: true,
        usePaymentIcons: true,
        // Empty state
        emptyStateClass: 'text-center text-gray-500 dark:text-gray-400 py-8 text-sm',
        emptyStateText: 'No items in cart',
    },
    customerModal: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200',
        headerClass: 'px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between',
        titleClass: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
        closeButtonClass: 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
        contentClass: 'p-6 space-y-4',
        formGroupClass: 'space-y-1.5',
        labelClass: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
        inputClass: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
        footerClass: 'px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
        submitButtonClass: 'px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors',
    },
    couponPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-gray-700',
        headerClass: 'px-6 py-5 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900',
        titleClass: 'text-xl font-bold text-white',
        subtitleClass: 'text-sm text-slate-300 mt-1',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[60vh] overflow-y-auto',
        // Coupon Input Section
        inputSectionClass: 'mb-6',
        inputWrapperClass: 'flex gap-3',
        inputClass: 'flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all text-sm font-medium uppercase tracking-wider',
        applyButtonClass: 'px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2',
        applyButtonIconClass: 'w-5 h-5',
        // Coupon List Section
        listSectionClass: 'mt-4',
        listTitleClass: 'text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3',
        listContainerClass: 'space-y-3',
        couponCardClass: 'relative p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer bg-white dark:bg-gray-800 group hover:shadow-md',
        couponCardActiveClass: '!border-slate-600 !bg-slate-50 dark:!bg-slate-900/50 ring-2 ring-slate-500/20',
        couponCardDisabledClass: 'opacity-50 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-none',
        // Coupon Card Inner Elements
        couponCodeClass: 'text-lg font-bold text-slate-700 dark:text-slate-300 tracking-wider',
        couponDiscountClass: 'inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold ml-3',
        couponDescriptionClass: 'text-sm text-gray-600 dark:text-gray-400 mt-2',
        couponExpiryClass: 'text-xs text-gray-400 dark:text-gray-500 mt-2',
        couponSelectButtonClass: 'absolute top-4 right-4 px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all',
        couponSelectedBadgeClass: 'absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white',
        // Applied Coupon Display
        appliedSectionClass: 'mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-sm font-medium text-green-600 dark:text-green-400',
        appliedCodeClass: 'text-lg font-bold text-green-700 dark:text-green-300 tracking-wider',
        appliedDiscountClass: 'text-sm text-green-600 dark:text-green-400',
        removeButtonClass: 'p-2 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg text-green-600 dark:text-green-400 transition-colors',
        removeButtonIconClass: 'w-5 h-5',
        // Footer
        footerClass: 'px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors',
        confirmButtonClass: 'px-6 py-2.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all',
        // Empty State
        emptyStateClass: 'py-12 text-center',
        emptyStateIconClass: 'w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600',
        emptyStateTextClass: 'text-gray-500 dark:text-gray-400 text-sm',
    },
    giftCardPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200',
        headerClass: 'px-6 py-5 bg-slate-800',
        titleClass: 'text-xl font-bold text-white',
        subtitleClass: 'text-sm text-slate-300 mt-1',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[60vh] overflow-y-auto',
        inputSectionClass: 'mb-6',
        inputWrapperClass: 'flex gap-3',
        inputClass: 'flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all text-sm font-medium',
        searchButtonClass: 'px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2',
        searchButtonIconClass: 'w-5 h-5',
        listSectionClass: 'mt-4',
        listTitleClass: 'text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3',
        listContainerClass: 'space-y-3',
        giftCardCardClass: 'relative p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer bg-white dark:bg-gray-800 group hover:shadow-md',
        giftCardCardActiveClass: '!border-slate-600 !bg-slate-50 dark:!bg-slate-900/50 ring-2 ring-slate-500/20',
        giftCardCardDisabledClass: 'opacity-50 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-none',
        giftCardCodeClass: 'text-lg font-bold text-slate-700 dark:text-slate-300 tracking-wider',
        giftCardBalanceClass: 'inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold ml-3',
        giftCardExpiryClass: 'text-xs text-gray-400 dark:text-gray-500 mt-2',
        giftCardSelectButtonClass: 'absolute top-4 right-4 px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all',
        giftCardSelectedBadgeClass: 'absolute top-4 right-4 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white',
        appliedSectionClass: 'mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-sm font-medium text-slate-600 dark:text-slate-400',
        appliedCodeClass: 'text-lg font-bold text-slate-700 dark:text-slate-200 tracking-wider',
        appliedBalanceClass: 'text-sm text-slate-600 dark:text-slate-400',
        removeButtonClass: 'p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors',
        removeButtonIconClass: 'w-5 h-5',
        footerClass: 'px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors',
        confirmButtonClass: 'px-6 py-2.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all',
        emptyStateClass: 'py-12 text-center',
        emptyStateIconClass: 'w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600',
        emptyStateTextClass: 'text-gray-500 dark:text-gray-400 text-sm',
    },
    loyaltyPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200',
        headerClass: 'px-6 py-5 bg-indigo-600',
        titleClass: 'text-xl font-bold text-white',
        subtitleClass: 'text-sm text-indigo-100 mt-1',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[60vh] overflow-y-auto',
        statsSectionClass: 'mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between',
        pointsBalanceClass: 'text-2xl font-bold text-indigo-600 dark:text-indigo-400',
        pointsLabelClass: 'text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider',
        listSectionClass: 'mt-0',
        listTitleClass: 'text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3',
        listContainerClass: 'space-y-3',
        loyaltyCardClass: 'relative p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer bg-white dark:bg-gray-800 group hover:shadow-md',
        loyaltyCardActiveClass: '!border-indigo-500 !bg-indigo-50 dark:!bg-indigo-900/30 ring-2 ring-indigo-500/20',
        loyaltyCardDisabledClass: 'opacity-50 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-none',
        loyaltyRuleNameClass: 'text-lg font-bold text-gray-800 dark:text-gray-200',
        loyaltyPointsCostClass: 'inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-bold mt-2',
        loyaltyMinAmountClass: 'text-xs text-gray-500 dark:text-gray-400 mt-2 block',
        loyaltySelectButtonClass: 'absolute top-4 right-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all',
        loyaltySelectedBadgeClass: 'absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white',
        appliedSectionClass: 'mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-sm font-medium text-indigo-600 dark:text-indigo-400',
        appliedRuleNameClass: 'text-lg font-bold text-indigo-700 dark:text-indigo-300',
        appliedPointsCostClass: 'text-sm text-indigo-600 dark:text-indigo-400',
        removeButtonClass: 'p-2 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors',
        removeButtonIconClass: 'w-5 h-5',
        footerClass: 'px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors',
        confirmButtonClass: 'px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all',
        emptyStateClass: 'py-12 text-center',
        emptyStateIconClass: 'w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600',
        emptyStateTextClass: 'text-gray-500 dark:text-gray-400 text-sm',
    },
    cashPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200',
        headerClass: 'px-6 py-4 bg-slate-700 border-b border-slate-600',
        titleClass: 'text-xl font-bold text-white',
        closeButtonClass: 'absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 space-y-5',
        rowClass: 'space-y-2',
        labelClass: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
        inputWrapperClass: 'relative',
        inputClass: 'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent font-semibold text-lg',
        readOnlyInputClass: 'w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-right font-semibold text-lg cursor-not-allowed',
        currencySymbolClass: 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium',
        footerClass: 'px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600',
        confirmButtonClass: 'px-6 py-2.5 text-sm font-semibold text-white bg-slate-700 hover:bg-orange-600 rounded-lg shadow-md hover:shadow-lg transition-all',
    },
    layout: {
        mainContainerClass: 'relative flex flex-col h-screen overflow-hidden',
        contentAreaClass: 'flex flex-col lg:flex-row flex-1 overflow-hidden',
        productAreaClass: 'flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        orderSidebarClass: 'hidden lg:flex flex-col relative flex-shrink-0 w-full lg:w-[420px] xl:w-[480px] 2xl:w-[490px] h-full bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700',
    },
    mobile: {
        overlayClass: 'lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50',
        categoryDrawerClass: 'fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform',
        categoryDrawerHeaderClass: 'flex items-center justify-between mb-4',
        orderDrawerClass: 'fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform shadow-2xl z-[60] flex flex-col',
        orderDrawerHeaderClass: 'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700',
    },
    bottomActionBar: {
        show: true,
        wrapperClass: 'bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-1 sm:p-2 md:p-3 lg:p-4 xl:p-5',
        containerClass: 'flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4',
        buttonClass: 'flex items-center space-x-1 sm:space-x-2 md:space-x-3 text-white px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg whitespace-nowrap',
        buttonIconClass: 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5',
        buttonTextClass: 'text-[10px] sm:text-xs md:text-sm lg:text-base',
    },
};

// POS-1 Configuration
const POS_1_CONFIG: PosScreenUIConfig = {
    screenId: 'POS_1',
    header: {
        wrapperClass: 'bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 h-20 flex items-center',
        innerContainerClass: 'w-full flex items-center justify-between px-2 sm:px-4 gap-4',
        logoContainerClass: 'flex-shrink-0 w-24 lg:w-[112px]',
        logoImageClass: 'h-12 sm:h-14 w-full object-contain',
        welcomeTextClass: 'hidden sm:block text-base sm:text-lg font-semibold text-gray-800 dark:text-white',
        dateTimeContainerClass: 'hidden sm:block',
        dateTimeTextClass: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400',
        storeDropdownClass: 'relative pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer flex items-center',
        storeDropdownListClass: 'absolute top-full mt-1 left-0 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 border-slate-100 dark:border-slate-700 py-1 z-50',
        storeOptionClass: 'w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors border-l-4 border-transparent hover:border-slate-400',
        mobileMenuButtonClass: 'lg:hidden p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 touch-manipulation',
        showMobileMenuButton: true,
        rightSideContainerClass: 'flex items-center space-x-2 sm:space-x-3 justify-end',
        searchContainerClass: 'hidden md:block flex-1 max-w-xs lg:max-w-sm',
        searchInputClass: 'w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white',
        searchIconClass: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400',
        showSearchBar: true,
        headerButtonClass: 'p-2 sm:p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 touch-manipulation flex-shrink-0',
        showDarkModeToggle: true,
        showCartButton: true,
        cartButtonClass: 'lg:hidden p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 relative flex-shrink-0',
        cartBadgeClass: 'absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900',
    },
    categorySidebar: {
        wrapperClass: 'hidden lg:block bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-y-auto flex-shrink-0 scrollbar-hide w-[120px]',
        innerContainerClass: 'flex flex-col items-center gap-3 p-3 w-full',
        categoryButtonClass: 'relative w-full aspect-square min-h-[auto] rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-500/30 hover:-translate-y-0.5 flex flex-col items-center justify-center p-2 group',
        categoryButtonActiveClass: '!bg-blue-600 !border-blue-600 !text-white shadow-lg shadow-blue-900/20 ring-2 ring-blue-500/20 ring-offset-2 dark:ring-offset-slate-900',
        categoryIconClass: 'w-7 h-7 flex-shrink-0 mb-1',
        categoryTextClass: 'text-[11px] font-semibold text-center leading-tight transition-colors text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400',
        variant: 'vertical',
        showMobileHorizontal: true,
        mobileHorizontalWrapperClass: 'lg:hidden mb-4',
    },
    productGrid: {
        wrapperClass: '',
        gridClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6',
        card: {
            wrapperClass: 'relative overflow-hidden bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow flex flex-col',
            innerPaddingClass: 'p-2 sm:p-3 md:p-4 flex flex-col flex-1',
            imageWrapperClass: 'aspect-square rounded-md border border-slate-300 dark:border-slate-600 mb-2 sm:mb-3 flex items-center justify-center overflow-hidden flex-shrink-0 bg-white dark:bg-white',
            imageContainerClass: '',
            imageClass: 'w-full h-full object-contain',
            stockBadgeClass: 'absolute top-2 right-2 z-10 px-2 py-1.5 rounded-lg bg-black/75 backdrop-blur-sm border border-white/20 shadow-sm flex items-center justify-center min-w-[24px]',
            stockBadgeTextClass: 'text-[10px] font-bold text-white tracking-wide leading-none',
            contentContainerClass: 'flex flex-col flex-1 px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4',
            infoWrapperClass: 'flex flex-col items-start mb-1 flex-shrink-0 w-full gap-0.5',
            nameClass: 'font-semibold text-gray-800 dark:text-white mb-1 sm:mb-2 text-xs sm:text-sm md:text-base line-clamp-2',
            brandClass: 'text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate w-full',
            priceRowClass: 'flex items-center justify-between mt-auto pt-2 flex-shrink-0',
            priceClass: 'text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white',
            addButtonClass: 'w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gray-100 dark:bg-slate-700 rounded-[5px] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 touch-manipulation flex-shrink-0 ml-2 transition-colors',
            addButtonIconClass: 'w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 text-gray-800 dark:text-white',
            addButtonText: '',
            isClickable: true,
            showQuantityControls: false,
            footerClass: '',
            quantityContainerClass: '',
            quantityButtonClass: '',
            quantityButtonIconClass: '',
            quantityInputClass: '',
        },
    },
    actionPanel: {
        show: false,
        wrapperClass: '',
        buttonsContainerClass: '',
        buttonClass: '',
        buttonIconClass: '',
    },
    orderPanel: {
        wrapperClass: 'flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 relative',
        innerContainerClass: 'h-full flex flex-col overflow-y-auto pb-28 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        headerClass: 'sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between shadow-sm mb-2',
        headerRightClass: 'flex items-center space-x-2',
        titleClass: 'text-xl font-bold text-slate-800 dark:text-white tracking-tight',
        orderNumberClass: 'text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg',
        closeButtonClass: '',
        closeButtonIconClass: '',
        customerSectionClass: 'px-5 mb-5',
        customerLabelClass: 'text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1',
        customerRowClass: 'flex items-center gap-3',
        customerDropdownClass: 'flex-1 bg-white dark:bg-slate-800 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-colors',
        customerDropdownTextClass: '',
        customerDropdownIconClass: 'text-slate-400 transition-colors',
        addCustomerButtonClass: 'w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-900/20 flex-shrink-0',
        addCustomerIconClass: 'w-5 h-5',
        scrollableContentClass: 'flex-1 px-5 space-y-5',
        orderDetailsSectionClass: '',
        orderDetailsCardClass: 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden',
        orderDetailsHeaderClass: 'flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700',
        orderDetailsTitleClass: 'font-bold text-slate-700 dark:text-slate-200',
        orderDetailsHeaderRightClass: 'flex items-center space-x-3',
        itemsCountClass: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-full',
        clearAllButtonClass: 'text-rose-500 dark:text-rose-400 text-xs hover:text-rose-700 dark:hover:text-rose-300 font-bold uppercase tracking-wide hover:underline',
        tableClass: 'w-full',
        tableHeaderRowClass: 'grid grid-cols-12 gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 py-2 px-4 bg-slate-50 dark:bg-slate-800/50 uppercase tracking-wider',
        tableHeaderCellClass: 'col-span-5 pl-2',
        tableHeaderCellCenterClass: 'col-span-3 text-center',
        tableHeaderCellRightClass: 'col-span-4 text-right pr-2',
        orderItemClass: 'bg-white dark:bg-slate-800 p-3 flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-2',
        orderItemNameClass: 'text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight flex-1',
        itemsWrapperClass: 'max-h-[35vh] overflow-y-auto custom-scrollbar',
        orderItemQtyContainerClass: '',
        orderItemQtyWrapperClass: 'flex items-center space-x-3 bg-slate-100 dark:bg-slate-700 rounded-lg p-1',
        quantityButtonClass: 'w-6 h-6 bg-white dark:bg-slate-600 rounded flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300 shadow-sm transition-all',
        quantityButtonIconClass: 'w-3 h-3',
        quantityTextClass: 'w-6 text-center text-sm font-bold text-slate-700 dark:text-slate-200',
        itemPriceClass: 'font-bold text-slate-700 dark:text-slate-200 text-right min-w-[60px]',
        itemActionCellClass: '',
        removeButtonClass: 'p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all',
        removeButtonIconClass: 'w-4 h-4',
        summarySectionClass: '',
        summaryCardClass: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm space-y-3',
        summaryTitleClass: 'text-lg font-bold text-slate-800 dark:text-white mb-4',
        summaryDividerClass: 'border-t border-slate-100 dark:border-slate-700 my-3',
        summaryContainerClass: 'mb-5',
        summaryRowClass: 'flex items-center justify-between text-sm',
        summaryLabelClass: 'text-slate-500 dark:text-slate-400 font-medium',
        summaryValueClass: 'text-slate-800 dark:text-slate-200 font-bold',
        summaryDiscountValueClass: 'text-emerald-500 dark:text-emerald-400 font-bold',
        totalRowClass: 'flex items-center justify-between pt-2 mt-2 border-t border-dashed border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-black text-lg',
        paymentSectionClass: '',
        paymentCardClass: 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4',
        paymentTitleClass: 'text-lg font-bold text-slate-800 dark:text-white mb-4',
        paymentDividerClass: 'border-t border-slate-100 dark:border-slate-700 my-3',
        paymentMethodsContainerClass: 'grid grid-cols-3 gap-2',
        paymentMethodsGridClass: 'grid grid-cols-3 gap-3',
        paymentMethodsGridMarginClass: '',
        paymentMethodButtonClass: 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent p-3 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 group h-[80px]',
        paymentMethodActiveClass: '!bg-blue-600 !border-blue-600 !text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20',
        actionsSectionClass: 'absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]',
        actionsCardClass: '',
        actionButtonsGridClass: 'grid grid-cols-2 gap-4',
        actionButtonClass: 'flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-3.5 rounded-xl flex items-center justify-center font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-[0.98]',
        actionButtonIconClass: 'w-5 h-5 mr-2',
        payButtonClass: 'flex-1 bg-blue-600 text-white px-4 py-3.5 rounded-xl flex items-center justify-center font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] active:shadow-none',
        payButtonIconClass: 'w-5 h-5 mr-2',
        printButtonClass: 'flex-1 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-3.5 rounded-xl flex items-center justify-center font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-[0.98]',
        variant: 'default',
        showTable: false,
        showCustomerInHeader: false,
        showAddCustomerInHeader: false,
        showGrandTotalSeparate: false,
        showActionButtons: true,
        showPaymentMethods: true,
        usePaymentIcons: true,
        emptyStateClass: 'text-center text-slate-400 dark:text-slate-500 py-12 text-sm flex flex-col items-center justify-center gap-3',
        emptyStateText: 'No items in order',
    },
    customerModal: POS_2_CONFIG.customerModal,
    couponPopup: POS_2_CONFIG.couponPopup,
    giftCardPopup: POS_2_CONFIG.giftCardPopup,
    loyaltyPopup: POS_2_CONFIG.loyaltyPopup,
    cashPopup: POS_2_CONFIG.cashPopup,
    layout: {
        mainContainerClass: 'h-full w-full bg-gray-50 flex flex-col overflow-hidden',
        contentAreaClass: 'flex-1 flex overflow-hidden',
        productAreaClass: 'bg-[#f9fafb] dark:bg-slate-900 flex-1 overflow-y-auto p-2 sm:p-4 lg:p-4 min-w-0',
        orderSidebarClass: 'hidden lg:block w-[450px] min-w-[450px] max-w-[450px] border-l flex-shrink-0 bg-[#e6eaed] dark:bg-slate-900',
    },
    mobile: {
        overlayClass: POS_2_CONFIG.mobile.overlayClass,
        categoryDrawerClass: 'fixed left-0 top-0 h-full w-72 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform z-[60]',
        categoryDrawerHeaderClass: 'flex items-center justify-between p-4',
        orderDrawerClass: 'fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 transform transition-transform shadow-2xl z-[60] flex flex-col',
        orderDrawerHeaderClass: 'flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700',
    },
    bottomActionBar: POS_2_CONFIG.bottomActionBar,
};

// POS-3 Configuration
const POS_3_CONFIG: PosScreenUIConfig = {
    screenId: 'POS_3',
    header: {
        wrapperClass: 'p-4 flex items-center flex-shrink-0 bg-white dark:bg-gray-800 border-b shadow-sm',
        innerContainerClass: 'w-full flex items-center justify-between gap-1 sm:gap-2 md:gap-3 lg:gap-4',
        logoContainerClass: 'w-16 sm:w-20 md:w-24 flex-shrink-0',
        logoImageClass: 'w-full h-10 object-contain',
        welcomeTextClass: 'hidden sm:flex flex-col text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-200',
        dateTimeContainerClass: 'bg-primary dark:bg-gray-600 px-2 py-[6px] rounded-md',
        dateTimeTextClass: 'text-white font-semibold',
        storeDropdownClass: 'relative pl-3 pr-10 py-2 bg-blue-50/50 dark:bg-gray-700 border border-blue-200 dark:border-blue-800/50 rounded-md text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 transition-colors cursor-pointer flex items-center',
        storeDropdownListClass: 'absolute top-full mt-1 left-0 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-blue-100 dark:border-blue-900 z-50',
        storeOptionClass: 'w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0',
        mobileMenuButtonClass: 'lg:hidden p-1.5 sm:p-2 rounded-lg touch-manipulation hover:bg-gray-100',
        showMobileMenuButton: false,
        rightSideContainerClass: 'flex items-center justify-end space-x-1 sm:space-x-1 md:space-x-2',
        searchContainerClass: 'hidden sm:block flex-1 max-w-[200px] md:max-w-xs lg:max-w-sm',
        searchInputClass: 'w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        searchIconClass: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5',
        showSearchBar: true,
        headerButtonClass: 'p-1 sm:p-1.5 md:p-2 rounded-md flex-shrink-0 bg-[#F5F6FA] text-textSmall dark:text-gray-200 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-gray-600',
        showDarkModeToggle: true,
        showCartButton: true,
        cartButtonClass: 'lg:hidden p-2 rounded-md bg-[#F5F6FA] text-textSmall dark:text-gray-200 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-gray-600 relative',
        cartBadgeClass: 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold',
    },
    categorySidebar: {
        wrapperClass: '',
        innerContainerClass: 'flex space-x-2 overflow-x-auto pb-2',
        categoryButtonClass: 'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
        categoryButtonActiveClass: '!bg-primary !text-white !border-primary',
        categoryIconClass: 'w-4 h-4 flex-shrink-0',
        categoryTextClass: 'font-medium',
        variant: 'horizontal',
        showMobileHorizontal: true,
        mobileHorizontalWrapperClass: 'mb-6',
    },
    productGrid: {
        wrapperClass: 'h-full flex flex-col',
        gridClass: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-4 2xl:gap-4',
        card: {
            wrapperClass: 'h-full flex flex-col overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow',
            innerPaddingClass: '',
            imageWrapperClass: 'relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden',
            imageContainerClass: '',
            imageClass: 'object-cover w-full h-full hover:scale-105 transition-transform duration-500',
            stockBadgeClass: 'absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#E6F2FF] border border-[#0066FF] z-10 shadow-sm',
            stockBadgeTextClass: 'text-[#0066FF] text-[10px] sm:text-[11px] font-semibold leading-none',
            contentContainerClass: 'p-3 flex-1 flex flex-col',
            infoWrapperClass: 'flex items-center justify-between mb-3',
            nameClass: 'flex-1 pr-2 text-sm font-medium text-gray-800 dark:text-gray-200',
            priceClass: 'flex-shrink-0 text-base sm:text-lg font-bold text-[#0066FF] dark:text-blue-400',
            addButtonClass: 'py-2 sm:py-2 md:py-2.5 lg:py-2 xl:py-2 2xl:py-2 px-3 sm:px-3 md:px-4 lg:px-4 xl:px-4 2xl:px-4 rounded-lg flex-shrink-0 bg-blue-600 text-white text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-medium transition-colors hover:bg-blue-700 touch-manipulation',
            addButtonIconClass: '',
            addButtonText: 'Add',
            isClickable: false,
            showQuantityControls: true,
            footerClass: 'flex items-center justify-between gap-3 px-3 pb-3 mt-auto',
            quantityContainerClass: 'flex items-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800',
            quantityButtonClass: 'p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors',
            quantityButtonIconClass: 'w-4 h-4',
            quantityInputClass: 'w-8 text-center text-sm font-medium text-gray-700 dark:text-gray-200',
        },
    },
    actionPanel: {
        show: true,
        wrapperClass: 'hidden xl:block w-48 2xl:w-56 p-2 md:p-3 lg:p-3 xl:p-4 2xl:p-4 bg-gray-50 dark:bg-gray-800',
        buttonsContainerClass: 'flex flex-col gap-1.5 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-2',
        buttonClass: 'flex flex-col items-center justify-center gap-0.5 sm:gap-1 md:gap-1 lg:gap-1.5 xl:gap-1.5 2xl:gap-1.5 py-3 sm:py-3 md:py-3 lg:py-3.5 xl:py-4 2xl:py-4 px-4 sm:px-4 md:px-5 lg:px-5 xl:px-6 2xl:px-8 rounded-md text-white font-semibold text-[10px] sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm transition-colors',
        buttonIconClass: 'w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5',
    },
    orderPanel: {
        wrapperClass: 'flex flex-col h-full bg-white dark:bg-gray-800',
        innerContainerClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 h-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        headerClass: 'flex items-center justify-between mb-0 sm:mb-0.5 md:mb-0.5 lg:mb-1 xl:mb-1 2xl:mb-0',
        headerRightClass: 'flex items-center gap-2',
        titleClass: 'text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-blue-600',
        orderNumberClass: 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-medium text-blue-600',
        closeButtonClass: 'lg:hidden p-1 rounded-md hover:bg-gray-100',
        closeButtonIconClass: 'w-4 h-4 text-gray-600',
        // Customer Section
        customerSectionClass: 'mb-3 p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-white dark:bg-gray-800 border border-[#F2F2F2] dark:border-gray-700 rounded-md',
        customerLabelClass: 'block mb-1 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-2 text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-medium text-blue-600 dark:text-blue-400',
        customerRowClass: 'flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-2',
        customerDropdownClass: 'flex items-center justify-between flex-1 px-2 sm:px-2.5 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-1.5 sm:py-1.5 md:py-2 lg:py-2 xl:py-2 2xl:py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-[4px]',
        customerDropdownTextClass: 'text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm text-gray-700 dark:text-gray-200',
        customerDropdownIconClass: 'w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-4 2xl:h-4 text-gray-400',
        addCustomerButtonClass: 'p-1.5 sm:p-1.5 md:p-2 lg:p-2 xl:p-2 2xl:p-2 rounded-md flex-shrink-0 bg-primary text-white transition-colors hover:bg-primaryHover',
        addCustomerIconClass: 'w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5',
        // Scrollable Content
        scrollableContentClass: 'pb-2',
        // Order Details Section
        orderDetailsSectionClass: 'mb-3',
        orderDetailsCardClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-white dark:bg-gray-800 border border-[#F2F2F2] dark:border-gray-700 rounded-md',
        orderDetailsHeaderClass: 'flex items-center justify-between p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3',
        orderDetailsTitleClass: 'text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-blue-600 dark:text-blue-400',
        orderDetailsHeaderRightClass: 'flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-2',
        itemsCountClass: 'px-1.5 sm:px-1.5 md:px-2 lg:px-2 xl:px-2 2xl:px-2 py-0.5 sm:py-0.5 md:py-1 lg:py-1 xl:py-1 2xl:py-1 rounded-md bg-[#E6F2FF] text-gray-700 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-semibold',
        clearAllButtonClass: 'text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-medium text-[#F4462C] hover:text-red-600',
        // Table
        tableClass: 'w-full',
        tableHeaderRowClass: 'bg-[#F2F2F2] dark:bg-gray-700',
        tableHeaderCellClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-1.5 sm:py-1.5 md:py-2 lg:py-2 xl:py-2 2xl:py-2 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-medium text-left text-gray-600 dark:text-gray-300',
        tableHeaderCellCenterClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-1.5 sm:py-1.5 md:py-2 lg:py-2 xl:py-2 2xl:py-2 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-medium text-center text-gray-600 dark:text-gray-300',
        tableHeaderCellRightClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-1.5 sm:py-1.5 md:py-2 lg:py-2 xl:py-2 2xl:py-2 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-medium text-right text-gray-600 dark:text-gray-300',
        // Order Items
        orderItemClass: 'border-t border-gray-200 dark:border-gray-700',
        orderItemNameClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 2xl:py-3 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-medium text-gray-800 dark:text-gray-200',
        orderItemQtyContainerClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 2xl:py-3',
        orderItemQtyWrapperClass: 'flex items-center justify-center gap-0.5 sm:gap-0.5 md:gap-1 lg:gap-1 xl:gap-1 2xl:gap-1',
        quantityButtonClass: 'p-0.5 sm:p-0.5 md:p-1 lg:p-1 xl:p-1 2xl:p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700',
        quantityButtonIconClass: 'w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-3 2xl:h-3 text-gray-600 dark:text-gray-300',
        quantityTextClass: 'w-5 sm:w-5 md:w-6 lg:w-6 xl:w-6 2xl:w-6 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-medium text-center text-gray-700 dark:text-gray-200',
        itemPriceClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 2xl:py-3 text-[10px] sm:text-[10px] md:text-xs lg:text-xs xl:text-xs 2xl:text-xs font-semibold text-right text-gray-800 dark:text-gray-200',
        itemActionCellClass: 'px-2 sm:px-2 md:px-3 lg:px-3 xl:px-3 2xl:px-3 py-2 sm:py-2 md:py-3 lg:py-3 xl:py-3 2xl:py-3 text-right',
        removeButtonClass: 'text-red-500 hover:text-red-600',
        removeButtonIconClass: 'w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-4 xl:h-4 2xl:w-4 2xl:h-4',
        // Payment Summary Section
        summarySectionClass: 'mb-3',
        summaryCardClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-white dark:bg-gray-800 border border-[#F2F2F2] dark:border-gray-700 rounded-md',
        summaryTitleClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-blue-600 dark:text-blue-400',
        summaryDividerClass: '',
        summaryContainerClass: 'space-y-1.5 sm:space-y-1.5 md:space-y-2 lg:space-y-2 xl:space-y-2 2xl:space-y-2 p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3',
        summaryRowClass: 'flex justify-between text-xs sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm',
        summaryLabelClass: 'text-gray-600 dark:text-gray-400',
        summaryValueClass: 'text-gray-600 dark:text-gray-400',
        summaryDiscountValueClass: 'text-red-500',
        totalRowClass: 'flex justify-between font-bold text-sm sm:text-base md:text-base lg:text-lg text-gray-900 dark:text-gray-100',
        // Payment Methods Section
        paymentSectionClass: 'mb-3',
        paymentCardClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-white dark:bg-gray-800 border border-[#F2F2F2] dark:border-gray-700 rounded-md',
        paymentTitleClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 text-sm sm:text-base md:text-base lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-blue-600 dark:text-blue-400',
        paymentDividerClass: 'border-gray-200 dark:border-gray-700',
        paymentMethodsContainerClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3',
        paymentMethodsGridClass: 'grid grid-cols-3 gap-1.5 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-2 p-3',
        paymentMethodsGridMarginClass: 'mb-1.5 sm:mb-1.5 md:mb-2 lg:mb-2 xl:mb-2 2xl:mb-2',
        paymentMethodButtonClass: 'py-2 sm:py-2 md:py-2.5 lg:py-3 xl:py-3 2xl:py-3 border border-[#C5C6C7] dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-textMain dark:text-gray-200 text-[10px] sm:text-[10px] md:text-xs lg:text-sm xl:text-sm 2xl:text-sm font-interTight font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-600',
        paymentMethodActiveClass: '!bg-primary !text-white !border-primary hover:!bg-primaryHover',
        // Actions Section
        actionsSectionClass: 'mb-3',
        actionsCardClass: 'p-2 sm:p-2 md:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-white dark:bg-gray-800 border border-[#F2F2F2] dark:border-gray-700 rounded-md',
        actionButtonsGridClass: 'grid grid-cols-2 gap-1.5 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-2',
        actionButtonClass: 'flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-1.5 py-3 sm:py-3.5 md:py-3.5 lg:py-4 xl:py-4 2xl:py-5 border border-[#D8D9D9] dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-textMain dark:text-gray-200 font-poppins text-xs sm:text-sm md:text-sm lg:text-base xl:text-base 2xl:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-600',
        actionButtonIconClass: 'w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5',
        payButtonClass: 'flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-2 2xl:gap-2 py-2 sm:py-2 md:py-2.5 lg:py-2.5 xl:py-3 2xl:py-3 rounded-md bg-primary text-white font-poppins text-xs sm:text-sm md:text-sm lg:text-base xl:text-base 2xl:text-base font-semibold hover:bg-primaryHover',
        payButtonIconClass: 'w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5',
        printButtonClass: 'flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 py-2 sm:py-2 md:py-2.5 lg:py-2.5 border border-[#D8D9D9] dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-textMain dark:text-gray-200 font-poppins text-xs sm:text-sm md:text-sm lg:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-600',
        // Layout Control Flags
        variant: 'table',
        showTable: true, // Use table layout
        showCustomerInHeader: false, // Customer dropdown in separate section
        showGrandTotalSeparate: false, // Grand total inside summary
        showActionButtons: true,
        showPaymentMethods: true,
        usePaymentIcons: false, // Text-only payment methods
        showOrderNumberInHeaderRight: true,
        // Empty state
        emptyStateClass: 'text-center text-gray-500 py-8 text-sm',
        emptyStateText: 'No items in cart',
    },
    customerModal: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200',
        headerClass: 'px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between',
        titleClass: 'text-base font-semibold text-gray-900 dark:text-gray-100',
        closeButtonClass: 'p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors',
        contentClass: 'p-5 space-y-4',
        formGroupClass: 'space-y-1.5',
        labelClass: 'block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide',
        inputClass: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors',
        footerClass: 'px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors',
        submitButtonClass: 'px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primaryHover rounded shadow-sm transition-colors',
    },
    couponPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-md',
        modalClass: 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700',
        headerClass: 'px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800',
        titleClass: 'text-xl font-bold text-white tracking-tight',
        subtitleClass: 'text-xs text-blue-100 mt-1 font-medium',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[60vh] overflow-y-auto',
        // Coupon Input Section
        inputSectionClass: 'mb-6',
        inputWrapperClass: 'flex gap-3',
        inputClass: 'flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-semibold uppercase tracking-wider',
        applyButtonClass: 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm',
        applyButtonIconClass: 'w-4 h-4',
        // Coupon List Section
        listSectionClass: 'mt-5',
        listTitleClass: 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3',
        listContainerClass: 'space-y-3',
        couponCardClass: 'relative p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer bg-white dark:bg-gray-800 group hover:shadow-md',
        couponCardActiveClass: '!border-blue-500 !bg-blue-50 dark:!bg-blue-900/20 ring-1 ring-blue-500',
        couponCardDisabledClass: 'opacity-50 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-none grayscale',
        // Coupon Card Inner Elements
        couponCodeClass: 'text-lg font-extrabold text-blue-600 dark:text-blue-400 tracking-widest',
        couponDiscountClass: 'inline-flex items-center px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold ml-3',
        couponDescriptionClass: 'text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium',
        couponExpiryClass: 'text-xs text-gray-400 dark:text-gray-500 mt-1',
        couponSelectButtonClass: 'absolute top-4 right-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm',
        couponSelectedBadgeClass: 'absolute top-4 right-4 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm',
        // Applied Coupon Display
        appliedSectionClass: 'mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide',
        appliedCodeClass: 'text-lg font-extrabold text-blue-700 dark:text-blue-300 tracking-widest',
        appliedDiscountClass: 'text-sm text-blue-600 dark:text-blue-400 font-bold',
        removeButtonClass: 'p-2 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400 transition-colors',
        removeButtonIconClass: 'w-5 h-5',
        // Footer
        footerClass: 'px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors',
        confirmButtonClass: 'px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all',
        // Empty State
        emptyStateClass: 'py-12 text-center',
        emptyStateIconClass: 'w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-sm font-medium',
    },
    giftCardPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700',
        headerClass: 'px-5 py-4 bg-primary dark:bg-primary border-b border-primary',
        titleClass: 'text-lg font-bold text-white',
        subtitleClass: 'text-xs text-white/80 mt-0.5',
        closeButtonClass: 'absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-md text-white transition-all',
        closeButtonIconClass: 'w-4 h-4',
        contentClass: 'p-4 max-h-[55vh] overflow-y-auto',
        inputSectionClass: 'mb-4',
        inputWrapperClass: 'flex gap-2',
        inputClass: 'flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium',
        searchButtonClass: 'px-4 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-md font-medium transition-all flex items-center gap-1.5 text-sm',
        searchButtonIconClass: 'w-4 h-4',
        listSectionClass: 'mt-3',
        listTitleClass: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2',
        listContainerClass: 'space-y-2',
        giftCardCardClass: 'relative p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer bg-white dark:bg-gray-800 group',
        giftCardCardActiveClass: '!border-primary !bg-blue-50 dark:!bg-primary/10',
        giftCardCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-600',
        giftCardCodeClass: 'text-sm font-bold text-primary dark:text-blue-400 tracking-wide',
        giftCardBalanceClass: 'inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold ml-2',
        giftCardExpiryClass: 'text-[10px] text-gray-400 dark:text-gray-500 mt-1',
        giftCardSelectButtonClass: 'absolute top-3 right-3 px-3 py-1 bg-primary hover:bg-primaryHover text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-all',
        giftCardSelectedBadgeClass: 'absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white',
        appliedSectionClass: 'mb-4 p-3 bg-blue-50 dark:bg-primary/10 rounded-md border border-primary/30',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-xs font-medium text-primary dark:text-blue-400',
        appliedCodeClass: 'text-sm font-bold text-primary dark:text-blue-300 tracking-wide',
        appliedBalanceClass: 'text-xs text-primary dark:text-blue-400',
        removeButtonClass: 'p-1.5 hover:bg-primary/10 rounded text-primary dark:text-blue-400 transition-colors',
        removeButtonIconClass: 'w-4 h-4',
        footerClass: 'px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors',
        confirmButtonClass: 'px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primaryHover rounded-md transition-all',
        emptyStateClass: 'py-10 text-center',
        emptyStateIconClass: 'w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-xs',
    },
    loyaltyPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700',
        headerClass: 'px-5 py-4 bg-violet-600 dark:bg-violet-700 border-b border-violet-600',
        titleClass: 'text-lg font-bold text-white',
        subtitleClass: 'text-xs text-white/80 mt-0.5',
        closeButtonClass: 'absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-md text-white transition-all',
        closeButtonIconClass: 'w-4 h-4',
        contentClass: 'p-4 max-h-[55vh] overflow-y-auto',
        statsSectionClass: 'mb-4 p-3 bg-violet-50 dark:bg-violet-900/10 rounded-md border border-violet-100 dark:border-violet-800/30 flex items-center justify-between',
        pointsBalanceClass: 'text-xl font-bold text-violet-600 dark:text-violet-400',
        pointsLabelClass: 'text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide',
        listSectionClass: 'mt-0',
        listTitleClass: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2',
        listContainerClass: 'space-y-2',
        loyaltyCardClass: 'relative p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all cursor-pointer bg-white dark:bg-gray-800 group',
        loyaltyCardActiveClass: '!border-violet-500 !bg-violet-50 dark:!bg-violet-900/10',
        loyaltyCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-600',
        loyaltyRuleNameClass: 'text-sm font-bold text-gray-800 dark:text-gray-200',
        loyaltyPointsCostClass: 'inline-flex items-center px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold mt-1.5',
        loyaltyMinAmountClass: 'text-[10px] text-gray-400 dark:text-gray-500 mt-1 block',
        loyaltySelectButtonClass: 'absolute top-3 right-3 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-all',
        loyaltySelectedBadgeClass: 'absolute top-3 right-3 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center text-white',
        appliedSectionClass: 'mb-4 p-3 bg-violet-50 dark:bg-violet-900/10 rounded-md border border-violet-200 dark:border-violet-800/30',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-xs font-medium text-violet-600 dark:text-violet-400',
        appliedRuleNameClass: 'text-base font-bold text-violet-700 dark:text-violet-300',
        appliedPointsCostClass: 'text-xs text-violet-600 dark:text-violet-400',
        removeButtonClass: 'p-1.5 hover:bg-violet-100 dark:hover:bg-violet-900/20 rounded text-violet-600 dark:text-violet-400 transition-colors',
        removeButtonIconClass: 'w-4 h-4',
        footerClass: 'px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors',
        confirmButtonClass: 'px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-md transition-all',
        emptyStateClass: 'py-10 text-center',
        emptyStateIconClass: 'w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-xs',
    },
    cashPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700',
        headerClass: 'px-5 py-4 border-b border-gray-100 dark:border-gray-700',
        titleClass: 'text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wider',
        closeButtonClass: 'absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-5 space-y-4',
        rowClass: 'grid grid-cols-3 gap-2 items-center',
        labelClass: 'col-span-1 text-sm text-gray-600 dark:text-gray-400',
        inputWrapperClass: 'col-span-2 relative',
        inputClass: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium',
        readOnlyInputClass: 'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-right font-medium cursor-not-allowed',
        currencySymbolClass: 'hidden',
        footerClass: 'px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded transition-colors',
        confirmButtonClass: 'px-8 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-sm hover:shadow transition-all uppercase',
    },
    layout: {
        mainContainerClass: 'h-screen w-full flex flex-col overflow-hidden',
        contentAreaClass: 'flex flex-col lg:flex-row flex-1 overflow-hidden',
        productAreaClass: 'flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 bg-gray-50 dark:bg-gray-900 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        orderSidebarClass: 'hidden lg:flex flex-col flex-shrink-0 w-80 xl:w-96 2xl:w-[420px] h-full overflow-hidden bg-white dark:bg-gray-800 border-l dark:border-gray-700',
    },
    mobile: {
        overlayClass: '',
        categoryDrawerClass: '',
        categoryDrawerHeaderClass: '',
        orderDrawerClass: 'fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform shadow-2xl z-[60] flex flex-col',
        orderDrawerHeaderClass: 'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700',
    },
    bottomActionBar: {
        show: false,
        wrapperClass: '',
        containerClass: '',
        buttonClass: '',
        buttonIconClass: '',
        buttonTextClass: '',
    },
};

// POS-4 Configuration (Table order panel)
const POS_4_CONFIG: PosScreenUIConfig = {
    screenId: 'POS_4',
    header: {
        wrapperClass: 'p-4 flex items-center flex-shrink-0 bg-white dark:bg-gray-800 border-b shadow-sm',
        innerContainerClass: 'w-full flex items-center justify-between gap-1 sm:gap-2 md:gap-3 lg:gap-4',
        logoContainerClass: 'w-16 sm:w-20 md:w-24 flex-shrink-0',
        logoImageClass: 'w-full h-10 object-contain',
        welcomeTextClass: 'hidden sm:flex flex-col text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-200',
        dateTimeContainerClass: 'bg-primary dark:bg-gray-600 px-2 py-[6px] rounded-md',
        dateTimeTextClass: 'text-white font-semibold',
        storeDropdownClass: 'relative pl-4 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-bold text-sm rounded border-b-2 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer flex items-center',
        storeDropdownListClass: 'absolute top-full mt-0 left-0 w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-b-md shadow-xl z-50 divide-y divide-gray-200 dark:divide-gray-700',
        storeOptionClass: 'w-full text-left px-4 py-3 hover:bg-white dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-wide',
        mobileMenuButtonClass: 'lg:hidden p-1.5 sm:p-2 rounded-lg touch-manipulation hover:bg-gray-100',
        showMobileMenuButton: false,
        rightSideContainerClass: 'flex items-center justify-end space-x-1 sm:space-x-1 md:space-x-2',
        searchContainerClass: 'hidden sm:block flex-1 max-w-[200px] md:max-w-xs lg:max-w-sm',
        searchInputClass: 'w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        searchIconClass: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5',
        showSearchBar: true,
        headerButtonClass: 'p-1 sm:p-1.5 md:p-2 rounded-full flex-shrink-0 bg-[#F5F6FA] text-textSmall dark:text-gray-200 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-gray-600',
        showDarkModeToggle: true,
        showCartButton: true,
        cartButtonClass: 'lg:hidden p-2 rounded-full bg-[#F5F6FA] text-textSmall dark:text-gray-200 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-gray-600 relative',
        cartBadgeClass: 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold',
    },
    categorySidebar: {
        wrapperClass: '',
        innerContainerClass: 'flex flex-col items-stretch space-y-2 2xl:space-y-3',
        categoryButtonClass: 'flex flex-col items-center justify-center py-3 2xl:py-4 px-2 rounded-md transition-colors bg-[#FAFAFA] dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-[#D8D9D9] dark:border-gray-700',
        categoryButtonActiveClass: 'bg-blue-600 text-white shadow-md border-blue-600',
        categoryIconClass: 'w-4 h-4 2xl:w-5 2xl:h-5 mb-1 2xl:mb-2',
        categoryTextClass: 'font-medium text-xs 2xl:text-sm text-center',
        variant: 'vertical',
        showMobileHorizontal: false,
        mobileHorizontalWrapperClass: '',
    },
    productGrid: {
        wrapperClass: 'flex-1 p-3 sm:p-4 lg:p-6 xl:p-4 2xl:p-4 bg-[#f9fafb] dark:bg-gray-900 overflow-y-auto',
        gridClass: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4',
        card: {
            wrapperClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full 2xl:w-[230px] 2xl:h-[249px]',
            innerPaddingClass: '',
            imageWrapperClass: '',
            imageContainerClass: 'relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden',
            imageClass: 'object-cover w-full h-full hover:scale-110 transition-transform duration-500',
            stockBadgeClass: 'absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#E6F2FF] dark:bg-blue-900/50 z-10 shadow-sm backdrop-blur-sm',
            stockBadgeTextClass: 'text-[#0066FF] dark:text-blue-400 text-[10px] sm:text-[11px] font-semibold leading-none',
            contentContainerClass: 'p-3 sm:p-4 bg-white dark:bg-gray-800 flex-1 flex flex-col justify-between gap-3',
            infoWrapperClass: 'flex items-center justify-between',
            nameClass: 'text-gray-900 dark:text-gray-100 text-sm sm:text-[15px] font-medium pr-2',
            priceClass: 'text-[#0066FF] dark:text-blue-400 text-sm sm:text-[15px] font-bold',
            addButtonClass: 'w-full py-2.5 rounded-lg flex items-center justify-center space-x-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow active:scale-[0.98]',
            addButtonIconClass: 'w-4 h-4',
            addButtonText: 'Add to Cart',
            isClickable: true,
            showQuantityControls: false,
            footerClass: '',
            quantityContainerClass: '',
            quantityButtonClass: '',
            quantityButtonIconClass: '',
            quantityInputClass: '',
        },
    },
    actionPanel: {
        show: true,
        wrapperClass: 'mb-4 sm:mb-6 pb-2',
        buttonsContainerClass: 'flex items-center gap-2 overflow-x-auto',
        buttonClass: 'flex items-center justify-center gap-1 sm:gap-2 text-white px-3 sm:px-4 py-2 rounded-md flex-shrink-0 whitespace-nowrap text-xs sm:text-sm 2xl:flex-1 2xl:justify-center 2xl:px-2 2xl:py-3',
        buttonIconClass: 'w-3 h-3 sm:w-4 sm:h-4 2xl:w-5 2xl:h-5',
    },
    orderPanel: {
        wrapperClass: 'hidden lg:block w-[420px] xl:w-[480px] 2xl:w-[490px] bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-3 flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        innerContainerClass: '',
        headerClass: 'bg-white dark:bg-gray-800 rounded-md shadow-sm p-3 sm:p-4 mb-2 border dark:border-gray-700',
        headerRightClass: '',
        titleClass: 'text-base sm:text-xl font-semibold text-blue-600 dark:text-blue-400',
        orderNumberClass: 'bg-[#E6F2FF] dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md px-2 py-1 font-medium text-xs sm:text-sm',
        closeButtonClass: '',
        closeButtonIconClass: '',
        // Customer Section
        customerSectionClass: '',
        customerLabelClass: '',
        customerRowClass: '',
        customerDropdownClass: 'w-full flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-gray-600 rounded hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200',
        customerDropdownTextClass: '',
        customerDropdownIconClass: '',
        addCustomerButtonClass: 'bg-green-600 text-white px-2 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors',
        addCustomerIconClass: '',
        // Scrollable Content
        scrollableContentClass: '',
        // Order Details Section
        orderDetailsSectionClass: '',
        orderDetailsCardClass: 'bg-white dark:bg-gray-800 rounded-md shadow-sm mb-2 border dark:border-gray-700',
        orderDetailsHeaderClass: 'flex items-center justify-between p-3 sm:p-4',
        orderDetailsTitleClass: 'text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400',
        orderDetailsHeaderRightClass: 'flex items-center gap-2 sm:gap-3',
        itemsCountClass: 'bg-[#E6F2FF] dark:bg-blue-900 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 font-semibold text-xs sm:text-sm',
        clearAllButtonClass: 'text-[#F4462C] dark:text-red-400 text-xs sm:text-sm font-medium hover:text-red-600',
        // Table
        tableClass: 'w-full',
        tableHeaderRowClass: 'bg-[#F2F2F2] dark:bg-gray-700',
        tableHeaderCellClass: 'px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
        tableHeaderCellCenterClass: 'px-2 sm:px-4 py-2 text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
        tableHeaderCellRightClass: 'px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300',
        // Order Items
        orderItemClass: 'border-t border-gray-200 dark:border-gray-700',
        orderItemNameClass: 'px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-800 dark:text-gray-200 text-xs sm:text-sm',
        orderItemQtyContainerClass: 'px-2 sm:px-4 py-2 sm:py-3',
        orderItemQtyWrapperClass: 'flex items-center justify-center gap-1 sm:gap-2',
        quantityButtonClass: 'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300',
        quantityButtonIconClass: 'w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400',
        quantityTextClass: 'w-6 sm:w-8 text-center font-medium text-xs sm:text-sm dark:text-gray-200',
        itemPriceClass: 'px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm',
        itemActionCellClass: 'px-2 sm:px-4 py-2 sm:py-3 text-center',
        removeButtonClass: 'text-red-500 hover:text-red-600 transition-colors',
        removeButtonIconClass: 'w-4 h-4 sm:w-5 sm:h-5',
        // Payment Summary Section
        summarySectionClass: '',
        summaryCardClass: 'bg-white dark:bg-gray-800 rounded-md shadow-sm mb-2 border dark:border-gray-700',
        summaryTitleClass: 'text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 p-3 sm:p-4',
        summaryDividerClass: 'border-gray-200 dark:border-gray-700',
        summaryContainerClass: 'space-y-2 sm:space-y-3 p-3 sm:p-4',
        summaryRowClass: 'flex justify-between text-gray-600 dark:text-gray-400 font-semibold text-xs sm:text-sm',
        summaryLabelClass: '',
        summaryValueClass: 'text-gray-800 dark:text-gray-200',
        summaryDiscountValueClass: 'text-[#F4462C] dark:text-red-400',
        totalRowClass: 'bg-[#E6F2FF] dark:bg-blue-900 border border-[#1A88FF] dark:border-blue-700 rounded-md py-3 px-3 flex justify-between items-center mb-2 text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base',
        // Payment Methods Section
        paymentSectionClass: '',
        paymentCardClass: 'bg-white dark:bg-gray-800 rounded-md shadow-sm mb-2 border dark:border-gray-700',
        paymentTitleClass: 'text-base sm:text-lg font-semibold text-blue-600 dark:text-blue-400 p-3 sm:p-4',
        paymentDividerClass: 'border-gray-200 dark:border-gray-700',
        paymentMethodsContainerClass: '',
        paymentMethodsGridClass: 'grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4',
        paymentMethodsGridMarginClass: '',
        paymentMethodButtonClass: 'flex flex-col items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-md border-2 transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500',
        paymentMethodActiveClass: '!bg-blue-600 !border-blue-600 !text-white',
        // Actions Section
        actionsSectionClass: '',
        actionsCardClass: '',
        actionButtonsGridClass: 'grid grid-cols-2 gap-2 sm:gap-3',
        actionButtonClass: '',
        actionButtonIconClass: 'w-4 h-4 sm:w-5 sm:h-5',
        payButtonClass: 'flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-md bg-blue-600 text-white font-semibold text-xs sm:text-base hover:bg-blue-700 transition-colors',
        payButtonIconClass: 'w-4 h-4 sm:w-5 sm:h-5',
        printButtonClass: 'flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-md border border-[#D8D9D9] dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold text-xs sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
        // Layout Control Flags
        variant: 'table',
        showTable: true,
        showCustomerInHeader: true,
        showGrandTotalSeparate: true,
        showActionButtons: true, // Show Print Order + Place Order
        showPaymentMethods: true,
        usePaymentIcons: true,
        // Empty state
        emptyStateClass: 'text-center text-gray-500 py-8 text-sm',
        emptyStateText: 'No items in cart',
    },
    customerModal: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200',
        headerClass: 'px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50',
        titleClass: 'text-lg font-bold text-gray-800',
        closeButtonClass: 'p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors',
        contentClass: 'p-6 space-y-4 bg-white',
        formGroupClass: 'space-y-2',
        labelClass: 'block text-sm font-semibold text-gray-700',
        inputClass: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm',
        footerClass: 'px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors',
        submitButtonClass: 'px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all',
    },
    couponPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-md',
        modalClass: 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-250 border-2 border-gray-100 dark:border-gray-700',
        headerClass: 'px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 shadow-sm',
        titleClass: 'text-xl font-extrabold text-white tracking-tight',
        subtitleClass: 'text-sm text-blue-100 mt-1',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[65vh] overflow-y-auto',
        // Coupon Input Section
        inputSectionClass: 'mb-6',
        inputWrapperClass: 'flex gap-4',
        inputClass: 'flex-1 px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-base font-bold uppercase tracking-widest',
        applyButtonClass: 'px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-base',
        applyButtonIconClass: 'w-5 h-5',
        // Coupon List Section
        listSectionClass: 'mt-5',
        listTitleClass: 'text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4',
        listContainerClass: 'space-y-4',
        couponCardClass: 'relative p-5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 group hover:shadow-lg',
        couponCardActiveClass: '!border-solid !border-indigo-500 !bg-gradient-to-r !from-indigo-50 !to-blue-50 dark:!from-indigo-900/30 dark:!to-blue-900/30 ring-4 ring-indigo-500/20',
        couponCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-none',
        // Coupon Card Inner Elements
        couponCodeClass: 'text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-widest',
        couponDiscountClass: 'inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-sm font-bold ml-4 shadow-sm',
        couponDescriptionClass: 'text-base text-gray-600 dark:text-gray-400 mt-3',
        couponExpiryClass: 'text-sm text-gray-400 dark:text-gray-500 mt-2',
        couponSelectButtonClass: 'absolute top-5 right-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md',
        couponSelectedBadgeClass: 'absolute top-5 right-5 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md',
        // Applied Coupon Display
        appliedSectionClass: 'mb-6 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide',
        appliedCodeClass: 'text-xl font-extrabold text-indigo-700 dark:text-indigo-300 tracking-widest',
        appliedDiscountClass: 'text-base text-indigo-600 dark:text-indigo-400 font-semibold',
        removeButtonClass: 'p-2.5 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors',
        removeButtonIconClass: 'w-6 h-6',
        // Footer
        footerClass: 'px-6 py-5 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4',
        cancelButtonClass: 'px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors',
        confirmButtonClass: 'px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg hover:shadow-xl transition-all',
        // Empty State
        emptyStateClass: 'py-16 text-center',
        emptyStateIconClass: 'w-20 h-20 mx-auto mb-5 text-gray-200 dark:text-gray-700',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-base',
    },
    giftCardPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700',
        headerClass: 'px-6 py-5 bg-blue-600 dark:bg-blue-700',
        titleClass: 'text-xl font-bold text-white',
        subtitleClass: 'text-sm text-blue-100 mt-1',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-blue-500 rounded-lg text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[65vh] overflow-y-auto',
        inputSectionClass: 'mb-6',
        inputWrapperClass: 'flex gap-4',
        inputClass: 'flex-1 px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-base font-bold uppercase tracking-widest',
        searchButtonClass: 'px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-base',
        searchButtonIconClass: 'w-5 h-5',
        listSectionClass: 'mt-5',
        listTitleClass: 'text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4',
        listContainerClass: 'space-y-4',
        giftCardCardClass: 'relative p-5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer bg-white dark:bg-gray-800 group hover:shadow-lg',
        giftCardCardActiveClass: '!border-blue-500 ring-4 ring-blue-500/20 !bg-blue-50 dark:!bg-blue-900/30',
        giftCardCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-none',
        giftCardCodeClass: 'text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-widest',
        giftCardBalanceClass: 'inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm font-bold ml-4 shadow-sm',
        giftCardExpiryClass: 'text-sm text-gray-400 dark:text-gray-500 mt-2',
        giftCardSelectButtonClass: 'absolute top-5 right-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md',
        giftCardSelectedBadgeClass: 'absolute top-5 right-5 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md',
        appliedSectionClass: 'mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide',
        appliedCodeClass: 'text-xl font-extrabold text-blue-700 dark:text-blue-300 tracking-widest',
        appliedBalanceClass: 'text-base text-blue-600 dark:text-blue-400 font-semibold',
        removeButtonClass: 'p-2.5 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400 transition-colors',
        removeButtonIconClass: 'w-6 h-6',
        footerClass: 'px-6 py-5 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4',
        cancelButtonClass: 'px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors',
        confirmButtonClass: 'px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all',
        emptyStateClass: 'py-16 text-center',
        emptyStateIconClass: 'w-20 h-20 mx-auto mb-5 text-gray-200 dark:text-gray-700',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-base',
    },
    loyaltyPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm',
        modalClass: 'bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-700',
        headerClass: 'px-6 py-5 bg-purple-600 dark:bg-purple-700',
        titleClass: 'text-xl font-bold text-white',
        subtitleClass: 'text-sm text-purple-100 mt-1',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-purple-500 rounded-lg text-white transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'p-6 max-h-[65vh] overflow-y-auto',
        statsSectionClass: 'mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 flex items-center justify-between',
        pointsBalanceClass: 'text-2xl font-bold text-purple-600 dark:text-purple-400',
        pointsLabelClass: 'text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest',
        listSectionClass: 'mt-5',
        listTitleClass: 'text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-4',
        listContainerClass: 'space-y-4',
        loyaltyCardClass: 'relative p-5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer bg-white dark:bg-gray-800 group hover:shadow-lg',
        loyaltyCardActiveClass: '!border-solid !border-purple-500 !bg-purple-50 dark:!bg-purple-900/30 ring-4 ring-purple-500/20',
        loyaltyCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-none',
        loyaltyRuleNameClass: 'text-lg font-bold text-gray-800 dark:text-gray-200',
        loyaltyPointsCostClass: 'inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-sm font-bold mt-3 shadow-sm',
        loyaltyMinAmountClass: 'text-sm text-gray-500 dark:text-gray-400 mt-2 block',
        loyaltySelectButtonClass: 'absolute top-5 right-5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md',
        loyaltySelectedBadgeClass: 'absolute top-5 right-5 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-md',
        appliedSectionClass: 'mb-6 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide',
        appliedRuleNameClass: 'text-xl font-extrabold text-purple-700 dark:text-purple-300 tracking-widest',
        appliedPointsCostClass: 'text-base text-purple-600 dark:text-purple-400 font-semibold',
        removeButtonClass: 'p-2.5 hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-lg text-purple-600 dark:text-purple-400 transition-colors',
        removeButtonIconClass: 'w-6 h-6',
        footerClass: 'px-6 py-5 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-4',
        cancelButtonClass: 'px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors',
        confirmButtonClass: 'px-8 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all',
        emptyStateClass: 'py-16 text-center',
        emptyStateIconClass: 'w-20 h-20 mx-auto mb-5 text-gray-200 dark:text-gray-700',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-base',
    },
    cashPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-md',
        modalClass: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-250 border border-white/20',
        headerClass: 'px-6 py-5',
        titleClass: 'text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight',
        closeButtonClass: 'absolute top-5 right-5 p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg text-gray-400 transition-all',
        closeButtonIconClass: 'w-5 h-5',
        contentClass: 'px-6 pb-6 space-y-5',
        rowClass: 'grid grid-cols-12 gap-3 items-center',
        labelClass: 'col-span-4 text-sm font-medium text-gray-500 dark:text-gray-400',
        inputWrapperClass: 'col-span-8 relative',
        inputClass: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold',
        readOnlyInputClass: 'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-right font-semibold cursor-not-allowed',
        currencySymbolClass: 'hidden',
        footerClass: 'px-6 py-5 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all',
        confirmButtonClass: 'px-8 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg hover:shadow-xl transition-all uppercase',
    },
    layout: {
        mainContainerClass: 'h-screen w-full flex flex-col overflow-hidden',
        contentAreaClass: 'flex-1 flex overflow-hidden relative',
        categorySidebarClass: 'hidden lg:block w-40 2xl:w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3',
        productAreaClass: 'flex-1 p-3 sm:p-4 lg:p-6 xl:p-4 2xl:p-4 bg-[#f9fafb] dark:bg-gray-900 overflow-y-auto',
        orderSidebarClass: 'hidden lg:block w-[420px] xl:w-[480px] 2xl:w-[490px] bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-3 h-full overflow-hidden',
    },
    mobile: {
        overlayClass: 'lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40',
        categoryDrawerClass: 'absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 overflow-y-auto',
        categoryDrawerHeaderClass: 'flex items-center justify-between mb-4',
        orderDrawerClass: 'fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col',
        orderDrawerHeaderClass: 'flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
    },
    bottomActionBar: {
        show: false,
        wrapperClass: '',
        containerClass: '',
        buttonClass: '',
        buttonIconClass: '',
        buttonTextClass: '',
    },
};

// POS-5 Configuration (Bottom action bar)
const POS_5_CONFIG: PosScreenUIConfig = {
    screenId: 'POS_5',
    header: {
        wrapperClass: 'bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4',
        innerContainerClass: 'flex items-center justify-between gap-4',
        logoContainerClass: 'w-16 sm:w-20 md:w-24 flex-shrink-0',
        logoImageClass: 'w-full h-8 sm:h-10 object-contain',
        welcomeTextClass: 'hidden sm:flex flex-col text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-200',
        dateTimeContainerClass: 'bg-primary dark:bg-blue-700 px-2 py-[6px] rounded-md',
        dateTimeTextClass: 'text-white font-semibold',
        storeDropdownClass: 'relative pl-4 pr-10 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-indigo-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center',
        storeDropdownListClass: 'absolute top-full mt-2 left-0 w-full bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300',
        storeOptionClass: 'w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all flex items-center justify-between group',
        mobileMenuButtonClass: 'lg:hidden p-1.5 sm:p-2 md:p-2.5 rounded-lg hover:bg-gray-100 touch-manipulation',
        showMobileMenuButton: true,
        rightSideContainerClass: 'flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl justify-end',
        searchContainerClass: 'hidden md:block flex-1 max-w-20 sm:max-w-24 md:max-w-32 lg:max-w-40 xl:max-w-48',
        searchInputClass: 'w-full pl-6 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 border rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary',
        searchIconClass: 'absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4',
        showSearchBar: true,
        headerButtonClass: 'p-1.5 sm:p-2 bg-primary dark:bg-gray-600 text-white rounded-md hover:bg-primaryHover',
        showDarkModeToggle: true,
        showCartButton: true,
        cartButtonClass: 'lg:hidden p-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-lg relative',
        cartBadgeClass: 'absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-white text-primary text-xs font-bold shadow-sm',
    },
    categorySidebar: {
        wrapperClass: 'hidden lg:block w-48 xl:w-56 2xl:w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800',
        innerContainerClass: 'py-2 lg:py-3 xl:py-4',
        categoryButtonClass: 'w-full text-left px-3 sm:px-4 py-2 lg:py-2.5 xl:py-3 border-y border-gray-100 dark:border-gray-700 first:border-t-0 last:border-b-0 hover:bg-primaryHover text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200',
        categoryButtonActiveClass: 'bg-primary text-white',
        categoryIconClass: '',
        categoryTextClass: '',
        variant: 'vertical',
        showMobileHorizontal: false,
        mobileHorizontalWrapperClass: '',
    },
    productGrid: {
        wrapperClass: 'flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 bg-gray-50 dark:bg-gray-900',
        gridClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4',
        card: {
            wrapperClass: 'bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-2 sm:p-3 md:p-4',
            innerPaddingClass: '',
            imageWrapperClass: '',
            imageContainerClass: 'aspect-[1/1] bg-blue-50 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mb-2',
            imageClass: 'w-full h-full object-cover',
            stockBadgeClass: '',
            stockBadgeTextClass: '',
            contentContainerClass: 'flex justify-between items-start',
            infoWrapperClass: 'flex-1 mr-2 flex flex-col',
            nameClass: 'text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300',
            priceClass: 'text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 font-semibold',
            addButtonClass: 'px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-primary text-white rounded-md hover:bg-primaryHover text-[10px] sm:text-xs md:text-sm flex-shrink-0',
            addButtonIconClass: '',
            addButtonText: 'Add',
            isClickable: false,
            showQuantityControls: false,
            footerClass: '',
            quantityContainerClass: '',
            quantityButtonClass: '',
            quantityButtonIconClass: '',
            quantityInputClass: '',
        },
    },
    actionPanel: {
        show: false,
        wrapperClass: '',
        buttonsContainerClass: '',
        buttonClass: '',
        buttonIconClass: '',
    },
    orderPanel: {
        wrapperClass: 'flex flex-col h-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600',
        innerContainerClass: '',
        headerClass: 'bg-primary dark:from-blue-700 dark:to-blue-800 p-3 sm:p-4',
        headerRightClass: 'flex items-center gap-3',
        titleClass: 'text-base sm:text-xl font-semibold text-white',
        orderNumberClass: 'text-blue-100 rounded-md px-2 py-1 font-medium text-xs sm:text-sm',
        closeButtonClass: 'p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors',
        closeButtonIconClass: 'w-5 h-5',
        // Customer Section (in header for this design)
        customerSectionClass: 'mt-2',
        customerLabelClass: 'hidden',
        customerRowClass: '',
        customerDropdownClass: 'w-full px-3 py-2 rounded-md border-2 border-blue-400 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all appearance-none flex items-center justify-between',
        customerDropdownTextClass: 'text-gray-700',
        customerDropdownIconClass: 'w-4 h-4 text-gray-500',
        addCustomerButtonClass: 'bg-white text-blue-600 px-2 py-2 rounded-md font-medium hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 text-xs sm:text-sm',
        addCustomerIconClass: 'w-4 h-4',
        // Scrollable Content
        scrollableContentClass: 'flex-1 p-2',
        // Order Details Section
        orderDetailsSectionClass: 'mb-2',
        orderDetailsCardClass: '',
        orderDetailsHeaderClass: 'flex items-center justify-between mb-1.5',
        orderDetailsTitleClass: 'text-base font-bold text-gray-800 dark:text-white',
        orderDetailsHeaderRightClass: 'flex items-center gap-3',
        itemsCountClass: 'text-sm text-gray-500 font-medium',
        clearAllButtonClass: 'text-sm text-red-500 hover:text-red-600 font-semibold transition-colors',
        // Table (not used, but keeping for compatibility)
        tableClass: '',
        tableHeaderRowClass: '',
        tableHeaderCellClass: '',
        tableHeaderCellCenterClass: '',
        tableHeaderCellRightClass: '',
        // Order Items - Premium gradient cards
        orderItemClass: 'flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-3 mb-2 shadow-sm',
        orderItemNameClass: 'text-sm font-semibold text-gray-800 dark:text-gray-100 block mb-1',
        itemsWrapperClass: 'space-y-0',
        orderItemQtyContainerClass: '',
        orderItemQtyWrapperClass: '',
        quantityButtonClass: 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-full border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-all w-6 h-6 flex items-center justify-center',
        quantityButtonIconClass: 'w-3 h-3',
        quantityTextClass: 'font-medium text-gray-700 dark:text-gray-200 w-6 text-center text-sm',
        itemPriceClass: 'text-xs text-gray-500 dark:text-gray-400 font-medium',
        itemActionCellClass: '',
        removeButtonClass: 'text-red-400 hover:text-red-600 p-1.5 rounded-md transition-all ml-1',
        removeButtonIconClass: 'w-4 h-4',
        // Payment Summary Section - Clean white card
        summarySectionClass: 'mb-2',
        summaryCardClass: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-3 shadow-sm',
        summaryTitleClass: 'text-base font-bold text-gray-800 dark:text-white mb-1.5',
        summaryDividerClass: 'hidden',
        summaryContainerClass: 'space-y-1 mb-1.5',
        summaryRowClass: 'flex justify-between text-gray-700 dark:text-gray-300 text-sm',
        summaryLabelClass: 'font-medium',
        summaryValueClass: 'font-semibold text-gray-800 dark:text-gray-100',
        summaryDiscountValueClass: 'font-semibold text-red-600 dark:text-red-400',
        totalRowClass: 'pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm',
        // Payment Methods Section - Clean white card
        paymentSectionClass: 'mb-2',
        paymentCardClass: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-3 shadow-sm',
        paymentTitleClass: 'text-base font-bold text-gray-800 dark:text-white mb-1.5',
        paymentDividerClass: 'hidden',
        paymentMethodsContainerClass: '',
        paymentMethodsGridClass: 'grid grid-cols-3 gap-1.5',
        paymentMethodsGridMarginClass: 'mb-0',
        paymentMethodButtonClass: 'bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent border-2 border-blue-100 dark:border-blue-800 rounded-md p-0.5 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 group flex flex-col items-center gap-1',
        paymentMethodActiveClass: 'border-blue-500 bg-blue-50 dark:bg-blue-900/50',
        // Actions Section - Premium buttons
        actionsSectionClass: '',
        actionsCardClass: '',
        actionButtonsGridClass: 'flex gap-2',
        actionButtonClass: '',
        actionButtonIconClass: 'w-4 h-4',
        payButtonClass: 'flex-1 bg-primary text-white px-3 py-2 rounded-md font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl text-sm',
        payButtonIconClass: 'w-4 h-4',
        printButtonClass: 'flex-1 bg-white dark:bg-gray-700 border-2 border-primary dark:border-primary text-primary dark:text-blue-400 px-3 py-2 rounded-md font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg text-sm',
        // Layout Control Flags
        variant: 'compact',
        showTable: false,
        showCustomerInHeader: true,
        showGrandTotalSeparate: false,
        showActionButtons: true,
        showPaymentMethods: true,
        usePaymentIcons: true,
        // Empty state
        emptyStateClass: 'text-center text-gray-400 dark:text-gray-500 py-12 text-sm',
        emptyStateText: 'No items in cart',
    },
    customerModal: {
        overlayClass: 'fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4',
        modalClass: 'bg-white rounded shadow-lg w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200',
        headerClass: 'px-4 py-3 border-b flex items-center justify-between',
        titleClass: 'text-base font-semibold text-gray-800',
        closeButtonClass: 'p-1 hover:bg-gray-100 rounded text-gray-500',
        contentClass: 'p-4 space-y-3',
        formGroupClass: 'space-y-1',
        labelClass: 'block text-xs font-medium text-gray-600',
        inputClass: 'w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-blue-500',
        footerClass: 'px-4 py-3 bg-gray-50 border-t flex items-center justify-end gap-2',
        cancelButtonClass: 'px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded border',
        submitButtonClass: 'px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded',
    },
    couponPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-gradient-to-br from-slate-900/80 to-blue-900/80 flex items-center justify-center p-4 backdrop-blur-lg',
        modalClass: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20',
        headerClass: 'px-5 py-4 bg-gradient-to-r from-primary via-blue-500 to-indigo-500 dark:from-primary dark:via-blue-600 dark:to-indigo-600',
        titleClass: 'text-lg font-bold text-white drop-shadow-sm',
        subtitleClass: 'text-xs text-white/70 mt-0.5',
        closeButtonClass: 'absolute top-3 right-3 p-2 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm transition-all',
        closeButtonIconClass: 'w-4 h-4',
        contentClass: 'p-5 max-h-[50vh] overflow-y-auto',
        // Coupon Input Section
        inputSectionClass: 'mb-5',
        inputWrapperClass: 'flex gap-2',
        inputClass: 'flex-1 px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-semibold uppercase tracking-widest',
        applyButtonClass: 'px-5 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm',
        applyButtonIconClass: 'w-4 h-4',
        // Coupon List Section
        listSectionClass: 'mt-4',
        listTitleClass: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3',
        listContainerClass: 'space-y-2.5',
        couponCardClass: 'relative p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm group hover:shadow-lg hover:scale-[1.01]',
        couponCardActiveClass: '!border-primary ring-2 ring-primary/20 !bg-gradient-to-br !from-blue-50 !to-indigo-50 dark:!from-blue-900/20 dark:!to-indigo-900/20',
        couponCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-200/50 dark:hover:border-gray-700/50 hover:shadow-none hover:scale-100',
        // Coupon Card Inner Elements
        couponCodeClass: 'text-base font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent tracking-wider',
        couponDiscountClass: 'inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold ml-2 shadow-sm',
        couponDescriptionClass: 'text-xs text-gray-500 dark:text-gray-400 mt-1.5',
        couponExpiryClass: 'text-[10px] text-gray-400 dark:text-gray-500 mt-1.5',
        couponSelectButtonClass: 'absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md',
        couponSelectedBadgeClass: 'absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md',
        // Applied Coupon Display
        appliedSectionClass: 'mb-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-primary/20',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-xs font-semibold text-primary dark:text-blue-400 uppercase tracking-wide',
        appliedCodeClass: 'text-base font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent tracking-wider',
        appliedDiscountClass: 'text-xs text-primary dark:text-blue-400 font-medium',
        removeButtonClass: 'p-2 hover:bg-primary/10 rounded-xl text-primary dark:text-blue-400 transition-all',
        removeButtonIconClass: 'w-4 h-4',
        // Footer
        footerClass: 'px-5 py-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-100/50 dark:border-gray-700/50 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all',
        confirmButtonClass: 'px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all',
        // Empty State
        emptyStateClass: 'py-10 text-center',
        emptyStateIconClass: 'w-14 h-14 mx-auto mb-3 text-gray-200 dark:text-gray-700',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-xs',
    },
    giftCardPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-gradient-to-br from-slate-900/80 to-blue-900/80 flex items-center justify-center p-4 backdrop-blur-lg',
        modalClass: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20',
        headerClass: 'px-5 py-4 bg-gradient-to-r from-teal-500 to-cyan-600',
        titleClass: 'text-lg font-bold text-white drop-shadow-sm',
        subtitleClass: 'text-xs text-white/80 mt-0.5',
        closeButtonClass: 'absolute top-3 right-3 p-2 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm transition-all',
        closeButtonIconClass: 'w-4 h-4',
        contentClass: 'p-5 max-h-[50vh] overflow-y-auto',
        inputSectionClass: 'mb-5',
        inputWrapperClass: 'flex gap-2',
        inputClass: 'flex-1 px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm font-semibold tracking-wide',
        searchButtonClass: 'px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm',
        searchButtonIconClass: 'w-4 h-4',
        listSectionClass: 'mt-4',
        listTitleClass: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3',
        listContainerClass: 'space-y-2.5',
        giftCardCardClass: 'relative p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-teal-400/50 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm group hover:shadow-lg hover:scale-[1.01]',
        giftCardCardActiveClass: '!border-teal-500 ring-2 ring-teal-500/20 !bg-gradient-to-br !from-teal-50 !to-cyan-50 dark:!from-teal-900/20 dark:!to-cyan-900/20',
        giftCardCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-200/50 hover:shadow-none hover:scale-100',
        giftCardCodeClass: 'text-sm font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-wide',
        giftCardBalanceClass: 'inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold ml-2 shadow-sm',
        giftCardExpiryClass: 'text-[10px] text-gray-400 dark:text-gray-500 mt-1.5',
        giftCardSelectButtonClass: 'absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md',
        giftCardSelectedBadgeClass: 'absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white shadow-md',
        appliedSectionClass: 'mb-5 p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl border border-teal-500/20',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide',
        appliedCodeClass: 'text-base font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-wide',
        appliedBalanceClass: 'text-sm font-medium text-teal-600 dark:text-teal-400',
        removeButtonClass: 'p-2 hover:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400 transition-all',
        removeButtonIconClass: 'w-4 h-4',
        footerClass: 'px-5 py-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-100/50 dark:border-gray-700/50 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all',
        confirmButtonClass: 'px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-lg hover:shadow-xl transition-all',
        emptyStateClass: 'py-10 text-center',
        emptyStateIconClass: 'w-14 h-14 mx-auto mb-3 text-gray-200 dark:text-gray-700',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-xs',
    },
    loyaltyPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-gradient-to-br from-slate-900/80 to-purple-900/80 flex items-center justify-center p-4 backdrop-blur-lg',
        modalClass: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20',
        headerClass: 'px-5 py-4 bg-gradient-to-r from-violet-600 to-purple-600',
        titleClass: 'text-lg font-bold text-white drop-shadow-sm',
        subtitleClass: 'text-xs text-white/80 mt-0.5',
        closeButtonClass: 'absolute top-3 right-3 p-2 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm transition-all',
        closeButtonIconClass: 'w-4 h-4',
        contentClass: 'p-5 max-h-[50vh] overflow-y-auto',
        statsSectionClass: 'mb-5 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-500/20 flex items-center justify-between',
        pointsBalanceClass: 'text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent',
        pointsLabelClass: 'text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest',
        listSectionClass: 'mt-4',
        listTitleClass: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3',
        listContainerClass: 'space-y-2.5',
        loyaltyCardClass: 'relative p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-violet-400/50 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm group hover:shadow-lg hover:scale-[1.01]',
        loyaltyCardActiveClass: '!border-violet-500 ring-2 ring-violet-500/20 !bg-gradient-to-br !from-violet-50 !to-purple-50 dark:!from-violet-900/20 dark:!to-purple-900/20',
        loyaltyCardDisabledClass: 'opacity-40 cursor-not-allowed hover:border-gray-200/50 hover:shadow-none hover:scale-100',
        loyaltyRuleNameClass: 'text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent',
        loyaltyPointsCostClass: 'inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold mt-2 shadow-sm',
        loyaltyMinAmountClass: 'text-[10px] text-gray-400 dark:text-gray-500 mt-1.5',
        loyaltySelectButtonClass: 'absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md',
        loyaltySelectedBadgeClass: 'absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md',
        appliedSectionClass: 'mb-5 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-500/20',
        appliedCardClass: 'flex items-center justify-between',
        appliedLabelClass: 'text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide',
        appliedRuleNameClass: 'text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent',
        appliedPointsCostClass: 'text-sm font-medium text-violet-600 dark:text-violet-400',
        removeButtonClass: 'p-2 hover:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400 transition-all',
        removeButtonIconClass: 'w-4 h-4',
        footerClass: 'px-5 py-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-100/50 dark:border-gray-700/50 flex items-center justify-end gap-2',
        cancelButtonClass: 'px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all',
        confirmButtonClass: 'px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all',
        emptyStateClass: 'py-10 text-center',
        emptyStateIconClass: 'w-14 h-14 mx-auto mb-3 text-gray-200 dark:text-gray-700',
        emptyStateTextClass: 'text-gray-400 dark:text-gray-500 text-base',
    },
    cashPopup: {
        overlayClass: 'fixed inset-0 z-[60] bg-gradient-to-br from-slate-900/80 to-blue-900/80 flex items-center justify-center p-4 backdrop-blur-lg',
        modalClass: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20',
        headerClass: 'px-6 py-5 bg-gradient-to-r from-teal-500 to-cyan-600',
        titleClass: 'text-lg font-bold text-white drop-shadow-sm',
        closeButtonClass: 'absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl text-white backdrop-blur-sm transition-all',
        closeButtonIconClass: 'w-4 h-4',
        contentClass: 'p-6 space-y-5',
        rowClass: 'grid grid-cols-12 gap-4 items-center',
        labelClass: 'col-span-4 text-sm font-semibold text-gray-600 dark:text-gray-300',
        inputWrapperClass: 'col-span-8 relative',
        inputClass: 'w-full px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-right focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-bold',
        readOnlyInputClass: 'w-full px-4 py-3 border border-gray-100 dark:border-gray-700/30 rounded-xl bg-gray-100/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-right font-bold cursor-not-allowed',
        currencySymbolClass: 'hidden',
        footerClass: 'px-6 py-5 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-100/50 dark:border-gray-700/50 flex items-center justify-end gap-3',
        cancelButtonClass: 'px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all',
        confirmButtonClass: 'px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-lg hover:shadow-xl transition-all',
    },
    layout: {
        mainContainerClass: 'h-full w-full flex flex-col overflow-hidden',
        contentAreaClass: 'flex-1 flex overflow-hidden',
        productAreaClass: 'flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 bg-gray-50 dark:bg-gray-900',
        orderSidebarClass: 'hidden xl:flex flex-col w-80 lg:w-96 xl:w-[400px] 2xl:w-[440px]',
    },
    mobile: {
        overlayClass: 'fixed inset-0 z-50 bg-black/40 lg:hidden',
        categoryDrawerClass: 'absolute left-0 top-0 h-full w-56 sm:w-64 bg-white border-r',
        categoryDrawerHeaderClass: 'flex items-center justify-between px-2 sm:px-3 py-2 border-b',
        orderDrawerClass: 'fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 transform transition-transform shadow-2xl z-[60] flex flex-col',
        orderDrawerHeaderClass: 'flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800',
    },
    bottomActionBar: {
        show: true,
        wrapperClass: 'bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-1 sm:p-2 md:p-3 lg:p-4 xl:p-5',
        containerClass: 'flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4',
        buttonClass: 'flex items-center space-x-1 sm:space-x-2 md:space-x-3 text-white px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg whitespace-nowrap',
        buttonIconClass: 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5',
        buttonTextClass: 'text-[10px] sm:text-xs md:text-sm lg:text-base',
    },
};

// Export
export const POS_UI_CONFIG = {
    POS_1: POS_1_CONFIG,
    POS_2: POS_2_CONFIG,
    POS_3: POS_3_CONFIG,
    POS_4: POS_4_CONFIG,
    POS_5: POS_5_CONFIG,
} as const;

export type PosScreenType = keyof typeof POS_UI_CONFIG;

export function getPosUIConfig(screen: PosScreenType): PosScreenUIConfig {
    return POS_UI_CONFIG[screen];
}

export function hasPosUIConfig(screen: string): screen is PosScreenType {
    return screen in POS_UI_CONFIG;
}

export default POS_UI_CONFIG;

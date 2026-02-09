"use client";

import React from 'react';
import { FaUser, FaCreditCard, FaCalendar, FaDollarSign, FaPhone, FaEnvelope, FaTimes } from 'react-icons/fa';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { SuperAdminTypes } from '@/types';

// Currency formatting utility function
const formatCurrency = (amount: number | undefined | null, currency: any) => {
  // Handle undefined, null, or NaN amounts
  const safeAmount = amount ?? 0;
  const numAmount = typeof safeAmount === 'number' && !isNaN(safeAmount) ? safeAmount : 0;

  if (!currency) {
    return numAmount.toFixed(2);
  }

  const formattedAmount = numAmount.toFixed(2);
  // Handle both plan currency structure and subscription currencyId structure
  const symbol = currency.symbol || currency.currencySymbol || '';
  const position = String(currency.position || currency.currencyPosition || 'Left').trim();
  // Make position comparison case-insensitive
  const isRight = position.toLowerCase() === 'right';

  if (isRight) {
    return `${formattedAmount}${symbol}`;
  } else {
    return `${symbol}${formattedAmount}`;
  }
};

interface SubscriptionDetailsModalProps {
  readonly subscription: SuperAdminTypes.SubscriptionTypes.SubscriptionData;
  readonly onClose: () => void;
}

const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({ subscription, onClose }) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 cursor-default"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] sm:max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700"
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary to-primaryHover p-4 sm:p-5 md:p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 sm:p-2 transition-all duration-200"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4 pr-8 sm:pr-12">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <FaCreditCard className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 truncate">{Constants.superadminConstants.subscriptiondetails}</h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base">{Constants.superadminConstants.subscriptionbio}</p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-4 sm:px-6 md:px-8 -mt-3 sm:-mt-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 sm:px-5 py-1 sm:py-1.5 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${(subscription.activeSubscription?.status === true) || (subscription.user?.status || 'Active') === 'Active'
              ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'
              : 'bg-gray-400 dark:bg-gray-500'
              }`} />
            <span className={`font-semibold text-xs sm:text-sm ${(subscription.activeSubscription?.status === true) || (subscription.user?.status || 'Active') === 'Active'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-gray-600 dark:text-gray-400'
              }`}>
              {subscription.activeSubscription?.status === true ? 'Active' : subscription.user?.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 pt-3 sm:pt-4 overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(95vh-200px)]">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* User Information Card */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
                </div>
                <span className="truncate">{Constants.superadminConstants.userinformation}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <FaUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.name}</label>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white ml-5 sm:ml-6 break-words">
                    {subscription.activeSubscription?.user?.name || subscription.user?.name || '-'}
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <FaEnvelope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.emaillabel}</label>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-all">
                    {subscription.activeSubscription?.user?.email || subscription.user?.email || '-'}
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <FaPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.phonelabel}</label>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-words">
                    {subscription.activeSubscription?.user?.phone || subscription.user?.phone || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Subscription (New Structure) */}
            {subscription.activeSubscription && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaDollarSign className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
                  </div>
                  <span className="truncate">{Constants.superadminConstants.activesubscriptions}</span>
                </h3>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{Constants.superadminConstants.subscriptionnumber}</h4>
                    <WebComponents.UiComponents.UiWebComponents.Badge className="bg-blue-500 dark:bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-2.5 py-1">
                      {formatCurrency(subscription.activeSubscription.totalAmount, subscription.activeSubscription.currency || subscription.activeSubscription.currencyId)}
                    </WebComponents.UiComponents.UiWebComponents.Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{Constants.superadminConstants.purchasedatelabel}</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {new Date(subscription.activeSubscription.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{Constants.superadminConstants.durationlabel}</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {subscription.activeSubscription.duration} {subscription.activeSubscription.planName.type === 'monthly' ? 'Months' : subscription.activeSubscription.planName.type === 'yearly' ? 'Years' : 'Days'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{Constants.superadminConstants.totalamountlabel}</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {formatCurrency(subscription.activeSubscription.totalAmount, subscription.activeSubscription.currency || subscription.activeSubscription.currencyId)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Expiry Date</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {new Date(subscription.activeSubscription.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {subscription.activeSubscription.planName && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Plan</span> {subscription.activeSubscription.planName.name}
                      </p>
                      {subscription.activeSubscription.planName.description && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{subscription.activeSubscription.planName.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending Subscription (New Structure) - History */}
            {subscription.pendingSubscription && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-600 dark:bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaCalendar className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" />
                  </div>
                  <span className="truncate">Subscription History (Inactive)</span>
                </h3>
                <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{Constants.superadminConstants.subscriptionnumber}</h4>
                    <WebComponents.UiComponents.UiWebComponents.Badge className="bg-yellow-500 dark:bg-yellow-600 text-white text-xs sm:text-sm px-2 sm:px-2.5 py-1">
                      {formatCurrency(subscription.pendingSubscription.totalAmount, subscription.pendingSubscription.currency || subscription.pendingSubscription.currencyId)}
                    </WebComponents.UiComponents.UiWebComponents.Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{Constants.superadminConstants.purchasedatelabel}</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {new Date(subscription.pendingSubscription.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{Constants.superadminConstants.durationlabel}</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {subscription.pendingSubscription.duration} {subscription.pendingSubscription.planName.type === 'monthly' ? 'Months' : subscription.pendingSubscription.planName.type === 'yearly' ? 'Years' : 'Days'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{Constants.superadminConstants.totalamountlabel}</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {formatCurrency(subscription.pendingSubscription.totalAmount, subscription.pendingSubscription.currency || subscription.pendingSubscription.currencyId)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Expiry Date</span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {new Date(subscription.pendingSubscription.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {subscription.pendingSubscription.planName && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">Plan</span> {subscription.pendingSubscription.planName.name}
                      </p>
                      {subscription.pendingSubscription.planName.description && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{subscription.pendingSubscription.planName.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailsModal;


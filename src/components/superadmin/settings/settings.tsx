"use client";

import React from 'react';
import { Constants } from '@/constant';
import { Settings as SettingsIcon, Mail as MailIcon, DollarSign, CreditCard, Languages, FileText, Clock, Shield, Search } from 'lucide-react';
import { SettingsCommonComponents } from './common';
import { ServerActions } from '@/lib';
import { SuperAdminTypes } from '@/types';

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState('general');
  const [loading, setLoading] = React.useState(false);
  const [generalSettings, setGeneralSettings] = React.useState<SuperAdminTypes.SettingTypes.GeneralSettingsTypes.GeneralSettings | null>(null);
  const [miscSettings, setMiscSettings] = React.useState<SuperAdminTypes.SettingTypes.MiscSettingsTypes.MiscSettings | null>(null);
  const [mailSettings, setMailSettings] = React.useState<SuperAdminTypes.SettingTypes.MailSettingsTypes.MailSettings | null>(null);
  const [currencies, setCurrencies] = React.useState<SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting[]>([]);
  const [currencySettings, setCurrencySettings] = React.useState<SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting | null>(null);
  const [paymentConfigs, setPaymentConfigs] = React.useState<SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PaymentConfig[]>([]);
  const [trialSettings, setTrialSettings] = React.useState<SuperAdminTypes.SettingTypes.TrialSettingsTypes.TrialSettings | null>(null);
  const [gdprSettings, setGdprSettings] = React.useState<SuperAdminTypes.SettingTypes.GDPRSettingsTypes.GDPRSettings | null>(null);
  const [seoSettings, setSeoSettings] = React.useState<SuperAdminTypes.SettingTypes.SEOSettingsTypes.SEOSettings | null>(null);

  React.useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'general') {
          const result = await ServerActions.ServerActionslib.getGeneralSettingsAction();
          if (result.success && result.data && result.data.data) {
            setGeneralSettings(result.data.data as SuperAdminTypes.SettingTypes.GeneralSettingsTypes.GeneralSettings);
          }
        } else if (activeTab === 'misc') {
          const result = await ServerActions.ServerActionslib.getSuperAdminMiscSettingsAction();
          if (result.success && result.data && result.data.data) {
            setMiscSettings(result.data.data as SuperAdminTypes.SettingTypes.MiscSettingsTypes.MiscSettings);
          }
        } else if (activeTab === 'mail') {
          const result = await ServerActions.ServerActionslib.getMailSettingsAction();
          if (result.success && result.data && result.data.data) {
            setMailSettings(result.data.data as unknown as SuperAdminTypes.SettingTypes.MailSettingsTypes.MailSettings);
          }
        } else if (activeTab === 'currency') {
          const result = await ServerActions.ServerActionslib.getCurrencySettingsAction();

          if (result.success && result.data && result.data.data && result.data.data.data) {
            const currencyData = result.data.data.data;
            if (Array.isArray(currencyData)) {
              setCurrencies(currencyData as SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting[]);
              // Set the primary currency as currencySettings, or the first one if no primary
              const primaryCurrency = currencyData.find((c: any) => c.isPrimary);
              setCurrencySettings((primaryCurrency || currencyData[0]) as SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting);
            }
          }
        } else if (activeTab === 'payment') {
          const result = await ServerActions.ServerActionslib.getPaymentSettingsAction();
          if (result.success && result.data && result.data.data) {
            const paymentData = Array.isArray(result.data.data) ? result.data.data : result.data.data.data;
            if (Array.isArray(paymentData)) {
              setPaymentConfigs(paymentData as SuperAdminTypes.SettingTypes.PaymentSettingsTypes.PaymentConfig[]);
            }
          }
        } else if (activeTab === 'trial') {
          const result = await ServerActions.ServerActionslib.getTrialSettingsAction();
          if (result.success && result.data && result.data.data) {
            setTrialSettings(result.data.data as SuperAdminTypes.SettingTypes.TrialSettingsTypes.TrialSettings);
          }
        } else if (activeTab === 'gdpr') {
          const result = await ServerActions.ServerActionslib.getGDPRSettingsAction();
          if (result.success && result.data && result.data.data) {
            const gdprData = result.data.data.data;
            if (Array.isArray(gdprData) && gdprData.length > 0) {
              setGdprSettings(gdprData[0] as SuperAdminTypes.SettingTypes.GDPRSettingsTypes.GDPRSettings);
            }
          }
        } else if (activeTab === 'seo') {
          const result = await ServerActions.ServerActionslib.getSEOSettingsAction();
          console.log(result);
          if (result.success && result.data && result.data.data) {
            const seoData = result.data.data.data;
            if (Array.isArray(seoData) && seoData.length > 0) {
              setSeoSettings(seoData[0] as SuperAdminTypes.SettingTypes.SEOSettingsTypes.SEOSettings);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{Constants.superadminConstants.settingsheading}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{Constants.superadminConstants.settingsbio}</p>
      </div>

      <div className="flex gap-6">
        {/* Vertical Sidebar */}
        <div className="w-64 h-fit bg-white dark:bg-darkFilterbar rounded-lg shadow-sm border border-[#F4F5F5] dark:border-[#616161] p-4">
          <nav className="flex flex-col gap-2 text-sm">
            <ul className="flex flex-col gap-2">
              <li>
                <button
                  onClick={() => setActiveTab('general')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'general'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">{Constants.superadminConstants.general}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('misc')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'misc'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">{Constants.superadminConstants.misc}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('mail')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'mail'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <MailIcon className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">{Constants.superadminConstants.mail}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('currency')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'currency'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <DollarSign className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">{Constants.superadminConstants.currency}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'payment'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">{Constants.superadminConstants.payment}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('trial')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'trial'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">Trial Settings</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('gdpr')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'gdpr'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">GDPR Cookie Notice</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'seo'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <Search className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">SEO Settings</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('language')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'language'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <Languages className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">{Constants.superadminConstants.language}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`group relative flex items-center gap-3 w-full transition-all duration-200 rounded-lg py-3 px-3
                    ${activeTab === 'invoice'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-textSmall hover:text-primary hover:bg-indigo-100 dark:text-textSmall dark:hover:text-primary dark:hover:bg-[#243387]'
                    }
                  `}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-poppins font-medium min-h-[1.25rem] flex items-center">Invoice Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white dark:bg-darkFilterbar rounded-lg shadow-sm border border-[#F4F5F5] dark:border-[#616161]">
          {activeTab === 'general' && <SettingsCommonComponents.General generalSettings={generalSettings} />}
          {activeTab === 'misc' && <SettingsCommonComponents.Misc miscSettings={miscSettings} />}
          {activeTab === 'mail' && <SettingsCommonComponents.Mail mailSettings={mailSettings} />}
          {activeTab === 'currency' && <SettingsCommonComponents.Currency currencies={currencies} currencySettings={currencySettings} />}
          {activeTab === 'payment' && <SettingsCommonComponents.Payment paymentConfigs={paymentConfigs} />}
          {activeTab === 'trial' && <SettingsCommonComponents.Trial trialSettings={trialSettings} />}
          {activeTab === 'gdpr' && <SettingsCommonComponents.GDPR gdprSettings={gdprSettings} />}
          {activeTab === 'seo' && <SettingsCommonComponents.SEO seoSettings={seoSettings} />}
          {activeTab === 'language' && <SettingsCommonComponents.Language />}
          {activeTab === 'invoice' && <SettingsCommonComponents.Invoice generalSettings={generalSettings} />}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WebComponents } from '@/components';
import Image from 'next/image';
import intlTelInput from 'intl-tel-input';

// Country type compatible with intl-tel-input
export type Country = {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  dialCode: string;
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
};

interface PhoneInputWithCountryCodeProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  onCountryChange?: (countryCode: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function PhoneInputWithCountryCode({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  onCountryChange,
  placeholder = "Enter a Phone Number",
  className = "",
  required = true
}: PhoneInputWithCountryCodeProps) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const loadCountries = () => {
      try {
        // Get country data from intl-tel-input
        const countryData = intlTelInput.getCountryData();
        // Map intl-tel-input data to our Country type
        const mappedCountries: Country[] = countryData
          .filter((country: any) => country.dialCode) // Filter out countries without dial codes
          .map((country: any) => ({
            name: {
              common: country.name || '',
              official: country.name || '',
            },
            cca2: country.iso2 || '',
            dialCode: `+${country.dialCode}`,
            flags: {
              png: `https://flagcdn.com/w320/${(country.iso2 || '').toLowerCase()}.png`,
              svg: `https://flagcdn.com/${(country.iso2 || '').toLowerCase()}.svg`,
              alt: `Flag of ${country.name || ''}`,
            },
          }))
          .sort((a: Country, b: Country) => a.name.common.localeCompare(b.name.common));
        setCountries(mappedCountries);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCountries();
  }, []);

  const getDialCode = (country: Country): string => {
    return country.dialCode || '';
  };

  const selectedCountry = React.useMemo(() => {
    if (countries.length === 0) return null;
    return countries.find(c => getDialCode(c) === countryCode) || countries.find(c => getDialCode(c) === "+1") || countries[0];
  }, [countries, countryCode]);

  const filteredCountries = React.useMemo(() => {
    if (!searchTerm) return countries;
    const search = searchTerm.toLowerCase();
    return countries.filter(c =>
      c.name.common.toLowerCase().includes(search) ||
      c.cca2.toLowerCase().includes(search) ||
      getDialCode(c).toLowerCase().includes(search)
    );
  }, [countries, searchTerm]);

  const handleSelect = (country: Country) => {
    const dialCode = getDialCode(country);
    onCountryCodeChange(dialCode);
    if (onCountryChange) {
      onCountryChange(country.cca2);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className={`h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] flex items-center justify-center ${className}`}>
        <span className="text-sm text-textSmall dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Combined Input Field */}
      <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] flex items-center px-3 gap-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
        {/* Country Code Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 h-full flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          {selectedCountry && (
            <>
              <Image
                src={selectedCountry.flags.png}
                alt={selectedCountry.flags.alt || selectedCountry.name.common}
                width={36}
                height={27}
                className="object-cover"
              />
              {isOpen ? (
                <ChevronUp className="w-3 h-3 text-textMain dark:text-white" />
              ) : (
                <ChevronDown className="w-3 h-3 text-textMain dark:text-white" />
              )}
            </>
          )}
        </button>

        {/* Country Code Display */}
        {selectedCountry && (
          <span className="text-sm font-medium text-textMain dark:text-white flex-shrink-0">
            {getDialCode(selectedCountry)}
          </span>
        )}

        {/* Phone Number Input */}
        <input
          type="tel"
          placeholder={placeholder}
          value={phoneNumber}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, '');
            // Limit to maximum 15 digits
            const limitedValue = numericValue.slice(0, 15);
            onPhoneNumberChange(limitedValue);
          }}
          maxLength={15}
          minLength={10}
          className="flex-1 h-full bg-transparent border-none outline-none text-textMain dark:text-white placeholder:text-textSmall placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] font-interTight font-medium text-sm leading-[14px]"
          // required={required}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#616161] rounded-[4px] shadow-lg max-h-[300px] overflow-hidden">
            {/* Search Bar */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <WebComponents.UiComponents.UiWebComponents.Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
                autoFocus
              />
            </div>
            {/* Country List */}
            <div className="overflow-y-auto max-h-[240px]">
              {filteredCountries.map((country) => {
                const dialCode = getDialCode(country);
                if (!dialCode) return null;
                return (
                  <button
                    key={country.cca2}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left ${countryCode === dialCode ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    <img
                      src={country.flags.png}
                      alt={country.flags.alt || country.name.common}
                      width={24}
                      height={18}
                      className="object-cover flex-shrink-0"
                      onError={(e) => {
                        if (country.flags.svg && e.currentTarget.src !== country.flags.svg) {
                          e.currentTarget.src = country.flags.svg;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-textMain dark:text-white truncate">
                        {country.name.common}
                      </div>
                    </div>
                    <div className="text-sm text-textSmall dark:text-gray-400">
                      {dialCode}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


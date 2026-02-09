"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Hash } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { BarcodeSuggestion, BarcodeSuggestionDropdownProps } from '@/types/BarcodeSuggestion';

export const BarcodeSuggestionDropdown: React.FC<BarcodeSuggestionDropdownProps> = ({
  suggestions,
  isLoading,
  onSuggestionSelect,
  onInputChange,
  value,
  placeholder = "Enter barcode or scan with barcode scanner",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          onSuggestionSelect(suggestions[highlightedIndex]);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onInputChange(newValue);
    setIsOpen(newValue.length >= 2);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: BarcodeSuggestion) => {
    onSuggestionSelect(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    if (value.length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <FormInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-[35px] pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.productId}-${suggestion.barcode}`}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {suggestion.barcode}
                    </span>
                    {suggestion.sku && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        SKU: {suggestion.sku}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {suggestion.productName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && suggestions.length === 0 && value.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-center text-gray-500">
            <Package className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No barcodes found matching "{value}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

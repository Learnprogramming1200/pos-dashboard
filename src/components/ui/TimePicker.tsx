"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { FormInput } from "./FormInput";

interface TimePickerProps {
  value: string; // HH:mm format (24-hour)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "HH:mm",
  disabled = false,
  className = "",
  id
}: TimePickerProps) {
  const [display24h, setDisplay24h] = useState<string>(""); // "HH:mm"
  const [showDropdown, setShowDropdown] = useState(false);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse 24h time string to parts
  const parse24h = (time24: string): { hh: string; mm: string } => {
    if (!time24) return { hh: '00', mm: '00' };
    const [h, m] = time24.split(':').map(Number);
    return {
      hh: String(h || 0).padStart(2, '0'),
      mm: String(m || 0).padStart(2, '0')
    };
  };

  // Format parts to 24h string
  const format24h = (hh: string, mm: string): string => {
    return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
  };

  // Update form fields when value changes
  useEffect(() => {
    if (value) {
      const { hh, mm } = parse24h(value);
      setDisplay24h(`${hh}:${mm}`);
      setHour(hh);
      setMinute(mm);
    } else {
      setDisplay24h("");
      setHour('00');
      setMinute('00');
    }
  }, [value]);

  // Click outside to close dropdown and auto-save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside the entire TimePicker component
      if (containerRef.current && !containerRef.current.contains(target) && showDropdown) {
        // Auto-save the current time when clicking outside
        const v24 = format24h(hour, minute);
        onChange(v24);
        setShowDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDropdown) {
        // Auto-save the current time when pressing Escape
        const v24 = format24h(hour, minute);
        onChange(v24);
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      // Use capture phase to ensure we catch the event before other handlers
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showDropdown, hour, minute, onChange]);

  // Custom dropdown helpers
  const normalizeTwo = (v: number) => String(Math.max(0, Math.min(59, v))).padStart(2, '0');
  const clampHour24 = (v: number) => {
    if (v < 0) return 23;
    if (v > 23) return 0;
    return v;
  };

  const updateFromParts = (hh: string, mm: string) => {
    setHour(hh);
    setMinute(mm);
    const formatted = format24h(hh, mm);
    setDisplay24h(formatted);
    onChange(formatted);
  };

  const adjustHour = (delta: number) => {
    const current = parseInt(hour, 10) || 0;
    const next = clampHour24(current + delta);
    updateFromParts(String(next).padStart(2, '0'), minute);
  };

  const adjustMinute = (delta: number) => {
    const current = parseInt(minute, 10) || 0;
    const next = normalizeTwo(current + delta);
    updateFromParts(hour, String(next));
  };

  const typeHour = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    const clamped = clampHour24(num);
    updateFromParts(String(clamped).padStart(2, '0'), minute);
  };

  const typeMinute = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    const clamped = normalizeTwo(num);
    updateFromParts(hour, String(clamped));
  };

  // Parse input value and update
  const handleInputChange = (inputValue: string) => {
    // Remove non-numeric characters except colon
    const cleaned = inputValue.replace(/[^0-9:]/g, '');
    setDisplay24h(cleaned);

    // Try to parse as HH:mm
    const match = cleaned.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (match) {
      let h = parseInt(match[1] || '0', 10) || 0;
      let m = parseInt(match[2] || '0', 10) || 0;

      // Clamp values
      h = Math.max(0, Math.min(23, h));
      m = Math.max(0, Math.min(59, m));

      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');

      // Update if we have a valid time
      if (cleaned.includes(':') && match[2] !== undefined) {
        updateFromParts(hh, mm);
      } else {
        setHour(hh);
        setMinute(mm);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative inline-flex items-center w-full">
        <FormInput
          id={id}
          value={display24h}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => {
            // Format and validate on blur
            const { hh, mm } = parse24h(display24h);
            const formatted = format24h(hh, mm);
            setDisplay24h(formatted);
            updateFromParts(hh, mm);
          }}
          placeholder={placeholder}
          onFocus={() => setShowDropdown(true)}
          disabled={disabled}
        />
        <Clock
          onClick={() => !disabled && setShowDropdown((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 cursor-pointer"
        />
      </div>

      {showDropdown && !disabled && (
        <div ref={dropdownRef} className="absolute z-50 mt-2 bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#616161] rounded-md shadow-lg p-3 w-56">
          <div className="grid grid-cols-5 gap-1 items-center text-gray-900 dark:text-white">
            <div className="col-span-2 flex flex-col items-center">
              <button
                type="button"
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => adjustHour(1)}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <input
                className="w-14 text-center border dark:border-[#616161] rounded px-2 py-1 bg-white dark:bg-[#1B1B1B] text-gray-900 dark:text-white"
                value={hour}
                onChange={(e) => typeHour(e.target.value)}
                type="number"
                min="0"
                max="23"
              />
              <button
                type="button"
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => adjustHour(-1)}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <span className="col-span-1 text-center select-none text-lg">:</span>

            <div className="col-span-2 flex flex-col items-center">
              <button
                type="button"
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => adjustMinute(1)}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <input
                className="w-14 text-center border dark:border-[#616161] rounded px-2 py-1 bg-white dark:bg-[#1B1B1B] text-gray-900 dark:text-white"
                value={minute}
                onChange={(e) => typeMinute(e.target.value)}
                // type="number"
                min="0"
                max="59"
              />
              <button
                type="button"
                className="h-5 w-5 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => adjustMinute(-1)}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

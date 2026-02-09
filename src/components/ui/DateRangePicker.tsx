"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-date-range";
// React Date Range CSS - loaded only when this component is used
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { FormInput } from "@/components/ui/FormInput";
import { ServerActions } from "@/lib";

type Props = {
  start: string; // DD-MM-YYYY
  end: string;   // DD-MM-YYYY
  onChange: (next: { start: string; end: string }) => void;
  placeholders?: { start?: string; end?: string };
  disabled?: boolean;
  className?: string;
};

function createShortMonthLocale() {
  return ServerActions.DatePretier.enUSLocale as any;
}

const parseDisplay = (display: string): Date | null => {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display || "");
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (dt.getUTCFullYear() !== yyyy || dt.getUTCMonth() + 1 !== mm || dt.getUTCDate() !== dd) return null;
  return new Date(yyyy, mm - 1, dd);
};

const formatDisplay = (d: Date) => {
  const dd = `${d.getDate()}`.padStart(2, "0");
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function DateRangePicker({ start, end, onChange, placeholders, disabled, className }: Props) {
  const locale = useMemo(createShortMonthLocale, []);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selection, setSelection] = useState<{ startDate: Date; endDate: Date; key: string }>(() => ({
    startDate: parseDisplay(start) || new Date(),
    endDate: parseDisplay(end) || new Date(),
    key: "selection",
  }));

  // Sync selection state when props change
  useEffect(() => {
    const startDate = parseDisplay(start);
    const endDate = parseDisplay(end);
    if (startDate && endDate) {
      setSelection({ startDate, endDate, key: "selection" });
    }
  }, [start, end]);

  const update = (next: { startDate?: Date; endDate?: Date }) => {
    const startDate = next.startDate || selection.startDate;
    const endDate = next.endDate || selection.endDate;
    setSelection({ startDate, endDate, key: "selection" });
    onChange({ start: formatDisplay(startDate), end: formatDisplay(endDate) });
  };

  const parseRangeInput = (value: string): { start: string; end: string } | null => {
    // Try to parse "DD-MM-YYYY to DD-MM-YYYY" format
    const match = value.match(/^(\d{2}-\d{2}-\d{4})\s+to\s+(\d{2}-\d{2}-\d{4})$/i);
    if (match) {
      const startDate = parseDisplay(match[1]);
      const endDate = parseDisplay(match[2]);
      if (startDate && endDate) {
        return { start: match[1], end: match[2] };
      }
    }
    // Try to parse if user is still typing (partial input)
    const parts = value.split(/\s+to\s+/i);
    if (parts.length === 2) {
      const startDate = parseDisplay(parts[0]);
      const endDate = parseDisplay(parts[1]);
      if (startDate && endDate) {
        return { start: parts[0], end: parts[1] };
      }
    }
    return null;
  };

  const displayValue = `${start} to ${end}`;
  const placeholder = placeholders?.start && placeholders?.end 
    ? `${placeholders.start} to ${placeholders.end}`
    : "DD-MM-YYYY to DD-MM-YYYY";

  return (
    <Popover
      open={open}
      onOpenChange={(n) => {
        const active = document.activeElement;
        if (!n && active === inputRef.current) return;
        setOpen(n);
      }}
    >
      {/* Hidden trigger so only input explicitly opens the popover via state */}
      <PopoverTrigger asChild>
        <button type="button" aria-hidden className="sr-only" tabIndex={-1} />
      </PopoverTrigger>

      {/* Use PopoverAnchor to keep the calendar positioned relative to the input */}
      <PopoverAnchor asChild>
        <FormInput
          ref={inputRef as any}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            const value = e.target.value;
            const parsed = parseRangeInput(value);
            if (parsed) {
              onChange(parsed);
              const startDate = parseDisplay(parsed.start);
              const endDate = parseDisplay(parsed.end);
              if (startDate && endDate) {
                update({ startDate, endDate });
              }
            } else {
              // Allow typing even if not fully valid yet
              // Try to extract partial dates
              const parts = value.split(/\s+to\s+/i);
              if (parts.length === 2) {
                onChange({ start: parts[0], end: parts[1] });
              } else if (parts.length === 1 && value.trim()) {
                // If only one part, update start date
                onChange({ start: parts[0], end });
              }
            }
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        variant="minimal"
        side="top"
        sideOffset={8}
        align="start"
        avoidCollisions={true}
        collisionPadding={8}
        className="p-0 w-auto z-50"
        onInteractOutside={(e) => {
          // Allow clicks on calendar navigation buttons
          const target = e.target as HTMLElement;
          if (target?.closest('.rdrPrevButton') || target?.closest('.rdrNextButton') || target?.closest('.rdrPprevButton')) {
            e.preventDefault();
            return;
          }
          if (inputRef.current && inputRef.current.contains(target)) {
            e.preventDefault();
          }
        }}
      >
        <div className="date-range-compact bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#616161] rounded-[4px] shadow-lg relative z-50">
          <DateRange
            onChange={(ranges: any) => {
              const sel = ranges?.selection;
              if (!sel) return;
              update({ startDate: sel.startDate, endDate: sel.endDate });
            }}
            moveRangeOnFirstSelection={false}
            ranges={[selection]}
            months={2}
            direction="horizontal"
            monthDisplayFormat="MMM yyyy"
            locale={locale}
            showDateDisplay={false}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}



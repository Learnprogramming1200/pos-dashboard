"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Calendar as RDRCalendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { FormInput } from "@/components/ui/FormInput";
import { publicAPI, default as api } from "@/lib/api";
import { ServerActions } from "@/lib";
import { useSession } from "next-auth/react";
import { getUserRole } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  /** MUST be ISO: YYYY-MM-DD */
  value: string;
  /** MUST emit ISO: YYYY-MM-DD */
  onChange: (isoDate: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  forceFormat?: string;
};

type SettingsData = {
  dateFormat: string;
  timeZone: string;
  timeFormat: string;
  [key: string]: any;
};

/* =========================================================
   UTILITIES
========================================================= */

function createShortMonthLocale() {
  return ServerActions.DatePretier.enUSLocale as any;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * STRICT parsing — NO guessing, NO fallbacks
 */
function parseDateByFormat(display: string, format: string): Date | null {
  const map: Record<string, number[]> = {
    "DD-MM-YYYY": [0, 1, 2],
    "MM-DD-YYYY": [1, 0, 2],
    "YYYY-MM-DD": [2, 1, 0],
    "DD/MM/YYYY": [0, 1, 2],
    "MM/DD/YYYY": [1, 0, 2],
  };

  const order = map[format];
  if (!order) return null;

  const parts = display.split(/[-/]/).map(Number);
  if (parts.length !== 3) return null;

  const [d, m, y] = [parts[order[0]], parts[order[1]], parts[order[2]]];

  const date = new Date(y, m - 1, d);

  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return date;
}

function formatForUI(date: Date, format: string): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear());

  return format.replace("DD", d).replace("MM", m).replace("YYYY", y);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function SingleDatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  minDate,
  maxDate,
  disablePast,
  forceFormat,
}: Props) {
  const locale = useMemo(createShortMonthLocale, []);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const { data: session } = useSession();
  const user = session?.user;
  const userRole = useMemo(() => getUserRole(user), [user]);

  /* =========================================================
     FETCH SETTINGS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        const response =
          userRole === "admin"
            ? await api.get("/admin/misc-settings")
            : await publicAPI.getMiscellaneousSettings();

        if (mounted && response?.data?.data) {
          setSettings(response.data.data);
        }
      } catch {
        if (mounted) {
          setSettings({
            dateFormat: "DD-MM-YYYY",
            timeZone: "UTC",
            timeFormat: "12",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      mounted = false;
    };
  }, [userRole]);

  const dateFormat = forceFormat || settings?.dateFormat || "DD-MM-YYYY";
  const dynamicPlaceholder = placeholder || dateFormat;

  /* =========================================================
     SYNC ISO VALUE → CALENDAR
  ========================================================= */

  useEffect(() => {
    if (!value) return;

    const parsed = parseDateByFormat(value, "YYYY-MM-DD");
    if (parsed) {
      setCalendarDate(parsed);
    }
  }, [value]);

  /* =========================================================
     DISPLAY VALUE (ISO → UI FORMAT)
  ========================================================= */

  const displayValue = useMemo(() => {
    const parsed = parseDateByFormat(value, "YYYY-MM-DD");
    return parsed ? formatForUI(parsed, dateFormat) : "";
  }, [value, dateFormat]);

  const computedMinDate = useMemo(() => {
    if (disablePast) return startOfDay(new Date());
    return minDate;
  }, [disablePast, minDate]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <FormInput
            ref={inputRef as any}
            type="text"
            value={displayValue}
            placeholder={dynamicPlaceholder}
            disabled={disabled}
            className={cn("pr-8 h-[36px] text-sm", className)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              const parsed = parseDateByFormat(e.target.value, dateFormat);
              if (!parsed) return;

              const iso = toISO(parsed);

              if (
                (computedMinDate &&
                  startOfDay(parsed) < startOfDay(computedMinDate)) ||
                (maxDate && startOfDay(parsed) > startOfDay(maxDate))
              ) {
                return;
              }

              setCalendarDate(parsed);
              onChange(iso);
            }}
          />
        </PopoverTrigger>

        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      <PopoverContent variant="minimal" className="p-0 w-auto -mt-4 z-50">
        <div className="single-date-compact bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[#616161] rounded-[4px] shadow-lg relative z-50">
          <RDRCalendar
            date={calendarDate}
            locale={locale}
            monthDisplayFormat="MMM yyyy"
            minDate={computedMinDate}
            maxDate={maxDate}
            onChange={(d: Date) => {
              const sel = startOfDay(d);

              if (
                (computedMinDate && sel < startOfDay(computedMinDate)) ||
                (maxDate && sel > startOfDay(maxDate))
              ) {
                return;
              }

              setCalendarDate(d);
              onChange(toISO(d));
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

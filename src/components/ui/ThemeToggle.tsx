"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CiLight, CiDark } from "react-icons/ci";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(systemTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const getCurrentTheme = () => {
    if (!mounted) return "light";
    if (theme === "system") return systemTheme || "light";
    return theme;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-slate-500 dark:text-slate-400 hover:text-teal-600 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {mounted && (getCurrentTheme() === "dark" ? <CiLight className="w-5 h-5" /> : <CiDark className="w-5 h-5" />)}
    </Button>
  );
} 
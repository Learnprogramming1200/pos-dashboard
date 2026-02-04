"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { CiLight, CiDark } from "react-icons/ci";

export function DarkModeToggle({ className }: { className?: string }) {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className={`flex items-center rounded-full p-0 h-10 bg-[#F5F6FA] dark:bg-[#111111] ${className || ''}`}>
                <button className="w-10 h-10 rounded-full flex items-center justify-center">
                    <CiLight className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center">
                    <CiDark className="w-5 h-5" />
                </button>
            </div>
        );
    }

    const activeTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark';

    return (
        <div
            className={`flex items-center rounded-full p-0 h-10 ${activeTheme === 'dark' ? 'bg-[#111111]' : 'bg-[#F5F6FA]'
                } ${className || ''}`}
        >
            <button
                aria-label="Light mode"
                onClick={() => setTheme('light')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTheme === 'light'
                    ? 'bg-white shadow-md text-[#1E1E24]'
                    : 'text-[#828A90] hover:text-[#fafdff]'
                    }`}
            >
                <CiLight className="w-5 h-5" />
            </button>
            <button
                aria-label="Dark mode"
                onClick={() => setTheme('dark')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTheme === 'dark'
                    ? 'bg-[#31394D] shadow-md text-white'
                    : 'text-[#828A90] hover:text-[#484849]'
                    }`}
            >
                <CiDark className="w-5 h-5" />
            </button>
        </div>
    );
}

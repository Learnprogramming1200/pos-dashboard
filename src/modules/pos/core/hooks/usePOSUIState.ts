'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { CashierInfo, RegisterInfo } from '../pos.types';
// import { Constants } from '@/constant';

// Default values
const DEFAULT_CASHIER: CashierInfo = {
    id: 'default',
    name: 'Cashier',
    avatar: "",
};

const DEFAULT_REGISTER: RegisterInfo = {
    id: 'REG-001',
    name: 'Register 1',
};

export interface UsePOSUIStateOptions {
    userName?: string;
    userId?: string;
}

export interface UsePOSUIStateReturn {
    // Fullscreen
    isFullscreen: boolean;
    toggleFullscreen: () => void;

    // Dark Mode
    darkMode: boolean;
    toggleDarkMode: () => void;

    // Calculator
    isCalculatorOpen: boolean;
    setIsCalculatorOpen: (open: boolean) => void;

    // Customer Modal
    isAddCustomerModalOpen: boolean;
    setIsAddCustomerModalOpen: (open: boolean) => void;

    // Time
    currentTime: Date;
    formattedDate: string;
    formattedTime: string;

    // Cashier/Register Info
    cashierInfo: CashierInfo;
    registerInfo: RegisterInfo;

    // Navigation
    handleBack: () => void;
}

export function usePOSUIState(options: UsePOSUIStateOptions = {}): UsePOSUIStateReturn {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Calculator state
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    // Customer Modal state
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

    // Time state
    const [currentTime, setCurrentTime] = useState(() => new Date());

    // Derived: Dark mode
    const darkMode = theme === 'dark';

    // Derived: Cashier info
    const cashierInfo: CashierInfo = {
        ...DEFAULT_CASHIER,
        name: options.userName || DEFAULT_CASHIER.name,
        id: options.userId || DEFAULT_CASHIER.id,
    };

    // Derived: Register info
    const registerInfo: RegisterInfo = DEFAULT_REGISTER;

    // Derived: Formatted time strings
    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error('Error exiting fullscreen:', err);
            });
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = useCallback(() => {
        setTheme(darkMode ? 'light' : 'dark');
    }, [darkMode, setTheme]);

    // Handle back navigation
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return {
        isFullscreen,
        toggleFullscreen,
        darkMode,
        toggleDarkMode,
        isCalculatorOpen,
        setIsCalculatorOpen,
        isAddCustomerModalOpen,
        setIsAddCustomerModalOpen,
        currentTime,
        formattedDate,
        formattedTime,
        cashierInfo,
        registerInfo,
        handleBack,
    };
}

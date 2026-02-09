import React from "react";
import { createPortal } from "react-dom";

export interface StatusSelectProps {
    currentStatus: string;
    onStatusChange: (status: string) => void;
}

const StatusSelectReturn = ({
    currentStatus,
    onStatusChange,
}: StatusSelectProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    /** Status colors */
    const statusColors: Record<string, string> = {
        Draft:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800",
        Approved:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
        Returned:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800",
        Credited:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
        Closed:
            "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800",
        Cancelled:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800",
        Pending:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800",
        Completed:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
    };

    /** Allowed transitions */
    const getAvailableOptions = (status: string): string[] => {
        switch (status.toLowerCase()) {
            case "draft":
                return ["Approved", "Closed"];
            case "approved":
                return ["Returned", "Closed"];
            case "returned":
                return ["Credited"];
            case "credited":
                return ["Closed"];
            case "closed":
            case "cancelled":
                return [];
            case "pending":
                return ["Completed"];
            case "completed":
                return ["Pending"];
            default:
                return [];
        }
    };

    const availableOptions = getAvailableOptions(currentStatus);
    const isDisabled = availableOptions.length === 0;

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDisabled) return;

        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 5,
                left: rect.left + rect.width / 2 - 72, // center align (w-36)
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                disabled={isDisabled}
                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 ${isDisabled
                    ? `${statusColors[currentStatus]} cursor-not-allowed opacity-75`
                    : `${statusColors[currentStatus]} hover:opacity-80 cursor-pointer`
                    }`}
            >
                {currentStatus}
                {!isDisabled && (
                    <svg
                        className={`ml-1.5 w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {isOpen &&
                !isDisabled &&
                typeof document !== "undefined" &&
                createPortal(
                    <>
                        <div
                            className="fixed inset-0 z-[10000]"
                            onClick={() => setIsOpen(false)}
                        />
                        <div
                            className="fixed z-[10001] w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 animate-in fade-in zoom-in-95 duration-100"
                            style={{ top: position.top, left: position.left }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {availableOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onStatusChange(option);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${option === "Draft"
                                            ? "bg-gray-500"
                                            : option === "Approved"
                                                ? "bg-blue-500"
                                                : option === "Returned"
                                                    ? "bg-yellow-500"
                                                    : option === "Credited"
                                                        ? "bg-green-500"
                                                        : option === "Closed"
                                                            ? "bg-indigo-500"
                                                            : "bg-red-500"
                                            }`}
                                    />
                                    {option}
                                </button>
                            ))}
                        </div>
                    </>,
                    document.getElementById("portal-root") || document.body
                )}
        </>
    );
};

export default StatusSelectReturn;

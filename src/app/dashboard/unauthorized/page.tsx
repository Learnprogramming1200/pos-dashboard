/**
 * Unauthorized Page
 * 
 * Displayed when a user attempts to access a page they don't have permission for.
 */

import Link from 'next/link';
import { FaLock, FaHome } from 'react-icons/fa';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl" />
                <FaLock className="relative h-24 w-24 text-red-500" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Access Denied
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaHome className="h-4 w-4" />
                    Go to Dashboard
                </Link>
            </div>

            <div className="mt-16 text-sm text-gray-500 dark:text-gray-500">
                <p>Error Code: 403 - Forbidden</p>
            </div>
        </div>
    );
}

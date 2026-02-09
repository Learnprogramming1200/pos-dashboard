"use client";

import React, { useState } from 'react';

export default function RazorpayConfigChecker() {
  const [isVisible, setIsVisible] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    keyConfigured: boolean;
    keyValue: string;
    environment: string;
  } | null>(null);

  const checkConfig = () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RBTbErXtZd68Hg';
    const isConfigured = Boolean(key && key !== 'rzp_test_YOUR_KEY_HERE' && key.length > 0);
    
    setConfigStatus({
      keyConfigured: isConfigured,
      keyValue: key || 'Not set',
      environment: process.env.NODE_ENV || 'development'
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        🔧 Check Razorpay Config
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Razorpay Configuration
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={checkConfig}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check Configuration
        </button>

        {configStatus && (
          <div className="space-y-2">
            <div className={`p-2 rounded text-sm ${
              configStatus.keyConfigured 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              <strong>Key Status:</strong> {configStatus.keyConfigured ? '✅ Configured' : '❌ Not Configured'}
            </div>

            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              <strong>Environment:</strong> {configStatus.environment}
            </div>

            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
              <strong>Key Value:</strong> 
              <div className="font-mono text-xs mt-1 break-all">
                {configStatus.keyValue}
              </div>
            </div>

            {!configStatus.keyConfigured && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm">
                <strong>To fix this:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create a <code>.env.local</code> file in your frontend directory</li>
                  <li>Add: <code>NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY</code></li>
                  <li>Get your key from <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Razorpay Dashboard</a></li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


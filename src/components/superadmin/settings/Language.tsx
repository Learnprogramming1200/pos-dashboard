import React from 'react';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';

const Language = () => {
    const [selectedLanguage, setSelectedLanguage] = React.useState('');
    const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState('');
    const [showFileDropdown, setShowFileDropdown] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    const handleSaveLanguageSettings = async () => {
        setSavedSection('language');
        setTimeout(() => setSavedSection(null), 2000);
        // Implement real API call here if available
    };

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Select Language Option */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Language Option <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-left outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white dark:bg-gray-800"
                            >
                                <span className={selectedLanguage ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                    {selectedLanguage || 'Select Language Option'}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showLanguageDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('(AR) العربي');
                                                setShowLanguageDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            (AR) العربي
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('(EN) English');
                                                setShowLanguageDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            (EN) English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('(ES) Español');
                                                setShowLanguageDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            (ES) Español
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('(FR) Français');
                                                setShowLanguageDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            (FR) Français
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLanguage('(DE) Deutsch');
                                                setShowLanguageDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            (DE) Deutsch
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Select File to be translate */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select File to be translate <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowFileDropdown(!showFileDropdown)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 text-left outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white dark:bg-gray-800"
                            >
                                <span className={selectedFile ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                    {selectedFile || 'Select File to be translate'}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showFileDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile('auth');
                                                setShowFileDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            auth
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile('backup');
                                                setShowFileDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            backup
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile('constant');
                                                setShowFileDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            constant
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile('currency');
                                                setShowFileDropdown(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-blue-100 dark:hover:bg-gray-700 focus:bg-blue-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white"
                                        >
                                            currency
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSaveLanguageSettings}
                    showStatus={savedSection === 'language'}
                >
                    {Constants.superadminConstants.savelanguagesettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default Language;

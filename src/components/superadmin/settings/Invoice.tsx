import React from 'react';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { ServerActions } from '@/lib';
import { toast } from 'react-toastify';
import { SuperAdminTypes } from '@/types';

interface InvoiceProps {
    generalSettings: SuperAdminTypes.SettingTypes.GeneralSettingsTypes.GeneralSettings | null;
}

const Invoice = ({ generalSettings: initialSettings }: InvoiceProps) => {
    const [invoicePrefix, setInvoicePrefix] = React.useState('');
    const [invoiceNumberFormat, setInvoiceNumberFormat] = React.useState('');
    const [invoiceFooter, setInvoiceFooter] = React.useState('');
    const [invoiceTerms, setInvoiceTerms] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (initialSettings) {
            setInvoicePrefix(initialSettings.invoicePrefix || '');
            setInvoiceNumberFormat(initialSettings.invoiceNumberFormat || '');
            setInvoiceFooter(initialSettings.invoiceFooter || '');
            setInvoiceTerms(initialSettings.invoiceTerms || false);
        }
    }, [initialSettings]);

    const handleSaveInvoiceSettings = async () => {
        setIsLoading(true);
        try {
            // Need to update general settings with these fields
            const result = await ServerActions.ServerActionslib.updateGeneralSettingsAction({
                invoicePrefix,
                invoiceNumberFormat,
                invoiceFooter,
                invoiceTerms
            });

            if (result.success) {
                toast.success('Invoice settings saved successfully!');
                setSavedSection('invoice');
                setTimeout(() => setSavedSection(null), 2000);
            } else {
                toast.error(result.error || 'Failed to save invoice settings');
            }
        } catch (error) {
            console.error('Error saving invoice settings:', error);
            toast.error('Failed to save invoice settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="invoicePrefix">Invoice Prefix</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="invoicePrefix"
                            value={invoicePrefix}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoicePrefix(e.target.value)}
                        />
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="invoiceNumberFormat">Invoice Number Format</WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput
                            id="invoiceNumberFormat"
                            value={invoiceNumberFormat}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceNumberFormat(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="invoiceFooter">Invoice Footer Notes</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <textarea
                        id="invoiceFooter"
                        value={invoiceFooter}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInvoiceFooter(e.target.value)}
                        rows={3}
                        className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-3 pt-2 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall dark:placeholder-gray-400 placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[100px] resize-vertical"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <WebComponents.UiComponents.UiWebComponents.Switch
                        checked={invoiceTerms}
                        onCheckedChange={setInvoiceTerms}
                    />
                    <label htmlFor="invoiceTerms" className="text-sm font-medium text-gray-700 dark:text-gray-300">{Constants.superadminConstants.includetermsandconditions}</label>
                </div>
            </div>
            <div className="mt-8">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSaveInvoiceSettings}
                    showStatus={savedSection === 'invoice'}
                    disabled={isLoading}
                >
                    {Constants.superadminConstants.saveinvoicesettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default Invoice;

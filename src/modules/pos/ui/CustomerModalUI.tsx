import React from 'react';
import { X } from 'lucide-react';
import type { PosCustomerModalConfig } from './pos-ui.config';
import { PhoneInputWithCountryCode } from '@/components/ui/PhoneInputWithCountryCode';

export interface CustomerModalUIProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { customerName: string; phone: string; email: string }) => Promise<void>;
    uiConfig: PosCustomerModalConfig;
}

export function CustomerModalUI({ isOpen, onClose, onSubmit, uiConfig }: CustomerModalUIProps) {
    const [customerName, setCustomerName] = React.useState('');
    const [countryCode, setCountryCode] = React.useState('+91');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Combine country code and phone number (same as CustomerForm)
            const fullPhone = `${countryCode}${phoneNumber}`.trim();
            await onSubmit({ customerName, phone: fullPhone, email });
            // Reset form on success
            setCustomerName('');
            setCountryCode('+91');
            setPhoneNumber('');
            setEmail('');
            onClose();
        } catch (err: any) {
            console.error('Error adding customer:', err);
            setError(err.message || 'Failed to add customer');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={uiConfig.overlayClass} onClick={onClose}>
            <div className={uiConfig.modalClass} onClick={e => e.stopPropagation()}>
                <div className={uiConfig.headerClass}>
                    <h3 className={uiConfig.titleClass}>Add New Customer</h3>
                    <button onClick={onClose} className={uiConfig.closeButtonClass}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={uiConfig.contentClass}>
                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Customer Name */}
                        <div className={uiConfig.formGroupClass}>
                            <label className={uiConfig.labelClass}>Customer Name</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className={uiConfig.inputClass}
                                required
                                placeholder="Enter Customer Name"
                            />
                        </div>

                        {/* Phone with Country Code */}
                        <div className={uiConfig.formGroupClass}>
                            <label className={uiConfig.labelClass}>Phone No</label>
                            <PhoneInputWithCountryCode
                                countryCode={countryCode}
                                phoneNumber={phoneNumber}
                                onCountryCodeChange={setCountryCode}
                                onPhoneNumberChange={setPhoneNumber}
                                placeholder="Enter Phone Number"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className={uiConfig.formGroupClass}>
                            <label className={uiConfig.labelClass}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={uiConfig.inputClass}
                                placeholder="Enter Email Address"
                            />
                        </div>
                    </div>

                    <div className={uiConfig.footerClass}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={uiConfig.cancelButtonClass}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={uiConfig.submitButtonClass}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

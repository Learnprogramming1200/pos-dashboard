"use client";
import React from 'react';
import { Constants } from '@/constant';
import { WebComponents } from '@/components';
import { SuperAdminTypes } from '@/types';

import { ServerActions } from '@/lib';

interface CurrencyFormProps {
    currency: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting | null;
    setLoading: (loading: boolean) => void;
    setShowModal: (show: boolean) => void;
    setEditingCurrency: (currency: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting | null) => void;
    onCancel: () => void;
    allCurrencies: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting[];
    onCurrencySaved: (currency: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => void;
}

export function CurrencyForm({ currency, setLoading, setShowModal, setEditingCurrency, onCancel, allCurrencies, onCurrencySaved }: CurrencyFormProps) {
    const [formData, setFormData] = React.useState<SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyFormData>({
        currencyName: currency?.currencyName || '',
        currencySymbol: currency?.currencySymbol || '',
        currencyCode: currency?.currencyCode || '',
        currencyPosition: currency?.currencyPosition || 'Left',
        thousandSeparator: currency?.thousandSeparator || ',',
        decimalSeparator: currency?.decimalSeparator || '.',
        numberOfDecimals: currency?.numberOfDecimals || 2,
    });

    const handleAdd = async (data: any) => {
        setLoading(true);
        try {
            const result = await ServerActions.ServerActionslib.createCurrencyAction(data);
            if (result.success) {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Currency added successfully." });
                onCurrencySaved(result.data);
                setShowModal(false);
            } else {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: result.error || "Failed to add currency." });
            }
        } catch (error) {
            console.error("Error adding currency:", error);
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "Failed to add currency." });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (data: any) => {
        if (!currency) return;
        setLoading(true);
        try {
            const id = currency._id || (currency as any).id;
            const result = await ServerActions.ServerActionslib.updateCurrencyAction(String(id), data);
            if (result.success) {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: "Currency updated successfully." });
                onCurrencySaved(result.data);
                setShowModal(false);
                setEditingCurrency(null);
            } else {
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: result.error || "Failed to update currency." });
            }
        } catch (error) {
            console.error("Error updating currency:", error);
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: "Failed to update currency." });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const submitData: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencyFormData = {
            ...formData,
            isPrimary: currency?.isPrimary || false,
        };

        if (currency) {
            handleEdit(submitData);
        } else {
            handleAdd(submitData);
        }
    };

    return (
        <form id="currency-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="currencyName">Currency Name *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="currencyName"
                        value={formData.currencyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, currencyName: e.target.value }))}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="currencySymbol">Currency Symbol *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="currencySymbol"
                        value={formData.currencySymbol}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="currencyCode">Currency Code *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="currencyCode"
                        value={formData.currencyCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, currencyCode: e.target.value }))}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="currencyPosition">
                        {Constants.superadminConstants.currentlypositionlabel}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                        id="currencyPosition"
                        value={formData.currencyPosition}
                        onChange={e => setFormData(prev => ({ ...prev, currencyPosition: e.target.value as "Left" | "Right" }))}
                        className="mt-1"
                    >
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Left">Left</WebComponents.UiComponents.UiWebComponents.FormOption>
                        <WebComponents.UiComponents.UiWebComponents.FormOption value="Right">Right</WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="thousandSeparator">Thousand Separator *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="thousandSeparator"
                        value={formData.thousandSeparator}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, thousandSeparator: e.target.value }))}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="decimalSeparator">Decimal Separator *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="decimalSeparator"
                        value={formData.decimalSeparator}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, decimalSeparator: e.target.value }))}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="numberOfDecimals">Number of Decimals *</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="numberOfDecimals"
                        type="number"
                        value={formData.numberOfDecimals?.toString() || '2'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, numberOfDecimals: Number(e.target.value) }))}
                        required
                        className="mt-1"
                    />
                </div>
            </div>
        </form>
    );
}

import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { HiPlus, HiArrowLeft } from 'react-icons/hi';
import { WebComponents } from '@/components';
import { CommonComponents } from '@/components/common';
import { ServerActions } from '@/lib';
import { SuperAdminTypes } from '@/types';
import { CurrencyForm } from './CurrencyForm';

interface CurrencyProps {
    currencies: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting[];
    currencySettings: any;
}

const Currency = ({ currencies: initialCurrencies, currencySettings: initialSettings }: CurrencyProps) => {
    const [currencies, setCurrencies] = React.useState<SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting[]>(initialCurrencies || []);
    const [showModal, setShowModal] = React.useState(false);
    const [editingCurrency, setEditingCurrency] = React.useState<SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting | null>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (initialCurrencies) setCurrencies(initialCurrencies);
    }, [initialCurrencies]);

    const handleSetDefaultCurrency = React.useCallback(async (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting, checked: boolean) => {
        if (checked) {
            const id = row._id || (row as any).id;
            try {
                // Optimistic update
                setCurrencies(prev => prev.map(c => ({
                    ...c,
                    isPrimary: (c._id || (c as any).id) === id
                })));

                const result = await ServerActions.ServerActionslib.updateCurrencySettingsAction({
                    currency: id
                });

                if (result.success) {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Default currency updated successfully!' });
                } else {
                    // Revert if failed
                    setCurrencies(prev => prev.map(c => ({
                        ...c,
                        isPrimary: (c._id || (c as any).id) !== id
                    })));
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: result.error || 'Failed to update default currency' });
                }
            } catch (error) {
                console.error('Error updating default currency:', error);
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Failed to update default currency' });
            }
        }
    }, []);

    const handleDelete = React.useCallback(async (id: string) => {
        const result = await WebComponents.UiComponents.UiWebComponents.SwalHelper.confirm({
            title: 'Are you sure?',
            text: 'You want to delete this currency? This action cannot be undone.',
            icon: 'warning',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await ServerActions.ServerActionslib.deleteAdminCurrencyAction(id);
                if (deleteResult.success) {
                    setCurrencies(prev => prev.filter(c => (c._id || (c as any).id) !== id));
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Currency deleted successfully!' });
                } else {
                    WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: deleteResult.error || 'Failed to delete currency' });
                }
            } catch (error) {
                console.error('Error deleting currency:', error);
                WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Failed to delete currency' });
            }
        }
    }, []);

    const tableColumns = React.useMemo(() => CommonComponents.createColumns<SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting>({
        fields: [
            {
                name: "Currency Name",
                selector: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => row.currencyName,
                sortable: true
            },
            {
                name: "Code",
                selector: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => row.currencyCode,
                sortable: true
            },
            {
                name: "Symbol",
                selector: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => row.currencySymbol,
                sortable: true
            },
            {
                name: "Position",
                selector: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => row.currencyPosition,
                sortable: true
            },
            {
                name: "Decimals",
                selector: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => row.numberOfDecimals,
                sortable: true
            },
            {
                name: "Default",
                selector: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => row.isPrimary ? 'Yes' : 'No',
                cell: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => (
                    <WebComponents.UiComponents.UiWebComponents.Switch
                        checked={row.isPrimary || false}
                        onCheckedChange={(checked) => handleSetDefaultCurrency(row, checked)}
                    />
                ),
                sortable: false
            }
        ],
        actions: [
            {
                render: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="editaction"
                        onClick={() => {
                            setEditingCurrency(row);
                            setShowModal(true);
                        }}
                    >
                        <FaEdit className="w-4 h-4" />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
            {
                render: (row: SuperAdminTypes.SettingTypes.CurrencySettingsTypes.CurrencySetting) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="deleteaction"
                        onClick={() => handleDelete(row._id || (row as any).id)}
                        disabled={row.isPrimary}
                        className={row.isPrimary ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        <FaTrash className={`w-4 h-4 ${row.isPrimary ? 'text-gray-400' : ''}`} />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
        ],
    }), [handleSetDefaultCurrency, handleDelete]); // Dependencies for useMemo

    return (
        <div className='p-6'>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {showModal ? (editingCurrency ? 'Edit Currency' : 'Add Currency') : 'Currency Settings'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                        Manage supported currencies
                    </p>
                </div>
                <WebComponents.UiComponents.UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        setShowModal(!showModal);
                        setEditingCurrency(null);
                    }}
                >
                    {showModal ? (
                        <>
                            <HiArrowLeft className="w-4 h-4" />
                            Back
                        </>
                    ) : (
                        <>
                            <HiPlus className="w-4 h-4" />
                            Add New Currency
                        </>
                    )}
                </WebComponents.UiComponents.UiWebComponents.Button>
            </div>

            {!showModal && (
                <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full overflow-hidden">
                    <CommonComponents.DataTable
                        columns={tableColumns}
                        data={currencies}
                        useCustomPagination={false} // Client-side pagination for now
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </div>
            )}

            {/* Modal for Add/Edit - reusing simple structure but wrapped in AdminFormModal logic or simple div if easier */}
            {showModal && (
                <WebComponents.UiComponents.UiWebComponents.AdminFormModal
                    formId="currency-form"
                    onClose={() => {
                        setShowModal(false);
                        setEditingCurrency(null);
                    }}
                    loading={loading}
                >
                    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4 p-4 sm:p-5 md:p-6 lg:p-8">
                        <CurrencyForm
                            currency={editingCurrency}
                            setLoading={setLoading}
                            setShowModal={setShowModal}
                            setEditingCurrency={setEditingCurrency}
                            onCancel={() => {
                                setShowModal(false);
                                setEditingCurrency(null);
                            }}
                            allCurrencies={currencies}
                            onCurrencySaved={(savedCurrency) => {
                                setCurrencies(prev => {
                                    const savedId = savedCurrency._id || (savedCurrency as any).id;
                                    const exists = prev.some(c => (c._id || (c as any).id) === savedId);
                                    if (exists) {
                                        return prev.map(c => {
                                            const cId = c._id || (c as any).id;
                                            return cId === savedId ? savedCurrency : c;
                                        });
                                    }
                                    return [...prev, savedCurrency];
                                });
                            }}
                        />
                    </div>
                </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
            )}
        </div>
    );
};

export default Currency;

"use client";
import React from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FaEdit, FaTrash } from "react-icons/fa";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { customHooks } from "@/hooks";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { PaginationType } from "@/types";
import CurrencyForm, { CurrencyFormData } from "@/components/admin/forms/CurrencyForm";

// Define Currency type 
interface Currency extends CurrencyFormData {
    _id: string;
    isPrimary?: boolean;
}

export default function CurrencySetting({
    initialCurrencies,
    initialPagination,
}: {
    initialCurrencies: Currency[];
    initialPagination: PaginationType.Pagination;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [currencies, setCurrencies] = React.useState<Currency[]>(initialCurrencies);
    const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editingCurrency, setEditingCurrency] = React.useState<Currency | null>(null);
    const [loading, setLoading] = React.useState(false);
    const { filteredData } = customHooks.useListFilters<Currency>(
        currencies,
    );

    // Sync state with props when URL params change (server re-fetches data)
    React.useEffect(() => {
        setCurrencies(initialCurrencies);
        setPagination(initialPagination);
    }, [initialCurrencies, initialPagination]);

    // Add
    const handleAdd = async (formData: CurrencyFormData) => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData,
            createAction: ServerActions.ServerActionslib.createAdminCurrencyAction,
            setLoading,
            setShowModal,
            router,
            successMessage: "Currency added successfully.",
            errorMessage: "Failed to add currency.",
            checkExistsError: (errorMessage) => errorMessage.toLowerCase().includes("already exists"),
        });
    };

    // Edit
    const handleEdit = async (formData: CurrencyFormData) => {
        await ServerActions.HandleFunction.handleEditCommon({
            formData,
            editingItem: editingCurrency,
            getId: (item) => item._id,
            updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateAdminCurrencyAction(String(id), data),
            setLoading,
            setShowEditModal,
            setEditingItem: setEditingCurrency,
            router,
            successMessage: "Currency updated successfully.",
            errorMessage: "Failed to update currency.",
            checkExistsError: (errorMessage) => errorMessage.toLowerCase().includes("already exists"),
        });
    };

    // Delete
    const handleDelete = React.useCallback(async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteAdminCurrencyAction(String(id)),
            setLoading,
            router,
            successMessage: "Currency deleted successfully.",
            errorMessage: "Failed to delete currency.",
        });
    }, [router]);

    const handleEditModal = React.useCallback((currency: Currency) => {
        setEditingCurrency(currency);
        setShowEditModal(true);
    }, []);

    // Set Primary Toggle
    const handleSetPrimary = React.useCallback(async (row: Currency, checked: boolean) => {
        if (checked) {
            try {
                setLoading(true);
                const result = await ServerActions.ServerActionslib.setAdminCurrencyPrimaryAction(row._id);
                if (result.success) {
                    // Update local state to reflect the new primary currency
                    setCurrencies(prev => prev.map(curr => ({
                        ...curr,
                        isPrimary: curr._id === row._id
                    })));
                    UiWebComponents.SwalHelper.success({ text: `${row.currencyName} set as primary currency!` });
                } else {
                    UiWebComponents.SwalHelper.error({ text: result.error || 'Failed to set primary currency' });
                }
            } catch (error) {
                console.error('Error setting primary currency:', error);
                UiWebComponents.SwalHelper.error({ text: 'Failed to set primary currency' });
            } finally {
                setLoading(false);
            }
        } else {
            // Cannot unset primary - show warning
            UiWebComponents.SwalHelper.warning({
                title: 'Cannot Unset Primary Currency',
                text: 'You cannot unset the primary currency. Please set another currency as primary first.',
            });
        }
    }, []);

    const tableColumns = React.useMemo(() => CommonComponents.createColumns<Currency>({
        fields: [
            {
                name: "Currency Name",
                selector: (row: Currency) => row.currencyName,
                sortable: true
            },
            {
                name: "Code",
                selector: (row: Currency) => row.currencyCode,
                sortable: true
            },
            {
                name: "Symbol",
                selector: (row: Currency) => row.currencySymbol,
                sortable: true
            },
            {
                name: "Position",
                selector: (row: Currency) => row.currencyPosition,
                sortable: true
            },
            {
                name: "Decimals",
                selector: (row: Currency) => row.numberOfDecimals,
                sortable: true
            },
            {
                name: "Is Primary",
                selector: (row: Currency) => row.isPrimary ? 'Yes' : 'No',
                cell: (row: Currency) => (
                    <UiWebComponents.Switch
                        checked={row.isPrimary || false}
                        onCheckedChange={(checked: boolean) => handleSetPrimary(row, checked)}
                        disabled={loading}
                    />
                ),
                sortable: false
            }
        ],
        actions: [
            {
                render: (row) => (
                    <UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
                        <FaEdit className="w-4 h-4" />
                    </UiWebComponents.Button>
                ),
            },
            {
                render: (row) => (
                    <UiWebComponents.Button
                        size="icon"
                        variant="deleteaction"
                        onClick={() => handleDelete(row._id)}
                        disabled={row.isPrimary}
                        className={row.isPrimary ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        <FaTrash className={`w-4 h-4 ${row.isPrimary ? 'text-gray-400' : ''}`} />
                    </UiWebComponents.Button>
                ),
            },
        ],
    }), [handleEditModal, handleDelete, handleSetPrimary, loading]);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {showModal || showEditModal ? `Currency Settings > ${showModal ? 'Add Currency' : 'Edit Currency'}` : 'Currency Settings'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Manage currencies for your system</p>
                </div>
                <UiWebComponents.Button
                    variant="addBackButton"
                    onClick={() => {
                        if (showModal || showEditModal) {
                            setShowModal(false);
                            setShowEditModal(false);
                            setEditingCurrency(null);
                        } else {
                            setShowModal(true);
                        }
                    }}
                >
                    {showModal || showEditModal ? (
                        <>
                            <HiArrowLeft className="w-4 h-4" />
                            Back
                        </>
                    ) : (
                        <>
                            <HiPlus className="w-4 h-4" />
                            Add
                        </>
                    )}
                </UiWebComponents.Button>
            </div>

            {/* Show filters and table only when modal is not open */}
            {!showModal && !showEditModal && (
                <>
                    {/* DataTable */}
                    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
                        <CommonComponents.DataTable
                            columns={tableColumns}
                            data={filteredData}
                            useCustomPagination={true}
                            totalRecords={pagination.totalItems}
                            filteredRecords={pagination.totalItems}
                            paginationPerPage={pagination.itemsPerPage}
                            paginationDefaultPage={pagination.currentPage}
                            paginationRowsPerPageOptions={[5, 10, 25, 50]}
                            onChangePage={(page) => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", page.toString());
                                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                            }}
                            onChangeRowsPerPage={(perPage) => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("limit", perPage.toString());
                                params.set("page", "1");
                                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                            }}
                            useUrlParams={true}
                        />
                    </div>
                </>
            )}

            {/* Add / Edit Modal */}
            {(showModal || showEditModal) && (
                <UiWebComponents.AdminFormModal
                    formId="currency-form"
                    onClose={() => {
                        setShowModal(false);
                        setShowEditModal(false);
                        setEditingCurrency(null);
                    }}
                    loading={loading}
                >
                    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4 p-4 sm:p-5 md:p-6 lg:p-8">
                        {editingCurrency ? (
                            <CurrencyForm
                                onSubmit={handleEdit}
                                initialData={editingCurrency}
                            />
                        ) : (
                            <CurrencyForm
                                onSubmit={handleAdd}
                            />
                        )}
                    </div>
                </UiWebComponents.AdminFormModal>
            )}
        </>
    );
}

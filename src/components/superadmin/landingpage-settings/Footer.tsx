import React from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { HiPlus } from "react-icons/hi";
import { Constants } from "@/constant";
import { ServerActions } from "@/lib";
import { WebComponents } from "@/components";
import { LandingFormModels } from "./FormModels";
import { SuperAdminTypes } from "@/types";

const Footer = ({ initialFooterSection }: {
    readonly initialFooterSection: SuperAdminTypes.LandingSettingPageTypes.FooterSection
}) => {
    const router = useRouter();
    const [footerSectionLoading, setFooterSectionLoading] = React.useState(false);
    const [footerSectionError, setFooterSectionError] = React.useState<string | null>(null);
    const [footerLinkPage, setFooterLinkPage] = React.useState(1);
    const [footerLinkPerPage, setFooterLinkPerPage] = React.useState(10);
    const [showFooterLinkModal, setShowFooterLinkModal] = React.useState(false);
    const [showEditFooterLinkModal, setShowEditFooterLinkModal] = React.useState(false);
    const [editingFooterLink, setEditingFooterLink] = React.useState<{ id: string; data: any } | null>(null);
    const [footerLinkFormData, setFooterLinkFormData] = React.useState({
        title: "",
        description: "",
        status: true
    });
    const [selectedFooterLinkRows, setSelectedFooterLinkRows] = React.useState<any[]>([]);
    const [clearSelectedFooterLinkRows, setClearSelectedFooterLinkRows] = React.useState(false);
    const [footerLinkActionFilter, setFooterLinkActionFilter] = React.useState('All');
    const [footerLinkActiveStatusFilter, setFooterLinkActiveStatusFilter] = React.useState('All');
    const [settings, setSettings] = React.useState({
        footer: {
            _id: initialFooterSection?._id || "",
            cta: {
                title: initialFooterSection?.cta?.title || "Ready to Transform Your Business?",
                subtitle: initialFooterSection?.cta?.subtitle || "Join thousands of successful businesses using POSPro. Start your free trial today and experience the difference a modern POS system can make."
            },
            links: initialFooterSection?.links || []
        }
    });

    // Reset action filter when no rows are selected
    React.useEffect(() => {
        if (selectedFooterLinkRows.length === 0) {
            setFooterLinkActionFilter('All');
            setFooterLinkActiveStatusFilter('All');
        }
    }, [selectedFooterLinkRows]);

    const clearSelectedData = () => {
        setClearSelectedFooterLinkRows(prev => !prev);
        setSelectedFooterLinkRows([]);
        router.refresh();
    };

    // Sync settings if initialFooterSection changes
    React.useEffect(() => {
        if (initialFooterSection) {
            setSettings({
                footer: {
                    _id: initialFooterSection._id || "",
                    cta: {
                        title: initialFooterSection.cta?.title || "Ready to Transform Your Business?",
                        subtitle: initialFooterSection.cta?.subtitle || "Join thousands of successful businesses using POSPro. Start your free trial today and experience the difference a modern POS system can make."
                    },
                    links: initialFooterSection.links || []
                }
            });
        }
    }, [initialFooterSection]);

    const updateNestedField = (
        section: "footer",
        nestedField: "cta",
        field: string,
        value: string
    ) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [nestedField]: {
                    ...prev[section][nestedField],
                    [field]: value,
                },
            },
        }));

        if (section === "footer") {
            setFooterSectionError(null);
        }
    };

    const handleSaveFooterCTA = async () => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData: settings.footer.cta,
            createAction: ServerActions.ServerActionslib.createFooterCTAAction,
            setLoading: setFooterSectionLoading,
            setShowModal: () => { }, // No modal for CTA section
            router,
            successMessage: 'Footer CTA saved successfully.',
            errorMessage: 'Failed to save footer CTA.',
            onSuccess: (result) => {
                const created = result?.data?.data || result?.data;
                if (created?._id) {
                    setSettings(prev => ({
                        ...prev,
                        footer: {
                            ...prev.footer,
                            _id: created._id,
                            cta: created.cta ?? prev.footer.cta
                        }
                    }));
                }
            },
            onError: (error) => {
                setFooterSectionError(error);
            }
        });
    };

    const handleEditFooterLink = (row: any) => {
        if (!row._id || row._id.startsWith('temp_') || row._id === '') {
            setFooterSectionError("Cannot edit link with temporary ID. Please refresh and try again.");
            return;
        }

        setEditingFooterLink({ id: row._id, data: row });
        setFooterLinkFormData({
            title: row.title || "",
            description: row.description || "",
            status: row.status ?? true
        });
        setShowEditFooterLinkModal(true);
        setFooterSectionError(null);
    };

    const handleDeleteFooterLink = async (id: string) => {
        await ServerActions.HandleFunction.handleDeleteCommon({
            id,
            deleteAction: (id) => ServerActions.ServerActionslib.deleteFooterLinkAction(String(id)),
            setLoading: setFooterSectionLoading,
            router,
            successMessage: "Footer link deleted successfully.",
            onSuccess: () => {
                setSettings(prev => ({
                    ...prev,
                    footer: { ...prev.footer, links: prev.footer.links.filter((link: any) => link._id !== id) }
                }));
            }
        });
    };

    const handleToggleFooterLinkStatus = React.useCallback(async (row: any, checked: boolean) => {
        await ServerActions.HandleFunction.handleToggleStatusCommon({
            row,
            next: checked,
            getId: (r) => r._id,
            preparePayload: (r, next) => ({
                title: r.title,
                description: r.description,
                status: next
            }),
            updateAction: (id, data) => ServerActions.ServerActionslib.updateFooterLinkAction(String(id), data),
            setLoading: setFooterSectionLoading,
            router,
            onSuccess: () => {
                setSettings(prev => ({
                    ...prev,
                    footer: {
                        ...prev.footer,
                        links: prev.footer.links.map((l: any) =>
                            l._id === row._id ? { ...l, status: checked } : l
                        )
                    }
                }));
            }
        });
    }, [router]);

    const handleAddFooterLink = async () => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData: footerLinkFormData,
            createAction: (data) => {
                if (settings.footer._id) {
                    return ServerActions.ServerActionslib.appendFooterLinkAction(settings.footer._id, data);
                } else {
                    return ServerActions.ServerActionslib.createFooterSectionAction({
                        cta: settings.footer.cta,
                        links: [data]
                    });
                }
            },
            setLoading: setFooterSectionLoading,
            setShowModal: setShowFooterLinkModal,
            router,
            successMessage: "Footer link added successfully.",
            onSuccess: (result) => {
                const created = result?.data?.data || result?.data;
                if (!settings.footer._id && created?._id) {
                    // Case: New section was created
                    setSettings(prev => ({
                        ...prev,
                        footer: {
                            ...prev.footer,
                            _id: created._id,
                            links: created.links || prev.footer.links,
                            cta: created.cta || prev.footer.cta
                        }
                    }));
                } else {
                    // Case: Link was appended to existing section
                    const createdLink = created;
                    const updatedLinks = result?.data?.links || result?.data?.data?.links || [
                        ...settings.footer.links,
                        { ...footerLinkFormData, _id: createdLink?._id || "" }
                    ];
                    setSettings(prev => ({
                        ...prev,
                        footer: { ...prev.footer, links: updatedLinks }
                    }));
                }
                setFooterLinkFormData({ title: "", description: "", status: true });
            }
        });
    };

    const handleBulkApply = React.useCallback(async () => {
        await ServerActions.HandleFunction.handleBulkApplyCommon({
            selectedRows: selectedFooterLinkRows,
            actionFilter: footerLinkActionFilter,
            activeStatusFilter: footerLinkActiveStatusFilter,
            items: settings.footer.links,
            setItems: (updatedLinks) => setSettings(prev => ({
                ...prev,
                footer: { ...prev.footer, links: updatedLinks }
            })),
            bulkDeleteAction: async ({ ids }) => {
                const results = await Promise.all(ids.map(id => ServerActions.ServerActionslib.deleteFooterLinkAction(id)));
                const success = results.every(r => r.success);
                router.refresh();
                return { success, message: success ? "Selected footer links deleted successfully." : "Some links failed to delete." };
            },
            bulkUpdateStatusAction: async ({ ids, status }) => {
                const results = await Promise.all(ids.map(id => {
                    const row = settings.footer.links.find((l: any) => l._id === id);
                    return ServerActions.ServerActionslib.updateFooterLinkAction(id, {
                        title: row?.title || "",
                        description: row?.description || "",
                        status
                    });
                }));
                router.refresh();
                return { success: results.every(r => r.success) };
            },
            clearSelectedData,
            idSelector: (r: any) => r._id,
        });
    }, [selectedFooterLinkRows, footerLinkActionFilter, footerLinkActiveStatusFilter, settings.footer.links, router]);

    const handleUpdateFooterLink = async () => {
        await ServerActions.HandleFunction.handleEditCommon({
            formData: footerLinkFormData,
            editingItem: editingFooterLink,
            getId: (item) => item.id,
            updateAction: (id, data: any) => ServerActions.ServerActionslib.updateFooterLinkAction(String(id), data),
            setLoading: setFooterSectionLoading,
            setShowEditModal: setShowEditFooterLinkModal,
            setEditingItem: setEditingFooterLink,
            router,
            successMessage: "Footer link updated successfully.",
            onSuccess: () => {
                setSettings(prev => ({
                    ...prev,
                    footer: {
                        ...prev.footer,
                        links: prev.footer.links.map((l: any) =>
                            (l._id === editingFooterLink?.id)
                                ? { ...l, ...footerLinkFormData }
                                : l
                        )
                    }
                }));
                setFooterLinkFormData({ title: "", description: "", status: true });
            }
        });
    };

    const handleToggleFooterLinkStatusById = React.useCallback(async (id: string, checked: boolean) => {
        const row = settings.footer.links.find((l: any) => l._id === id);
        if (row) {
            await handleToggleFooterLinkStatus(row, checked);
        }
    }, [settings.footer.links, handleToggleFooterLinkStatus]);

    const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns({
        fields: [
            {
                name: "Title",
                selector: (row: any) => row.title,
                sortable: true,
            },
            {
                name: "Description",
                selector: (row: any) => row.description,
                sortable: true,
                cell: (row: any) => (
                    <div className="max-w-xs truncate" title={row.description}>
                        {row.description}
                    </div>
                ),
            },
        ],
        status: {
            name: "Status",
            idSelector: (row: any) => row._id,
            valueSelector: (row: any) => !!row.status,
            onToggle: handleToggleFooterLinkStatusById,
        },
        actions: [
            {
                render: (row: any) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="editaction"
                        onClick={() => handleEditFooterLink(row)}
                    >
                        <Edit className="w-4 h-4" />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
            {
                render: (row: any) => (
                    <WebComponents.UiComponents.UiWebComponents.Button
                        size="icon"
                        variant="deleteaction"
                        onClick={() => handleDeleteFooterLink(row._id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </WebComponents.UiComponents.UiWebComponents.Button>
                ),
            },
        ],
    }), [handleToggleFooterLinkStatusById, handleDeleteFooterLink]);

    const footerLinksData = React.useMemo(() => {
        return settings.footer.links.map((link: any, index: number) => ({
            ...link,
            _index: index
        }));
    }, [settings.footer.links]);

    return (
        <div className="m-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Footer Section</h2>
            {footerSectionError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {footerSectionError}
                </div>
            )}

            <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">CTA Section</h1>
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    <div className="flex flex-col gap-4">
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="cta-title">
                                CTA Title
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput
                                id="cta-title"
                                value={settings.footer.cta.title}
                                onChange={(e) => updateNestedField("footer", "cta", "title", e.target.value)}
                            />
                        </div>
                        <div>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="cta-description">
                                CTA Description
                            </WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.Textarea
                                id="cta-description"
                                value={settings.footer.cta.subtitle}
                                onChange={(e) => updateNestedField("footer", "cta", "subtitle", e.target.value)}
                            />
                        </div>
                        <WebComponents.UiComponents.UiWebComponents.Button
                            variant="save"
                            disabled={footerSectionLoading}
                            onClick={handleSaveFooterCTA}
                        >
                            {footerSectionLoading ? "Saving..." : "Save CTA Section"}
                        </WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                </div>
            </div>

            <h1 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-4">Bottom Side</h1>
            <div className="bg-white dark:bg-darkFilterbar h-full w-full overflow-hidden border border-[#ffffff] rounded-[4px]">
                <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
                    actionFilter={footerLinkActionFilter}
                    onActionFilterChange={(value: string) => {
                        setFooterLinkActionFilter(value);
                        if (value !== "Status") {
                            setFooterLinkActiveStatusFilter("All");
                        }
                    }}
                    actionOptions={Constants.commonConstants.actionOptions}
                    activeStatusFilter={footerLinkActiveStatusFilter}
                    onActiveStatusFilterChange={setFooterLinkActiveStatusFilter}
                    activeStatusOptions={Constants.commonConstants.activeStatusOptions}
                    selectedCount={selectedFooterLinkRows.length}
                    onApply={handleBulkApply}
                    showCategoryFilter={false}
                    showSearch={false}
                    statusFilter=""
                    onStatusFilterChange={() => { }}
                    searchTerm=""
                    onSearchTermChange={() => { }}
                    renderExports={false}
                />

                <div className="flex justify-end p-3 border-t border-gray-100 dark:border-gray-800">
                    <WebComponents.UiComponents.UiWebComponents.Button
                        onClick={() => setShowFooterLinkModal(true)}
                        variant="addBackButton"
                    >
                        <HiPlus className="w-4 h-4" />
                        {Constants.superadminConstants.add}
                    </WebComponents.UiComponents.UiWebComponents.Button>
                </div>

                <div>
                    <WebComponents.WebCommonComponents.CommonComponents.DataTable
                        data={footerLinksData}
                        columns={tableColumns}
                        selectableRows
                        onSelectedRowsChange={({ selectedRows }) => setSelectedFooterLinkRows(selectedRows)}
                        clearSelectedRows={clearSelectedFooterLinkRows}
                        useCustomPagination={true}
                        totalRecords={footerLinksData.length}
                        filteredRecords={footerLinksData.length}
                        paginationPerPage={footerLinkPerPage}
                        paginationDefaultPage={footerLinkPage}
                        paginationRowsPerPageOptions={[5, 10, 25, 50]}
                        onChangePage={(page) => setFooterLinkPage(page)}
                        onChangeRowsPerPage={(perPage) => {
                            setFooterLinkPerPage(perPage);
                            setFooterLinkPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Footer Link Add Modal */}
            {showFooterLinkModal && (
                <LandingFormModels.FooterFormModel
                    title="Add Footer Link"
                    onClose={() => {
                        setShowFooterLinkModal(false);
                        setFooterLinkFormData({ title: "", description: "", status: true });
                    }}
                    onSubmit={handleAddFooterLink}
                    formData={footerLinkFormData}
                    setFormData={setFooterLinkFormData}
                    footerLinkLoading={footerSectionLoading}
                />
            )}

            {/* Footer Link Edit Modal */}
            {showEditFooterLinkModal && editingFooterLink && (
                <LandingFormModels.FooterFormModel
                    title="Edit Footer Link"
                    onClose={() => {
                        setShowEditFooterLinkModal(false);
                        setEditingFooterLink(null);
                        setFooterLinkFormData({ title: "", description: "", status: true });
                    }}
                    onSubmit={handleUpdateFooterLink}
                    formData={footerLinkFormData}
                    setFormData={setFooterLinkFormData}
                    footerLinkLoading={footerSectionLoading}
                />
            )}
        </div>
    );
};

export default Footer;

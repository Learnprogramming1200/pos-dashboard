"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FaEdit } from "react-icons/fa";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes, PaginationType, SearchParamsTypes } from "@/types";
import { RichTextEditorRef } from '@/components/ui/RichTextEditor';

export default function AdminEmailNotificationTemplates({
  initialTemplates,
  initialPagination
}: {
 readonly initialTemplates: AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [templates, setTemplates] = React.useState<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate[]>(initialTemplates);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [downloadData, setDownloadData] = React.useState<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [activeField, setActiveField] = React.useState<'emailSubject' | 'emailContent' | null>(null);
  const [selectedUserType, setSelectedUserType] = React.useState<string>('');
  const [isEditing, setIsEditing] = React.useState(false);
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate>(
    templates,
  )

  // Sync state with props when URL params change (server re-fetches data)
  React.useEffect(() => {
    setTemplates(initialTemplates);
    setPagination(initialPagination);
  }, [initialTemplates, initialPagination]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Sync URL with Search
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchTerm]);

  const emailEditorRef = React.useRef<RichTextEditorRef>(null);

  // Dynamic user type options based on 'To' field selection
  const getUserTypeOptions = React.useCallback((toValues: string[]) => {
    const options: { name: string; value: string }[] = [];

    if (toValues.includes('customer')) {
      options.push({ name: 'Customer', value: 'customer' });
    }

    if (toValues.includes('user')) {
      options.push({ name: 'User', value: 'user' });
    }

    if (toValues.includes('admin')) {
      options.push({ name: 'Admin', value: 'admin' });
    }

    if (toValues.includes('supplier')) {
      options.push({ name: 'Supplier', value: 'supplier' });
    }

    if (toValues.includes('manager')) {
      options.push({ name: 'Manager', value: 'manager' });
    }

    return options;
  }, []);

  // Ensure we always have a template entry for the currently selected user type
  const ensureUserTypeTemplate = React.useCallback((prev: any, userType: string) => {
    if (!prev || !userType) return prev;
    const updated = { ...prev };
    if (!updated.templates) {
      updated.templates = [];
    }

    const hasTemplate = updated.templates.some((t: any) => t.userType === userType);
    if (!hasTemplate) {
      updated.templates.push({
        userType,
        email: {
          subject: '',
          content: '',
        },
      });
    }

    return updated;
  }, []);

  const handleParameterClick = (param: string) => {
    const formattedParam = param.toLowerCase().replace(/\s+/g, '_');
    const placeholder = `{{${formattedParam}}}`;

    if (activeField === 'emailSubject') {
      setEditingTemplate((prev: any) => prev ? { ...prev, emailSubject: (prev.emailSubject || '') + placeholder } : null);
    } else if (activeField === 'emailContent') {
      if (emailEditorRef.current) {
        emailEditorRef.current.insertContent(placeholder);
      }
    }
  };

  const handleEditModal = React.useCallback((template: AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate) => {
    setEditingTemplate(template);
    setSelectedUserType(template.templates?.[0]?.userType || '');
    setShowEditModal(true);
    setIsEditing(true);
  }, []);

  const handleCloseEdit = () => {
    setIsEditing(false);
    setShowEditModal(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setLoading(true);

    try {
      // Always create new template
      const result = await ServerActions.ServerActionslib.createMailTemplateAction(editingTemplate as any);

      if (result.success) {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Email template created successfully!' });
        setIsEditing(false);
        setShowEditModal(false);
        setEditingTemplate(null);
        // Refresh the data by refetching
        window.location.reload();
      } else {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: result.error || 'Failed to create template' });
      }
    } catch (error: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: error.message || 'Failed to create template' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApply = React.useCallback(async () => {
    const ids = selectedRows.map(r => r._id);
    if (actionFilter !== 'Status') {
      return;
    }
    if (activeStatusFilter === 'All') {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Please select a status.' });
      return;
    }
    const isActive = activeStatusFilter === 'Active';
    try {
      const result = await Promise.all(ids.map(id => ServerActions.ServerActionslib.toggleMailTemplateStatusAction(id)));
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Status updated successfully.' });
      clearSelectedData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply status.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
    }
  }, [actionFilter, activeStatusFilter, selectedRows]);

  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }

  const handleToggleStatus = React.useCallback(async (row: AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate, next: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (row) => row._id,
      preparePayload: (row, next) => {
        return {
          label: row.label,
          type: row.type,
          to: row.to,
          templates: row.templates,
          status: next,
        };
      },
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.toggleMailTemplateStatusAction(String(id)),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
      errorMessage: "Failed to update status.",
    });
  }, [router]);

  // Wrapper function to convert id-based toggle to row-based toggle
  const handleToggleStatusById = React.useCallback(
    async (id: string, next: boolean) => {
      const template = templates.find(t => t._id === id);
      if (template) {
        await handleToggleStatus(template, next);
      }
    },
    [templates, handleToggleStatus]
  );

  const tableColumns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate>({
    fields: [
      {
        name: "Template Label",
        selector: (row: AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate) => row.label,
        sortable: true
      },
      {
        name: "Type",
        selector: (row: AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate) => row.type,
        sortable: true
      },
      {
        name: "To",
        selector: (row: AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate) => Array.isArray(row.to) ? row.to.join(', ') : (row.to || '-'),
        sortable: true
      },
    ],
    status: {
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.status,
      onToggle: handleToggleStatusById,
    },
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditModal(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleToggleStatusById, handleEditModal]);

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    return WebComponents.WebCommonComponents.CommonComponents.generateExportColumns<AdminTypes.NotificationTypes.EmailNotificationTypes.EmailNotificationTemplate>([
      {
        key: "label",
        label: "Template Label",
        accessor: (row) => row.label || '-',
        pdfWidth: 40
      },
      {
        key: "type",
        label: "Type",
        accessor: (row) => row.type || '-',
        pdfWidth: 30
      },
      {
        key: "to",
        label: "To",
        accessor: (row) => Array.isArray(row.to) ? row.to.join(', ') : (row.to || '-'),
        pdfWidth: 30
      },
      {
        key: "status",
        label: "Status",
        accessor: (row) => row.status ? 'Active' : 'Inactive',
        pdfWidth: 25
      }
    ]);
  }, []);

  const downloadPdf = async (): Promise<any[]> => {
    const selectedRowsIds = selectedRows.map(item => item._id);
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const filterDatas: SearchParamsTypes.DownloadSearchParams = {
      isActive: undefined,
      search: undefined
    };
    if (isActive) {
      filterDatas.isActive = isActive ? true : false
    }
    if (search) {
      filterDatas.search = search
    }
    let res;
    if (selectedRowsIds.length > 0) {
      // res = await ServerActions.ServerActionslib.bulkGetSelectedEmailTemplatesAction({ ids: selectedRowsIds });
      res = { data: { data: { data: selectedRows } } };
    } else {
      // res = await ServerActions.ServerActionslib.bulkGetEmailTemplatesAction(filterDatas);
      res = { data: { data: { data: templates } } };
    }
    const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : [];
    setDownloadData(rows);
    return rows;
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showEditModal ? `Email Notification Templates > Edit Template` : 'Email Notification Templates'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Manage and customize email notification templates for your system</p>
        </div>
      </div>

      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
            <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
              actionFilter={actionFilter}
              onActionFilterChange={(value: string) => {
                setActionFilter(value);
                if (value !== "Status") {
                  setActiveStatusFilter("All");
                }
              }}
              actionOptions={Constants.commonConstants.actionOptions}
              activeStatusFilter={activeStatusFilter}
              onActiveStatusFilterChange={setActiveStatusFilter}
              activeStatusOptions={Constants.commonConstants.activeStatusOptions}
              selectedCount={selectedRows.length}
              onApply={handleBulkApply}
              categoryFilter="All"
              onCategoryFilterChange={() => { }}
              categoryOptions={[]}
              statusFilter={statusFilter}
              onStatusFilterChange={(value: string) => {
                const validValue = value === "Active" || value === "Inactive" ? value : "All";
                setStatusFilter(validValue);
              }}
              statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              renderExports={
                <>
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={downloadData}
                    columns={exportColumns.csvColumns}
                    filename={`email-templates-${new Date().toISOString().split('T')[0]}.csv`}
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'CSV exported successfully.' });
                      clearSelectedData();
                      return data;
                    }}
                  >
                    <button
                      type="button"
                      className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                      aria-label="Download CSV"
                      title="Download CSV"
                    >
                      <Image src={Constants.assetsIcon.assets.csv} alt="CSV" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={downloadData}
                    columns={exportColumns.pdfColumns}
                    filename={`email-templates-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="Email Templates Report"
                    orientation="landscape"
                    onExport={async () => {
                      const data = await downloadPdf();
                      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'PDF exported successfully.' });
                      clearSelectedData();
                      return data;
                    }}
                  >
                    <button
                      type="button"
                      className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                      aria-label="Download PDF"
                      title="Download PDF"
                    >
                      <Image src={Constants.assetsIcon.assets.pdf} alt="PDF" width={28} height={28} className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" />
                    </button>
                  </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
                </>
              }
            />
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
              columns={tableColumns}
              data={filteredData}
              selectableRows
              clearSelectedRows={clearSelectedRows}
              onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
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
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="email-template-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingTemplate(null);
            setIsEditing(false);
          }}
          loading={loading}
          wrapInForm
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSaveTemplate();
          }}
        >
          {showEditModal && editingTemplate && (
            <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
              <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  {/* Type - Non-editable display field */}
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="template-type">
                      {Constants.adminConstants.notificationTemplateStrings.templateType}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B] flex items-center px-3">
                      <span className="text-sm text-textMain dark:text-white">
                        {editingTemplate.type || ''}
                      </span>
                    </div>
                  </div>

                  {/* To */}
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="template-to">
                      {Constants.adminConstants.notificationTemplateStrings.to}<span className="text-required">*</span>
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                      id="template-to"
                      name="template-to"
                      multiselect
                      placeholder={Constants.adminConstants.notificationTemplateStrings.selectRecipients}
                      value={Array.isArray(editingTemplate.to) ? editingTemplate.to : (editingTemplate.to ? [editingTemplate.to] : [])}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const newToValues = e.target.value as unknown as string[];
                        setEditingTemplate((prev: any) => {
                          if (!prev) return null;
                          const updated = { ...prev, to: newToValues };
                          if (selectedUserType && !newToValues.includes(selectedUserType)) {
                            setSelectedUserType(newToValues[0] || '');
                          }
                          return updated;
                        });
                      }}
                      required
                    >
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="admin">
                        {Constants.adminConstants.notificationTemplateStrings.recipientOptions.admin}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="manager">
                        {Constants.adminConstants.notificationTemplateStrings.recipientOptions.manager}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="supplier">
                        {Constants.adminConstants.notificationTemplateStrings.recipientOptions.supplier}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="customer">
                        {Constants.adminConstants.notificationTemplateStrings.recipientOptions.customer}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                      <WebComponents.UiComponents.UiWebComponents.FormOption value="user">
                        {Constants.adminConstants.notificationTemplateStrings.recipientOptions.user}
                      </WebComponents.UiComponents.UiWebComponents.FormOption>
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  </div>

                  {/* User Type */}
                  <div className="col-span-1">
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="user-type">
                      {Constants.adminConstants.notificationTemplateStrings.userType}
                    </WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormDropdown
                      id="user-type"
                      name="user-type"
                      value={selectedUserType}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserType(e.target.value)}
                      disabled={!editingTemplate.to || (Array.isArray(editingTemplate.to) ? editingTemplate.to.length === 0 : !editingTemplate.to)}
                    >
                      {getUserTypeOptions(Array.isArray(editingTemplate.to) ? editingTemplate.to : (editingTemplate.to ? [editingTemplate.to] : [])).map(option => (
                        <WebComponents.UiComponents.UiWebComponents.FormOption key={option.value} value={option.value}>
                          {option.name}
                        </WebComponents.UiComponents.UiWebComponents.FormOption>
                      ))}
                    </WebComponents.UiComponents.UiWebComponents.FormDropdown>
                  </div>
                </div>

                {/* Parameters */}
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <WebComponents.UiComponents.UiWebComponents.FormLabel>
                    {Constants.adminConstants.notificationTemplateStrings.dynamicParameters}
                  </WebComponents.UiComponents.UiWebComponents.FormLabel>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Constants.adminConstants.notificationTemplateStrings.parameters.map(param => (
                      <WebComponents.UiComponents.UiWebComponents.Badge
                        key={param}
                        variant="outline"
                        className="cursor-pointer bg-white text-[#121E3E] border border-[#121E3E] hover:bg-blue-600 hover:text-white hover:border-transparent transition-all px-3 py-1 text-xs rounded-[4px] dark:bg-darkFilterbar dark:text-white dark:border-gray-600 dark:hover:bg-blue-600"
                        onClick={() => handleParameterClick(param)}
                      >
                        {param}
                      </WebComponents.UiComponents.UiWebComponents.Badge>
                    ))}
                  </div>
                </div>

                {/* Email Template */}
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-base sm:text-lg font-semibold text-textMain dark:text-white">
                      {Constants.adminConstants.notificationTemplateStrings.emailTemplate}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email-subject">
                        {Constants.adminConstants.notificationTemplateStrings.subject}
                      </WebComponents.UiComponents.UiWebComponents.FormLabel>
                      <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="email-subject"
                        name="email-subject"
                        type="text"
                        placeholder={Constants.adminConstants.notificationTemplateStrings.enterEmailSubject}
                        value={editingTemplate.templates?.find(t => t.userType === selectedUserType)?.email?.subject || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newSubject = e.target.value;
                          setEditingTemplate((prev: any) => {
                            if (!prev) return null;
                            let updated = ensureUserTypeTemplate(prev, selectedUserType);
                            if (!updated) return null;
                            if (updated.templates) {
                              updated.templates = updated.templates.map((template: any) => {
                                if (template.userType === selectedUserType) {
                                  return {
                                    ...template,
                                    email: {
                                      ...template.email,
                                      subject: newSubject
                                    }
                                  };
                                }
                                return template;
                              });
                            }
                            return updated;
                          });
                        }}
                        onFocus={() => setActiveField('emailSubject')}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <WebComponents.UiComponents.UiWebComponents.FormLabel>Content</WebComponents.UiComponents.UiWebComponents.FormLabel>
                      <WebComponents.UiComponents.UiWebComponents.RichTextEditor
                        key={`email-${editingTemplate._id || 'new'}-${selectedUserType}`}
                        ref={emailEditorRef}
                        value={editingTemplate.templates?.find(t => t.userType === selectedUserType)?.email?.content || ''}
                        onChange={(val) => {
                          setEditingTemplate(prev => {
                            if (!prev) return null;
                            let updated = ensureUserTypeTemplate(prev, selectedUserType);
                            if (!updated) return null;
                            if (updated.templates) {
                              updated.templates = updated.templates.map((template: any) => {
                                if (template.userType === selectedUserType) {
                                  return {
                                    ...template,
                                    email: {
                                      ...template.email,
                                      content: val
                                    }
                                  };
                                }
                                return template;
                              });
                            }
                            return updated;
                          });
                        }}
                        onFocus={() => setActiveField('emailContent')}
                        placeholder="Enter email template content..."
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}
    </>
  );
}

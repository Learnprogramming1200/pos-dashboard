"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditorRef } from '@/components/ui/RichTextEditor';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { HiArrowLeft } from 'react-icons/hi';
import { ServerActions } from '@/lib';
import { Constants } from '@/constant';
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { SuperAdminTypes,PaginationType } from '@/types';
export default function NotificationTemplates({initialTemplates,initialPagination
}: {
  readonly initialTemplates: SuperAdminTypes.NotificationTypes.FlatNotificationTemplate[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const [templates, setTemplates] = React.useState<any[]>(initialTemplates);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const router = useRouter();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredData } = customHooks.useListFilters<SuperAdminTypes.NotificationTypes.FlatNotificationTemplate>(
    templates
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<Partial<SuperAdminTypes.NotificationTypes.FlatNotificationTemplate> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [actionFilter, setActionFilter] = React.useState(Constants.superadminConstants.allStatusFilter);
  const [activeStatusFilter, setActiveStatusFilter] = React.useState(Constants.superadminConstants.allStatusFilter);
  const [activeField, setActiveField] = React.useState<'notificationSubject' | 'notificationContent' | 'emailSubject' | 'emailContent' | null>(null);
  const [selectedUserType, setSelectedUserType] = React.useState<string>('');
  const [selectedRows, setSelectedRows] = React.useState<SuperAdminTypes.NotificationTypes.FlatNotificationTemplate[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const notificationEditorRef = React.useRef<RichTextEditorRef>(null);
  const emailEditorRef = React.useRef<RichTextEditorRef>(null);
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
        notification: {
          subject: '',
          content: '',
        },
        email: {
          subject: '',
          content: '',
        },
      });
    }
    return updated;
  }, []);
  
  // Dynamic user type options based on 'To' field selection
  const getUserTypeOptions = React.useCallback((toValues: string[]) => {
    const options: { name: string; value: string }[] = [];
    
    if (toValues.includes('customer')) {
      options.push({ name: Constants.superadminConstants.userTypeCustomer, value: 'customer' });
    }
    
    if (toValues.includes('user')) {
      options.push({ name: Constants.superadminConstants.userTypeUser, value: 'user' });
    }
    
    if (toValues.includes('admin')) {
      options.push({ name: Constants.superadminConstants.userTypeAdmin, value: 'admin' });
    }
    
    if (toValues.includes('manager')) {
      options.push({ name: Constants.superadminConstants.userTypeManager, value: 'manager' });
    }
    if (toValues.includes('supplier')) {
      options.push({ name: Constants.superadminConstants.userTypeSupplier, value: 'supplier' });
    }
    if (toValues.includes('superadmin')) {
      options.push({ name: Constants.superadminConstants.userTypeSuperadmin, value: 'superadmin' });
    }
    
    return options;
  }, []);

  // Sync state with props
  React.useEffect(() => {
    setTemplates(initialTemplates);
    setPagination(initialPagination);
  }, [initialTemplates]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter(Constants.superadminConstants.allStatusFilter);
      setActiveStatusFilter(Constants.superadminConstants.allStatusFilter);
    }
  }, [selectedRows]);

  const handleParameterClick = (param: string) => {
    // Convert parameter to lowercase and replace spaces with underscores
    const formattedParam = param.toLowerCase().replace(/\s+/g, '_');
    const placeholder = `{${formattedParam}}`;
    if (activeField === 'notificationSubject') {
      setEditingTemplate((prev: any) => prev ? { ...prev, notificationSubject: (prev.notificationSubject || '') + placeholder } : null);
    } else if (activeField === 'notificationContent') {
      if (notificationEditorRef.current) {
        notificationEditorRef.current.insertContent(placeholder);
      }
    } else if (activeField === 'emailSubject') {
      setEditingTemplate((prev: any) => prev ? { ...prev, emailSubject: (prev.emailSubject || '') + placeholder } : null);
    } else if (activeField === 'emailContent') {
      if (emailEditorRef.current) {
        emailEditorRef.current.insertContent(placeholder);
      }
    }
  };

  const handleEditTemplate = (template: SuperAdminTypes.NotificationTypes.FlatNotificationTemplate) => {
    // Use backend structure directly without normalization
    setEditingTemplate(template);
    // Set selected user type to the first template's user type
    setSelectedUserType(template.templates?.[0]?.userType || '');
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setLoading(true);
    try {
      const notificationContent = notificationEditorRef.current?.getContent() || editingTemplate.templates?.find((t: any) => t.userType === selectedUserType)?.notification?.content;
      const emailContent = emailEditorRef.current?.getContent() || editingTemplate.templates?.find((t: any) => t.userType === selectedUserType)?.email?.content;

      const hasNotification = notificationContent?.trim() && editingTemplate.templates?.find((t: any) => t.userType === selectedUserType)?.notification?.subject?.trim();
      const hasEmail = emailContent?.trim() && editingTemplate.templates?.find((t: any) => t.userType === selectedUserType)?.email?.subject?.trim();

      if (!hasNotification && !hasEmail) {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: Constants.superadminConstants.templateValidationError });
        setLoading(false);
        return;
      }
      // Use backend structure directly - no top-level ID
      const toValues = Array.isArray(editingTemplate.to) ? editingTemplate.to : (editingTemplate.to ? [editingTemplate.to] : []);
      // Update templates with current form values
      const updatedTemplates = editingTemplate.templates?.map((template: any) => ({
        ...template,
        notification: {
          subject: template.userType === selectedUserType
            ? editingTemplate.templates?.find((t: any) => t.userType === selectedUserType)?.notification?.subject || template.notification?.subject
            : template.notification?.subject,
          content: template.userType === selectedUserType
            ? notificationContent || template.notification?.content
            : template.notification?.content
        },
        email: {
          subject: template.userType === selectedUserType
            ? editingTemplate.templates?.find((t: any) => t.userType === selectedUserType)?.email?.subject || template.email?.subject
            : template.email?.subject,
          content: template.userType === selectedUserType
            ? emailContent || template.email?.content
            : template.email?.content
        }
      })) || [];

      const payload = {
        type: editingTemplate.type,
        to: toValues,
        label: editingTemplate.label,
        status: editingTemplate.status,
        templates: updatedTemplates
      };

      let result;
      // Update existing template using top-level ID
      result = await ServerActions.ServerActionslib.updateNotificationAction(editingTemplate._id || '', payload);

      if (result.success) {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: Constants.superadminConstants.templateSavedSuccess });
        setIsEditing(false);
        setEditingTemplate(null);
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: error.message || Constants.superadminConstants.templateSaveError });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteNotificationAction(id as string),
      setLoading,
      router,
      successMessage: Constants.superadminConstants.templateDeletedSuccess,
      errorMessage: Constants.superadminConstants.templateDeleteError,
      onSuccess: () => {
        setTemplates(prev => prev.filter(t => t._id !== id));
      },
    });
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleToggleStatus = async (template:SuperAdminTypes.NotificationTypes.FlatNotificationTemplate, checked: boolean) => {
    try {
      const result = await ServerActions.ServerActionslib.toggleNotificationStatusAction(template._id);
      if (result.success) {
        setTemplates(prev => prev.map(t => t._id === template._id ? { ...t, status: checked } : t));
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: Constants.superadminConstants.statusUpdateSuccess });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: error.message || Constants.superadminConstants.statusUpdateError });
    }
  };
  const handleToggleStatusById = React.useCallback(async (id: string | number, checked: boolean) => {
    const template = templates.find(t => t._id === id);
    if (template) {
      await handleToggleStatus(template, checked);
    }
  }, [templates]);

  // clear selected data
  const clearSelectedData = React.useCallback(() => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }, [router]);

  // Bulk apply handler (status update / delete)
  
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: templates,
      setItems: setTemplates,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteNotificationsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateNotificationsStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
      statusProp: 'status',
    });
  }, [selectedRows, actionFilter, activeStatusFilter, templates, clearSelectedData]);

  // Define columns for DataTable using createColumns
  const columns = React.useMemo(() => WebComponents.WebCommonComponents.CommonComponents.createColumns<SuperAdminTypes.NotificationTypes.FlatNotificationTemplate>({
    fields: [
      {
        name: Constants.superadminConstants.templateLabel,
        selector: (row) => row.label || '',
        sortable: true,
        width: "30%"
      },
      {
        name: Constants.superadminConstants.templateType,
        selector: (row) => row.type || '',
        sortable: true,
        width: "20%"
      },
      {
        name: Constants.superadminConstants.toLabel,
        selector: (row) => Array.isArray(row.to) ? row.to.join(', ') : (row.to || '-'),
        sortable: true,
        width: "20%"
      },
    ],
    status: {
      name: Constants.superadminConstants.statuslabel,
      idSelector: (row) => row._id || '',
      valueSelector: (row) => !!row.status,
      onToggle: handleToggleStatusById,
    },
    actions: [
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEditTemplate(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
      {
        render: (row) => (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDeleteTemplate(row._id || '')}>
            <FaTrash className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        ),
      },
    ],
  }), [handleToggleStatusById, handleDeleteTemplate]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            {Constants.superadminConstants.notificationTemplatesHeading}
            {isEditing && editingTemplate ? ` > ${Constants.superadminConstants.editTemplateConstant}` : ""}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {Constants.superadminConstants.notificationTemplatesBio}
          </p>
        </div>
        {isEditing && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={handleCloseEdit}
          >
            <><HiArrowLeft className="w-4 h-4" /> {Constants.superadminConstants.back}</>
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>

      {/* Main List View */}
      {!isEditing && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value: string) => {
              setActionFilter(value);
              if (value !== Constants.superadminConstants.statusActionOption) {
                setActiveStatusFilter(Constants.superadminConstants.allStatusFilter);
              }
            }}
            actionOptions={Constants.commonConstants.actionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={Constants.commonConstants.activeStatusOptions}
            selectedCount={selectedRows.length}
            onApply={handleBulkApply}
            categoryFilter={Constants.superadminConstants.allStatusFilter}
            onCategoryFilterChange={() => { }}
            categoryOptions={[]}
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === Constants.superadminConstants.activeStatusFilter ? "Active" : 
                                 value === Constants.superadminConstants.inactiveStatusFilter ? "Inactive" : "All";
              setStatusFilter(validValue as "All" | "Active" | "Inactive");
            }}
            statusOptions={Constants.commonConstants.CommonFilterOptions.CommonStatusOptions}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            showCategoryFilter={false}
            renderExports={false}
          />
          {/* DataTable */}
          <div>
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
              columns={columns}
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
              useUrlParams={true}
            />
          </div>
        </div>
      )}
      {/* Edit Form View */}
      {isEditing && editingTemplate && (
        <WebComponents.SuperAdminComponents.SuperadminWebComponents.SuperAdminForms.NotificationTemplateForm
          editingTemplate={editingTemplate}
          selectedUserType={selectedUserType}
          setSelectedUserType={setSelectedUserType}
          setEditingTemplate={setEditingTemplate}
          setActiveField={setActiveField}
          handleParameterClick={handleParameterClick}
          handleSaveTemplate={handleSaveTemplate}
          handleCloseEdit={handleCloseEdit}
          loading={loading}
          notificationEditorRef={notificationEditorRef as React.RefObject<RichTextEditorRef | null>}
          emailEditorRef={emailEditorRef as React.RefObject<RichTextEditorRef | null>}
          ensureUserTypeTemplate={ensureUserTypeTemplate}
          getUserTypeOptions={getUserTypeOptions}
        />
      )}
    </>
  );
}

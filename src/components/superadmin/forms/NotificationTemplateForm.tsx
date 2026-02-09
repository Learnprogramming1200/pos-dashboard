"use client";

import React from 'react';
import { RichTextEditorRef } from '@/components/ui/RichTextEditor';
import { Constants } from '@/constant';
import { WebComponents } from "@/components";
import { SuperAdminTypes } from '@/types';

interface NotificationTemplateFormProps {
  editingTemplate: Partial<SuperAdminTypes.NotificationTypes.FlatNotificationTemplate> | null;
  selectedUserType: string;
  setSelectedUserType: (value: string) => void;
  setEditingTemplate: React.Dispatch<React.SetStateAction<Partial<SuperAdminTypes.NotificationTypes.FlatNotificationTemplate> | null>>;
  setActiveField: (field: 'notificationSubject' | 'notificationContent' | 'emailSubject' | 'emailContent' | null) => void;
  handleParameterClick: (param: string) => void;
  handleSaveTemplate: () => void;
  handleCloseEdit: () => void;
  loading: boolean;
  notificationEditorRef: React.RefObject<RichTextEditorRef | null>;
  emailEditorRef: React.RefObject<RichTextEditorRef | null>;
  ensureUserTypeTemplate: (prev: any, userType: string) => any;
  getUserTypeOptions: (toValues: string[]) => { name: string; value: string }[];
}

export default function NotificationTemplateForm({
  editingTemplate,
  selectedUserType,
  setSelectedUserType,
  setEditingTemplate,
  setActiveField,
  handleParameterClick,
  handleSaveTemplate,
  handleCloseEdit,
  loading,
  notificationEditorRef,
  emailEditorRef,
  ensureUserTypeTemplate,
  getUserTypeOptions,
}: NotificationTemplateFormProps) {
  if (!editingTemplate) return null;

  return (
    <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
      <form id="template-form" onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }}>
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {/* Type - Non-editable display field */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="template-type">
                {Constants.superadminConstants.templateType}
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
                {Constants.superadminConstants.toLabel}<span className="text-required">*</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <WebComponents.UiComponents.UiWebComponents.FormDropdown
                id="template-to"
                name="template-to"
                multiselect
                placeholder={Constants.superadminConstants.selectTo}
                value={Array.isArray(editingTemplate.to) ? editingTemplate.to : (editingTemplate.to ? [editingTemplate.to] : [])}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newToValues = e.target.value as unknown as string[];
                  setEditingTemplate((prev: any) => {
                    if (!prev) return null;
                    const updated = { ...prev, to: newToValues };
                    // Reset selected user type if it's no longer valid for the new selection
                    if (selectedUserType && !newToValues.includes(selectedUserType)) {
                      setSelectedUserType(newToValues[0] || '');
                    }
                    return updated;
                  });
                }}
                required
              >
                <WebComponents.UiComponents.UiWebComponents.FormOption value="superadmin">Super Admin</WebComponents.UiComponents.UiWebComponents.FormOption>
                <WebComponents.UiComponents.UiWebComponents.FormOption value="admin">Admin</WebComponents.UiComponents.UiWebComponents.FormOption>
                <WebComponents.UiComponents.UiWebComponents.FormOption value="manager">Manager</WebComponents.UiComponents.UiWebComponents.FormOption>
                <WebComponents.UiComponents.UiWebComponents.FormOption value="supplier">Supplier</WebComponents.UiComponents.UiWebComponents.FormOption>
                <WebComponents.UiComponents.UiWebComponents.FormOption value="customer">Customer</WebComponents.UiComponents.UiWebComponents.FormOption>
                <WebComponents.UiComponents.UiWebComponents.FormOption value="user">User</WebComponents.UiComponents.UiWebComponents.FormOption>
              </WebComponents.UiComponents.UiWebComponents.FormDropdown>
            </div>

            {/* User Type */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="user-type">
                {Constants.superadminConstants.userTypeLabel}
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

            {/* Status */}
            <div className="col-span-1">
              <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="template-status-toggle">
                {Constants.superadminConstants.templateStatus} <span className="text-required">*</span>
              </WebComponents.UiComponents.UiWebComponents.FormLabel>
              <div className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-[#616161] bg-textMain2 dark:bg-[#1B1B1B]">
                <div className="flex items-center justify-between px-3 sm:px-4 py-[10px]">
                  <span className="text-xs sm:text-sm font-interTight font-medium leading-[14px] text-textMain dark:text-white">
                    {editingTemplate.status ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
                  </span>
                  <WebComponents.UiComponents.UiWebComponents.Switch
                    id="template-status-toggle"
                    checked={editingTemplate.status}
                    onCheckedChange={(checked: boolean) => setEditingTemplate(prev => prev ? { ...prev, status: checked } : null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.superadminConstants.dynamicParametersLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {[// Company
                'Company Name', 'Company Email', 'Site URL',

                // User (Generalized for future login/auth)
                'User Name', 'User Email', 'User Phone', 'User ID', 'User Role',

                // Admin / Manager / Supplier / Super Admin
                'Business Name', 'Admin Name', 'Admin Email', 'Admin Phone', 'Admin ID',
                'Manager Name', 'Manager Email', 'Manager Phone', 'Manager ID',
                'Supplier Name', 'Supplier Email', 'Supplier Phone', 'Supplier ID',
                'SuperAdmin Name', 'SuperAdmin Email', 'SuperAdmin Phone',

                // Plan & Payment
                'Plan Name', 'Plan Start Date', 'Plan Expiry Date', 'Payment Status',
                'Amount Paid', 'Payment Method', 'Payment Date', 'Transaction ID',

                // App & Support
                'App Name', 'Support Email',

                // Date
                'Current Date',
              ]
                .map(param => (
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

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
            {/* Notification Template */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-base sm:text-lg font-semibold text-textMain dark:text-white">{Constants.superadminConstants.notificationTemplateTitle}</h3>
              </div>
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="notification-subject">{Constants.superadminConstants.subjectLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="notification-subject"
                  name="notification-subject"
                  type="text"
                  placeholder={Constants.superadminConstants.enterNotificationSubjectPlaceholder}
                  value={editingTemplate.templates?.find(t => t.userType === selectedUserType)?.notification?.subject || ''}
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
                              notification: {
                                ...template.notification,
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
                  onFocus={() => setActiveField('notificationSubject')}
                  autoComplete="off"
                />
              </div>
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.superadminConstants.contentTemplateLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.RichTextEditor
                  key={`notification-${editingTemplate._id || 'new'}-${selectedUserType}`}
                  ref={notificationEditorRef}
                  value={editingTemplate.templates?.find(t => t.userType === selectedUserType)?.notification?.content || ''}
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
                              notification: {
                                ...template.notification,
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
                  onFocus={() => setActiveField('notificationContent')}
                  placeholder={Constants.superadminConstants.enterNotificationContentPlaceholder}
                  height={400}
                />
              </div>
            </div>

            {/* Email Template */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-base sm:text-lg font-semibold text-textMain dark:text-white">{Constants.superadminConstants.emailTemplateTitle}</h3>
              </div>
              <div>
                <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email-subject">{Constants.superadminConstants.subjectLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  id="email-subject"
                  name="email-subject"
                  type="text"
                  placeholder={Constants.superadminConstants.enterEmailSubjectPlaceholder}
                  value={editingTemplate.templates?.find(t => t.userType === selectedUserType)?.email?.subject || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newSubject = e.target.value;
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
                <WebComponents.UiComponents.UiWebComponents.FormLabel>{Constants.superadminConstants.contentTemplateLabel}</WebComponents.UiComponents.UiWebComponents.FormLabel>
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
                  placeholder={Constants.superadminConstants.enterEmailContentPlaceholder}
                  height={400}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
      {/* Footer inside form container for consistency */}
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 pt-0 flex flex-col sm:flex-row justify-end gap-3">
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="cancel"
          type="button"
          className="w-full sm:w-auto"
          onClick={handleCloseEdit}
        >
          {Constants.superadminConstants.cancelbutton}
        </WebComponents.UiComponents.UiWebComponents.Button>
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="save"
          type="submit"
          className="w-full sm:w-auto min-w-[120px]"
          form="template-form"
          disabled={loading}
        >
          {loading ? Constants.superadminConstants.saving : Constants.superadminConstants.save}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { UiWebComponents } from "@/components/ui";
import { Constants } from "@/constant";

interface AdminFormModalProps {
  formId: string;
  onClose: () => void;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  loadingText?: string;
  cancelButtonClassName?: string;
  submitButtonClassName?: string;
  cancelButtonVariant?: any;
  submitButtonVariant?: any;
  wrapInForm?: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function AdminFormModal({
  formId,
  onClose,
  children,
  // submitText ,
  loading = false,
  // loadingText,
  wrapInForm = false,
  onSubmit,
}:  AdminFormModalProps) {
  return (
    <>
      <div className="bg-white dark:bg-darkFilterbar rounded-[4px] mt-4">
        {wrapInForm ? (
          <form id={formId} onSubmit={onSubmit}>
            {children}
          </form>
        ) : (
          children
        )}
      </div>
      <div className="pt-[60px] flex justify-end gap-3">
        <UiWebComponents.Button
          // variant={cancelButtonVariant}
       variant="cancel"
          type="button"
          onClick={onClose}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          disabled={loading}
        >
          {Constants.adminConstants.cancelButtonLabel}
        </UiWebComponents.Button>
        <UiWebComponents.Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          variant="default"
          type="submit"
          form={formId}
          disabled={loading}
        // onClick={onSubmit}
        >
          {loading ?  Constants.adminConstants.saving : Constants.adminConstants.saveButtonLabel}
        </UiWebComponents.Button>
      </div>
    </>
  );
}

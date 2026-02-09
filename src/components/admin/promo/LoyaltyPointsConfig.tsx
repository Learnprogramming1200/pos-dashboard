"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { customHooks } from "@/hooks";
import { PaginationType, AdminTypes } from "@/types";
import LoyaltyTab from "./LoyaltyTab";
import RedeemTab from "./RedeemTab";

export default function LoyaltyPointsConfig({
  initialLoyaltyPoints,
  initialRedeems,
  initialPagination,
}: {
  readonly initialLoyaltyPoints: AdminTypes.loyaltyTypes.LoyaltyPointServerResponse[];
  readonly initialRedeems: AdminTypes.loyaltyTypes.RedeemPointServerResponse[];
  readonly initialPagination: PaginationType.Pagination;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = (searchParams.get("type") === "Redeem" ? "redeem" : "loyalty") as "loyalty" | "redeem";
  const handleTabChange = (tab: "loyalty" | "redeem") => {

    const params = new URLSearchParams(searchParams.toString());
    params.set("type", tab === "loyalty" ? "Loyalty" : "Redeem");
    params.set("page", "1");
    params.delete("isActive");
    params.delete("search")
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [loyaltyPoints, setLoyaltyPoints] = React.useState<AdminTypes.loyaltyTypes.LoyaltyPointServerResponse[]>(initialLoyaltyPoints);
  const [redeemCalculations, setRedeemCalculations] = React.useState<AdminTypes.loyaltyTypes.RedeemPointServerResponse[]>(initialRedeems);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [editingLoyaltyPoint, setEditingLoyaltyPoint] = React.useState<AdminTypes.loyaltyTypes.LoyaltyPointServerResponse | null>(null);
  const [editingRedeemCalculation, setEditingRedeemCalculation] = React.useState<AdminTypes.loyaltyTypes.RedeemPointServerResponse | null>(null);
  const [selectedLoyalty, setSelectedLoyalty] = React.useState<AdminTypes.loyaltyTypes.LoyaltyPointServerResponse | null>(null);
  const [selectedRedeem, setSelectedRedeem] = React.useState<AdminTypes.loyaltyTypes.RedeemPointServerResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  // Sync state with props when data changes
  React.useEffect(() => {
    setLoyaltyPoints(initialLoyaltyPoints);
    setPagination(initialPagination);
  }, [initialLoyaltyPoints]);

  React.useEffect(() => {
    setRedeemCalculations(initialRedeems);
    setPagination(initialPagination);
  }, [initialRedeems]);

  // Add Loyalty
  const handleAddLoyaltyPoint = async (formData: AdminTypes.loyaltyTypes.LoyaltyPointFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createLoyaltyPointsAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Loyalty points added successfully.",
      errorMessage: "Failed to add loyalty points.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "loyalty point already exists",
    });
  };

  // Edit Loyalty
  const handleEditLoyaltyPoint = async (formData: AdminTypes.loyaltyTypes.LoyaltyPointFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingLoyaltyPoint,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateLoyaltyPointsAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingLoyaltyPoint,
      router,
      successMessage: "Loyalty points updated successfully.",
      errorMessage: "Failed to update loyalty points.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "loyalty point already exists",
    });
  };

  // Delete Loyalty
  const handleDeleteLoyaltyPoint = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteLoyaltyPointsAction(String(id)),
      setLoading,
      router,
      successMessage: "The loyalty points configuration has been deleted.",
      errorMessage: "Failed to delete loyalty points.",
    });
  }, [router]);

  // Add Redeem
  const handleAddRedeemCalculation = async (formData: AdminTypes.loyaltyTypes.RedeemPointFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createLoyaltyPointsRedeemAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Redeem configuration added successfully.",
      errorMessage: "Failed to add redeem configuration.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "redeem calculation already exists",
    });
  };

  // Edit Redeem
  const handleEditRedeemCalculation = async (formData: AdminTypes.loyaltyTypes.RedeemPointFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingRedeemCalculation,
      getId: (item) => item._id,
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateLoyaltyPointsRedeemAction(String(id), data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingRedeemCalculation,
      router,
      successMessage: "Redeem configuration updated successfully.",
      errorMessage: "Failed to update redeem configuration.",
      checkExistsError: (errorMessage) => errorMessage.toLowerCase() === "redeem calculation already exists",
    });
  };

  // Delete Redeem
  const handleDeleteRedeemCalculation = React.useCallback(async (id: string) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id,
      deleteAction: (id: string | number) => ServerActions.ServerActionslib.deleteLoyaltyPointsRedeemAction(String(id)),
      setLoading,
      router,
      successMessage: "The redeem configuration has been deleted.",
      errorMessage: "Failed to delete redeem configuration.",
    });
  }, [router]);

  const handleEditModal = React.useCallback((item: AdminTypes.loyaltyTypes.LoyaltyPointServerResponse | AdminTypes.loyaltyTypes.RedeemPointServerResponse) => {
    if (activeTab === "loyalty") {
      setEditingLoyaltyPoint(item as AdminTypes.loyaltyTypes.LoyaltyPointServerResponse);
    } else {
      setEditingRedeemCalculation(item as AdminTypes.loyaltyTypes.RedeemPointServerResponse);
    }
    setShowEditModal(true);
  }, [activeTab]);

  const handleToggleStatusLoyaltyPoint = React.useCallback(async (row: AdminTypes.loyaltyTypes.LoyaltyPointServerResponse, next: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (row) => row._id,
      preparePayload: (row, next) => {
        return {
          minimumAmount: row.minimumAmount,
          maximumAmount: row.maximumAmount,
          loyaltyPoints: row.loyaltyPoints,
          expiryDuration: row.expiryDuration,
          status: next,
        };
      },
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateLoyaltyPointsAction(String(id), data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
      errorMessage: "Failed to update status.",
    });
  }, [router]);

  const handleToggleStatusRedeemCalculation = React.useCallback(async (row: AdminTypes.loyaltyTypes.RedeemPointServerResponse, next: boolean) => {
    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row,
      next,
      getId: (row) => row._id,
      preparePayload: (row, next) => {
        return {
          ruleName: row.ruleName,
          pointFrom: row.pointFrom,
          pointTo: row.pointTo,
          amount: row.amount,
          status: next,
        };
      },
      updateAction: (id: string | number, data) => ServerActions.ServerActionslib.updateLoyaltyPointsRedeemAction(String(id), data),
      setLoading,
      router,
      successMessage: `Status updated to ${next ? "Active" : "Inactive"}.`,
      errorMessage: "Failed to update status.",
    });
  }, [router]);

  // Details Modal handler
  const handleViewDetails = React.useCallback((item: AdminTypes.loyaltyTypes.LoyaltyPointServerResponse | AdminTypes.loyaltyTypes.RedeemPointServerResponse) => {
    if (activeTab === "loyalty") {
      setSelectedLoyalty(item as AdminTypes.loyaltyTypes.LoyaltyPointServerResponse);
    } else {
      setSelectedRedeem(item as AdminTypes.loyaltyTypes.RedeemPointServerResponse);
    }
    setShowDetailsModal(true);
  }, [activeTab]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {showModal || showEditModal
              ? `${Constants.adminConstants.loyaltyPointsHeading} > ${showModal ? (activeTab === "loyalty" ? "Add Loyalty" : "Add Redeem") : (activeTab === "loyalty" ? "Edit Loyalty" : "Edit Redeem")}`
              : Constants.adminConstants.loyaltyPointsHeading}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{Constants.adminConstants.loyaltyPointsBio}</p>
        </div>
        {(checkPermission("promo.loyalty", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingLoyaltyPoint(null);
                setEditingRedeemCalculation(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (
              <>
                <HiArrowLeft className="w-4 h-4" />
                {Constants.adminConstants.back}
              </>
            ) : (
              <>
                <HiPlus className="w-4 h-4" />
                {Constants.adminConstants.add}
              </>
            )}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 mt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("loyalty")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "loyalty"
              ? "bg-primary text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            Loyalty
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("redeem")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "redeem"
              ? "bg-primary text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            Redeem
          </button>
        </div>
      </div>

      {/* Show Content only when modal is not open */}
      {!showModal && !showEditModal && (
        <>
          {activeTab === "loyalty" ? (
            <LoyaltyTab
              loyaltyPoints={loyaltyPoints}
              pagination={pagination}
              onViewDetails={handleViewDetails}
              onEdit={handleEditModal}
              onDelete={handleDeleteLoyaltyPoint}
              onToggleStatus={handleToggleStatusLoyaltyPoint}
            />
          ) : (
            <RedeemTab
              redeems={redeemCalculations}
              pagination={pagination}
              onViewDetails={handleViewDetails}
              onEdit={handleEditModal}
              onDelete={handleDeleteRedeemCalculation}
              onToggleStatus={handleToggleStatusRedeemCalculation}
            />
          )}
        </>
      )}

      {/* Add / Edit Modal - Loyalty */}
      {(showModal || showEditModal) && activeTab === "loyalty" && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="loyalty-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingLoyaltyPoint(null);
          }}
          loading={loading}
        >
          {editingLoyaltyPoint ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.LoyaltyPointForm
              onSubmit={handleEditLoyaltyPoint}
              loyalty={editingLoyaltyPoint}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.LoyaltyPointForm
              onSubmit={handleAddLoyaltyPoint}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Add / Edit Modal - Redeem */}
      {(showModal || showEditModal) && activeTab === "redeem" && (
        <WebComponents.UiComponents.UiWebComponents.AdminFormModal
          formId="redeem-form"
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingRedeemCalculation(null);
          }}
          loading={loading}
        >
          {editingRedeemCalculation ? (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.RedeemCalculationForm
              onSubmit={handleEditRedeemCalculation}
              redeem={editingRedeemCalculation}
            />
          ) : (
            <WebComponents.AdminComponents.AdminWebComponents.Forms.RedeemCalculationForm
              onSubmit={handleAddRedeemCalculation}
            />
          )}
        </WebComponents.UiComponents.UiWebComponents.AdminFormModal>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <>
          {activeTab === "loyalty" && selectedLoyalty && (
            <WebComponents.AdminComponents.AdminWebComponents.Models.LoyaltyDetailsModal
              loyalty={selectedLoyalty}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
          {activeTab === "redeem" && selectedRedeem && (
            <WebComponents.AdminComponents.AdminWebComponents.Models.RedeemDetailsModal
              redeem={selectedRedeem}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </>
      )}
    </>
  );
}

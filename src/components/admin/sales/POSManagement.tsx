"use client";
import React from "react";
import { Monitor, Trash2, Eye } from "lucide-react";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { FaEdit } from "react-icons/fa";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { WebComponents } from "@/components";
import { customHooks } from "@/hooks";
import { POS } from "@/types/admin/sales/Sales";
import { actionOptions } from "@/constant/common";

// Mock data - replace with actual API calls
const mockPOS: POS[] = [
  {
    id: "1",
    name: "POS Terminal 1",
    storeId: "STORE-001",
    storeName: "Main Store",
    location: "Front Counter",
    status: "Active",
    lastUsed: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "POS Terminal 2",
    storeId: "STORE-001",
    storeName: "Main Store",
    location: "Back Counter",
    status: "Active",
    lastUsed: "2024-01-15T09:15:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T09:15:00Z"
  },
  {
    id: "3",
    name: "POS Terminal 3",
    storeId: "STORE-002",
    storeName: "Branch Store",
    location: "Main Counter",
    status: "Inactive",
    lastUsed: "2024-01-10T16:45:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T16:45:00Z"
  },
  {
    id: "4",
    name: "POS Terminal 4",
    storeId: "STORE-002",
    storeName: "Branch Store",
    location: "Express Lane",
    status: "Maintenance",
    lastUsed: "2024-01-12T14:20:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T14:20:00Z"
  }
];

// Static status options for filters
const activeStatusOptions = [
  { name: 'Active', value: 'Active' },
  { name: 'Inactive', value: 'Inactive' },
  { name: 'Maintenance', value: 'Maintenance' }
];

const statusColor = {
  Active: "bg-success text-white",
  Inactive: "bg-danger text-white",
  Maintenance: "bg-warning text-white",
};

const columns = (
  handleEdit: (row: POS) => void,
  handleDelete: (id: string) => void,
  handleView: (row: POS) => void,
  checkPermission: (key: string, action: string) => boolean
) => WebComponents.WebCommonComponents.CommonComponents.createColumns<POS>({
  fields: [
    {
      name: "POS Name",
      selector: (row: POS) => row.name,
      sortable: true,
      width: '15%',
      cell: (row: POS) => (
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    {
      name: "Store",
      selector: (row: POS) => row.storeName,
      sortable: true,
      width: '12%',
      cell: (row: POS) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-white">{row.storeName}</span>
        </div>
      ),
    },
    {
      name: "Location",
      selector: (row: POS) => row.location,
      sortable: true,
      width: '18%',
      cell: (row: POS) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-white">{row.location}</span>
        </div>
      ),
    },
    {
      name: "Last Used",
      selector: (row: POS) => row.lastUsed,
      sortable: true,
      width: '12%',
      cell: (row: POS) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-white">{new Date(row.lastUsed).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      name: "Created Date",
      selector: (row: POS) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A',
      sortable: true,
      width: '12%',
    },
    {
      name: "Status",
      selector: (row: POS) => row.status,
      width: '12%',
      cell: (row: POS) => (
        <WebComponents.UiComponents.UiWebComponents.Badge className={`px-2 py-1 rounded-full text-sm ${statusColor[row.status as keyof typeof statusColor]}`}>
          {row.status}
        </WebComponents.UiComponents.UiWebComponents.Badge>
      ),
    }
  ],
  actions: [
    {
      render: (row: POS) => (
        <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="viewaction" onClick={() => handleView(row)}>
          <Eye className="w-4 h-4" />
        </WebComponents.UiComponents.UiWebComponents.Button>
      )
    },
    {
      render: (row: POS) => (
        (checkPermission("sales.pos", "update")) && (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="editaction" onClick={() => handleEdit(row)}>
            <FaEdit className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      )
    },
    {
      render: (row: POS) => (
        (checkPermission("sales.pos", "delete")) && (
          <WebComponents.UiComponents.UiWebComponents.Button size="icon" variant="deleteaction" onClick={() => handleDelete(row.id)}>
            <Trash2 className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        )
      )
    }
  ]
});

export default function POSManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const [pos, setPOS] = React.useState<POS[]>(mockPOS);
  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingPOS, setEditingPOS] = React.useState<POS | null>(null);
  const [selectedPOS, setSelectedPOS] = React.useState<POS | null>(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  // Hook integration
  const {
    searchTerm,
    setSearchTerm,
    allStatusFilter,
    setAllStatusFilter,
    storeFilter,
    setStoreFilter,
    filteredData
  } = customHooks.useListFilters(pos, {
    searchKeys: ["name", "storeName", "location", "status"],
    statusAllSelector: (row) => row.status,
    storeSelector: (row) => row.storeId
  });

  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<POS[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");

  /* Permissions */
  const { checkPermission } = customHooks.useUserPermissions();

  const bulkActionOptions = React.useMemo(() => {
    return actionOptions.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("sales.pos", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("sales.pos", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter('All');
      setActiveStatusFilter('All');
    }
  }, [selectedRows]);

  // Manual URL pagination sync removed (handled by hook/component interaction)
  // Manual filteredData removed (handled by hook)

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  // Add
  const handleAdd = async (formData: any) => {
    try {
      setLoading(true);
      const newPOS: POS = {
        id: Date.now().toString(),
        ...formData,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPOS(prev => [newPOS, ...prev]);
      setShowModal(false);
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ title: "Created", text: "POS terminal created successfully" });
    } catch (error: unknown) {
      console.error('Error adding POS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add POS.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = async (formData: any) => {
    if (!editingPOS) return;

    try {
      setLoading(true);
      setPOS(prev => prev.map(pos =>
        pos.id === editingPOS.id
          ? { ...pos, ...formData, updatedAt: new Date().toISOString() }
          : pos
      ));
      setShowEditModal(false);
      setEditingPOS(null);
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ title: "Updated", text: "POS terminal updated successfully" });
    } catch (error: unknown) {
      console.error('Error updating POS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update POS.';
      WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (pos: POS) => {
    setEditingPOS(pos);
    setShowEditModal(true);
  };

  const handleView = (pos: POS) => {
    setSelectedPOS(pos);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await WebComponents.UiComponents.UiWebComponents.SwalHelper.delete();
    if (result.isConfirmed) {
      try {
        setPOS(prev => prev.filter(pos => pos.id !== id));
        WebComponents.UiComponents.UiWebComponents.SwalHelper.success({
          text: 'The POS terminal has been deleted.'
        });
      } catch (error: unknown) {
        console.error('Error deleting POS:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete POS.';
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({
          text: errorMessage
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkApply = () => {
    if (actionFilter === 'Status') {
      if (activeStatusFilter === 'All') {
        WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: 'Please select a status.' });
        return;
      }
      setPOS(prev => prev.map(p => selectedRows.find(r => r.id === p.id) ? { ...p, status: activeStatusFilter as "Active" | "Inactive" | "Maintenance" } : p));
      WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Status updated successfully.' });
      setSelectedRows([]);
    } else if (actionFilter === 'Delete') {
      WebComponents.UiComponents.UiWebComponents.SwalHelper.delete({ title: 'Delete POS Terminals', text: `Delete ${selectedRows.length} POS terminal(s)?` }).then((res: any) => {
        if (res.isConfirmed) {
          setPOS(prev => prev.filter(p => !selectedRows.find(r => r.id === p.id)));
          WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'POS terminals deleted successfully.' });
          setSelectedRows([]);
        }
      });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            POS Management
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? "Add POS" : "Edit POS";
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            {showModal || showEditModal ? "Add new POS terminal configuration." : "Manage POS terminals across all stores"}
          </p>
        </div>
        {(checkPermission("sales.pos", "create")) && (
          <WebComponents.UiComponents.UiWebComponents.Button
            variant="addBackButton"
            className={!showModal && !showEditModal ? "min-w-[120px]" : ""}
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingPOS(null);
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
                Add POS
              </>
            )}
          </WebComponents.UiComponents.UiWebComponents.Button>
        )}
      </div>

      {/* Show stats and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <>
          {/* Cards */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card 
              title="Total POS" 
              value={totalPOS} 
              color="bg-blue-500" 
              icon={<Monitor className="w-5 h-5" />} 
            />
            <Card 
              title="Active POS" 
              value={activePOS} 
              color="bg-green-500" 
              icon={<Power className="w-5 h-5" />} 
            />
            <Card 
              title="Inactive POS" 
              value={inactivePOS} 
              color="bg-gray-500" 
              icon={<Power className="w-5 h-5" />} 
            />
            <Card 
              title="Under Maintenance" 
              value={maintenancePOS} 
              color="bg-yellow-500" 
              icon={<Settings className="w-5 h-5" />} 
            />
          </div> */}

          {/* Filters & Actions */}
          <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
            <WebComponents.WebCommonComponents.CommonComponents.CommonFilterBar
              actionFilter={actionFilter}
              onActionFilterChange={(val) => {
                setActionFilter(val);
                if (val !== 'Status') setActiveStatusFilter('All');
              }}
              actionOptions={bulkActionOptions}
              activeStatusFilter={activeStatusFilter}
              onActiveStatusFilterChange={setActiveStatusFilter}
              activeStatusOptions={activeStatusOptions}
              selectedCount={selectedRows.length}
              onApply={handleBulkApply}
              // Using category filter as Store filter
              categoryFilter={storeFilter}
              onCategoryFilterChange={(val) => setStoreFilter(val)}
              categoryPlaceholder="All Stores"
              categoryOptions={[
                { name: 'All Stores', value: 'All' },
                { name: 'Main Store', value: 'STORE-001' },
                { name: 'Branch Store', value: 'STORE-002' },
              ]}
              showCategoryFilter={true}
              statusFilter={allStatusFilter}
              onStatusFilterChange={setAllStatusFilter}
              statusOptions={[
                { label: 'All Status', value: 'All' },
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Maintenance', value: 'Maintenance' },
              ]}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              renderExports={
                <>
                  <WebComponents.UiComponents.UiWebComponents.DownloadCSV
                    data={filteredData}
                    columns={[]}
                    filename={`pos_terminals-${new Date().toISOString().split('T')[0]}.csv`}
                    onExport={() => Promise.resolve(filteredData)}
                  >
                    {/* <button
                      type="button"
                      className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                      aria-label="Download CSV"
                      title="Download CSV"
                      disabled={filteredData.length === 0}
                    >
                      <Image src={Constants.assetsIcon.assets.csv} alt="" className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" width={28} height={28} />
                    </button> */}
                  </WebComponents.UiComponents.UiWebComponents.DownloadCSV>
                  <WebComponents.UiComponents.UiWebComponents.DownloadPDF
                    data={filteredData}
                    columns={[]}
                    filename={`pos_terminals-${new Date().toISOString().split('T')[0]}.pdf`}
                    title="POS Terminals Report"
                    orientation="portrait"
                    onExport={() => Promise.resolve(filteredData)}
                  >
                    {/* <button
                      type="button"
                      className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                      aria-label="Download PDF"
                      title="Download PDF"
                      disabled={filteredData.length === 0}
                    >
                      <Image src={Constants.assetsIcon.assets.pdf} alt="" className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7" width={28} height={28} />
                    </button> */}
                  </WebComponents.UiComponents.UiWebComponents.DownloadPDF>
                </>
              }
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white dark:bg-darkFilterbar border-t border-gray-200 dark:border-gray-700 rounded-b-md">
            <WebComponents.WebCommonComponents.CommonComponents.DataTable
              columns={columns(handleEditClick, handleDelete, handleView, checkPermission)}
              data={paginatedData}
              selectableRows
              onSelectedRowsChange={({ selectedRows }: { selectedRows: POS[] }) => setSelectedRows(selectedRows)}
              clearSelectedRows={selectedRows.length === 0}
              useCustomPagination={true}
              useUrlParams={true}
              totalRecords={filteredData.length}
              filteredRecords={filteredData.length}
              paginationPerPage={limit}
              paginationDefaultPage={page}
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handleRowsPerPageChange}
            />
          </div>
        </>
      )}

      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.POSModel
          name={showModal ? "Add POS" : "Edit POS"}
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingPOS(null);
          }}
          onSubmit={showModal ? handleAdd : handleEdit}
          pos={editingPOS || undefined}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPOS && (
        <WebComponents.AdminComponents.AdminWebComponents.Models.POSDetailsModal
          pos={selectedPOS}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}






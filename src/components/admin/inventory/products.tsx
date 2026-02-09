"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { CommonComponents } from "@/components/common";
import { UiWebComponents } from "@/components/ui";
import { AdminWebComponents } from "@/components/admin";
import { storeTypes } from "@/types/admin";
import { AdminTypes, PaginationType } from "@/types";

export default function Products({
  initialProducts,
  initialPagination,
  initialCategories,
  initialSubCategories,
  initialBrands,
  initialUnits,
  initialWarrenties,
  initialStores,
  initialVariations,
  initialTaxes,
}: {
  initialProducts: AdminTypes.InventoryTypes.ProductTypes.Product[];
  initialPagination: PaginationType.Pagination;
  initialCategories: AdminTypes.InventoryTypes.ProductTypes.ProductCategory[];
  initialSubCategories: AdminTypes.InventoryTypes.ProductTypes.ProductSubCategory[];
  initialBrands: AdminTypes.InventoryTypes.ProductTypes.ProductBrand[];
  initialUnits: AdminTypes.InventoryTypes.ProductTypes.ProductUnit[];
  initialWarrenties: AdminTypes.InventoryTypes.ProductTypes.ProductWarranty[];
  initialStores: storeTypes.Store[];
  initialVariations: AdminTypes.InventoryTypes.ProductTypes.ProductVariation[];
  initialTaxes: any[];
}) {
  const [products, setProducts] = React.useState<AdminTypes.InventoryTypes.ProductTypes.Product[]>(initialProducts);
  const [pagination, setPagination] = React.useState<PaginationType.Pagination>(initialPagination);
  const [stores, setStores] = React.useState<storeTypes.Store[]>(initialStores);
  const [categories, setCategories] =
    React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductCategory[]>(initialCategories);
  const [subcategories, setSubcategories] =
    React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductSubCategory[]>(initialSubCategories);
  const [brands, setBrands] = React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductBrand[]>(initialBrands);
  const [units, setUnits] = React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductUnit[]>(initialUnits);
  const [warrenties, setWarrenties] =
    React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductWarranty[]>(initialWarrenties);
  const [variations, setVariations] =
    React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductVariation[]>(initialVariations);
  const [taxes, setTaxes] = React.useState<any[]>(initialTaxes);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [showModal, setShowModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<AdminTypes.InventoryTypes.ProductTypes.Product | null>(null);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [viewingProduct, setViewingProduct] = React.useState<AdminTypes.InventoryTypes.ProductTypes.Product | null>(null);
  const [actionFilter, setActionFilter] = React.useState<string>("All");
  const [activeStatusFilter, setActiveStatusFilter] = React.useState<string>("All");
  const [selectedRows, setSelectedRows] = React.useState<AdminTypes.InventoryTypes.ProductTypes.Product[]>([]);
  const [clearSelectedRows, setClearSelectedRows] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [downloadData, setDownloadData] = React.useState<AdminTypes.InventoryTypes.ProductTypes.Product[]>([]);
  const { checkPermission } = customHooks.useUserPermissions();

  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, selectedCategoryFilter,
    setSelectedCategoryFilter, filteredData } = customHooks.useListFilters<AdminTypes.InventoryTypes.ProductTypes.Product>(
      products,
      {
        statusSelector: (row) => !!row.status,
      }
    );
  // Helper function to get product image URL
  const getProductImageUrl = React.useCallback((product: AdminTypes.InventoryTypes.ProductTypes.Product): string | null => {
    const isValidUrl = (url: any) => {
      if (!url) return false;
      if (typeof url !== 'string') return false;
      if (url === 'null' || url === 'undefined') return false;
      // Basic check for relative path or absolute URL
      return url.startsWith('/') || url.startsWith('http');
    };

    if (isValidUrl(product.productImage)) return product.productImage as string;

    if (product.hasVariation && Array.isArray((product as any).variantData) && (product as any).variantData.length > 0) {
      const firstVariant = (product as any).variantData[0];
      if (isValidUrl(firstVariant?.variantImage)) return firstVariant.variantImage;
    }
    return null;
  }, []);

  // Sync state with props when router.refresh() is called
  React.useEffect(() => {
    setProducts(initialProducts);
    setPagination(initialPagination);
  }, [initialProducts, initialPagination]);

  React.useEffect(() => {
    setStores(initialStores);
  }, [initialStores]);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  React.useEffect(() => {
    setSubcategories(initialSubCategories);
  }, [initialSubCategories]);

  React.useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  // Reset action filter when no rows are selected
  React.useEffect(() => {
    if (selectedRows.length === 0) {
      setActionFilter("All");
      setActiveStatusFilter("All");
    }
  }, [selectedRows]);

  // Helpers to normalize server response for datatable display
  const getAllStoreEntries = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    const storeEntries: any[] = [];
    // For variant products, get store data from variantData
    if (
      product.hasVariation &&
      product.variantData &&
      Array.isArray(product.variantData)
    ) {
      product.variantData.forEach((variant: any) => {
        if (
          variant.stock &&
          variant.stock.storeStock &&
          Array.isArray(variant.stock.storeStock)
        ) {
          variant.stock.storeStock.forEach((storeStock: any) => {
            storeEntries.push({
              storeId: storeStock.storeId,
              storeName: storeStock.storeName,
              quantity: storeStock.quantity,
              SKU: storeStock.SKU,
              isVariant: storeStock.isVariant,
            });
          });
        }
      });
    }

    // For non-variant products, get store data from product.stock
    if (
      !product.hasVariation &&
      product.stock &&
      (product.stock as any).storeStock &&
      Array.isArray((product.stock as any).storeStock)
    ) {
      (product.stock as any).storeStock.forEach((storeStock: any) => {
        storeEntries.push({
          storeId: storeStock.storeId,
          storeName: storeStock.storeName,
          quantity: storeStock.quantity,
          SKU: storeStock.SKU,
          isVariant: storeStock.isVariant,
        });
      });
    }

    // Legacy support for old structure
    const variantDataStores =
      (product.variantData as any[])?.flatMap(
        (v: any) => v?.storeQuantities || []
      ) || [];
    const variantInventoryStores =
      (product.variantInventory as any[])?.flatMap(
        (v: any) => v?.storeQuantities || []
      ) || [];
    const productStores = product.storeQuantities || [];

    return [
      ...storeEntries,
      ...variantDataStores,
      ...variantInventoryStores,
      ...productStores,
    ];
  };

  // Helper to resolve store name from ID or object
  const resolveStoreName = React.useCallback((s: any) => {
    if (!s) return null;

    // Check for populated store object in s.store, s.storeId, or s.id
    if (s.store && typeof s.store === "object" && s.store.name) return s.store.name;
    if (s.storeId && typeof s.storeId === "object" && s.storeId.name) return s.storeId.name;
    if (s.id && typeof s.id === "object" && s.id.name) return s.id.name;

    // Check for ID and lookup in stores array
    const sId = (typeof s.storeId === "string" ? s.storeId : s.storeId?._id || s.storeId?.id) ||
      (typeof s.store === "string" ? s.store : s.store?._id || s.store?.id) ||
      (typeof s === "string" ? s : s._id || s.id);

    if (sId) {
      const match = stores.find(st => st._id === sId || (st as any).id === sId);
      if (match) return match.name;
    }
    return null;
  }, [stores]);

  const getStoreNames = React.useCallback((product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    // 1. Try direct product.store
    if (product.store) {
      const name = resolveStoreName(product.store);
      if (name) return name;
    }

    // 2. Collect all possible store sources
    let storeSources: any[] = [];

    // Check product.stock structure (handle both new object structure and old array structure)
    if (product.stock) {
      if (Array.isArray(product.stock)) {
        storeSources = product.stock;
      } else if (typeof product.stock === "object") {
        if ((product.stock as any).storeStock) {
          storeSources = (product.stock as any).storeStock;
        } else if ((product.stock as any).storeId || (product.stock as any).id) {
          storeSources = [product.stock];
        }
      }
    }

    // if sources found in stock, use them
    if (Array.isArray(storeSources) && storeSources.length > 0) {
      const names = storeSources.map(resolveStoreName).filter(Boolean);
      if (names.length > 0) return Array.from(new Set(names)).join(", ");
    }

    // 3. Fallback to getAllStoreEntries
    const entries = getAllStoreEntries(product);
    const names = entries.map((e: any) => e.storeName || resolveStoreName(e)).filter(Boolean) as string[];

    return Array.from(new Set(names)).join(", ");
  }, [stores, resolveStoreName]);

  const getOwnerNames = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    // Try direct store owner
    if (product.store && typeof product.store === "object") {
      const st = stores.find((s) => s._id === (product.store as any).id);
      if (st?.owner?.name) return st.owner.name;
    }

    // Get owners from new structure
    const entries = getAllStoreEntries(product);
    const owners = entries
      .map((e: any) => {
        const storeId =
          e.storeId || (typeof e.store === "object" ? e.store?._id : e.store);
        const st = stores.find((s) => s._id === storeId);
        return st?.owner?.name;
      })
      .filter(Boolean) as string[];
    return Array.from(new Set(owners)).join(", ");
  };

  const getTotalQuantity = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    // For variant products, sum up totalStock from variantData
    if (
      product.hasVariation &&
      product.variantData &&
      Array.isArray(product.variantData)
    ) {
      const total = product.variantData.reduce(
        (total: number, variant: any) => {
          return total + (variant.stock?.totalStock || 0);
        },
        0
      );
      return total;
    }

    // For non-variant products, use totalStock from product.stock
    if (
      !product.hasVariation &&
      product.stock &&
      typeof product.stock === "object" &&
      (product.stock as any).totalStock !== undefined
    ) {
      const total = (product.stock as any).totalStock;
      return total;
    }

    // Legacy support - prefer aggregated store quantities when present
    const entries = getAllStoreEntries(product);
    if (entries.length > 0) {
      const total = entries.reduce(
        (sum: number, e: any) => sum + (Number(e.quantity) || 0),
        0
      );
      return total;
    }

    // Fallback to product-level quantity
    const fallback = Number(product.quantity) || 0;
    return fallback;
  };

  const getSellingPriceDisplay = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    // Check for variantData first (new server response structure)
    if (
      product.hasVariation &&
      Array.isArray(product.variantData) &&
      (product.variantData as any[]).length > 0
    ) {
      const prices = (product.variantData as any[]).map(
        (v) => Number(v?.sellingPrice) || 0
      );
      return ServerActions.HandleFunction.getPriceRange(prices);
    }
    // Fallback to variantInventory (old structure)
    if (
      product.hasVariation &&
      Array.isArray(product.variantInventory) &&
      (product.variantInventory as any[]).length > 0
    ) {
      const prices = (product.variantInventory as any[]).map(
        (v) => Number(v?.sellingPrice) || 0
      );
      return ServerActions.HandleFunction.getPriceRange(prices);
    }
    // For non-variant products, use the main product selling price
    if (typeof product.sellingPrice === "number")
      return `$${product.sellingPrice}`;
    return "N/A";
  };

  const getCostPriceDisplay = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    // Check for variantData first (new server response structure)
    if (
      product.hasVariation &&
      Array.isArray(product.variantData) &&
      (product.variantData as any[]).length > 0
    ) {
      const prices = (product.variantData as any[]).map(
        (v) => Number(v?.costPrice) || 0
      );
      return ServerActions.HandleFunction.getPriceRange(prices);
    }
    // Fallback to variantInventory (old structure)
    if (
      product.hasVariation &&
      Array.isArray(product.variantInventory) &&
      (product.variantInventory as any[]).length > 0
    ) {
      const prices = (product.variantInventory as any[]).map(
        (v) => Number(v?.costPrice) || 0
      );
      return ServerActions.HandleFunction.getPriceRange(prices);
    }
    // For non-variant products, use the main product cost price
    if (typeof product.costPrice === "number") return `$${product.costPrice}`;
    return "N/A";
  };

  // CSV and PDF export columns
  const exportColumns = React.useMemo(() => {
    // const columnConfigs: ColumnConfig<AdminTypes.InventoryTypes.ProductTypes.Product>[] = [
    return CommonComponents.generateExportColumns<AdminTypes.InventoryTypes.ProductTypes.Product>([
      {
        key: "productName",
        label: "Product Name",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => row.productName || "-",
        pdfWidth: 45,
      },
      {
        key: "category",
        label: "Category",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          if (typeof row.category === "object" && row.category !== null) {
            return (row.category as any).categoryName || "-";
          }
          if (row.category) {
            const match = categories.find((c) => c._id === row.category);
            return match?.categoryName || "-";
          }
          return "-";
        },
        pdfWidth: 40,
      },
      {
        key: "brand",
        label: "Brand",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          if (typeof row.brand === "object" && row.brand !== null) {
            return (row.brand as any).brand || "-";
          }
          if (row.brand) {
            const match = brands.find((b) => b._id === row.brand);
            return match?.brand || "-";
          }
          return "-";
        },
        pdfWidth: 35,
      },
      {
        key: "sku",
        label: "SKU",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => ((row.SKU as any) || "-") as string,
        pdfWidth: 35,
      },
      {
        key: "stores",
        label: "Stores",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => getStoreNames(row) || "-",
        pdfWidth: 55,
      },
      {
        key: "totalQuantity",
        label: "Total Quantity",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => String(getTotalQuantity(row)),
        pdfWidth: 30,
      },
      {
        key: "costPrice",
        label: "Cost Price",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => getCostPriceDisplay(row),
        pdfWidth: 35,
      },
      {
        key: "sellingPrice",
        label: "Selling Price",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => getSellingPriceDisplay(row),
        pdfWidth: 35,
      },
      {
        key: "status",
        label: "Status",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => (row.status ? "Active" : "Inactive"),
        pdfWidth: 25,
      },
      {
        key: "createdAt",
        label: "Created On",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) =>
          row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
        pdfWidth: 35,
      },
      {
        key: "updatedAt",
        label: "Updated On",
        accessor: (row: AdminTypes.InventoryTypes.ProductTypes.Product) =>
          row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-",
        pdfWidth: 35,
      },
    ])

    // return CommonComponents.generateExportColumns(columnConfigs);
  }, [categories, brands, units, stores, getStoreNames, getTotalQuantity, getCostPriceDisplay, getSellingPriceDisplay]);


  const handleEditClick = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleView = (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleDelete = async (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    await ServerActions.HandleFunction.handleDeleteCommon({
      id: product._id,
      deleteAction: (id: string | number) =>
        ServerActions.ServerActionslib.deleteProductAction(id as string),
      setLoading,
      router,
      successMessage: "Product deleted successfully",
      errorMessage: "Failed to delete product",
      onSuccess: () => {
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
      },
    });
  };

  const handleToggleStatus = React.useCallback(async (product: AdminTypes.InventoryTypes.ProductTypes.Product, checked: boolean) => {
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, status: checked } : p))
    );

    await ServerActions.HandleFunction.handleToggleStatusCommon({
      row: product,
      next: checked,
      getId: (p) => p._id,
      preparePayload: (_p, next) => ({ ids: [product._id], status: next }),
      updateAction: (_id, data) => ServerActions.ServerActionslib.bulkUpdateProductsStatusAction(data),
      setLoading,
      router,
      successMessage: `Product status updated to ${checked ? "Active" : "Inactive"}`,
      onError: () => {
        // Revert on error
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id ? { ...p, status: !checked } : p
          )
        );
      },
    });
  }, [router]);

  // Dynamic columns
  const tableColumns = React.useMemo(() => CommonComponents.createColumns<AdminTypes.InventoryTypes.ProductTypes.Product>({
    fields: [
      {
        name: "Image",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => getProductImageUrl(row) || "No Image",
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          const imageUrl = getProductImageUrl(product);
          return (
            <div className="p-2">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.productName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
        sortable: false,
      },
      {
        name: "Product Name",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => row.productName,
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => (
          <div className="font-semibold text-gray-900 dark:text-white">
            {product.productName}
          </div>
        ),
        sortable: true,
        width: "160px",
      },
      {
        name: "Category",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          if (typeof row.category === "object" && row.category !== null) {
            return (row.category as any).categoryName || "";
          }
          return row.category
            ? categories.find((c) => c._id === row.category)?.categoryName || ""
            : "";
        },
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          let categoryName = "";
          if (typeof product.category === "object" && product.category !== null) {
            categoryName = (product.category as any).categoryName || "";
          } else if (product.category) {
            categoryName =
              categories.find((c) => c._id === product.category)?.categoryName ||
              "";
          }
          return <span className="text-sm">{categoryName || "N/A"}</span>;
        },
        sortable: true,
      },
      {
        name: "Brand",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          if (typeof row.brand === "object" && row.brand !== null) {
            return (row.brand as any).brand || "";
          }
          return row.brand
            ? brands.find((b) => b._id === row.brand)?.brand || ""
            : "";
        },
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => {
          let brandName = "";
          if (typeof product.brand === "object" && product.brand !== null) {
            brandName = (product.brand as any).brand || "";
          } else if (product.brand) {
            brandName = brands.find((b) => b._id === product.brand)?.brand || "";
          }
          return <span>{brandName || "N/A"}</span>;
        },
        sortable: true,
      },
      {
        name: "SKU",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => (row.SKU as any) || "",
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => <span>{(product.SKU as any) || ""}</span>,
        sortable: true,
        width: "160px",
      },
      {
        name: "Store",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => getStoreNames(row),
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => (
          <span className="font-medium">{getStoreNames(product) || ""}</span>
        ),
        sortable: true,
      },
      {
        name: "Total Quantity",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => getTotalQuantity(row),
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => <span>{getTotalQuantity(product)}</span>,
        sortable: true,
      },
      {
        name: "Created Date",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => row.createdAt,
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => (
          <span>
            {product.createdAt
              ? new Date(product.createdAt).toLocaleDateString()
              : ""}
          </span>
        ),
        sortable: true,
      },
      {
        name: "Updated Date",
        selector: (row: AdminTypes.InventoryTypes.ProductTypes.Product) => row.updatedAt,
        cell: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => (
          <span>
            {product.updatedAt
              ? new Date(product.updatedAt).toLocaleDateString()
              : ""}
          </span>
        ),
        sortable: true,
      },
    ],
    status: {
      name: "Status",
      idSelector: (row) => row._id,
      valueSelector: (row) => !!row.status,
      onToggle: async (id: string, checked: boolean) => {
        const product = products.find((p) => p._id === id);
        if (product) {
          await handleToggleStatus(product, checked);
        }
      },
    },
    actions: [
      {
        render: (row) => (
          <UiWebComponents.Button
            size="icon"
            variant="viewaction"
            onClick={() => handleView(row)}
            title="View"
          >
            <FaEye className="w-4 h-4" />
          </UiWebComponents.Button>
        ),
      },
      ...(checkPermission("inventory.products", "update") ? [{
        render: (row: any) => (
          <UiWebComponents.Button
            size="icon"
            variant="editaction"
            onClick={() => handleEditClick(row)}
          >
            <FaEdit className="w-4 h-4" />
          </UiWebComponents.Button>
        ),
      }] : []),
      ...(checkPermission("inventory.products", "delete") ? [{
        render: (row: any) => (
          <UiWebComponents.Button
            size="icon"
            variant="deleteaction"
            onClick={() => handleDelete(row)}
          >
            <FaTrash className="w-4 h-4" />
          </UiWebComponents.Button>
        ),
      }] : []),
    ],
  }), [categories, brands, getStoreNames, getTotalQuantity, getProductImageUrl, products, handleToggleStatus, handleView, handleEditClick, handleDelete, checkPermission]);
  // clear selected data
  const clearSelectedData = () => {
    setClearSelectedRows(prev => !prev);
    setSelectedRows([]);
    router.refresh();
  }


  const handleAdd = async (formData: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) => {
    await ServerActions.HandleFunction.handleAddCommon({
      formData,
      createAction: ServerActions.ServerActionslib.createProductAction,
      setLoading,
      setShowModal,
      router,
      successMessage: "Product added successfully",
      errorMessage: "Failed to add product",
      onSuccess: (result) => {
        if (result?.data?.data) {
          setProducts((prev) => [result.data.data, ...prev]);
        }
      },
    });
  };
  const handleEdit = async (formData: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) => {
    await ServerActions.HandleFunction.handleEditCommon({
      formData,
      editingItem: editingProduct,
      getId: (item) => item._id,
      updateAction: (id: string | number, data: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) =>
        ServerActions.ServerActionslib.updateProductAction(id as string, data),
      setLoading,
      setShowEditModal,
      setEditingItem: setEditingProduct,
      router,
      successMessage: "Product updated successfully",
      errorMessage: "Failed to update product",
      onSuccess: (result) => {
        if (result?.data?.data && editingProduct) {
          setProducts((prev) =>
            prev.map((product) =>
              product._id === editingProduct._id ? result.data.data : product
            )
          );
        }
      },
    });
  };
  // Handle form submission with warranty processing
  const handleSubmit = async (formData: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) => {
    // Process warranty fields for "no-warranty" selection
    const processedFormData = { ...formData };
    if (processedFormData.warrantyType === "no-warranty") {
      processedFormData.warrantyType = "";
      processedFormData.warrantyDate = "";
      processedFormData.expiryDate = "";
    }

    if (showModal) {
      await handleAdd(processedFormData);
    } else {
      await handleEdit(processedFormData);
    }
  };
  // Bulk apply handler for CommonFilterBar (status updates / delete)
  const handleBulkApply = React.useCallback(async () => {
    await ServerActions.HandleFunction.handleBulkApplyCommon({
      selectedRows,
      actionFilter,
      activeStatusFilter,
      items: products,
      setItems: setProducts,
      bulkDeleteAction: ServerActions.ServerActionslib.bulkDeleteProductsAction,
      bulkUpdateStatusAction: ServerActions.ServerActionslib.bulkUpdateProductsStatusAction,
      clearSelectedData,
      idSelector: (r) => r._id,
    });
  }, [selectedRows, actionFilter, activeStatusFilter, products, clearSelectedData]);

  const downloadPdf = async (): Promise<any[]> => {
    return await ServerActions.HandleFunction.handleDownloadCommon({
      selectedRows,
      searchParams,
      bulkGetSelectedAction: ServerActions.ServerActionslib.bulkGetSelectedProductAction,
      bulkGetAllAction: (data) => ServerActions.ServerActionslib.bulkGetProductAction({ ...data, limit: 1000000 }),
      setDownloadData,
    });
  };


  const bulkActionOptions = React.useMemo(() => {
    const options = Constants.commonConstants.actionOptions;
    return options.filter(option => {
      if (option.value === 'Status') {
        return checkPermission("inventory.products", "update");
      }
      if (option.value === 'Delete') {
        return checkPermission("inventory.products", "delete");
      }
      return true;
    });
  }, [checkPermission]);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-medium text-textMain dark:text-white truncate">
            Product Management
            {(() => {
              if (!showModal && !showEditModal) return "";
              const modalTitle = showModal ? "Add Product" : "Edit Product";
              return ` > ${modalTitle}`;
            })()}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-textSmall pt-2">
            Manage your product inventory and details
          </p>
        </div>
        {(showModal || showEditModal || checkPermission("inventory.products", "create")) && (
          <UiWebComponents.Button
            variant="addBackButton"
            onClick={() => {
              if (showModal || showEditModal) {
                setShowModal(false);
                setShowEditModal(false);
                setEditingProduct(null);
              } else {
                setShowModal(true);
              }
            }}
          >
            {showModal || showEditModal ? (
              <>
                <HiArrowLeft className="w-4 h-4" /> Back
              </>
            ) : (
              <>
                <HiPlus className="w-4 h-4" /> Add
              </>
            )}
          </UiWebComponents.Button>
        )}
      </div>

      {/* Show filters and table only when modal is not open */}
      {!showModal && !showEditModal && (
        <div className="bg-white dark:bg-darkFilterbar rounded-[4px] h-full w-full mt-4 overflow-hidden">
          {/* Filters */}
          <CommonComponents.CommonFilterBar
            actionFilter={actionFilter}
            onActionFilterChange={(value: string) => {
              setActionFilter(value);
              if (value !== "Status") {
                setActiveStatusFilter("All");
              }
            }}
            actionOptions={bulkActionOptions}
            activeStatusFilter={activeStatusFilter}
            onActiveStatusFilterChange={setActiveStatusFilter}
            activeStatusOptions={[
              { name: 'Active', value: 'Active' },
              { name: 'Inactive', value: 'Inactive' }
            ]}
            selectedCount={selectedRows.length}
            onApply={bulkActionOptions.length > 0 ? handleBulkApply : undefined}
            categoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={(value: string) => {

              setSelectedCategoryFilter(value || 'All')
              // const params = new URLSearchParams(searchParams.toString());
              // if (value === "All") {
              //   params.delete("categoryId");
              // } else {
              //   params.set("categoryId", value);
              // }
              // params.set("page", "1");
              // router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            categoryOptions={[
              { name: "All Categories", value: "All" },
              ...categories.map((c) => ({
                name: c.categoryName,
                value: c._id,
              })),
            ]}
            statusFilter={statusFilter}
            onStatusFilterChange={(value: string) => {
              const validValue = value === "Active" || value === "Inactive" ? value : "All";
              setStatusFilter(validValue);
            }}
            statusOptions={[
              { label: "All Status", value: "All" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            renderExports={
              <>
                <UiWebComponents.DownloadCSV
                  data={downloadData}
                  columns={exportColumns.csvColumns}
                  filename={`products-${new Date()
                    .toISOString()
                    .split("T")[0]}.csv`}
                  onExport={async () => {
                    const data = await downloadPdf();
                    UiWebComponents.SwalHelper.success({ text: "CSV exported successfully." });
                    clearSelectedData();
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download CSV"
                    title="Download CSV"
                    disabled={products.length === 0}
                  >
                    <Image
                      src={Constants.assetsIcon.assets.csv}
                      alt="CSV"
                      width={28}
                      height={28}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7"
                    />
                  </button>
                </UiWebComponents.DownloadCSV>
                <UiWebComponents.DownloadPDF
                  data={downloadData}
                  columns={exportColumns.pdfColumns}
                  filename={`products-${new Date()
                    .toISOString()
                    .split("T")[0]}.pdf`}
                  title="Products Report"
                  orientation="landscape"
                  onExport={async () => {
                    const data = await downloadPdf();
                    UiWebComponents.SwalHelper.success({ text: "PDF exported successfully." });
                    clearSelectedData();
                    return data;
                  }}
                >
                  <button
                    type="button"
                    className="rounded-[4px] bg-[#ffffff] dark:bg-[#3A3A3A] border border-[#D8D9D9] border-opacity-50 font-interTight font-normal hover:bg-[#e0e0e0] dark:hover:bg-[#4A4A4A] shadow-sm transition-colors duration-200 cursor-pointer flex-shrink-0 sm:px-1 md:px-2 lg:px-2 xl:px-2 2xl:px-2 px-2 py-[6.9px]"
                    aria-label="Download PDF"
                    title="Download PDF"
                    disabled={products.length === 0}
                  >
                    <Image
                      src={Constants.assetsIcon.assets.pdf}
                      alt="PDF"
                      width={28}
                      height={28}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-7 xl:h-7 2xl:w-7 2xl:h-7"
                    />
                  </button>
                </UiWebComponents.DownloadPDF>
              </>
            }
          />

          <div>
            {loading ? (
              <div className="flex justify-center items-center p-6 sm:p-8 md:p-10 lg:p-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 border-b-2 border-primary"></div>
                <span className="ml-2 sm:ml-3 md:ml-4 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
                  Loading products...
                </span>
              </div>
            ) : (
              <CommonComponents.DataTable
                columns={tableColumns}
                data={filteredData}
                selectableRows
                clearSelectedRows={clearSelectedRows}
                onSelectedRowsChange={({ selectedRows }) =>
                  setSelectedRows(selectedRows)
                }
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
            )}
          </div>
        </div>
      )}


      {/* Show modal when open */}
      {(showModal || showEditModal) && (
        <AdminWebComponents.Models.ProductFormModal
          name={showModal ? "Add Product" : "Edit Product"}
          onClose={() => {
            setShowModal(false);
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSubmit}
          product={editingProduct || undefined}
          loading={loading}
          stores={stores}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          units={units}
          warranties={warrenties}
          variations={variations}
          taxes={taxes}
          products={products}
        />
      )}

      {showViewModal && viewingProduct && (
        <AdminWebComponents.Models.ProductDetailsModal
          product={viewingProduct}
          onClose={() => {
            setShowViewModal(false);
            setViewingProduct(null);
          }}
          getStoreNames={getStoreNames}
          getTotalQuantity={getTotalQuantity}
          getCostPriceDisplay={getCostPriceDisplay}
          getSellingPriceDisplay={getSellingPriceDisplay}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          units={units}
          taxes={taxes}
        />
      )}
    </>
  );
}

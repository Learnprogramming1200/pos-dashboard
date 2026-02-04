"use client";
import Image from "next/image";
import { Package, X } from "lucide-react";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

interface ProductModalProps {
  product: AdminTypes.InventoryTypes.ProductTypes.Product;
  onClose: () => void;
  getStoreNames: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => string;
  getTotalQuantity: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => number;
  getCostPriceDisplay: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => string;
  getSellingPriceDisplay: (product: AdminTypes.InventoryTypes.ProductTypes.Product) => string;
  categories: AdminTypes.InventoryTypes.ProductTypes.ProductCategory[];
  subcategories: AdminTypes.InventoryTypes.ProductTypes.ProductSubCategory[];
  brands: AdminTypes.InventoryTypes.ProductTypes.ProductBrand[];
  units: AdminTypes.InventoryTypes.ProductTypes.ProductUnit[];
  taxes: any[];
}

export default function ProductDetailsModal({
  product,
  onClose,
  getStoreNames,
  getTotalQuantity,
  getCostPriceDisplay,
  getSellingPriceDisplay,
  categories,
  subcategories,
  brands,
  units,
  taxes,
}: ProductModalProps) {
  const getCategoryName = () => {
    if (typeof product.category === "object" && product.category !== null)
      return (product.category as any).categoryName || "";
    return product.category
      ? categories.find((c) => c._id === product.category)?.categoryName || ""
      : "";
  };

  const getSubCategoryName = () => {
    if (typeof product.subCategory === "object" && product.subCategory !== null)
      return (product.subCategory as any).subcategory || "";
    return product.subCategory
      ? subcategories.find((s) => s._id === product.subCategory)?.subcategory || ""
      : "";
  };

  const getBrandName = () => {
    if (typeof product.brand === "object" && product.brand !== null)
      return (product.brand as any).brand || "";
    return product.brand
      ? brands.find((b) => b._id === product.brand)?.brand || ""
      : "";
  };

  const getUnitName = () => {
    const unitData = product.unit;
    if (!unitData) return "";

    let unitIdOrName = "";
    if (typeof unitData === "object" && unitData !== null) {
      // It could be populated: { _id, unit: "Name" }
      // Or from form: { unit: "ID", value: 1 }
      unitIdOrName = (unitData as any).unit || (unitData as any)._id || "";
    } else {
      unitIdOrName = unitData as string;
    }

    if (!unitIdOrName) return "";

    // Try to find the name in units array (in case it's an ID)
    const foundUnit = units.find(
      (u) => u._id === unitIdOrName || (u as any).id === unitIdOrName
    );
    if (foundUnit) return foundUnit.unit;

    // Return the value itself (might be the name already or a fallback)
    return unitIdOrName;
  };

  const getTaxDisplay = () => {
    // If product.tax is already an object (populated), use it
    if (typeof product.tax === 'object' && product.tax !== null) {
      const t = product.tax as any;
      if (t.taxName && t.value) {
        return `${t.taxName} - ${t.value}${t.valueType === "Percentage" ? "%" : ""}`;
      }
    }

    // If product.tax is an ID string, look it up in taxes array
    const taxId = typeof product.tax === 'string' ? product.tax : (product.tax as any)?._id;
    const taxInfo = taxes.find((t: any) => t._id === taxId);

    if (!taxInfo) return "N/A";

    return `${taxInfo.taxName} - ${taxInfo.value}${taxInfo.valueType === "Percentage" ? "%" : ""}`;
  };

  const createdAt = product.createdAt
    ? new Date(product.createdAt).toLocaleString()
    : "";
  const updatedAt = product.updatedAt
    ? new Date(product.updatedAt).toLocaleString()
    : "";

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary to-primaryHover p-3 sm:p-4 md:p-5 lg:p-[20px] text-white">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 lg:top-6 lg:right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 sm:p-2 transition-all"
            aria-label="Close modal"
          >
            <X size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pr-8 sm:pr-10 md:pr-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/10 backdrop-blur rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1">
                Product Details
              </h2>
              <p className="text-white/80 text-xs sm:text-sm">
                Complete product information
              </p>
            </div>
          </div>
          {/* Status Badge */}
          <div className="absolute -bottom-[18px] left-6 sm:left-8 bg-white dark:bg-gray-800 rounded-full px-3 sm:px-4 py-1.5 shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-2 z-10 transition-all">
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${product.status ? 'bg-emerald-500' : 'bg-gray-400 animate-pulse'}`}></div>
            <span className={`text-xs sm:text-sm font-bold ${product.status ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {product.status ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {/* Scroller for the content */}
        <div className="pt-2 sm:pt-3 md:pt-4 pb-2 sm:pb-3 md:pb-4 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-100px)] md:max-h-[70vh]">
          {/* Content - redesigned layout */}
          {product.hasVariation ? (
            // Variant Product Layout - 3 rows: (1 card with 3 sections), (2 cards), (variations)
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
              {/* Row 1: Single card with 3 sections in flex row */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {/* Section 1: Product Image & SKU */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 shadow-sm w-full mb-3 sm:mb-4 aspect-square max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                      {(() => {
                        // Determine which image to show
                        let imageUrl: string | null = null;

                        if (product.productImage) {
                          imageUrl = product.productImage;
                        } else if (Array.isArray((product as any).variantData) && (product as any).variantData.length > 0) {
                          const firstVariant = (product as any).variantData[0];
                          if (firstVariant?.variantImage) {
                            imageUrl = firstVariant.variantImage;
                          }
                        }

                        return imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.productName}
                            width={600}
                            height={600}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                            No Image
                          </div>
                        );
                      })()}
                    </div>
                    <div className="w-full space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-900 dark:text-white">
                      <div className="flex justify-between">
                        <span className="text-gray-500">SKU</span>
                        <span className="font-medium break-all">
                          {((product.SKU as any) || "-").substring(0, 20)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Quantity</span>
                        <span className="font-medium">
                          {getTotalQuantity(product)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Basic Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                      Basic Info
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Name</span>
                        <div className="font-medium">{product.productName}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Category</span>
                        <div className="font-medium">
                          {getCategoryName() || "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Sub-Category</span>
                        <div className="font-medium">
                          {getSubCategoryName() || "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Brand</span>
                        <div className="font-medium">
                          {getBrandName() || "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit</span>
                        <div className="font-medium">
                          {getUnitName() || "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Stores</span>
                        <div className="font-medium">
                          {getStoreNames(product) || "-"}
                        </div>
                      </div>
                      {!!product.description && (
                        <div>
                          <span className="text-gray-500">Description</span>
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none font-normal"
                            dangerouslySetInnerHTML={{
                              __html: product.description as any,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Pricing & Tax */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                      Pricing & Tax
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Selling Price</span>
                        <div className="font-medium">
                          {getSellingPriceDisplay(product)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost Price</span>
                        <div className="font-medium">
                          {getCostPriceDisplay(product)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Tax</span>
                        <div className="font-medium">{getTaxDisplay()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Low Stock Alert</span>
                        <div className="font-medium">
                          {typeof (product as any).lowStockAlert === "number"
                            ? (product as any).lowStockAlert
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: 2 cards in flex row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {/* Card: Timestamps */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    Timestamps
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Created</span>
                      <div className="font-medium break-words">{createdAt}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated</span>
                      <div className="font-medium break-words">{updatedAt}</div>
                    </div>
                  </div>
                </div>

                {/* Card: Physical */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    Physical
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Weight</span>
                      <div className="font-medium">{product.weight ?? "-"}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Dimensions</span>
                      <div className="font-medium break-words">
                        {product.dimensions || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Warranty</span>
                      <div className="font-medium">
                        {(
                          typeof product.warrantyType === "object"
                            ? (product.warrantyType as any)?._id
                            : product.warrantyType
                        )
                          ? "Yes"
                          : "No"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Variations section (full width) */}
              {Array.isArray(product.variantData) &&
                (product.variantData as any[]).length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                      Variations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {(product.variantData as any[]).map(
                        (v: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700">
                              <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white break-words">
                                {(() => {
                                  const typeName =
                                    (product as any)?.variantIds?.[0]
                                      ?.variant || "";
                                  const valueName =
                                    v?.variantTitle ||
                                    v?.variantValues?.[0]?.value ||
                                    "";
                                  if (typeName && valueName)
                                    return `${typeName}: ${valueName}`;
                                  if (valueName) return valueName;
                                  return `Variant ${idx + 1}`;
                                })()}
                              </div>
                              {/* <WebComponents.UiComponents.UiWebComponents.Badge
                                className={`text-xs sm:text-sm ${v?.status
                                  ? "bg-emerald-100 text-white"
                                  : "bg-gray-100 text-gray-600"
                                  }`}
                              >
                                {v?.status ? "Active" : "Inactive"}
                              </WebComponents.UiComponents.UiWebComponents.Badge> */}
                            </div>
                            {/* Variant Image and Barcode */}
                            <div className="mt-2 sm:mt-3 mb-3 flex items-start gap-3 sm:gap-4">
                              {/* Variant Image */}
                              {v?.variantImage && (
                                <div className="flex-shrink-0">
                                  <Image
                                    src={v.variantImage}
                                    alt={v?.variantTitle || v?.variantValues?.[0]?.value || `Variant ${idx + 1}`}
                                    width={100}
                                    height={100}
                                    className="object-contain rounded border border-gray-200 dark:border-gray-700 p-1"
                                  />
                                </div>
                              )}
                              {/* Barcode */}
                              {v?.barcodeUrl && (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                  <Image
                                    src={v.barcodeUrl}
                                    alt={v?.barcode || "barcode"}
                                    width={240}
                                    height={60}
                                    className="w-full max-w-[200px] sm:max-w-[240px] h-auto object-contain bg-white dark:bg-gray-800 rounded"
                                  />
                                  {v?.barcode && (
                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                      {v.barcode}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                              <div>
                                <div className="text-gray-500">Value</div>
                                <div className="font-medium">
                                  {v?.variantValues?.[0]?.value || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">SKU</div>
                                <div className="font-medium">
                                  {v?.SKU || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Barcode</div>
                                <div className="font-medium break-all text-xs">
                                  {v?.barcode || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Quantity</div>
                                <div className="font-medium">
                                  {v?.stock?.totalStock ?? 0}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Cost</div>
                                <div className="font-medium">
                                  {typeof v?.costPrice === "number"
                                    ? `$${v.costPrice}`
                                    : "-"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Price</div>
                                <div className="font-medium">
                                  {typeof v?.sellingPrice === "number"
                                    ? `$${v.sellingPrice}`
                                    : "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            // Non-Variant Product Layout - keep existing structure
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-gray-900 shadow-sm w-full aspect-square max-h-[200px] sm:max-h-[250px] md:max-h-[300px]">
                  {product.productImage ? (
                    <Image
                      src={product.productImage}
                      alt={product.productName}
                      width={600}
                      height={600}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="w-full space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-900 dark:text-white">
                  <div className="flex justify-between">
                    <span className="text-gray-500">SKU</span>
                    <span className="font-medium break-all">
                      {((product.SKU as any) || "-").substring(0, 20)}
                    </span>
                  </div>
                  {!!(product as any).barcode && (
                    <>
                      <div className="w-full">
                        {(product as any).barcodeUrl ? (
                          <Image
                            src={(product as any).barcodeUrl}
                            alt={(product as any).barcode || "barcode"}
                            width={240}
                            height={60}
                            className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[240px] h-auto object-contain bg-white dark:bg-gray-800 rounded"
                          />
                        ) : null}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Barcode</span>
                        <span className="font-medium break-all text-xs">
                          {(product as any).barcode || "-"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Quantity</span>
                    <span className="font-medium">
                      {getTotalQuantity(product)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 text-gray-900 dark:text-white">
                    Basic Info
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Name</span>
                      <div className="font-medium">{product.productName}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Category</span>
                      <div className="font-medium">
                        {getCategoryName() || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Sub-Category</span>
                      <div className="font-medium">
                        {getSubCategoryName() || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Brand</span>
                      <div className="font-medium">{getBrandName() || "-"}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Unit</span>
                      <div className="font-medium">{getUnitName() || "-"}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Stores</span>
                      <div className="font-medium">
                        {getStoreNames(product) || "-"}
                      </div>
                    </div>
                    {!!product.description && (
                      <div>
                        <span className="text-gray-500">Description</span>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none font-normal"
                          dangerouslySetInnerHTML={{
                            __html: product.description as any,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    Timestamps
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Created</span>
                      <div className="font-medium break-words">{createdAt}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated</span>
                      <div className="font-medium break-words">{updatedAt}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 text-gray-900 dark:text-white">
                    Pricing & Tax
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Selling Price</span>
                      <div className="font-medium">
                        {getSellingPriceDisplay(product)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost Price</span>
                      <div className="font-medium">
                        {getCostPriceDisplay(product)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity</span>
                      <div className="font-medium">
                        {typeof product.quantity === "number"
                          ? product.quantity
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Discount (%)</span>
                      <div className="font-medium">
                        {typeof (product as any).productDiscount === "number"
                          ? `${(product as any).productDiscount}%`
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tax</span>
                      <div className="font-medium">{getTaxDisplay()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Low Stock Alert</span>
                      <div className="font-medium">
                        {typeof (product as any).lowStockAlert === "number"
                          ? (product as any).lowStockAlert
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    Physical
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-500">Weight</span>
                      <div className="font-medium">{product.weight ?? "-"}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Dimensions</span>
                      <div className="font-medium break-words">
                        {product.dimensions || "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Warranty</span>
                      <div className="font-medium">
                        {(
                          typeof product.warrantyType === "object"
                            ? (product.warrantyType as any)?._id
                            : product.warrantyType
                        )
                          ? "Yes"
                          : "No"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Footer */}
          {/* <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 bg-white dark:bg-gray-800 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-200 dark:border-gray-700">
            <WebComponents.UiComponents.UiWebComponents.Button
              variant="cancel"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3"
            >
              Close
            </WebComponents.UiComponents.UiWebComponents.Button>
          </div> */}
        </div>
      </div>
    </div >
  );
}


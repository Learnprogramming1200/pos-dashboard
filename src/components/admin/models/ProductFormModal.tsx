"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ServerActions } from "@/lib";
import { Constants } from "@/constant";
import { customHooks } from "@/hooks";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";
import { toast } from "react-toastify";
// import { convertToYMD } from "@/components/ui/SingleDatePicker";

interface ProductFormModalProps {
  name: string;
  onClose: () => void;
  onSubmit: (data: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) => void;
  product?: AdminTypes.InventoryTypes.ProductTypes.Product;
  loading: boolean;
  stores?: AdminTypes.storeTypes.Store[];
  categories?: AdminTypes.InventoryTypes.ProductTypes.ProductCategory[];
  subcategories?: AdminTypes.InventoryTypes.ProductTypes.ProductSubCategory[];
  brands?: AdminTypes.InventoryTypes.ProductTypes.ProductBrand[];
  units?: AdminTypes.InventoryTypes.ProductTypes.ProductUnit[];
  warranties?: AdminTypes.InventoryTypes.ProductTypes.ProductWarranty[];
  variations?: AdminTypes.InventoryTypes.ProductTypes.ProductVariation[];
  taxes?: any[];
  products?: AdminTypes.InventoryTypes.ProductTypes.Product[];
}

export default function ProductFormModal({
  name,
  onClose,
  onSubmit,
  product,
  loading,
  stores = [],
  categories = [],
  subcategories = [],
  brands = [],
  units = [],
  warranties = [],
  variations = [],
  taxes = [],
  products = [],
}: ProductFormModalProps) {
  const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), {
    ssr: false,
  }) as any;

  // Helper function to get initial stock data
  const getInitialStock = () => {
    if (!product) {
      return [{ storeId: "", quantity: 0 }];
    }

    // For variant products, extract store data from variantStocks or variantData
    if (product.hasVariation) {
      // Check for variantStocks array first
      if ((product as any).variantStocks && Array.isArray((product as any).variantStocks)) {
        const stores = new Set<string>();
        ((product as any).variantStocks as any[]).forEach((vs: any) => {
          let sId = "";
          if (typeof vs.storeId === "string") sId = vs.storeId;
          else if (vs.storeId && typeof vs.storeId === "object") sId = vs.storeId._id || vs.storeId.id;
          if (sId) stores.add(sId);
        });

        if (stores.size > 0) {
          return Array.from(stores).map(id => ({ storeId: id, quantity: 0 }));
        }
      }

      // Check variantData for store information
      if (product.variantData && Array.isArray(product.variantData)) {
        const stores = new Set<string>();
        product.variantData.forEach((v: any) => {
          if (v.stock && v.stock.storeStock && Array.isArray(v.stock.storeStock)) {
            v.stock.storeStock.forEach((ss: any) => {
              let sId = "";
              if (typeof ss.storeId === "string") sId = ss.storeId;
              else if (ss.storeId && typeof ss.storeId === "object") sId = ss.storeId._id;
              if (sId) stores.add(sId);
            });
          }
        });

        if (stores.size > 0) {
          return Array.from(stores).map(id => ({ storeId: id, quantity: 0 }));
        }
      }

      // If no store data found for variant product, return empty array
      return [];
    }

    // For non-variant products, handle stock data
    // New structure: stock.storeStock array
    if ((product.stock as any)?.storeStock && Array.isArray((product.stock as any).storeStock)) {
      return (product.stock as any).storeStock.map((s: any) => ({
        storeId: typeof s.storeId === "string" ? s.storeId : s.storeId?._id || "",
        quantity: s.quantity || 0,
      }));
    }
    // Old structure: stock array
    if (Array.isArray(product.stock) && product.stock.length > 0) {
      return product.stock.map((s: any) => ({
        storeId: typeof s.storeId === "string" ? s.storeId : s.storeId?._id || "",
        quantity: s.quantity || 0,
      }));
    }

    // If no stock data found for non-variant product, return one empty entry
    return [{ storeId: "", quantity: 0 }];
  };

  // Helper to find variantId by matching valueId
  const findVariantIdByValueId = (valueId: string): string => {
    if (!valueId || !variations || variations.length === 0) return "";

    for (const variation of variations) {
      for (const value of variation.values) {
        // Check both _id and id for the value
        const valId = typeof value === "string"
          ? value
          : (value as any)._id || (value as any).id || "";

        if (valId === valueId || value === valueId) {
          return variation._id || variation.id || "";
        }
      }
    }
    return "";
  };

  // Helper function to get initial variant inventory
  const getInitialVariantInventory = () => {
    if (!product || !product.hasVariation) {
      return [];
    }

    // New structure: variantData
    if (product.variantData && Array.isArray(product.variantData) && product.variantData.length > 0) {
      return product.variantData.map((variant: any) => {
        const variantValue =
          variant.variantValues && variant.variantValues.length > 0
            ? variant.variantValues[0].value
            : variant.variantTitle || "";

        // Try to find variantId from variantValues
        let variantId = "";
        if (variant.variantValues && variant.variantValues.length > 0) {
          const valueId = variant.variantValues[0].valueId;
          variantId = findVariantIdByValueId(valueId);
        }

        // Fallback to first variantId from product.variantIds
        if (!variantId && product.variantIds && Array.isArray(product.variantIds) && product.variantIds.length > 0) {
          const firstVariant = product.variantIds[0];
          variantId = typeof firstVariant === "string" ? firstVariant : (firstVariant as any)._id || (firstVariant as any).id || "";
        }

        let quantity = 0;
        if (variant.stock) {
          if (typeof variant.stock.totalStock === 'number') {
            quantity = variant.stock.totalStock;
          } else if (Array.isArray(variant.stock.storeStock) && variant.stock.storeStock.length > 0) {
            quantity = variant.stock.storeStock.reduce((sum: number, store: any) => sum + (store.quantity || 0), 0);
          }
        }

        return {
          _id: variant._id || variant.id || "",
          variantValue: variantValue,
          SKU: variant.SKU || "",
          quantity: quantity,
          costPrice: variant.costPrice || 0,
          sellingPrice: variant.sellingPrice || 0,
          image: variant.variantImage || variant.image || null,
          variantId: variantId,
          discount: variant.discount || 0,
          lowStockAlert: variant.lowStockAlert || 0,
        };
      });
    }

    // Fallback: variantInventory
    if (product.variantInventory && Array.isArray(product.variantInventory)) {
      // Get fallback variantId
      let fallbackVariantId = "";
      if (product.variantIds && Array.isArray(product.variantIds) && product.variantIds.length > 0) {
        const firstVariant = product.variantIds[0];
        fallbackVariantId = typeof firstVariant === "string" ? firstVariant : (firstVariant as any)._id || (firstVariant as any).id || "";
      }

      return product.variantInventory.filter(Boolean).map((v: any) => ({
        _id: v?._id || v?.id || "",
        variantValue: v?.variationValue || v?.variantValue || "",
        SKU: v?.SKU || "",
        quantity: v?.quantity || 0,
        costPrice: v?.costPrice || 0,
        sellingPrice: v?.sellingPrice || 0,
        image: v?.variantImage || v?.image || null,
        variantId: v?.variantId || fallbackVariantId,
        discount: v?.discount || 0,
        lowStockAlert: v?.lowStockAlert || 0,
      }));
    }

    return [];
  };

  // Helper function to get initial variant ID
  const getInitialVariantId = () => {
    if (product?.variantIds && Array.isArray(product.variantIds) && product.variantIds.length > 0) {
      const firstVariant = product.variantIds[0];
      if (typeof firstVariant === "string") {
        return firstVariant;
      }
      if (typeof firstVariant === "object" && firstVariant !== null) {
        return (firstVariant as any).id || "";
      }
    }
    return "";
  };

  // Helper function to get initial unit value
  const getInitialUnitValue = () => {
    if (typeof product?.unit === "object" && product?.unit !== null) {
      return (product.unit as any).value || product?.weight || 0;
    }
    return product?.weight || 0;
  };

  // Helper function to get initial warranty type
  const getInitialWarrantyType = () => {
    if (!product?.warrantyType) return "";
    if (typeof product.warrantyType === "object" && product.warrantyType !== null) {
      const warrantyObj = product.warrantyType as any;
      return warrantyObj._id || "";
    }
    if (typeof product.warrantyType === "string") {
      return product.warrantyType;
    }
    return "";
  };

  // Helper to safely get ID from any object or string
  const getSafeId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item._id || item.id || "";
  };

  // Helper function to extract category ID from object or find by name
  const getCategoryId = (productData?: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    const prod = productData || product;
    if (!prod?.category) return "";
    if (typeof prod.category === "string") return prod.category;
    if (typeof prod.category === "object") {
      const categoryObj = prod.category as any;
      if (categoryObj._id) return categoryObj._id;
      if (categoryObj.id) return categoryObj.id;
      // If no _id, try to find by categoryName
      const name = categoryObj.categoryName || categoryObj.name;
      if (name) {
        const matched = categories.find((c) => c.categoryName === name);
        if (matched) return matched._id;
      }
    }
    return "";
  };

  // Helper function to extract subCategory ID from object or find by name
  const getSubCategoryId = (productData?: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    const prod = productData || product;
    if (!prod?.subCategory) return "";
    if (typeof prod.subCategory === "string") return prod.subCategory;
    if (typeof prod.subCategory === "object") {
      const subCategoryObj = prod.subCategory as any;
      if (subCategoryObj._id) return subCategoryObj._id;
      if (subCategoryObj.id) return subCategoryObj.id;

      const name = subCategoryObj.subcategory || subCategoryObj.name || subCategoryObj.subCategoryName;
      if (name) {
        const matched = subcategories.find((s) => s.subcategory === name);
        if (matched) return matched._id;
      }
    }
    return "";
  };

  // Helper function to extract brand ID from object or find by name
  const getBrandId = (productData?: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    const prod = productData || product;
    if (!prod?.brand) return "";
    if (typeof prod.brand === "string") return prod.brand;
    if (typeof prod.brand === "object") {
      const brandObj = prod.brand as any;
      if (brandObj._id) return brandObj._id;
      if (brandObj.id) return brandObj.id;

      const name = brandObj.brand || brandObj.name || brandObj.brandName;
      if (name) {
        const matched = brands.find((b) => b.brand === name);
        if (matched) return matched._id;
      }
    }
    return "";
  };

  // Helper function to extract unit ID from object or find by unit name
  const getUnitId = (productData?: AdminTypes.InventoryTypes.ProductTypes.Product) => {
    const prod = productData || product;
    if (!prod?.unit) return "";
    if (typeof prod.unit === "string") return prod.unit;
    if (typeof prod.unit === "object") {
      const unitObj = prod.unit as any;
      if (unitObj._id) return unitObj._id;
      if (unitObj.id) return unitObj.id;

      const name = unitObj.unit || unitObj.name || unitObj.shortName;
      if (name) {
        const matched = units.find((u) => u.unit === name || u.shortName === name);
        if (matched) return matched._id;
      }
    }
    return "";
  };

  const [formData, setFormData] = React.useState<AdminTypes.InventoryTypes.ProductTypes.ProductFormData>({
    productImage: product?.productImage || null,
    stock: getInitialStock(),
    productName: product?.productName || "",
    description: product?.description || "",
    category: getCategoryId(),
    subCategory: getSubCategoryId(),
    brand: getBrandId(),
    unit: {
      unit: getUnitId(),
      value: getInitialUnitValue(),
    },
    hasVariation: product?.hasVariation || false,
    variantInventory: getInitialVariantInventory(),
    variantId: getInitialVariantId(),
    productCostPrice: product?.costPrice || 0,
    productSellingPrice: product?.sellingPrice || 0,
    warrantyType: getInitialWarrantyType(),
    warrantyDate: product?.warrantyDate || "",
    expiryDate: (product as any)?.expiryDate || "",
    tax: Array.isArray(product?.tax)
      ? product!.tax.map((t: any) => (typeof t === "string" ? t : t?._id || "")).filter(Boolean)
      : typeof product?.tax === "string"
        ? [product!.tax]
        : (product?.tax as any)?._id
          ? [(product!.tax as any)._id]
          : [],
    productDiscount: product?.discount || 0,
    productSKU: product?.SKU || "",
    barcode: product?.barcode || "",
    dimensions: product?.dimensions || "",
    status: product?.status !== undefined ? product.status : true,
    lowStockAlert: product?.lowStockAlert || 0,
  });

  // Determine which expiry/warranty fields to show based on selected category
  const selectedCategory = React.useMemo(
    () => categories.find((c) => c._id === formData.category),
    [categories, formData.category]
  );
  const showWarrantyFields = !!(selectedCategory as any)?.hasWarranty;
  const showExpiryFields = !!(selectedCategory as any)?.hasExpiry;

  // Barcode scanning state
  const [scanCode, setScanCode] = React.useState<string>("");
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const [barcodeFetchStatus, setBarcodeFetchStatus] = React.useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({
    loading: false,
    success: false,
    error: null,
  });

  // Barcode suggestions
  const {
    suggestions,
    isLoading: suggestionsLoading,
    updateSearchTerm,
    clearSuggestions,
  } = customHooks.useBarcodeSuggestions({ products, debounceMs: 300 });
  const scanTimerRef = React.useRef<number | null>(null);

  // New state to trigger form reset in child component
  const [resetTrigger, setResetTrigger] = React.useState(0);



  // Handle warranty and expiry field visibility and calculations
  React.useEffect(() => {
    // 1. Clear warranty fields if hidden by category
    if (!showWarrantyFields) {
      if (formData.warrantyType || formData.warrantyDate) {
        setFormData(prev => ({
          ...prev,
          warrantyType: "",
          warrantyDate: "",
        }));
      }
    }

    // 2. Clear expiry fields if hidden by category AND not set by warranty
    if (!showExpiryFields && (!showWarrantyFields || formData.warrantyType === "no-warranty" || !formData.warrantyType)) {
      if (formData.expiryDate) {
        setFormData(prev => ({
          ...prev,
          expiryDate: "",
        }));
      }
    }

    // 3. Handle warranty date calculations when shown
    if (showWarrantyFields) {
      if (formData.warrantyType === "no-warranty") {
        setFormData((prev) => {
          if (prev.warrantyDate === "" && prev.expiryDate === "") return prev;
          return {
            ...prev,
            warrantyDate: "",
            expiryDate: "",
          };
        });
      } else if (formData.warrantyType) {
        const selectedWarranty = warranties.find((w) => w._id === formData.warrantyType);
        if (selectedWarranty) {
          const now = new Date();
          const duration = Number(selectedWarranty.duration) || 0;

          if (selectedWarranty.period === "Year") {
            now.setFullYear(now.getFullYear() + duration);
          } else {
            now.setMonth(now.getMonth() + duration);
          }

          const day = now.getDate().toString().padStart(2, '0');
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const year = now.getFullYear();
          const dateStr = `${day}-${month}-${year}`;

          if (formData.warrantyDate !== dateStr || formData.expiryDate !== dateStr) {
            setFormData((prev) => ({
              ...prev,
              warrantyDate: dateStr,
              expiryDate: dateStr,
            }));
          }
        }
      }
    }
  }, [showWarrantyFields, showExpiryFields, formData.warrantyType, warranties, formData.warrantyDate, formData.expiryDate]);


  // Update form data when product prop changes (for edit mode)
  React.useEffect(() => {
    if (product) {
      // Helper to safely get ID from string or object
      const getId = (item: any): string => {
        if (!item) return "";
        if (typeof item === "string") return item;
        return item._id || item.id || "";
      };

      // Handle stock structure - support both new (stock.storeStock) and old (stock array) formats
      let stockData: Array<{ storeId: string; quantity: number }> = [];

      // Method 1: Check stock.storeStock (New Standard)
      if ((product.stock as any)?.storeStock && Array.isArray((product.stock as any).storeStock)) {
        stockData = (product.stock as any).storeStock.map((s: any) => ({
          storeId: getId(s.storeId || s.store),
          quantity: s.quantity || 0,
        }));
      }
      // Method 2: Check stock array (Old Standard)
      else if (Array.isArray(product.stock) && product.stock.length > 0) {
        stockData = product.stock.map((s: any) => ({
          storeId: getId(s.storeId || s.store),
          quantity: s.quantity || 0,
        }));
      }
      // Method 2.5: Check top-level product.store (Single Store Association)
      else if (product.store) {
        const sId = getId(product.store);
        if (sId) {
          stockData = [{ storeId: sId, quantity: (product.stock as any)?.totalStock || (product.stock as any)?.quantity || 0 }];
        }
      }

      // Method 3: If no stock found yet, look in variantData (for variation products)
      if ((!stockData || stockData.length === 0 || !stockData[0]?.storeId) && product.hasVariation) {
        const stores = new Set<string>();

        // Check variantData first (primary source for variations)
        if (product.variantData && Array.isArray(product.variantData)) {
          product.variantData.forEach((v: any) => {
            if (v.stock?.storeStock && Array.isArray(v.stock.storeStock)) {
              v.stock.storeStock.forEach((ss: any) => {
                const sId = getId(ss.storeId || ss.store);
                if (sId) stores.add(sId);
              });
            }
          });
        }

        // Fallback to variantStocks
        if (stores.size === 0 && (product as any).variantStocks && Array.isArray((product as any).variantStocks)) {
          ((product as any).variantStocks as any[]).forEach((vs: any) => {
            const sId = getId(vs.storeId || vs.store);
            if (sId) stores.add(sId);
          });
        }

        // Fallback to variantInventory (legacy)
        if (stores.size === 0 && (product as any).variantInventory && Array.isArray((product as any).variantInventory)) {
          ((product as any).variantInventory as any[]).forEach((v: any) => {
            if (v.storeQuantities && Array.isArray(v.storeQuantities)) {
              v.storeQuantities.forEach((sq: any) => {
                if (sq.storeId) stores.add(sq.storeId);
              });
            }
          });
        }

        if (stores.size > 0) {
          stockData = Array.from(stores).map(id => ({ storeId: id, quantity: 0 }));
        }
      }

      // Default if nothing found: one empty entry
      if (stockData.length === 0) {
        stockData = [{ storeId: "", quantity: 0 }];
      }

      // Handle unit structure
      let unitValue = 0;
      if (typeof product.unit === "object" && product.unit !== null) {
        unitValue = (product.unit as any).value || product.weight || 0;
      } else {
        unitValue = product.weight || 0;
      }

      // Handle warranty type
      let warrantyTypeValue = "";
      if (product.warrantyType) {
        warrantyTypeValue = getId(product.warrantyType);
      }

      const newFormData: AdminTypes.InventoryTypes.ProductTypes.ProductFormData = {
        productImage: product.productImage || null,
        stock: stockData,
        productName: product.productName || "",
        description: product.description || "",
        category: getCategoryId(),
        subCategory: getSubCategoryId(),
        brand: getBrandId(),
        unit: {
          unit: getUnitId(),
          value: unitValue,
        },
        hasVariation: product.hasVariation || false,
        variantInventory: [],
        variantId: "",
        productCostPrice: product.costPrice || 0,
        productSellingPrice: product.sellingPrice || 0,
        warrantyType: warrantyTypeValue,
        warrantyDate: product.warrantyDate || "",
        expiryDate: (product as any).expiryDate || "",
        tax: Array.isArray(product.tax)
          ? product.tax.map((t: any) => (typeof t === "string" ? t : t?._id || "")).filter(Boolean)
          : typeof product.tax === "string"
            ? [product.tax]
            : (product.tax as any)?._id
              ? [(product.tax as any)._id]
              : [],
        productDiscount: product.discount || 0,
        productSKU: product.SKU || "",
        barcode: product.barcode || "",
        dimensions: product.dimensions || "",
        status: product.status !== undefined ? product.status : true,
        lowStockAlert: product.lowStockAlert || 0,
      };

      // Handle variations
      if (product.hasVariation && product.variantData?.length > 0) {

        // Set global variantId from first variant if available
        if (product.variantIds?.length > 0) {
          newFormData.variantId = getId(product.variantIds[0]);
        }

        // Transform variantData to variantInventory
        newFormData.variantInventory = product.variantData.map((variant: any) => {
          const variantValue = variant.variantValues?.[0]?.value || variant.variantTitle || "";

          // CRITICAL FIX: Find and set variantId for this specific variant row
          let rowVariantId = "";
          if (variant.variantValues?.[0]?.valueId) {
            // Try to find matching variant type (e.g., "Color", "Size") for this value
            rowVariantId = findVariantIdByValueId(variant.variantValues[0].valueId);
          }
          if (!rowVariantId && newFormData.variantId) {
            rowVariantId = newFormData.variantId; // Fallback to global
          }

          let quantity = 0;
          if (variant.stock) {
            if (typeof variant.stock.totalStock === 'number') {
              quantity = variant.stock.totalStock;
            } else if (Array.isArray(variant.stock.storeStock)) {
              quantity = variant.stock.storeStock.reduce((sum: number, store: any) => sum + (store.quantity || 0), 0);
            }
          }

          return {
            _id: variant._id || variant.id || "",
            variantValue: variantValue,
            SKU: variant.SKU || "",
            quantity: quantity,
            costPrice: variant.costPrice || 0,
            sellingPrice: variant.sellingPrice || 0,
            image: variant.variantImage || variant.image || null,
            variantId: rowVariantId, // This field was missing!
            discount: variant.discount || 0,
            lowStockAlert: variant.lowStockAlert || 0,
          };
        });
      } else if (product.variantInventory && Array.isArray(product.variantInventory)) {
        // Legacy structure
        newFormData.variantInventory = product.variantInventory.filter(Boolean).map((v: any) => ({
          _id: v?._id || v?.id || "",
          variantValue: v?.variationValue || v?.variantValue || "",
          SKU: v?.SKU || "",
          quantity: v?.quantity || 0,
          costPrice: v?.costPrice || 0,
          sellingPrice: v?.sellingPrice || 0,
          image: v?.variantImage || v?.image || null,
          variantId: v?.variantId || newFormData.variantId,
          discount: v?.discount || 0,
          lowStockAlert: v?.lowStockAlert || 0,
        }));
      }

      setFormData(newFormData);

      // Trigger RHF reset
      setTimeout(() => {
        setResetTrigger(prev => prev + 1);
      }, 0);
    }
  }, [product, variations, categories, subcategories, brands, units]);



  // Handle warranty date calculations
  React.useEffect(() => {
    if (formData.warrantyType === "no-warranty") {
      // Clear warranty dates when no warranty is selected
      setFormData((prev) => ({
        ...prev,
        warrantyDate: "",
        expiryDate: "",
      }));
    } else if (formData.warrantyType) {
      // Find the selected warranty
      const selectedWarranty = warranties.find((w) => w._id === formData.warrantyType);
      if (selectedWarranty) {
        // Set warranty start date to current date
        const currentDate = new Date();
        const currentDateYmd = currentDate.toISOString().split('T')[0]; // yyyy-mm-dd format

        // Calculate expiry date based on duration and period
        const expiryDate = new Date(currentDate);
        const duration = selectedWarranty.duration;

        switch (selectedWarranty.period.toLowerCase()) {
          case 'days':
            expiryDate.setDate(expiryDate.getDate() + duration);
            break;
          case 'months':
            expiryDate.setMonth(expiryDate.getMonth() + duration);
            break;
          case 'years':
            expiryDate.setFullYear(expiryDate.getFullYear() + duration);
            break;
          default:
            // Default to days if period is not recognized
            expiryDate.setDate(expiryDate.getDate() + duration);
        }

        const expiryDateYmd = expiryDate.toISOString().split('T')[0];

        setFormData((prev) => ({
          ...prev,
          warrantyDate: currentDateYmd,
          expiryDate: expiryDateYmd,
        }));
      }
    }
  }, [formData.warrantyType, warranties]);

  // Barcode scanning functionality
  const commitScan = (code: string) => {
    const v = code.trim();
    if (!v) return;

    setFormData((prev) => ({ ...prev, barcode: v }));
    setScanCode("");
    setIsScanning(false);
  };

  // Fetch product data by barcode
  const fetchProductData = async (barcodeValue: string) => {
    if (!barcodeValue) return;
    setBarcodeFetchStatus({ loading: true, success: false, error: null });
    try {
      const result = await ServerActions.ServerActionslib.getProductByBarcodeAction(barcodeValue);

      if (!result.success) {
        console.error("❌ Failed to fetch product by barcode:", result.error);
        setBarcodeFetchStatus({
          loading: false,
          success: false,
          error: result.error || "Product not found",
        });
        return;
      }

      const product = result.data.data; // Access the nested data structure

      // Auto-fill ALL product fields from backend data
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          // Basic product info
          productName: product.productName || "",
          description: product.description || "",
          productSKU: product.SKU || "",
          barcode: product.barcode || barcodeValue,

          // Product image - store the URL from response
          productImage: product.productImage || null,

          // Category and brand info - use helper functions to handle object structure
          category: getCategoryId(product as any),
          subCategory: getSubCategoryId(product as any),
          brand: getBrandId(product as any),
          unit: {
            unit: getUnitId(product as any),
            value: typeof product.unit === "object" && product.unit !== null
              ? (product.unit as any).value || product.weight || 0
              : product.weight || 0,
          },

          // Pricing and stock
          productCostPrice: product.costPrice || 0,
          productSellingPrice: product.sellingPrice || 0,
          stock:
            product.stock && product.stock.length > 0
              ? product.stock.map((s: any) => ({
                storeId:
                  typeof s.storeId === "string"
                    ? s.storeId
                    : s.storeId?._id || "",
                quantity: s.quantity || 0,
              }))
              : [{ storeId: "", quantity: 0 }],
          dimensions: product.dimensions || "",

          // Tax and warranty
          tax: Array.isArray(product.tax)
            ? product.tax.map((t: any) => (typeof t === "string" ? t : t?._id || "")).filter(Boolean)
            : typeof product.tax === "string"
              ? [product.tax]
              : (product.tax as any)?._id
                ? [(product.tax as any)._id]
                : [],
          warrantyType: product.warrantyType?._id || "",
          warrantyDate: product.warrantyDate || "",
          productDiscount: (product as any).discount || 0,

          // Variations
          hasVariation: product.hasVariation || false,
          variantInventory: [] as any[],
          variantId: "",

          // Status
          status: product.status !== undefined ? product.status : true,
        };

        // Handle variations if product has them
        if (
          product.hasVariation &&
          product.variantData &&
          product.variantData.length > 0
        ) {

          // Set the variant ID from variantIds array
          if (product.variantIds && Array.isArray(product.variantIds) && product.variantIds.length > 0) {
            const firstVariant = product.variantIds[0];
            if (typeof firstVariant === "string") {
              newFormData.variantId = firstVariant;
            } else if (typeof firstVariant === "object" && firstVariant !== null) {
              newFormData.variantId = (firstVariant as any)._id || (firstVariant as any).id || "";
            }
          }

          // Transform variantData to variantInventory format
          newFormData.variantInventory = product.variantData.map(
            (variant: any) => {
              // Get the variant value from variantValues array
              const variantValue =
                variant.variantValues && variant.variantValues.length > 0
                  ? variant.variantValues[0].value
                  : variant.variantTitle || "";

              // Get quantity from stock data if available
              let quantity = 0;
              if (variant.stock) {
                if (typeof variant.stock.totalStock === 'number') {
                  quantity = variant.stock.totalStock;
                } else if (Array.isArray(variant.stock.storeStock) && variant.stock.storeStock.length > 0) {
                  quantity = variant.stock.storeStock.reduce((sum: number, store: any) => sum + (store.quantity || 0), 0);
                }
              }

              const variantItem = {
                variantValue: variantValue,
                SKU: variant.SKU || "",
                quantity: quantity,
                costPrice: variant.costPrice || 0,
                sellingPrice: variant.sellingPrice || 0,
                image: variant.variantImage || variant.image || null,
                discount: variant.discount || 0,
                lowStockAlert: variant.lowStockAlert || 0,
              };

              return variantItem;
            }
          );
        } else if (product.variantInventory) {
          // Fallback to old variantInventory structure
          newFormData.variantInventory = product.variantInventory
            .filter(Boolean)
            .map((v: any) => ({
              variantValue: v?.variationValue || v?.variantValue || "",
              SKU: v?.SKU || "",
              quantity: v?.quantity || 0,
              costPrice: v?.costPrice || 0,
              sellingPrice: v?.sellingPrice || 0,
              image: v?.image || null,
              discount: v?.discount || 0,
              lowStockAlert: v?.lowStockAlert || 0,
            }));
        } else {
        }

        // Trigger RHF reset after scan update
        setTimeout(() => {
          setResetTrigger(prev => prev + 1);
        }, 0);

        return newFormData;
      });

      setBarcodeFetchStatus({ loading: false, success: true, error: null });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setBarcodeFetchStatus((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      console.error("❌ Failed to fetch product by barcode:", error);
      setBarcodeFetchStatus({
        loading: false,
        success: false,
        error: "Failed to fetch product data",
      });
    }
  };

  // Handle barcode suggestion selection
  const handleBarcodeSuggestionSelect = (suggestion: any) => {
    setFormData((prev) => ({ ...prev, barcode: suggestion.barcode }));
    clearSuggestions();

    // Optionally fetch product data for the selected barcode
    fetchProductData(suggestion.barcode);
  };

  // Keyboard event listener for barcode scanner
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Only listen for keyboard input when scanning is active
      if (!isScanning) return;

      // Ignore if focused on input/textarea/select to not disturb typing
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();
      const isInput =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (target?.isContentEditable ?? false);
      if (isInput) return;

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
        commitScan(scanCode);
        return;
      }

      if (e.key.length === 1) {
        setScanCode((prev) => prev + e.key);
        if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
        scanTimerRef.current = window.setTimeout(() => {
          commitScan(scanCode);
        }, 120);
      }
    };

    if (isScanning) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (scanTimerRef.current) {
        window.clearTimeout(scanTimerRef.current);
      }
    };
  }, [scanCode, isScanning]);

  const handleSubmit = async (e?: React.FormEvent, directData?: AdminTypes.InventoryTypes.ProductTypes.ProductFormData) => {
    if (e) e.preventDefault();

    try {
      const normalizeDate = (value: any) => {
        if (!value) return "";
        const val = value.toString().trim();
        if (!val) return "";

        // Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
        if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(val)) {
          const separator = val.includes("/") ? "/" : "-";
          const [day, month, year] = val.split(separator);
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return val;
      };

      const dataToUse = directData || formData;
      const normalizedExpiryDate = normalizeDate(dataToUse.expiryDate);
      const normalizedWarrantyDate = normalizeDate(dataToUse.warrantyDate);

      // Safety check: ensure hidden fields are cleared even if they persisted in state
      const cleanExpiryDate = showExpiryFields || (showWarrantyFields && dataToUse.warrantyType && dataToUse.warrantyType !== "no-warranty") ? normalizedExpiryDate : "";
      const cleanWarrantyType = showWarrantyFields ? dataToUse.warrantyType : "";
      const cleanWarrantyDate = showWarrantyFields ? normalizedWarrantyDate : "";

      let transformedFormData: any = {
        ...dataToUse,
        expiryDate: cleanExpiryDate,
        warrantyType: cleanWarrantyType,
        warrantyDate: cleanWarrantyDate,
      };

      // Always remove variantInventory as it's an internal form field
      delete transformedFormData.variantInventory;

      if (
        dataToUse.hasVariation &&
        dataToUse.variantInventory &&
        dataToUse.variantInventory.length > 0
      ) {
        // Create variantIds array from selected variants
        const variantIdsSet = new Set<string>();

        if (dataToUse.variantId) {
          variantIdsSet.add(dataToUse.variantId);
        }

        dataToUse.variantInventory.forEach((variation) => {
          if (variation.variantId) {
            variantIdsSet.add(variation.variantId);
          }
        });

        const variantIds = Array.from(variantIdsSet);

        // Transform variantInventory to variantData format
        const variantData = dataToUse.variantInventory.map((variation) => {
          const selectedVariant = variations.find((v: any) => {
            const vId = (v._id || v.id || "").toString();
            const targetId = (variation.variantId || dataToUse.variantId || "").toString();
            return vId === targetId;
          });

          const variantValues: Array<{ value: string; valueId: string }> = [];

          if (selectedVariant && variation.variantValue) {
            const valueObj = selectedVariant.values?.find((val: any) => {
              const valueString = (typeof val === "string" ? val : val.value || "").toString();
              return valueString.toLowerCase() === variation.variantValue.toString().toLowerCase();
            });

            if (valueObj) {
              const valueString = (typeof valueObj === "string" ? valueObj : valueObj.value || "").toString();
              const valueId = (typeof valueObj === "string" ? valueString : (valueObj as any)._id || (valueObj as any).id || valueString).toString();
              variantValues.push({ value: valueString, valueId });
            }
          }

          return {
            _id: variation._id || "",
            variantId: variation.variantId || dataToUse.variantId || "",
            variantValues,
            SKU: variation.SKU || "",
            status: true,
            costPrice: Number(variation.costPrice) || 0,
            sellingPrice: Number(variation.sellingPrice) || 0,
            tax: dataToUse.tax || "",
            image: variation.image || null,
            discount: Number(variation.discount) || 0,
            lowStockAlert: Number(variation.lowStockAlert) || 0,
          };
        });

        // Create variantStocks
        const variantStocks = dataToUse.variantInventory.flatMap((variation) =>
          (dataToUse.stock || []).map((stockItem) => ({
            SKU: variation.SKU,
            storeId: stockItem.storeId,
            quantity: variation.quantity,
          }))
        );

        const {
          stock,
          variantId,
          productCostPrice,
          productSellingPrice,
          ...cleanFormData
        } = transformedFormData;

        transformedFormData = {
          ...cleanFormData,
          variantId: dataToUse.variantId,
          variantIds,
          variantData,
          variantStocks,
        };
      } else {
        // For non-variation products, strip variation-related fields
        delete transformedFormData.variantId;
        delete transformedFormData.variantData;
        delete transformedFormData.variantStocks;
        delete transformedFormData.variantIds;
      }

      // Final sanity check: ensure we are sending an object, not an array
      if (Array.isArray(transformedFormData)) {
        console.error('❌ CRITICAL: Payload is unexpectedly an array! Converting to object.');
        transformedFormData = transformedFormData[0];
      }

      // Normalize barcode
      const trimmedBarcode = (transformedFormData.barcode as any)?.toString?.().trim?.() || "";
      if (trimmedBarcode) {
        transformedFormData.barcode = trimmedBarcode;
      } else {
        delete transformedFormData.barcode;
      }

      await onSubmit(transformedFormData);
    } catch (error) {
      console.error("❌ handleSubmit error:", error);
      toast.error("An unexpected error occurred. Please check your data and try again.");
    } finally {
      // Parent manages loading state via props
    }
  };

  const handleFileChange = (file: File | null | string) => {
    setFormData((prev) => ({ ...prev, productImage: file as any }));
  };

  const addVariation = () => {
    const newVariation = {
      variantValue: "",
      SKU: "",
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      image: null,
      variantId: "",
      discount: 0,
      lowStockAlert: 0,
    };
    setFormData((prev) => {
      const updatedVariations = [
        ...(prev.variantInventory || []),
        newVariation,
      ];

      return {
        ...prev,
        variantInventory: updatedVariations,
      };
    });
  };

  const removeVariation = (index: number) => {
    setFormData((prev) => {
      const updatedVariations = (prev.variantInventory || []).filter(
        (_, idx) => idx !== index
      );

      return {
        ...prev,
        variantInventory: updatedVariations,
        // If no variations left, automatically turn off the toggle
        hasVariation: updatedVariations.length > 0,
      };
    });
  };

  const updateVariation = (
    index: number,
    field: keyof AdminTypes.InventoryTypes.ProductTypes.ProductVariationItem,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedVariations = [...(prev.variantInventory || [])];
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value,
      };

      return {
        ...prev,
        variantInventory: updatedVariations,
      };
    });
  };

  // Helpers to build standardized codes
  const sanitizeCode = (input: string, maxLen: number) => {
    return (input || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, Math.max(0, maxLen));
  };

  const getStoreCode = () => {
    // Use the first store from the stock array
    const firstStockItem = (formData.stock || []).find((s) => s.storeId);
    if (!firstStockItem) return "STORE";

    const sId = getSafeId(firstStockItem.storeId);
    const store = stores.find((s) => getSafeId(s) === sId);
    if (!store) return "STORE";

    // Take first letter of each word
    const initials = (store.name || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("");

    const code = sanitizeCode(initials || store.name, 4);
    return code || "STORE";
  };

  const getProductCode = () => {
    if (!formData.productName) return "PROD";
    // Each word first letter
    const initials = formData.productName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("");
    const base = sanitizeCode(initials || formData.productName, 6);
    return base || "PROD";
  };

  const getAutoCode = (len = 4) => {
    // Alphanumeric code for better variety and to match user screenshot style (e.g., IV9O)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Date helpers to mirror attendance page behavior
  const ymdToDisplay = (ymd: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
    if (!m) return ymd || "";
    return `${m[3]}-${m[2]}-${m[1]}`; // dd-mm-yyyy
  };

  const displayToYmd = (display: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(display || "")) return display || "";
    return WebComponents.UiComponents.UiWebComponents.convertToYMD(display || "") || "";
  };

  // Generate main product SKU (no variation): <STORECODE>-<PRODUCTCODE>-<AUTO>
  const generateSKU = () => {
    const storeCode = getStoreCode();
    const productCode = getProductCode();
    const auto = getAutoCode(4);
    const sku = [storeCode, productCode, auto].join("-");
    setFormData((prev) => ({ ...prev, productSKU: sku }));
  };

  // Generate variant SKU: <STORECODE>-<PRODUCTCODE>-<VARIANT>-<AUTO>
  const generateVariationSKU = (
    variationValue: string,
    _variationType: string
  ) => {
    const storeCode = getStoreCode();
    const productCode = getProductCode();
    const variantCode = sanitizeCode(variationValue, 6) || "VAR";
    const auto = getAutoCode(4);
    return [storeCode, productCode, variantCode, auto].join("-");
  };

  return (
    <>
      {/* Form Content */}
      <WebComponents.AdminComponents.AdminWebComponents.Forms.ProductForm
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        isScanning={isScanning}
        setIsScanning={setIsScanning}
        barcodeFetchStatus={barcodeFetchStatus}
        setBarcodeFetchStatus={setBarcodeFetchStatus}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        updateSearchTerm={updateSearchTerm}
        handleBarcodeSuggestionSelect={handleBarcodeSuggestionSelect}
        fetchProductData={fetchProductData}
        generateSKU={generateSKU}
        showWarrantyFields={showWarrantyFields}
        showExpiryFields={showExpiryFields}
        ymdToDisplay={ymdToDisplay}
        displayToYmd={displayToYmd}
        updateVariation={updateVariation}
        addVariation={addVariation}
        removeVariation={removeVariation}
        generateVariationSKU={generateVariationSKU}
        stores={stores}
        categories={categories}
        subcategories={subcategories}
        brands={brands}
        units={units}
        warranties={warranties}
        variations={variations}
        taxes={taxes}
        resetTrigger={resetTrigger}
      />
      {/* Footer */}
      <div className="pt-8 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-[60px] flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4 px-4 sm:px-0">
        <WebComponents.UiComponents.UiWebComponents.Button
          variant="cancel"
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3"
        >
          {Constants.adminConstants.cancel}
        </WebComponents.UiComponents.UiWebComponents.Button>
        <WebComponents.UiComponents.UiWebComponents.Button
          type="submit"
          form="product-form"
          disabled={loading}
          className="w-full sm:w-auto text-xs sm:text-sm md:text-base px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3"
        >
          {loading ? Constants.adminConstants.saving : Constants.adminConstants.save}
        </WebComponents.UiComponents.UiWebComponents.Button>
      </div>
    </>
  );
}


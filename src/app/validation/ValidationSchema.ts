import * as Yup from "yup";

export const storeManagementFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Store name is required")
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name must not exceed 100 characters"),
  description: Yup.string()
    .max(500, "Description must not exceed 500 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  countryCode: Yup.string()
    .required("Country code is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  poc: Yup.string()
    .max(100, "Point of contact must not exceed 100 characters"),
  address: Yup.string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),
  country: Yup.string()
    .required("Country is required"),
  state: Yup.string()
    .when("country", {
      is: (country: string) => country && country.length > 0,
      then: (schema) => schema.required("State is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  city: Yup.string()
    .when("state", {
      is: (state: string) => state && state.length > 0,
      then: (schema) => schema.required("City is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  postalCode: Yup.string()
    .required("Postal code is required")
    .min(3, "Postal code must be at least 3 characters")
    .max(20, "Postal code must not exceed 20 characters"),
  latitude: Yup.string()
    .required("Latitude is required")
    .test("is-valid-latitude", "Latitude must be between -90 and 90", (value: string | undefined) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num >= -90 && num <= 90;
    }),
  longitude: Yup.string()
    .required("Longitude is required")
    .test("is-valid-longitude", "Longitude must be between -180 and 180", (value: string | undefined) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num >= -180 && num <= 180;
    }),
  status: Yup.boolean().required("Status is required"),
});

export const categoryFormSchema = Yup.object().shape({
  categoryName: Yup.string()
    .required("Category name is required")
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(500, "Description must not exceed 500 characters"),
  isActive: Yup.boolean().required("Status is required"),
  hasExpiry: Yup.boolean().required("Expiry setting is required"),
  hasWarranty: Yup.boolean().required("Warranty setting is required"),
}).test(
  "mutually-exclusive",
  "Expiry and Warranty cannot both be enabled at the same time",
  function (value) {
    if (value && value.hasExpiry && value.hasWarranty) {
      return this.createError({
        path: "hasWarranty",
        message: "Expiry and Warranty cannot both be enabled at the same time",
      });
    }
    return true;
  }
);

export const subCategoryFormSchema = Yup.object().shape({
  category: Yup.string()
    .required("Category is required"),
  subcategory: Yup.string()
    .required("Subcategory name is required")
    .trim()
    .min(1, "Subcategory name cannot be empty")
    .max(100, "Subcategory name must not exceed 100 characters"),
  categorycode: Yup.string()
    .required("Subcategory code is required")
    .trim()
    .min(1, "Subcategory code cannot be empty")
    .max(50, "Subcategory code must not exceed 50 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(500, "Description must not exceed 500 characters"),
  status: Yup.boolean().required("Status is required"),
  subCategoryImage: Yup.mixed()
    .nullable()
    .notRequired(),
});

export const unitFormSchema = Yup.object().shape({
  unit: Yup.string()
    .required("Unit name is required")
    .trim()
    .min(1, "Unit name cannot be empty")
    .max(100, "Unit name must not exceed 100 characters"),
  shortName: Yup.string()
    .required("Short name is required")
    .trim()
    .min(1, "Short name cannot be empty")
    .max(50, "Short name must not exceed 50 characters"),
  status: Yup.boolean().required("Status is required"),
});

export const expenseCategoryFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Category name is required")
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name must not exceed 100 characters"),
  description: Yup.string()
    .notRequired()
    .trim()
    .max(250, "Description must not exceed 250 characters"),
  status: Yup.boolean().required("Status is required"),
});

export const variantFormSchema = Yup.object().shape({
  variant: Yup.string()
    .required("Variant name is required")
    .trim()
    .min(1, "Variant name cannot be empty")
    .max(100, "Variant name must not exceed 100 characters"),
  values: Yup.string()
    .required("Variant values are required")
    .trim()
    .min(1, "Please enter at least one variant value")
    .test(
      "has-values",
      "Please enter at least one valid variant value",
      (value) => {
        if (!value) return false;
        const trimmedValues = value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
        return trimmedValues.length > 0;
      }
    ),
  status: Yup.boolean().required("Status is required"),
});

export const brandFormSchema = Yup.object().shape({
  brand: Yup.string()
    .required("Brand name is required")
    .trim()
    .min(1, "Brand name cannot be empty")
    .max(100, "Brand name must not exceed 100 characters"),
  brandImage: Yup.mixed()
    .required("Brand image is required")
    .test("is-valid-image", "Please upload a brand image", (value) => {
      return value !== null && value !== undefined && value !== "";
    }),
  status: Yup.boolean().required("Status is required"),
});

export const warrantyFormSchema = Yup.object().shape({
  warranty: Yup.string()
    .required("Warranty name is required")
    .trim()
    .min(1, "Warranty name cannot be empty")
    .max(100, "Warranty name must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(250, "Description must not exceed 250 characters"),
  duration: Yup.number()
    .required("Duration is required")
    .min(1, "Duration must be at least 1")
    .integer("Duration must be a whole number"),
  period: Yup.string<'Month' | 'Year'>()
    .required("Period is required")
    .oneOf(['Month', 'Year'] as const, "Period must be either Month or Year"),
  status: Yup.boolean().required("Status is required"),
});

// Product Variation Item Schema
const productVariationItemSchema = Yup.object().shape({
  _id: Yup.string().nullable().notRequired(),
  variantValue: Yup.string()
    .required("Variation value is required")
    .trim()
    .min(1, "Variation value cannot be empty"),
  SKU: Yup.string()
    .required("SKU is required")
    .trim()
    .min(1, "SKU cannot be empty"),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1")
    .integer("Quantity must be a whole number"),
  costPrice: Yup.number()
    .required("Cost price is required")
    .min(0, "Cost price must be 0 or greater"),
  sellingPrice: Yup.number()
    .required("Selling price is required")
    .min(0, "Selling price must be 0 or greater")
    .test(
      "selling-price-greater-than-cost",
      "Selling price should be greater than or equal to cost price",
      function (value) {
        const costPrice = this.parent.costPrice;
        if (costPrice !== undefined && value !== undefined) {
          return value >= costPrice;
        }
        return true;
      }
    ),
  variantId: Yup.string()
    .required("Variation type is required")
    .min(1, "Variation type is required"),
  image: Yup.mixed()
    .nullable()
    .notRequired(),
  discount: Yup.number()
    .min(0, "Discount must be 0 or greater")
    .max(100, "Discount cannot exceed 100%")
    .notRequired()
    .default(0),
  lowStockAlert: Yup.number()
    .min(0, "Low stock alert must be 0 or greater")
    .integer("Low stock alert must be a whole number")
    .notRequired()
    .default(0),
});

// Product Form Schema
export const productFormSchema = Yup.object().shape({
  productName: Yup.string()
    .required("Product name is required")
    .trim()
    .min(1, "Product name cannot be empty")
    .max(200, "Product name must not exceed 200 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(250, "Description must not exceed 250 characters"),
  category: Yup.string()
    .required("Category is required"),
  subCategory: Yup.string()
    .required("Subcategory is required"),
  brand: Yup.string()
    .required("Brand is required"),
  unit: Yup.object()
    .shape({
      unit: Yup.string()
        .required("Unit is required"),
      value: Yup.number()
        .min(0, "Unit value must be 0 or greater")
        .notRequired(),
    })
    .required("Unit is required"),
  productSKU: Yup.string()
    .required("SKU is required")
    .trim()
    .min(1, "SKU cannot be empty")
    .max(100, "SKU must not exceed 100 characters"),
  barcode: Yup.string()
    .trim()
    .notRequired(),
  status: Yup.boolean()
    .required("Status is required"),
  hasVariation: Yup.boolean()
    .required("Variation setting is required"),
  stock: Yup.array()
    .of(
      Yup.object().shape({
        storeId: Yup.string()
          .required("Store is required"),
        quantity: Yup.number()
          .integer("Quantity must be a whole number")
          .notRequired(),
      })
    )
    .min(1, "At least one store is required")
    .test(
      "stock-validation",
      "Stock validation",
      function (value) {
        // Use resolve(ref) to safely get sibling field value
        const hasVariation = this.resolve(Yup.ref("hasVariation"));

        if (!value || value.length === 0) {
          return this.createError({
            message: "Store is required",
            path: "stock.0.storeId",
          });
        }

        // 1. Store ID is always required for the first entry
        if (!value[0]?.storeId) {
          return this.createError({
            message: "Store is required",
            path: "stock.0.storeId",
          });
        }

        // 2. Quantity >= 1 ONLY if NOT using variations
        if (hasVariation === false) {
          const qty = value[0]?.quantity;
          if (qty === undefined || qty === null || (typeof qty === 'number' && qty < 1)) {
            return this.createError({
              message: "Quantity must be at least 1",
              path: "stock.0.quantity",
            });
          }
        }

        return true;
      }
    ),
  // Regular product pricing (when hasVariation is false)
  productCostPrice: Yup.number()
    .when("hasVariation", {
      is: false,
      then: (schema) => schema
        .required("Cost price is required")
        .min(0, "Cost price must be 0 or greater"),
      otherwise: (schema) => schema.notRequired(),
    }),
  productSellingPrice: Yup.number()
    .when("hasVariation", {
      is: false,
      then: (schema) => schema
        .required("Selling price is required")
        .min(0, "Selling price must be 0 or greater")
        .test(
          "selling-price-greater-than-cost",
          "Selling price should be greater than or equal to cost price",
          function (value) {
            const costPrice = this.parent.productCostPrice;
            if (costPrice !== undefined && value !== undefined) {
              return value >= costPrice;
            }
            return true;
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  productDiscount: Yup.number()
    .when("hasVariation", {
      is: false,
      then: (schema) => schema
        .min(0, "Discount must be 0 or greater")
        .max(100, "Discount cannot exceed 100%"),
      otherwise: (schema) => schema.notRequired(),
    })
    .notRequired(),
  tax: Yup.array()
    .of(Yup.string())
    .notRequired()
    .default([]),
  warrantyType: Yup.string()
    .notRequired(),
  warrantyDate: Yup.string()
    .notRequired(),
  expiryDate: Yup.string()
    .notRequired(),
  dimensions: Yup.string()
    .trim()
    .notRequired(),
  lowStockAlert: Yup.number()
    .min(0, "Low stock alert must be 0 or greater")
    .integer("Low stock alert must be a whole number")
    .notRequired(),
  productImage: Yup.mixed()
    .nullable()
    .notRequired(),
  // Variations (when hasVariation is true)
  variantInventory: Yup.array()
    .of(productVariationItemSchema)
    .when("hasVariation", {
      is: true,
      then: (schema) => schema
        .required("At least one variation is required")
        .min(1, "At least one variation is required")
        .test(
          "variations-required",
          "At least one variation is required",
          function (value) {
            if (!value || value.length === 0) {
              return this.createError({
                message: "At least one variation is required",
                path: "variantInventory",
              });
            }
            return true;
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
});

// Stock Transfer Form Schema
export const stockTransferFormSchema = Yup.object().shape({
  fromStoreId: Yup.string()
    .required("From store is required")
    .test(
      "different-stores",
      "From and To stores cannot be the same",
      function (value) {
        const { toStoreId } = this.parent;
        if (value && toStoreId && value === toStoreId) {
          return this.createError({
            message: "From and To stores cannot be the same",
            path: "fromStoreId",
          });
        }
        return true;
      }
    ),
  toStoreId: Yup.string()
    .required("To store is required")
    .test(
      "different-stores",
      "From and To stores cannot be the same",
      function (value) {
        const { fromStoreId } = this.parent;
        if (value && fromStoreId && value === fromStoreId) {
          return this.createError({
            message: "From and To stores cannot be the same",
            path: "toStoreId",
          });
        }
        return true;
      }
    ),
  categoryId: Yup.string()
    .required("Category is required"),
  subCategoryId: Yup.string()
    .required("Subcategory is required"),
  productId: Yup.string()
    .required("Product is required"),
  variant: Yup.string()
    .notRequired(),
  SKU: Yup.string()
    .notRequired(),
  quantity: Yup.number()
    .required("Quantity is required")
    .typeError("Quantity must be a number")
    .min(1, "Quantity must be at least 1")
    .integer("Quantity must be a whole number"),
  reason: Yup.string()
    .max(250, "Reason must not exceed 250 characters")
    .required("Transfer reason is required"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["pending", "approved", "rejected", "completed"], "Invalid status"),
});

// Stock Adjustment Form Schema
export const stockAdjustmentFormSchema = Yup.object().shape({
  storeId: Yup.string()
    .required("Store is required"),
  categoryId: Yup.string()
    .required("Category is required"),
  subcategoryId: Yup.string()
    .required("Subcategory is required"),
  productId: Yup.string()
    .required("Product is required"),
  variant: Yup.string()
    .notRequired(),
  actualStock: Yup.number()
    .required("Actual quantity is required")
    .typeError("Actual quantity must be a number")
    .min(1, "Actual quantity must be at least 1")
    .integer("Actual quantity must be a whole number"),
  reason: Yup.string()
    .max(250, "Reason must not exceed 250 characters")
    .required("Adjustment reason is required"),
});

// Coupon Form Schema
export const couponFormSchema = Yup.object().shape({
  code: Yup.string()
    .required("Coupon code is required")
    .trim()
    .min(1, "Coupon code cannot be empty")
    .max(20, "Coupon code must not exceed 20 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(250, "Description must not exceed 250 characters"),
  startDate: Yup.string()
    .required("Start date is required")
    .test("is-valid-date", "Please enter a valid date (YYYY-MM-DD)", (value) => {
      if (!value) return false;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) return false;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    }),
  endDate: Yup.string()
    .required("End date is required")
    .test("is-valid-date", "Please enter a valid date (YYYY-MM-DD)", (value) => {
      if (!value) return false;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) return false;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    })
    .test("is-after-start", "End date must be greater than or equal to start date", function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true; // Let required validation handle empty values
      return value >= startDate;
    }),
  type: Yup.string()
    .required("Type is required")
    .oneOf(["Percentage", "Fixed"], "Type must be either Percentage or Fixed"),
  discount_amount: Yup.number()
    .required("Discount amount is required")
    .min(0, "Discount amount must be 0 or greater"),
  limit: Yup.number()
    .required("Limit is required")
    .min(0, "Limit must be 0 or greater"),
  maxUsagePerUser: Yup.number()
    .required("Max usage per user is required")
    .min(1, "Max usage per user must be at least 1"),
  customerIds: Yup.array()
    .of(Yup.string())
    .notRequired(),
  sendMail: Yup.boolean()
    .required("Send in mail is required"),
  status: Yup.boolean().required("Status is required"),
});

// Advertisement Form Schema (Superadmin)
const isValidYyyyMmDd = (value?: string) => {
  if (!value) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

export const advertisementFormSchema = Yup.object().shape({
  adName: Yup.string()
    .required("Ad name is required")
    .trim()
    .min(1, "Ad name is required")
    .max(100, "Ad name must not exceed 100 characters"),
  selectType: Yup.string()
    .required("Type is required")
    .oneOf(["Image", "Video"], "Select a valid type"),
  urlType: Yup.string()
    .required("URL type is required")
    .oneOf(["Local", "Url"], "Select a valid URL type"),
  placement: Yup.string()
    .required("Placement is required")
    .oneOf(["Home Page", "Hero Section", "Pricing"], "Select a valid placement"),
  position: Yup.string()
    .required("Position is required")
    .oneOf(["Left", "Right", "Center"], "Select a valid position"),
  redirectUrl: Yup.string()
    .required("Redirect URL is required")
    .url("Please enter a valid URL"),
  mediaUrl: Yup.string().default("").when("urlType", {
    is: "Url",
    then: (schema) =>
      schema
        .required("Media URL is required")
        .url("Please enter a valid media URL"),
    otherwise: (schema) => schema.default("").notRequired(),
  }),
  mediaContent: Yup.mixed<File | string>()
    .nullable()
    .default(null)
    .when("urlType", {
      is: "Local",
      then: (schema) =>
        schema
          .required("Media content is required")
          .test("has-media", "Media content is required", (value) => {
            return value instanceof File || (typeof value === "string" && value.trim().length > 0);
          }),
      otherwise: (schema) => schema.nullable().default(null).notRequired(),
    }),
  startDate: Yup.string()
    .required("Start date is required")
    .test("is-valid-date", "Please enter a valid date (YYYY-MM-DD)", (value) => isValidYyyyMmDd(value)),
  endDate: Yup.string()
    .required("End date is required")
    .test("is-valid-date", "Please enter a valid date (YYYY-MM-DD)", (value) => isValidYyyyMmDd(value))
    .test("is-after-start", "End date must be greater than or equal to start date", function (value) {
      const { startDate } = this.parent as any;
      if (!value || !startDate) return true;
      return value >= startDate;
    }),
  status: Yup.boolean().required("Status is required"),
});

// Gift Card Form Schema
export const giftCardFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Gift card name is required")
    .trim()
    .min(1, "Gift card name cannot be empty")
    .max(100, "Gift card name must not exceed 100 characters"),
  number: Yup.string()
    .required("Gift card number is required")
    .trim()
    .min(1, "Gift card number cannot be empty")
    .max(50, "Gift card number must not exceed 50 characters"),
  value: Yup.number()
    .required("Gift card value is required")
    .min(0.01, "Gift card value must be greater than 0")
    .typeError("Gift card value must be a valid number"),
  thresholdAmount: Yup.number()
    .min(0, "Threshold amount must be 0 or greater")
    .typeError("Threshold amount must be a valid number")
    .nullable()
    .notRequired(),
  validity: Yup.string()
    .required("Validity date is required")
    .test(
      "is-future-date",
      "Validity date must be in the future",
      (value) => {
        if (!value) return false;
        const today = new Date();
        const validityDate = new Date(value);
        const todayMid = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ).getTime();
        return validityDate.getTime() > todayMid;
      }
    ),
  assignedCustomerIds: Yup.array()
    .of(Yup.string())
    .notRequired(),
  terms: Yup.string()
    .notRequired(),
  giftCardImage: Yup.string()
    .nullable()
    .notRequired(),
  status: Yup.boolean()
    .required("Status is required"),
  sendMail: Yup.boolean()
    .required("Send in mail is required"),
  sendSms: Yup.boolean()
    .required("Send in SMS is required"),
  sendWhatsapp: Yup.boolean()
    .required("Send in Whatsapp is required"),
});

// Mail Settings Form Schema
export const mailSettingFormSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .trim()
    .lowercase(),
  host: Yup.string()
    .required("SMTP host is required")
    .trim()
    .min(1, "Host cannot be empty"),
  port: Yup.number()
    .required("SMTP port is required")
    .min(1, "Port must be greater than 0")
    .max(65535, "Port must be less than 65536")
    .integer("Port must be a whole number"),
  encryption: Yup.string()
    .oneOf(['ssl', 'tls', 'none'], "Encryption must be SSL, TLS, or None")
    .required("Encryption is required"),
  password: Yup.string()
    .required("SMTP password is required")
    .min(1, "Password cannot be empty"),
});

// Customer Form Schema
export const customerFormSchema = Yup.object().shape({
  customerCode: Yup.string()
    .trim()
    .max(50, "Customer code must not exceed 50 characters")
    .notRequired(),
  customerName: Yup.string()
    .required("Customer name is required")
    .trim()
    .min(1, "Customer name cannot be empty")
    .max(100, "Customer name must not exceed 100 characters"),
  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Gender must be Male, Female, or Other"),
  countryCode: Yup.string()
    .required("Country code is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .notRequired(),
  address: Yup.object().shape({
    street: Yup.string()
      .notRequired()
      .max(200, "Address must not exceed 200 characters"),
    city: Yup.string()
      .notRequired()
      .max(100, "City must not exceed 100 characters"),
    state: Yup.string()
      .notRequired()
      .max(100, "State must not exceed 100 characters"),
    country: Yup.string()
      .notRequired()
      .max(100, "Country must not exceed 100 characters"),
    pincode: Yup.string()
      .notRequired()
      .max(20, "Pincode must not exceed 20 characters"),
  })
    .notRequired(),
  isActive: Yup.boolean()
    .required("Status is required"),
});

// Supplier Form Schema
export const supplierSchema = Yup.object().shape({
  name: Yup.string()
    .required("Supplier name is required")
    .trim()
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name must not exceed 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .trim(),
  phone: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits"),
  code: Yup.string()
    .required("Supplier code is required")
    .trim(),
  address: Yup.string()
    .required("Address is required")
    .max(200, "Address must not exceed 200 characters"),
  city: Yup.string()
    .notRequired()
    .max(100, "City must not exceed 100 characters"),
  state: Yup.string()
    .notRequired()
    .max(100, "State must not exceed 100 characters"),
  country: Yup.string()
    .notRequired()
    .max(100, "Country must not exceed 100 characters"),
  pincode: Yup.string()
    .required("Pincode is required")
    .matches(/^\d+$/, "Pincode must contain only digits")
    .min(4, "Pincode must be at least 4 digits")
    .max(10, "Pincode must not exceed 10 digits"),
  status: Yup.boolean().required("Status is required"),
  supplierImage: Yup.mixed<File | string>()
    .nullable()
    .notRequired(),
  createdBy: Yup.string().optional(),
  updatedBy: Yup.string().optional(),
});


//Purchase Order Form Schema
export const purchaseOrderSchema = Yup.object().shape({
  supplierId: Yup.string().required("Supplier is required"),
  storeId: Yup.string().required("Store is required"),
  storeName: Yup.string().optional(),
  purchaseOrderNumber: Yup.string().required("Order number is required"),
  purchaseDate: Yup.string().required("Purchase date is required"),
  expectedDeliveryDate: Yup.string().required("Expected delivery date is required"),
  paymentTerms: Yup.string().required("Payment terms is required"),
  status: Yup.string().required("Status is required"),

  // Shipping Details
  shippingDetails: Yup.object().shape({
    address: Yup.string().nullable(),
    country: Yup.string().nullable(),
    state: Yup.string().nullable(),
    city: Yup.string().nullable(),
    postalCode: Yup.string().nullable(),
    contactPerson: Yup.string().nullable(),
    phone: Yup.string().nullable(),
  }),

  items: Yup.array()
    .of(
      Yup.object().shape({
        productId: Yup.string().required("Product is required"),
        productName: Yup.string().optional(),
        quantity: Yup.number()
          .required("Quantity is required")
          .min(1, "Quantity must be at least 1"),
        unitPrice: Yup.number()
          .required("Unit price is required")
          .min(0, "Price must be 0 or greater"),
        taxAmount: Yup.number().min(0).default(0),
        discountAmount: Yup.number().min(0).default(0),
        total: Yup.number().default(0),
        hasVariation: Yup.boolean().optional(),
        variantData: Yup.array().optional(),
        selectedVariation: Yup.object().nullable().optional(),
        selectedVariantValue: Yup.string().optional(),
        productTaxType: Yup.string().optional(),
        productTaxValue: Yup.number().optional(),
      })
    )
    .min(1, "At least one item is required"),

  shippingCharges: Yup.number().min(0).default(0),
  paymentMethod: Yup.string().oneOf(['Cash', 'Credit Card', 'Bank Transfer', 'Cheque', 'Other']).default('Cash'),

  notes: Yup.string().nullable(),
  discountPercentage: Yup.number().min(0).max(100).default(0),
  discountAmount: Yup.number().default(0),
  discountType: Yup.string().oneOf(['Percentage', 'Fixed']).default('Percentage'),
  taxPercentage: Yup.number().default(0),
  taxAmount: Yup.number().default(0),
});

export const expenseFormSchema = Yup.object().shape({
  store: Yup.string().required("Store is required"),
  categoryId: Yup.string().required("Category is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .typeError("Amount must be a number"),
  description: Yup.string()
    .required("Description is required")
    .max(250, "Description must not exceed 250 characters"),
  expenseDate: Yup.string().required("Expense date is required"),
  paymentMethod: Yup.string()
    .required("Payment method is required")
    .oneOf(["Cash", "Bank Transfer", "Credit Card", "Cheque", "Digital Wallet", "Other"], "Invalid payment method"),
  bankName: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("Bank name is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  branchName: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("Branch name is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  accountNumber: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("Account number is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  ifscCode: Yup.string().when("paymentMethod", {
    is: "Bank Transfer",
    then: (schema) => schema.required("IFSC code is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  cardNumber: Yup.string().when("paymentMethod", {
    is: "Credit Card",
    then: (schema) => schema.required("Card number is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  cardHolderName: Yup.string().when("paymentMethod", {
    is: "Credit Card",
    then: (schema) => schema.required("Card holder name is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  cardType: Yup.string().when("paymentMethod", {
    is: "Credit Card",
    then: (schema) => schema.required("Card type is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  expiryMonth: Yup.string().when("paymentMethod", {
    is: "Credit Card",
    then: (schema) => schema.required("Expiry month is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  expiryYear: Yup.string().when("paymentMethod", {
    is: "Credit Card",
    then: (schema) => schema.required("Expiry year is required"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
});

export const taxFormSchema = Yup.object().shape({
  taxName: Yup.string()
    .required("Tax name is required")
    .trim()
    .min(1, "Tax name cannot be empty")
    .max(100, "Tax name must not exceed 100 characters"),
  taxType: Yup.string()
    .required("Tax type is required")
    .oneOf(["Inclusive", "Exclusive"], "Select valid tax type"),
  valueType: Yup.string()
    .required("Value type is required")
    .oneOf(["Fixed", "Percentage"], "Select valid value type"),
  value: Yup.number()
    .required("Value is required")
    .min(0, "Value must be 0 or greater")
    .test("max-percentage", "Percentage value cannot exceed 100", function (value) {
      const { valueType } = this.parent;
      if (valueType === "Percentage" && value !== undefined) {
        return value <= 100;
      }
      return true;
    }),
  status: Yup.boolean().required("Status is required"),
  description: Yup.string()
    .nullable()
    .notRequired()
    .max(250, "Description must not exceed 250 characters"),
});

// Simple tax form schema matching TaxFormData structure
export const superAdminTaxFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tax name is required")
    .trim()
    .min(1, "Tax name cannot be empty")
    .max(100, "Tax name must not exceed 100 characters"),
  type: Yup.string()
    .required("Tax type is required")
    .oneOf(["Fixed", "Percentage"], "Select valid tax type"),
  value: Yup.string()
    .required("Value is required")
    .test("is-number", "Value must be a valid number", (value) => {
      if (!value) return false;
      const num = Number.parseFloat(value);
      return !Number.isNaN(num);
    })
    .test("min-value", "Value must be 0 or greater", (value) => {
      if (!value) return false;
      const num = Number.parseFloat(value);
      return num >= 0;
    })
    .test("max-percentage", "Percentage value cannot exceed 100", function (value) {
      const { type } = this.parent;
      if (type === "Percentage" && value) {
        const num = Number.parseFloat(value);
        return num <= 100;
      }
      return true;
    }),
  status: Yup.boolean().required("Status is required"),
});

export const purchaseReturnSchema = Yup.object().shape({
  purchaseOrderId: Yup.string()
    .required("Purchase order is required"),
  supplierId: Yup.string()
    .required("Supplier is required"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Draft", "Approved", "Returned", "Credited", "Cancelled"], "Invalid status"),
  returnDate: Yup.string()
    .required("Return date is required"),
  notes: Yup.string()
    .required("Return reason is required")
    .trim()
    .min(5, "Return reason must be at least 5 characters")
    .max(500, "Return reason must not exceed 500 characters"),
  items: Yup.array()
    .of(
      Yup.object().shape({
        productId: Yup.string().required("Product is required"),
        quantity: Yup.number()
          .required("Return quantity is required")
          .min(1, "Return quantity must be at least 1")
          .typeError("Return quantity must be a number"),
        price: Yup.number()
          .required("Unit price is required")
          .min(0, "Price must be 0 or greater"),
      })
    )
    .min(1, "At least one product is required")
    .required("Product items are required"),
});
export const staffFormSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: Yup.string()
    .required("Last name is required")
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  email: Yup.string()
    .required("Email is required")
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address")
    .trim()
    .lowercase(),
  countryCode: Yup.string()
    .required("Country code is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .min(5, "Phone number must be at least 5 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  designation: Yup.string()
    .required("Designation is required"),
  storeId: Yup.string()
    .required("Store is required"),
  salary: Yup.number()
    .required("Salary is required")
    .min(0, "Salary must be 0 or greater")
    .typeError("Salary must be a number"),
  joiningDate: Yup.string()
    .required("Joining date is required"),
  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Invalid gender"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive"], "Invalid status"),
  password: Yup.string()
    .when("$isEdit", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Password is required").min(6, "Password must be at least 6 characters")
    }),
  confirmPassword: Yup.string()
    .when("$isEdit", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Confirm password is required")
    })
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  image: Yup.mixed()
    .nullable()
    .notRequired(),
});

export const businessOwnerFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Owner name is required")
    .trim()
    .min(2, "Owner name must be at least 2 characters")
    .max(100, "Owner name must not exceed 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .trim()
    .lowercase(),
  countryCode: Yup.string().required("Country code is required"),
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .min(5, "Phone number must be at least 5 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  password: Yup.string()
    .when("$isEdit", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Password is required").min(6, "Password must be at least 6 characters")
    }),
  businessName: Yup.string()
    .required("Business name is required")
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  businessCategory: Yup.string()
    .required("Business category is required"),
  isActive: Yup.boolean().required("Status is required"),
});

export const businessCategorySchema = Yup.object().shape({
  categoryName: Yup.string()
    .required("Category name is required")
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(500, "Description must not exceed 500 characters"),
  isActive: Yup.boolean().required("Status is required"),
});


// POS Form Schema
export const posFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("POS Name is required")
    .trim()
    .min(2, "POS Name must be at least 2 characters")
    .max(50, "POS Name must not exceed 50 characters"),
  storeId: Yup.string()
    .required("Store is required"),
  location: Yup.string()
    .required("Location is required")
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive", "Maintenance"], "Invalid status"),
});

// Create Sale Schema
export const createSaleSchema = Yup.object().shape({
  store: Yup.string().required("Store is required"),
  customerId: Yup.string().required("Customer is required"),
  paymentMethod: Yup.string().required("Payment method is required"),
  receivedAmount: Yup.number().when("paymentMethod", {
    is: (val: string) => val !== "Credit Sale",
    then: (schema) =>
      schema
        .required("Received amount is required")
        .typeError("Amount must be a number")
        .min(0, "Amount cannot be negative"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  products: Yup.array()
    .min(1, "Add at least one product to cart")
    .required("Add at least one product to cart"),
  notes: Yup.string().nullable(),
});

// Sales Return Form Schema
// Sales Return Form Schema
export const salesReturnFormSchema = Yup.object().shape({
  invoiceNumber: Yup.string()
    .required("Invoice number is required")
    .trim()
    .min(1, "Invoice number cannot be empty"),
  customerId: Yup.string()
    .required("Customer is required"),
  customerName: Yup.string()
    .required("Customer name is required"),
  productName: Yup.string()
    .optional(),
  returnDate: Yup.string()
    .required("Return date is required"),
  quantity: Yup.number()
    .optional()
    .default(1)
    .typeError("Quantity must be a number"),
  unitPrice: Yup.number()
    .min(0, "Unit price must be 0 or greater")
    .default(0)
    .typeError("Unit price must be a number"),
  items: Yup.array()
    .of(
      Yup.object().shape({
        productId: Yup.string().required(),
        productName: Yup.string().required(),
        quantity: Yup.number().required().min(1),
        unitPrice: Yup.number().min(0),
        taxes: Yup.mixed().nullable(),
      })
    )
    .min(1, "Please select at least one product to return"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(['Pending', 'Approved', 'Rejected', 'Completed'], "Invalid status"),
  notes: Yup.string()
    .optional()
    .max(500, "Notes must not exceed 500 characters"),
  totalReturnAmount: Yup.number()
    .optional(),
  returnCharges: Yup.number()
    .optional(),
});

// Loyalty Point Form Schema
export const loyaltyFormSchema = Yup.object().shape({
  loyaltyPoints: Yup.number()
    .nullable()
    .typeError("Loyalty points is required")
    .required("Loyalty points is required")
    .min(0, "Loyalty points must be greater than or equal to 0"),
  minimumAmount: Yup.number()
    .nullable()
    .typeError("Minimum amount is required")
    .required("Minimum amount is required")
    .min(0, "Minimum amount must be greater than or equal to 0"),
  maximumAmount: Yup.number()
    .nullable()
    .typeError("Maximum amount is required")
    .required("Maximum amount is required")
    .min(0, "Maximum amount must be greater than or equal to 0")
    .test(
      "max-greater-than-min",
      "Maximum amount must be greater than minimum amount",
      function (value) {
        const { minimumAmount } = this.parent;
        return value !== null && value !== undefined && minimumAmount !== null && minimumAmount !== undefined ? value > minimumAmount : true;
      }
    ),
  expiryDuration: Yup.number()
    .nullable()
    .typeError("Expiry duration is required")
    .required("Expiry duration is required")
    .min(1, "Expiry duration must be at least 1 day"),
  status: Yup.boolean().required("Status is required"),
});

// Redeem Calculation Form Schema
export const redeemFormSchema = Yup.object().shape({
  ruleName: Yup.string()
    .required("Rule name is required")
    .trim()
    .min(1, "Rule name cannot be empty")
    .max(100, "Rule name must not exceed 100 characters"),
  pointFrom: Yup.number()
    .typeError("Point from is required")
    .required("Point from is required")
    .min(0, "Point from must be greater than or equal to 0"),
  pointTo: Yup.number()
    .typeError("Point to is required")
    .required("Point to is required")
    .min(0, "Point to must be greater than or equal to 0")
    .test(
      "pointTo-greater-than-pointFrom",
      "Point to must be greater than point from",
      function (value) {
        const { pointFrom } = this.parent;
        return value !== undefined && pointFrom !== undefined ? value > pointFrom : true;
      }
    ),
  amount: Yup.number()
    .typeError("Amount is required")
    .required("Amount is required")
    .min(0, "Amount must be greater than or equal to 0"),
  status: Yup.boolean().required("Status is required"),
});

export const shiftFormSchema = Yup.object().shape({
  title: Yup.string()
    .required("Shift title is required")
    .trim()
    .min(1, "Shift title cannot be empty")
    .max(100, "Shift title must not exceed 100 characters"),
  breakDuration: Yup.number()
    .typeError("Break duration must be a number")
    .required("Break duration is required")
    .min(0, "Break duration must be 0 or greater"),
  startTime: Yup.string()
    .required("Start time is required"),
  endTime: Yup.string()
    .required("End time is required"),
  status: Yup.boolean().required("Status is required"),
  weekOff: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one week off day.")
    .required("Please select at least one week off day."),
});

// Role Form Schema
export const roleFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Role name is required")
    .trim()
    .min(1, "Role name cannot be empty")
    .max(100, "Role name must not exceed 100 characters"),
  code: Yup.string()
    .required("Role code is required")
    .trim()
    .min(1, "Role code cannot be empty")
    .max(50, "Role code must not exceed 50 characters")
    .matches(/^[A-Z_]+$/, "Role code must be uppercase letters and underscores only (e.g., STORE_MANAGER)"),
  description: Yup.string()
    .notRequired()
    .trim()
    .max(500, "Description must not exceed 500 characters"),
  isActive: Yup.boolean().required("Status is required"),
});
export const leaveTypeFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Leave type name is required")
    .trim()
    .min(1, "Leave type name cannot be empty")
    .max(100, "Leave type name must not exceed 100 characters"),
  isPaid: Yup.boolean().required("Payment type is required"),
  paidCount: Yup.number()
    .typeError("Leave count must be a number")
    .required("Leave count is required")
    .min(1, "Leave count must be at least 1"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .max(500, "Description must not exceed 500 characters"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive"], "Invalid status"),
});

export const leaveAssignFormSchema = Yup.object().shape({
  employeeId: Yup.string().required("Employee is required"),
  leaveTypeId: Yup.string().required("Leave type is required"),
  duration: Yup.string()
    .oneOf(["full", "half", "multiple"], "Invalid duration")
    .required("Duration is required"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required"),
  reason: Yup.string()
    .required("Reason is required")
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters"),
  isHalfDay: Yup.boolean().default(false),
  isPaid: Yup.boolean().default(false),
  storeId: Yup.string().required("Store ID is required"),
  status: Yup.string()
    .oneOf(["pending", "approved", "rejected", "cancelled"], "Invalid status")
    .default("pending"),
  rejectionReason: Yup.string()
    .nullable()
    .when("status", {
      is: "rejected",
      then: (schema) => schema.required("Rejection reason is required when status is rejected"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export const subscriptionFormSchema = Yup.object().shape({
  purchaseDate: Yup.string()
    .required("Purchase date is required")
    .test("is-not-empty", "Purchase date is required", (value) => {
      return value !== undefined && value !== null && value !== "";
    })
    .test("is-valid-date", "Please enter a valid date", (value) => {
      if (!value || value === "") return false;
      // Check if date is in YYYY-MM-DD format (ISO format)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) return false;
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }),
  planName: Yup.string()
    .required("Plan name is required")
    .test("not-empty", "Please select a plan", (value) => value !== "" && value !== null && value !== undefined),
  userId: Yup.string()
    .required("Business owner is required")
    .test("not-empty", "Please select a business owner", (value) => value !== "" && value !== null && value !== undefined),
  amount: Yup.string()
    .required("Amount is required")
    .test("is-valid-amount", "Please enter a valid amount", (value) => {
      if (!value) return false;
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0;
    }),
  discount: Yup.string()
    .default("0")
    .test("is-valid-discount", "Discount must be a valid number", (value) => {
      if (!value || value === "") return true; // Optional field
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue >= 0;
    }),
  discountType: Yup.string()
    .oneOf(["Fixed", "Percentage"], "Discount type must be either Fixed or Percentage")
    .default("Fixed"),
  status: Yup.string()
    .oneOf(["Active", "Inactive"], "Status must be either Active or Inactive")
    .required("Status is required"),
  selectTax: Yup.string().nullable().notRequired(),
});

// Plan Form Schema (Superadmin)
export const planFormSchema = Yup.object().shape({
  planCategory: Yup.string()
    .required("Plan category is required")
    .oneOf(["paid", "free"], "Plan category must be either paid or free"),

  name: Yup.string()
    .required("Plan name is required")
    .trim()
    .min(1, "Plan name is required")
    .max(100, "Plan name must not exceed 100 characters"),

  type: Yup.string()
    .required("Plan type is required")
    .oneOf(["monthly", "yearly", "daily", "weekly"], "Invalid plan type")
    .when("planCategory", {
      is: "free",
      then: (schema) => schema.oneOf(["daily"], "Free plan type must be daily"),
      otherwise: (schema) => schema,
    }),

  duration: Yup.string()
    .required("Plan duration is required")
    .trim()
    .matches(/^\d+$/, "Plan duration must be a number")
    .test("duration-range", "Invalid plan duration", function (value) {
      const { planCategory, type } = this.parent as any;
      if (!value) return false;
      const n = Number(value);
      if (!Number.isFinite(n) || n < 1) return false;

      if (planCategory === "free") {
        // free: daily max 31
        if (String(type) === "daily") return n <= 31;
        return false;
      }

      // paid: monthly max 11, yearly max 10, weekly/daily no explicit max
      if (String(type) === "monthly") return n <= 11;
      if (String(type) === "yearly") return n <= 10;
      return true;
    }),

  price: Yup.number()
    .typeError("Plan price must be a number")
    .when("planCategory", {
      is: "free",
      then: (schema) => schema.required("Plan price is required").min(0, "Plan price must be 0 or greater"),
      otherwise: (schema) => schema.required("Plan price is required").min(0, "Plan price must be 0 or greater"),
    }),

  storeLimit: Yup.number()
    .typeError("Store count must be a number")
    .required("Store count is required")
    .min(1, "Store count must be at least 1"),

  staffLimit: Yup.number()
    .typeError("Staff count must be a number")
    .required("Staff count is required")
    .min(1, "Staff count must be at least 1"),

  screens: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one screen")
    .required("Screen selection is required"),

  modules: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one module")
    .required("Module selection is required"),

  description: Yup.string()
    .notRequired()
    .max(50, "Description must not exceed 50 characters"),

  status: Yup.boolean()
    .required("Status is required"),

  taxes: Yup.array()
    .of(Yup.string())
    .default([])
    .when("planCategory", {
      is: "paid",
      then: (schema) => schema.min(1, "Please select at least one tax"),
      otherwise: (schema) => schema.notRequired(),
    }),

  discountType: Yup.string()
    .oneOf(["fixed", "percentage", ""], "Discount type must be fixed or percentage")
    .default(""),

  discount: Yup.number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined || originalValue === null) return null;
      return value;
    })
    .when(["planCategory", "discountType"], {
      is: (planCategory: string, discountType: string) => planCategory === "paid" && discountType === "percentage",
      then: (schema) =>
        schema
          .min(0, "Discount must be 0 or greater")
          .max(100, "Discount must be between 0 and 100"),
      otherwise: (schema) => schema.min(0, "Discount must be 0 or greater").notRequired(),
    }),

  totalPrice: Yup.number()
    .notRequired(),
});

// Quick Assign Shift Schema
export const quickAssignShiftSchema = Yup.object().shape({
  employeeId: Yup.string()
    .required("Employee is required"),
  shiftTypeId: Yup.string()
    .required("Shift is required"),
  assignmentDate: Yup.string()
    .required("Assignment date is required")
    .test("is-valid-date", "Please enter a valid date (YYYY-MM-DD)", (value) => {
      if (!value) return false;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(value);
    }),
  endDate: Yup.string()
    .nullable()
    .notRequired()
    .when("showEndDate", {
      is: true,
      then: (schema) => schema
        .required("End date is required")
        .test("is-after-start", "End date must be greater than or equal to start date", function (value) {
          const { assignmentDate } = this.parent;
          if (!value || !assignmentDate) return true;
          return value >= assignmentDate;
        }),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  showEndDate: Yup.boolean()
})
export const businessTypeSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(250, "Description must not exceed 250 characters"),
  status: Yup.boolean().required("Status is required"),
});

export const featureSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(250, "Description must not exceed 250 characters"),
  status: Yup.boolean().required("Status is required"),
});

export const faqCategorySchema = Yup.object().shape({
  categoryName: Yup.string()
    .required("Category name is required")
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name must not exceed 100 characters"),
  status: Yup.boolean().required("Status is required"),
});

export const faqSchema = Yup.object().shape({
  question: Yup.string()
    .required("Question is required")
    .trim()
    .min(1, "Question cannot be empty"),
  answer: Yup.string()
    .required("Answer is required")
    .trim()
    .min(1, "Answer cannot be empty"),
  isPublished: Yup.boolean().required("Status is required"),
  categoryId: Yup.string()
    .required("Category is required")
    .nullable(),
});

// Barcode Label Settings Schema
export const barcodeLabelSchema = Yup.object().shape({
  note: Yup.string()
    .max(45, "Max 45 characters")
    .optional(),
  expiryDate: Yup.string().optional(),
  productName: Yup.number()
    .typeError("Must be a number")
    .min(8, "Min font size is 8")
    .max(45, "Max font size is 45")
    .optional(),
  productVariation: Yup.number()
    .typeError("Must be a number")
    .min(8, "Min font size is 8")
    .max(45, "Max font size is 45")
    .optional(),
  productPrice: Yup.number()
    .typeError("Must be a number")
    .min(8, "Min font size is 8")
    .max(45, "Max font size is 45")
    .optional(),
  productSKU: Yup.number()
    .typeError("Must be a number")
    .min(8, "Min font size is 8")
    .max(45, "Max font size is 45")
    .optional(),
  expiryDateSize: Yup.number()
    .typeError("Must be a number")
    .min(8, "Min font size is 8")
    .max(45, "Max font size is 45")
    .optional(),
  noteSize: Yup.number()
    .typeError("Must be a number")
    .min(8, "Min font size is 8")
    .max(45, "Max font size is 45")
    .optional(),
});

// Holiday Form Schema
export const holidayFormSchema = Yup.object().shape({
  name: Yup.string()
    .required("Holiday name is required")
    .min(2, "Holiday name must be at least 2 characters")
    .max(100, "Holiday name must not exceed 100 characters"),
  date: Yup.string().required("Date range is required"),
  description: Yup.string().max(500, "Description must not exceed 500 characters"),
  isRecurring: Yup.boolean().required(),
  status: Yup.string().required(),
});
export const footerLinkSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty"),
  status: Yup.boolean().required("Status is required"),
});

export const productOverviewSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(500, "Description must not exceed 500 characters"),
  overviewImage: Yup.mixed()
    .required("Image is required"),
  status: Yup.boolean().required("Status is required"),
});

export const blogSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must not exceed 200 characters"),
  overview: Yup.string()
    .required("Overview is required")
    .trim()
    .min(1, "Overview cannot be empty")
    .max(500, "Overview must not exceed 500 characters"),
  description: Yup.string()
    .required("Description is required")
    .trim()
    .min(1, "Description cannot be empty")
    .max(5000, "Description must not exceed 5000 characters"),
  tags: Yup.array()
    .of(Yup.string().trim().min(1, "Tag cannot be empty"))
    .min(1, "At least one tag is required")
    .required("Tags are required"),
  createdBy: Yup.string()
    .required("Created by is required")
    .trim()
    .min(1, "Created by cannot be empty")
    .max(100, "Created by must not exceed 100 characters"),
  readTime: Yup.number()
    .required("Read time is required")
    .min(0, "Read time must be 0 or greater")
    .integer("Read time must be a whole number"),
  blogImage: Yup.mixed()
    .nullable()
    .notRequired(),
  isPublished: Yup.boolean().required("Publish status is required"),
});
export const attendanceFormSchema = Yup.object().shape({
  staffId: Yup.string().required("Please select a staff member"),
  date: Yup.string().required("Please select a date"),
  addMode: Yup.string().oneOf(["attendance", "leave"]).default("attendance"),
  shiftId: Yup.string().when("addMode", {
    is: "attendance",
    then: (schema) => schema.required("Please select a shift"),
    otherwise: (schema) => schema.notRequired(),
  }),
  clockIn: Yup.string().when("addMode", {
    is: "attendance",
    then: (schema) => schema.required("Please provide clock-in time"),
    otherwise: (schema) => schema.notRequired(),
  }),
  clockOut: Yup.string().notRequired(),
  leaveTypeId: Yup.string().when("addMode", {
    is: "leave",
    then: (schema) => schema.required("Please select a leave type"),
    otherwise: (schema) => schema.notRequired(),
  }),
  notes: Yup.string().notRequired(),
});

// General Settings Schema
export const generalSettingsSchema = Yup.object().shape({
  appName: Yup.string()
    .required("App Name is required")
    .min(2, "App Name must be at least 2 characters")
    .max(100, "App Name must not exceed 100 characters"),
  footerText: Yup.string(),
  contactCountryCode: Yup.string(),
  contactNo: Yup.string()
    .required("Contact Number is required")
    .min(7, "Contact Number must be at least 7 digits")
    .max(20, "Contact Number must not exceed 20 digits"),
  inquiryEmail: Yup.string().email("Invalid email").required("Inquiry Email is required"),
  siteDescription: Yup.string()
    .required("Site Description is required")
    .min(2, "Site Description must be at least 2 characters")
    .max(100, "Site Description must not exceed 100 characters"),
  userApp: Yup.string(),
  businessAddress: Yup.object({
    shopNumber: Yup.string(),
    buildingName: Yup.string(),
    area: Yup.string(),
    landmark: Yup.string(),
    nearBy: Yup.string(),
    country: Yup.string(),
    state: Yup.string(),
    city: Yup.string(),
    postalCode: Yup.string(),
    latitude: Yup.number(),
    longitude: Yup.number(),
  }),
  logos: Yup.object({
    darkLogo: Yup.string().nullable(),
    lightLogo: Yup.string().nullable(),
    favicon: Yup.string().nullable(),
    collapsDarkLogo: Yup.string().nullable(),
    collapsLightLogo: Yup.string().nullable(),
    miniLogo: Yup.string().nullable(),
  })
});

// Trial Settings Schema
export const trialSettingsSchema = Yup.object().shape({
  duration: Yup.number()
    .required("Trial Days is required")
    .min(0, "Trial Days must be 0 or greater")
    .integer("Trial Days must be a whole number")
    .typeError("Trial Days must be a number"),
  description: Yup.string()
    .required("Trial Description is required")
    .trim()
    .max(500, "Trial Description must not exceed 500 characters"),
});

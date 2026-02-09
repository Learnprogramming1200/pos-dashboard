"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { WebComponents } from "@/components";
import { ServerActions } from "@/lib";
import { salesReturnFormSchema } from "@/app/validation/ValidationSchema";
import { SalesReturn, SalesReturnFormData } from "@/types/admin/sales/sales-return";
import { Plus, X, Search, Trash2 } from "lucide-react";

// ... (Customer Helper Functions remain the same)
interface PosCustomer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
}
const extractPosCustomer = (raw: any, fallbackIndex = 0): PosCustomer | null => {
  if (!raw) return null;
  const id = raw._id || raw.id || raw.customerId || raw.userId || `temp-${fallbackIndex}`;
  const possibleNames = [
    raw.customerName,
    raw.name,
    raw.fullName,
    raw.displayName,
    raw.user?.name,
    [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim(),
  ].filter((value: any) => typeof value === 'string' && value.trim().length > 0);
  const name = possibleNames.length > 0 ? (possibleNames[0] as string).trim() : '';
  if (!id || !name) return null;

  return {
    id,
    code: raw.customerCode || raw.code || raw.customer_code || raw.customerId || raw.id || '',
    name,
    phone: raw.phone || raw.mobile || raw.contactNumber || raw.user?.phone || '',
    email: raw.email || raw.emailAddress || '',
  };
};

const extractCustomerArray = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};


// Schema type might need adjustment/casting or separate interface locally
// using any for form data to allow flexibility before mapping to strict payload
type LocalFormType = any;

interface SalesReturnFormProps {
  onClose: () => void;
  onSubmit: (data: SalesReturnFormData) => void;
  formId?: string;
  initialData?: SalesReturn;
}

export default function SalesReturnForm({
  onClose,
  onSubmit,
  formId = "sales-return-form",
  initialData
}: SalesReturnFormProps) {
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<LocalFormType>({
    resolver: yupResolver(salesReturnFormSchema) as any,
    defaultValues: {
      invoiceNumber: "",
      customerName: "",
      customerId: "",
      returnDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      notes: "",
      totalReturnAmount: 0,
      returnCharges: 0,
      items: [],
      // Legacy fields
      productName: "",
      quantity: 1,
      unitPrice: 0,
    },
    mode: "onChange"
  });

  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: "items"
  });

  // Calculate total return amount based on items
  const items = watch("items");
  useEffect(() => {
    if (items) {
      const total = items.reduce((sum: number, item: any) => sum + (item.quantity * (item.unitPrice || 0)), 0);
      setValue("totalReturnAmount", total);
    }
  }, [items, setValue]);

  // Derive selected sale
  const currentInvoiceNumber = watch("invoiceNumber");
  const selectedSale = useMemo(() =>
    sales.find(s => s.invoiceNumber === currentInvoiceNumber),
    [sales, currentInvoiceNumber]
  );

  // Fetch customers ... (same as before)
  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      try {
        const result = await ServerActions.ServerActionslib.getAllActiveCustomersAction();
        if (result?.success) {
          const rawList = extractCustomerArray(result.data);
          const parsed = rawList
            .map((item: any, index: number) => extractPosCustomer(item, index))
            .filter(Boolean) as PosCustomer[];
          if (isMounted) setCustomers(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    };
    fetchCustomers();
    return () => { isMounted = false; };
  }, []);

  // Sync initial Data
  useEffect(() => {
    if (initialData) {
      reset({
        invoiceNumber: initialData.invoiceNumber,
        customerName: initialData.customerId?.customerName || "",
        customerId: initialData.customerId?._id || "",
        returnDate: (initialData.returnDate || new Date().toISOString()).split('T')[0],
        status: initialData.status,
        notes: initialData.reason || "",
        totalReturnAmount: initialData.totalRefundAmount,
        returnCharges: initialData.shippingAdjustment || 0,
        items: initialData.items?.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.returnQuantity,
          unitPrice: i.sellingPrice,
          sku: i.SKU,
          variantId: i.variantId === null ? undefined : i.variantId,
          taxes: null
        })) || []
      });
      // Optionally fetch sales for this customer so the dropdown works and validations hold
      if (initialData.customerId?._id) {
        ServerActions.ServerActionslib.getSalesByCustomerAction(initialData.customerId._id).then((res: any) => {
          if (res?.success) {
            const salesData = res.data?.data?.data || res.data?.data || [];
            setSales(Array.isArray(salesData) ? salesData : []);
          }
        });
      }
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: LocalFormType) => {
    // Transform to SalesReturnFormData
    const saleId = selectedSale?._id || selectedSale?.id || initialData?.salesId?._id || "";

    const formattedData: SalesReturnFormData = {
      salesId: saleId,
      customerId: data.customerId,
      invoiceNumber: data.invoiceNumber,
      reason: data.notes || "Return Request", // Mapping notes to reason if reason field is missing in UI
      returnDate: data.returnDate ? new Date(data.returnDate).toISOString() : new Date().toISOString(),
      items: data.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId || undefined, // If available
        SKU: item.sku || (selectedSale?.products.find((p: any) => (p.product || p._id) === item.productId)?.sku),
        returnQuantity: item.quantity,
        reason: data.notes, // Item level reason?
        notes: "",
        productName: item.productName, // Extra for UI if needed in parent
        unitPrice: item.unitPrice
      })),
      shippingAdjustment: 0,
      otherAdjustment: 0,
      notes: data.notes,
      status: data.status
    };

    onSubmit(formattedData);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onFormSubmit)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Customer <span className="text-red-500 ml-1">*</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                  {...field}
                  value={field.value || ""}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    field.onChange(val);
                    const selectedCustomer = customers.find(c => c.id === val);
                    if (selectedCustomer) {
                      setValue("customerName", selectedCustomer.name);
                      // Clear previous sales and items when customer changes
                      setSales([]);
                      replace([]);
                      setValue("invoiceNumber", "");

                      ServerActions.ServerActionslib.getSalesByCustomerAction(val).then((res: any) => {
                        if (res?.success) {
                          // Handle nested data structure: res.data.data.data array
                          const salesData = res.data?.data?.data || res.data?.data || [];
                          setSales(Array.isArray(salesData) ? salesData : []);
                        } else {
                          console.error("Failed to fetch customer sales:", res?.error);
                          setSales([]);
                        }
                      }).catch((err: any) => {
                        console.error("Error fetching customer sales:", err);
                        setSales([]);
                      });
                    }
                  }}
                  className={errors.customerId ? "border-red-500" : ""}
                >
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="" disabled>Select Customer</WebComponents.UiComponents.UiWebComponents.FormOption>
                  {customers.map((c) => (
                    <WebComponents.UiComponents.UiWebComponents.FormOption key={c.id} value={c.id}>
                      {`${c.name} ${c.email ? `- ${c.email}` : `(${c.phone})`}`}
                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                  ))}
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              )}
            />
            {errors.customerId && <p className="mt-1 text-sm text-red-500">{errors.customerId.message as string}</p>}
          </div>

          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Invoice Number
              <span className="text-red-500 ml-1">*</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="invoiceNumber"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                  {...field}
                  value={field.value || ""}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    field.onChange(val);
                    const selectedSale = sales.find(s => s.invoiceNumber === val);
                    if (selectedSale && selectedSale.products) {
                      // Map sale products to form items
                      const newItems = selectedSale.products.map((p: any) => ({
                        productId: p.product || p._id, // Fallback to _id if product ref is missing or populated differently
                        productName: p.productName,
                        quantity: p.quantity,
                        unitPrice: p.sellingPrice,
                        taxes: null
                      }));
                      replace(newItems);
                    }
                  }}
                  className={errors.invoiceNumber ? "border-red-500" : ""}
                >
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="" disabled>Select Invoice</WebComponents.UiComponents.UiWebComponents.FormOption>
                  {sales.map((sale: any) => (
                    <WebComponents.UiComponents.UiWebComponents.FormOption key={sale._id} value={sale.invoiceNumber}>
                      {sale.invoiceNumber} - {new Date(sale.saleDate).toLocaleDateString()}
                    </WebComponents.UiComponents.UiWebComponents.FormOption>
                  ))}
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              )}
            />
            {errors.invoiceNumber && <p className="mt-1 text-sm text-red-500">{errors.invoiceNumber.message as string}</p>}
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2 relative">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Product Name (Optional)
            </WebComponents.UiComponents.UiWebComponents.FormLabel>

            {/* Selected Items List */}
            {items && items.length > 0 ? (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fields.map((field, index) => {
                      const item = items && items[index] ? items[index] : {};

                      // Find original product to get max qty
                      const originalProduct = selectedSale?.products?.find(
                        (p: any) => (p.product || p._id) === item.productId
                      );

                      const maxQty = originalProduct ? originalProduct.quantity : (item.quantity || 9999);

                      return (
                        <tr key={field.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName || "Unknown"}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.unitPrice || 0}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 w-24">
                            <input
                              type="number"
                              min="1"
                              max={maxQty}
                              className="w-full border rounded px-2 py-1"
                              value={item.quantity || 0}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                // Enforce max quantity constraint
                                if (val > maxQty) {
                                  val = maxQty;
                                }
                                if (val < 1) val = 1;
                                update(index, { ...item, quantity: val });
                              }}
                            />
                            {maxQty > 0 && (
                              <div className="text-xs text-gray-500 mt-1">Max: {maxQty}</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
            {errors.items && <p className="mt-1 text-sm text-red-500">{errors.items.message as string}</p>}
          </div>




          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Return Date
              <span className="text-red-500 ml-1">*</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="returnDate"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  {...field}
                  type="date"
                  className={errors.returnDate ? "border-red-500" : ""}
                />
              )}
            />
            {errors.returnDate && <p className="mt-1 text-sm text-red-500">{errors.returnDate.message as string}</p>}
          </div>

          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Status
              <span className="text-red-500 ml-1">*</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                  {...field}
                  className={errors.status ? "border-red-500" : ""}
                >
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="Pending">Pending</WebComponents.UiComponents.UiWebComponents.FormOption>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="Completed">Completed</WebComponents.UiComponents.UiWebComponents.FormOption>
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              )}
            />
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status.message as string}</p>}
          </div>

          <div className="col-span-1">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Total Return Amount
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="totalReturnAmount"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.FormInput
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly // Calculated automatically
                  className={errors.totalReturnAmount ? "border-red-500 bg-gray-50" : "bg-gray-50"}
                />
              )}
            />
            {errors.totalReturnAmount && <p className="mt-1 text-sm text-red-500">{errors.totalReturnAmount.message as string}</p>}
          </div>

          <div className="col-span-1 md:col-span-2">
            <WebComponents.UiComponents.UiWebComponents.FormLabel>
              Reason
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <WebComponents.UiComponents.UiWebComponents.Textarea
                  {...field}
                  rows={3}
                  value={field.value || ""}
                  placeholder="Enter reason..."
                  className={errors.notes ? "border-red-500" : ""}
                />
              )}
            />
            {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes.message as string}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}

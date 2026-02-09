"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";

export function useListFilters<T>(
  list: T[],
  opts?: {
    statusSelector?: (row: T) => boolean | undefined;
    statusAllSelector?: (row: T) => string | undefined;
    storeSelector?: (row: T) => string | undefined; // ✅ N
    categorySelector?: (row: T) => string | undefined;
    taxTypeSelector?: (row: T) => string | undefined;
    designationSelector?: (row: T) => string | undefined;
    searchKeys?: (keyof T)[];
  }
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");

  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">(() => {
    const urlIsActive = searchParams.get("isActive");
    return urlIsActive === "true" ? "Active" : urlIsActive === "false" ? "Inactive" : "All";
  });

  const [allStatusFilter, setAllStatusFilter] = useState<string>(
    () => searchParams.get("status") || "All"
  );
  const [storeFilter, setStoreFilter] = useState<string>(
    () => searchParams.get("storeId") || "All"
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(
    () => searchParams.get("categoryId") || "All"
  );
  const [taxTypeFilter, setTaxTypeFilter] = useState<string>(
    () => searchParams.get("type") || "All"
  );
  const [designationFilter, setDesignationFilter] = useState<string>(
    () => searchParams.get("designation") || "All"
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  // for search
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    setSearchTerm((prev) => (prev === urlSearchTerm ? prev : urlSearchTerm));
  }, [searchParamsString, searchParams]);

  // for isActive status boolean
  useEffect(() => {
    const urlIsActive = searchParams.get("isActive");
    const normalized = urlIsActive === "true" ? "Active" : urlIsActive === "false" ? "Inactive" : "All";
    setStatusFilter((prev) => (prev === normalized ? prev : normalized));
  }, [searchParamsString, searchParams]);

  // for status  string
  useEffect(() => {
    const selecetdStatus = searchParams.get("status") || "All"
    setAllStatusFilter((prev) => (prev === selecetdStatus ? prev : selecetdStatus));
  }, [searchParamsString, searchParams]);

  // for filter on storeId
  useEffect(() => {
    const selectedStore = searchParams.get("storeId") || "All";
    setStoreFilter(prev => (prev === selectedStore ? prev : selectedStore));
  }, [searchParamsString, searchParams]);

  // for filter on categoryId
  useEffect(() => {
    const selectedCategory = searchParams.get("categoryId") || "All";
    setSelectedCategoryFilter(prev => (prev === selectedCategory ? prev : selectedCategory));
  }, [searchParamsString, searchParams]);

  // for filter on taxType
  useEffect(() => {
    const selectedTaxTypes = searchParams.get("type") || "All";
    setTaxTypeFilter(prev => (prev === selectedTaxTypes ? prev : selectedTaxTypes));
  }, [searchParamsString, searchParams]);

  // for filter on designation
  useEffect(() => {
    const selectedDesignation = searchParams.get("designation") || "All";
    setDesignationFilter(prev => (prev === selectedDesignation ? prev : selectedDesignation));
  }, [searchParamsString, searchParams]);

  // for search term
  useEffect(() => {
    const normalizedDebounced = debouncedSearchTerm.trim();
    const currentUrlSearch = searchParams.get("search") || "";
    if (normalizedDebounced === currentUrlSearch) return;
    const params = new URLSearchParams(searchParams.toString());
    if (normalizedDebounced) params.set("search", normalizedDebounced);
    else params.delete("search");
    params.set("page", "1");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [debouncedSearchTerm, searchParamsString, searchParams, router, pathname]);

  // for status filter isActive
  useEffect(() => {
    const currentUrlIsActive = searchParams.get("isActive") || "All";
    const desiredIsActive = statusFilter === "Active" ? "true" : statusFilter === "Inactive" ? "false" : "All";
    if (desiredIsActive === currentUrlIsActive) return;
    const params = new URLSearchParams(searchParams.toString());
    if (desiredIsActive !== "All") params.set("isActive", desiredIsActive);
    else params.delete("isActive");
    params.set("page", "1");
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [statusFilter, searchParamsString, router, pathname, searchParams]);

  // for status filter all
  useEffect(() => {
    const currentStatus = searchParams.get("status") || "All";
    if (allStatusFilter === currentStatus) return;
    const params = new URLSearchParams(searchParams.toString());
    if (allStatusFilter !== "All") {
      params.set("status", allStatusFilter);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [allStatusFilter, searchParamsString, router, pathname]);

  // for store filter
  useEffect(() => {
    const currentStore = searchParams.get("storeId") || "All";
    if (storeFilter === currentStore) return;
    const params = new URLSearchParams(searchParams.toString());
    if (storeFilter !== "All") {
      params.set("storeId", storeFilter);
    } else {
      params.delete("storeId");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [storeFilter, searchParamsString, router, pathname]);
  // for category filter
  useEffect(() => {
    const currentCategory = searchParams.get("categoryId") || "All";
    if (selectedCategoryFilter === currentCategory) return;
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategoryFilter !== "All") {
      params.set("categoryId", selectedCategoryFilter);
    } else {
      params.delete("categoryId");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedCategoryFilter, searchParamsString, router, pathname]);
  // for taxType filter
  useEffect(() => {
    const currentTaxType = searchParams.get("type") || "All";
    if (taxTypeFilter === currentTaxType) return;
    const params = new URLSearchParams(searchParams.toString());
    if (taxTypeFilter !== "All") {
      params.set("type", taxTypeFilter);
    } else {
      params.delete("type");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [taxTypeFilter, searchParamsString, router, pathname]);

  // for designation filter
  useEffect(() => {
    const currentDesignation = searchParams.get("designation") || "All";
    if (designationFilter === currentDesignation) return;
    const params = new URLSearchParams(searchParams.toString());
    if (designationFilter !== "All") {
      params.set("designation", designationFilter);
    } else {
      params.delete("designation");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [designationFilter, searchParamsString, router, pathname]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(list)) return [];
    let filtered = list;
    if (statusFilter !== "All" && opts?.statusSelector) {
      const wantActive = statusFilter === "Active";
      filtered = filtered.filter((row) => {
        const v = opts.statusSelector!(row);
        return wantActive ? v === true : v === false;
      });
    }
    /** NEW statusAll filter */
    if (allStatusFilter !== "All" && opts?.statusAllSelector) {
      filtered = filtered.filter(
        row => opts.statusAllSelector!(row) === allStatusFilter
      );
    }
    if (storeFilter !== "All" && opts?.storeSelector) {
      filtered = filtered.filter(
        row => opts.storeSelector!(row) === storeFilter
      );
    }
    if (selectedCategoryFilter !== "All" && opts?.categorySelector) {
      filtered = filtered.filter(
        row => opts.categorySelector!(row) === selectedCategoryFilter
      );
    }
    if (taxTypeFilter !== "All" && opts?.taxTypeSelector) {
      filtered = filtered.filter(
        row => opts.taxTypeSelector!(row) === taxTypeFilter
      );
    }
    if (designationFilter !== "All" && opts?.designationSelector) {
      filtered = filtered.filter(
        row => opts.designationSelector!(row) === designationFilter
      );
    }
    const q = searchTerm.trim().toLowerCase();
    if (q && opts?.searchKeys?.length) {
      filtered = filtered.filter((row) =>
        opts.searchKeys!.some((k) => String((row as any)[k] ?? "").toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [
    list,
    statusFilter,
    searchTerm,
    opts?.statusSelector,
    opts?.searchKeys,
    allStatusFilter,
    opts?.statusAllSelector,
    storeFilter,
    opts?.storeSelector,
    selectedCategoryFilter,
    opts?.categorySelector,
    taxTypeFilter,
    opts?.taxTypeSelector,
    designationFilter,
    opts?.designationSelector,
  ]);

  return {
    searchTerm,
    setSearchTerm,
    storeFilter,
    setStoreFilter,
    statusFilter,
    setStatusFilter,
    allStatusFilter,
    setAllStatusFilter,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    taxTypeFilter,
    setTaxTypeFilter,
    designationFilter,
    setDesignationFilter,
    filteredData,
  };
}

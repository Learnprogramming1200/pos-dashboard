"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface CustomPaginationProps {
  totalRecords: number;
  filteredRecords: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (perPage: number) => void;
  rowsPerPageOptions?: number[];
  useUrlParams?: boolean;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalRecords,
  filteredRecords,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  useUrlParams = false
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Calculate the range of records being displayed
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, filteredRecords);
  const totalPages = Math.ceil(filteredRecords / rowsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Update URL params if useUrlParams is enabled
  const updateUrlParams = (page: number, perPage: number) => {
    if (!useUrlParams) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('limit', perPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      if (useUrlParams) {
        updateUrlParams(newPage, rowsPerPage);
      }
      onPageChange(newPage);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      if (useUrlParams) {
        updateUrlParams(newPage, rowsPerPage);
      }
      onPageChange(newPage);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      if (useUrlParams) {
        updateUrlParams(page, rowsPerPage);
      }
      onPageChange(page);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value);
    if (useUrlParams) {
      updateUrlParams(1, newRowsPerPage); // Reset to page 1 when changing rows per page
    }
    onRowsPerPageChange(newRowsPerPage);
  };

  if (filteredRecords === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 2xl:gap-0 px-2 sm:px-3 md:px-4 2xl:px-4 py-2.5 sm:py-3 md:py-4 2xl:py-8 bg-white dark:bg-darkFilterbar border-t border-[#F4F5F5] dark:border-darkBorder">
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 2xl:gap-0 px-2 sm:px-3 md:px-4 2xl:px-4 py-2.5 sm:py-3 md:py-4 2xl:py-4 bg-white dark:bg-darkFilterbar border-t border-[#F4F5F5] dark:border-darkBorder">
      {/* Left side - Records info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 2xl:space-x-4">
        <div className="text-xs sm:text-sm 2xl:text-sm text-textMain dark:text-[#EEEEEE] font-dmsans font-medium leading-4 sm:leading-5 2xl:leading-5">
          Showing {startRecord} to {endRecord} of {filteredRecords} results
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 2xl:space-x-2">
          <label className="text-xs sm:text-sm 2xl:text-sm text-textMain dark:text-[#EEEEEE] font-dmsans font-medium leading-4 sm:leading-5 2xl:leading-5 whitespace-nowrap">
            Rows per page:
          </label>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="px-1.5 sm:px-2 2xl:px-2 py-1 text-xs sm:text-sm 2xl:text-sm rounded bg-white dark:bg-darkFilterbar text-[#111636] dark:text-[#F2F2F2] border border-border"
          >
            {rowsPerPageOptions.map(option => (
              <option key={option} value={option} className="text-[#111636] dark:text-[#F2F2F2]">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center justify-center sm:justify-end gap-0.5 sm:gap-1 md:gap-1 2xl:space-x-1">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-2 sm:px-2.5 md:px-3 2xl:px-3 py-1 text-xs sm:text-sm 2xl:text-sm rounded-[6px] transition-colors ${currentPage === 1
            ? 'text-[#111636] dark:text-[#F2F2F2] font-interTight font-normal leading-5 border border-[#D1D5DB] opacity-50 cursor-not-allowed'
            : 'text-textMain dark:text-[#EEEEEE] font-interTight font-normal leading-5 border border-[#D1D5DB] hover:bg-[#f2f2f2] dark:hover:bg-[#333333]'
            }`}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 sm:gap-1 2xl:space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              disabled={page === '...'}
              className={`w-6 sm:w-7 md:w-8 2xl:w-8 px-2 sm:px-2.5 md:px-3 2xl:px-3 py-1 text-xs sm:text-sm 2xl:text-sm rounded-[6px] transition-colors flex items-center justify-center ${page === '...'
                ? 'text-[#888b9b] dark:text-gray-500 font-dmsans font-medium cursor-default'
                : page === currentPage
                  ? 'bg-primary text-white font-interTight font-normal'
                  : 'bg-[#E8F0FF] dark:bg-[#3A3A3A] text-[#1E40AF] dark:text-[#EAEAEA] font-interTight font-normal hover:bg-[#D7E6FF] dark:hover:bg-[#4A4A4A]'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-2.5 md:px-3 2xl:px-3 py-1 text-xs sm:text-sm 2xl:text-sm rounded-[6px] transition-colors ${currentPage === totalPages
            ? 'text-[#111636] dark:text-[#F2F2F2] font-interTight font-normal leading-5 border border-[#D1D5DB] opacity-50 cursor-not-allowed'
            : 'text-textMain dark:text-[#EEEEEE] font-interTight font-normal leading-5 border border-[#D1D5DB] hover:bg-[#f2f2f2] dark:hover:bg-[#333333]'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;

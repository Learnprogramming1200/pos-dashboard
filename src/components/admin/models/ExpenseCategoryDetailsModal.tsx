"use client"
import React from 'react'
import { X, Receipt, Tag, Clock, Calendar } from "lucide-react"
import * as adminStrings from "@/constant/admin"

export default function ExpenseCategoryDetailsModal({ category, onClose }: { category: any; onClose: () => void }) {
    if (!category) return null;

    const categoryData = {
        categoryName: category.name,
        description: category.description || 'N/A',
        status: category.status ? 'Active' : 'Inactive',
        createdDate: category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A',
        lastUpdated: category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-primary to-primaryHover p-[20px] text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="">
                            <Receipt size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-1">{adminStrings.categoryProfileLabel} </h2>
                            <p className="text-white/80 text-sm">{adminStrings.completeCategoryInformationAndDetailsLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="px-8 -mt-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-1 shadow-lg border border-gray-100">
                        <div className={`w-2.5 h-2.5 rounded-full ${categoryData.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className={`font-semibold text-sm ${categoryData.status === 'Active' ? 'text-emerald-700' : 'text-gray-600'}`}>
                            {categoryData.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Information Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Receipt size={18} className="text-white" />
                                </div>
                                {adminStrings.categoryInformationLabel}
                            </h3>

                            <div className="space-y-5">
                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category Name</label>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                        {categoryData.categoryName}
                                    </p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed max-w-md italic">
                                        {categoryData.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                    <Calendar size={18} className="text-white" />
                                </div>
                                Timestamps
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Calendar size={20} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-orange-600 uppercase tracking-wider mb-0.5">Created Date</label>
                                        <span className="text-lg font-bold text-gray-900">{categoryData.createdDate}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <Clock size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-blue-600 uppercase tracking-wider mb-0.5">Last Updated</label>
                                        <span className="text-lg font-bold text-gray-900">{categoryData.lastUpdated}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-95"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

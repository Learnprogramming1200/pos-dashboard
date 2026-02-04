"use client";
import Image from "next/image";
import { X, User, Mail, Phone, Building2, Tag, Clock, Calendar } from "lucide-react";
import { Constants } from "@/constant";
import { AdminTypes } from "@/types";

interface SupplierDetailsModalProps {
    supplier: AdminTypes.supplierTypes.Supplier;
    onClose: () => void;
}

export default function SupplierDetailsModal({
    supplier,
    onClose
}: SupplierDetailsModalProps) {
    const supplierData = {
        supplierName: supplier.name,
        email: supplier.email,
        phoneNumber: supplier.phone,
        code: supplier.supplierCode || 'N/A',
        status: supplier.status ? "Active" : "Inactive",
        address: supplier.address || 'N/A',
        city: supplier.address.city || 'N/A',
        state: supplier.address.state || 'N/A',
        country: supplier.address.country || 'N/A',
        postalCode: supplier.address.pincode || 'N/A',
        createdDate: supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A',
        lastUpdated: supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString() : 'N/A'
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
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
                            {supplier.supplierImage ? (
                                <Image
                                    src={supplier.supplierImage}
                                    alt={supplierData.supplierName}
                                    className="w-16 h-16 rounded-xl object-cover"
                                    width={64}
                                    height={64}
                                />
                            ) : (
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                                    <User size={32} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-1">{Constants.adminConstants.imageLabel}</h2>
                            <p className="text-white/80 text-sm">{Constants.adminConstants.completeSupplierInformationLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="px-8 -mt-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-5 py-1 shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className={`w-2.5 h-2.5 rounded-full ${supplierData.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className={`font-semibold text-sm ${supplierData.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {supplierData.status}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Supplier Information Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <User size={18} className="text-white" />
                                </div>
                                {Constants.adminConstants.supplierInformationLabel}
                            </h3>

                            <div className="space-y-5">
                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.supplierNameLabel}</label>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">{supplierData.supplierName}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.emailAddressLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6 break-all">{supplierData.email}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.contactNumberLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{supplierData.phoneNumber}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.supplierCodeLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{supplierData.code}</p>
                                </div>
                            </div>
                        </div>

                        {/* Address Information Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Building2 size={18} className="text-white" />
                                </div>
                                {Constants.adminConstants.addressInfoLabel}
                            </h3>

                            <div className="space-y-5">
                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.addressLabel}</label>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white ml-6">{supplierData.address.street}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.cityLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{supplierData.city}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.stateLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{supplierData.state}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.countryLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{supplierData.country}</p>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={16} className="text-gray-500" />
                                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{Constants.adminConstants.postalCodeLabel}</label>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 ml-6">{supplierData.postalCode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="mt-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Clock size={20} className="text-gray-600" />
                            {Constants.adminConstants.activityTimelineLabel}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar size={20} className="text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1">{Constants.adminConstants.createdOnLabel}</label>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">{supplierData.createdDate}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-1">{Constants.adminConstants.lastModifiedLabel}</label>
                                    <p className="text-base font-semibold text-gray-900 dark:text-white">{supplierData.lastUpdated}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { Tag, FileText, Calendar, Clock } from "lucide-react";
import { Constants } from "@/constant";
import { SuperAdminTypes } from "@/types";

export default function AdvertisementDetails({ advertisement }: { readonly advertisement: SuperAdminTypes.AdvertisementTypes.Advertisement }) {
  return (
    <>
      <div className="px-4 sm:px-6 md:px-8 -mt-1 relative z-10">
        <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 sm:px-5 py-1 sm:py-1.5 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${advertisement.status ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-gray-400 dark:bg-gray-500'}`} />
          <span className={`font-semibold text-xs sm:text-sm ${advertisement.status ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {advertisement.status ? Constants.superadminConstants.activestatus : Constants.superadminConstants.inactivestatus}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-8 pt-3 sm:pt-4 overflow-y-auto max-h-[calc(70vh)] sm:max-h-[calc(75vh)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Tag size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </div>
              <span className="truncate">{Constants.superadminConstants.basicinformation}</span>
            </h3>
            <div className="space-y-4 sm:space-y-5">
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.adnamelabel}</label>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white ml-5 sm:ml-6 break-words">{advertisement.adName}</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.typelabel}</label>
                </div>
                <div className="ml-5 sm:ml-6">
                  <span className="inline-block px-2.5 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-xs sm:text-sm font-medium">{advertisement.selectType}</span>
                </div>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.urltypelabel}</label>
                </div>
                <div className="ml-5 sm:ml-6">
                  <span className="inline-block px-2.5 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-xs sm:text-sm font-medium">{advertisement.urlType}</span>
                </div>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.placementlabel}</label>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-words">{advertisement.placement}</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.positionlabel}</label>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-words">{advertisement.position}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 md:mb-6 flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
              </div>
              <span className="truncate">{Constants.superadminConstants.additionalinformation}</span>
            </h3>
            <div className="space-y-4 sm:space-y-5">
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.redirecturllabel}</label>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-all">{advertisement.redirectUrl}</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Calendar size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.startdatelabel}</label>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-words">{new Date(advertisement.startDate).toLocaleDateString()}</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Clock size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.enddatelabel}</label>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 break-words">{new Date(advertisement.endDate).toLocaleDateString()}</p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <Tag size={14} className="sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.advertisementidlabel}</label>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-5 sm:ml-6 font-mono break-words">{advertisement._id}</p>
              </div>
            </div>
          </div>
        </div>
        {advertisement.mediaContent && (
          <div className="mt-4 sm:mt-5 md:mt-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FileText size={18} className="sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              <span>{Constants.superadminConstants.mediacontentlabel}</span>
            </h3>
            <div className="space-y-3">
              {advertisement.urlType === "Url" && advertisement.mediaContent.url && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.mediacontentlabel}</label>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">{advertisement.mediaContent.url}</p>
                </div>
              )}
              {advertisement.urlType === "Local" && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{Constants.superadminConstants.localmedialabel}</label>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{Constants.superadminConstants.fileuploadedlocallylabel}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

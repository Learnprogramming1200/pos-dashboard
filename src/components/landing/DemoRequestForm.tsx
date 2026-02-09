"use client";

import React from "react";
import { X, ArrowRight } from "lucide-react";
import { WebComponents } from "@/components";
import { PhoneInputWithCountryCode } from "@/components/ui/PhoneInputWithCountryCode";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemoRequest } from "@/contexts/DemoRequestContext";
import { Constants } from "@/constant";


interface DemoRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const businessCategories = Constants.commonConstants.landingStrings.demoRequest.businessCategories;

const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+358", country: "Finland" },
  { code: "+48", country: "Poland" },
  { code: "+420", country: "Czech Republic" },
  { code: "+36", country: "Hungary" },
  { code: "+43", country: "Austria" },
  { code: "+41", country: "Switzerland" },
];

export default function DemoRequestForm({ isOpen, onClose }: DemoRequestFormProps) {
  const { addDemoRequest } = useDemoRequest();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+1",
    companyName: "",
    businessCategory: "",
    additionalRequirements: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      addDemoRequest({
        fullName: formData.fullName,
        email: formData.email,
        phone: `${formData.countryCode} ${formData.phone}`,
        companyName: formData.companyName,
        businessCategory: formData.businessCategory,
        additionalRequirements: formData.additionalRequirements
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        countryCode: "+1",
        companyName: "",
        businessCategory: "",
        additionalRequirements: ""
      });

      // Show success message
      alert(Constants.commonConstants.landingStrings.demoRequest.successMessage);
      onClose();
    } catch {
      console.error("Failed to submit demo request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg shadow-xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {Constants.commonConstants.landingStrings.demoRequest.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {Constants.commonConstants.landingStrings.demoRequest.form.fullName}
            </label>
            <WebComponents.UiComponents.UiWebComponents.Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {Constants.commonConstants.landingStrings.demoRequest.form.email}
            </label>
            <WebComponents.UiComponents.UiWebComponents.Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email address"
              className="w-full"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {Constants.commonConstants.landingStrings.demoRequest.form.phone}
            </label>
            <PhoneInputWithCountryCode
              countryCode={formData.countryCode}
              phoneNumber={formData.phone}
              onCountryCodeChange={(code) => setFormData({ ...formData, countryCode: code })}
              onPhoneNumberChange={(number) => setFormData({ ...formData, phone: number })}
              placeholder="Enter phone number"
              className="w-full"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {Constants.commonConstants.landingStrings.demoRequest.form.companyName}
            </label>
            <WebComponents.UiComponents.UiWebComponents.Input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Enter your company name"
              className="w-full"
              required
            />
          </div>

          {/* Business Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {Constants.commonConstants.landingStrings.demoRequest.form.businessCategory}
            </label>
            <Select
              value={formData.businessCategory}
              onValueChange={(value) => setFormData({ ...formData, businessCategory: value })}
            >
              <SelectTrigger
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <SelectValue placeholder="Select Business Category" />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {Constants.commonConstants.landingStrings.demoRequest.form.additionalRequirements}
            </label>
            <WebComponents.UiComponents.UiWebComponents.Textarea
              value={formData.additionalRequirements}
              onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
              placeholder="Tell us about your specific needs..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <WebComponents.UiComponents.UiWebComponents.Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isSubmitting ? Constants.commonConstants.landingStrings.demoRequest.form.submitting : Constants.commonConstants.landingStrings.demoRequest.form.submit}
            <ArrowRight className="w-4 h-4" />
          </WebComponents.UiComponents.UiWebComponents.Button>
        </form>
      </div>
    </div>
  );
} 
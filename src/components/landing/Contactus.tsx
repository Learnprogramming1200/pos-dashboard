"use client";
import React from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { WebComponents } from "@/components";
import { Constants } from "@/constant";
import { GeneralSettings } from "@/types/contactus";

export default function ContactUsContent({ generalSettings }: { generalSettings: GeneralSettings | null }) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pinCode: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      pinCode: "",
      message: ""
    });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  if (isSubmitted) {
    return (
      <div className="py-20 bg-white dark:bg-slate-900">
        <div className="bg-gray-300 dark:bg-slate-800">
          <div className="flex justify-center items-center py-7">
            <WebComponents.Breadcrumbs items={[
              { label: "Home", href: "/" },
              { label: "Contact" }
            ]} />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-textMain dark:text-white font-poppins font-semibold text-2xl sm:text-3xl lg:text-4xl mb-4">
              Message Sent Successfully!
            </h1>
            <p className="text-textSmall dark:text-neutral font-interTight text-base sm:text-lg leading-6 sm:leading-7 mb-8">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <WebComponents.UiComponents.UiWebComponents.Button
              onClick={() => setIsSubmitted(false)}
              className="font-interTight font-semibold text-sm sm:text-base"
            >
              Send Another Message
            </WebComponents.UiComponents.UiWebComponents.Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white dark:bg-slate-900">

      <div className="bg-gray-300 dark:bg-slate-800">
        <div className="flex justify-center items-center py-7">
          <WebComponents.Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Contact" }
          ]} />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-textMain dark:text-white font-poppins font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
            Have a question, need help, or want to join the {generalSettings?.appName || 'POSPro'} ecosystem?
          </h1>
          <p className="text-textSmall dark:text-neutral font-interTight text-base sm:text-lg leading-6 max-w-3xl mx-auto">
            {generalSettings?.siteDescription || "We're here to help you grow your business with our comprehensive POS solutions. Reach out to our team and we'll respond as soon as possible."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          {/* Bridge Image */}
          <div className="order-2 lg:order-1">
            <div className="relative h-full rounded-lg overflow-hidden">
              <Image
                src={Constants.assetsIcon.assets.demoImage}
                alt="Bridge connecting businesses"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Corporate Address */}
          <div className="order-1 lg:order-2">
            <h2 className="text-textMain dark:text-white font-poppins font-semibold text-2xl mb-6">
              Site Description
            </h2>
            <div className="space-y-4 text-textSmall dark:text-neutral font-interTight">
              <p>{generalSettings?.siteDescription || 'BuildXpria is a leading construction and real estate development company specializing in innovative residential and commercial projects. With years of expertise in the industry, we deliver high-quality construction solutions that meet modern standards and exceed client expectations.'}</p>
            </div>

            <h2 className="text-textMain dark:text-white font-poppins font-semibold text-2xl mt-10 mb-6">
              Corporate Address
            </h2>
            <div className="space-y-4 text-textSmall dark:text-neutral font-interTight">
              <p>{generalSettings?.appName || 'BuildXpria Projects Pvt Ltd'}</p>
              <div className="space-y-1">
                <p>Shop No. {generalSettings?.businessAddress?.shopNumber || '895'}, {generalSettings?.businessAddress?.buildingName || 'Elaine Holder'}</p>
                <p>{generalSettings?.businessAddress?.area || 'Dicta non aut suscip'}, {generalSettings?.businessAddress?.landmark || 'Dolorum dolor dolor'}</p>
                <p>Near {generalSettings?.businessAddress?.nearBy || 'Praesentium elit in'}</p>
                <p>{generalSettings?.businessAddress?.city || 'Amroli'}, {generalSettings?.businessAddress?.state || 'Gujarat'}</p>
                <p>{generalSettings?.businessAddress?.country || 'India'} – {generalSettings?.businessAddress?.postalCode || 'Dignissimos suscipit'}</p>
              </div>
              <p className="text-primary font-semibold">{generalSettings?.contactNumber || '+91 789 0000 265'}</p>
              <p className="text-primary font-semibold">{generalSettings?.inquiryEmail || 'info@buildxpria.com'}</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            {generalSettings?.businessAddress?.mapUrl ? (
              <iframe
                src={generalSettings.businessAddress.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title={`Google Maps - ${generalSettings.businessAddress.city || 'Location'}`}
              />
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59548.60899980796!2d72.71748364097205!3d21.121014080827806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be052f201ed4421%3A0xf2797c037e17a35e!2sSurat%20International%20Airport!5e0!3m2!1sen!2sin!4v1765275788289!5m2!1sen%2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Google Maps - Default Location"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

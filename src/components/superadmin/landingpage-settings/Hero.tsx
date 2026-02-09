"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, Pencil } from "lucide-react";
import { BsArrowRight } from "react-icons/bs";
import { Constants } from "@/constant";
import { WebComponents } from "@/components";
import { createHeroSectionAction } from "@/lib/server-actions";
import { SuperAdminTypes } from "@/types";

const Hero = ({
    initialHeroSection
}: {
    readonly initialHeroSection: SuperAdminTypes.LandingSettingPageTypes.HeroSection[]
}) => {
    const router = useRouter();
    const [heroSection, setHeroSection] = useState<SuperAdminTypes.LandingSettingPageTypes.HeroSection[]>(initialHeroSection);
    const [heroSectionLoading, setHeroSectionLoading] = useState(false);
    const [editingHero, setEditingHero] = useState<SuperAdminTypes.LandingSettingPageTypes.HeroSection | null>(null);
    const [showEditHeroModal, setShowEditHeroModal] = useState(false);

    // Refs for focusable inputs
    const title1Ref = useRef<HTMLInputElement>(null);
    const title2Ref = useRef<HTMLInputElement>(null);
    const subtitleRef = useRef<HTMLTextAreaElement>(null);
    const sublist1Ref = useRef<HTMLInputElement>(null);
    const sublist2Ref = useRef<HTMLInputElement>(null);
    const sublist3Ref = useRef<HTMLInputElement>(null);
    const sublist4Ref = useRef<HTMLInputElement>(null);

    // Local form state for hero section
    const [heroFormData, setHeroFormData] = useState<SuperAdminTypes.LandingSettingPageTypes.HeroSectionFormData>({
        title1: "",
        title2: "",
        subtitle: "",
        heroImage: "",
        sublist1: "",
        sublist2: "",
        sublist3: "",
        sublist4: "",
    });

    useEffect(() => {
        if (heroSection && heroSection.length > 0) {
            const currentHero = heroSection[0];
            const defaultFeatures = Constants.commonConstants.landingStrings.hero.keyFeatures;
            setHeroFormData({
                title1: currentHero.title1 || "",
                title2: currentHero.title2 || "",
                subtitle: currentHero.subtitle || "",
                heroImage: currentHero.heroImage as string || "",
                sublist1: currentHero.sublist1 || defaultFeatures[0] || "",
                sublist2: currentHero.sublist2 || defaultFeatures[1] || "",
                sublist3: currentHero.sublist3 || defaultFeatures[2] || "",
                sublist4: currentHero.sublist4 || defaultFeatures[3] || "",
            });
            setEditingHero(currentHero);
        } else {
            // Initialize with default values if no hero section exists
            const defaultFeatures = Constants.commonConstants.landingStrings.hero.keyFeatures;
            setHeroFormData(prev => ({
                ...prev,
                sublist1: prev.sublist1 || defaultFeatures[0] || "",
                sublist2: prev.sublist2 || defaultFeatures[1] || "",
                sublist3: prev.sublist3 || defaultFeatures[2] || "",
                sublist4: prev.sublist4 || defaultFeatures[3] || "",
            }));
        }
    }, [heroSection]);

    const handleSaveHeroSection = async () => {
        try {
            setHeroSectionLoading(true);
            const result = await createHeroSectionAction(heroFormData as any);
            if (!result?.success) throw new Error(result?.error || 'Failed to save hero section');

            if (result.data && result.data.data) {
                setHeroSection([result.data.data]);
                setEditingHero(result.data.data);
                const defaultFeatures = Constants.commonConstants.landingStrings.hero.keyFeatures;
                setHeroFormData({
                    title1: result.data.data.title1 || "",
                    title2: result.data.data.title2 || "",
                    subtitle: result.data.data.subtitle || "",
                    heroImage: result.data.data.heroImage || "",
                    sublist1: result.data.data.sublist1 || defaultFeatures[0] || "",
                    sublist2: result.data.data.sublist2 || defaultFeatures[1] || "",
                    sublist3: result.data.data.sublist3 || defaultFeatures[2] || "",
                    sublist4: result.data.data.sublist4 || defaultFeatures[3] || "",
                });
            }

            WebComponents.UiComponents.UiWebComponents.SwalHelper.success({ text: 'Hero section saved successfully.' });
            router.refresh();
        } catch (error: unknown) {
            console.error('Error saving hero section:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save hero section.';
            WebComponents.UiComponents.UiWebComponents.SwalHelper.error({ text: errorMessage });
        } finally {
            setHeroSectionLoading(false);
        }
    };

    return (
        <div className="">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveHeroSection(); }}>
                <div className="space-y-4">
                    <div className="bg-[#F6FBFF] dark:bg-[#0D1117] relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center dark:opacity-45"
                            style={{ backgroundImage: "url(" + Constants.assetsIcon.assets.bgDesign.src + ")" }}
                        ></div>
                        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14 2xl:gap-[280px] items-center py-6 sm:py-8 md:py-12">
                                <div className="pt-6 sm:pt-8 md:pt-12 pb-6 sm:pb-8 md:pb-12 w-full lg:w-[626px] order-2 lg:order-1">
                                    <div className="text-primary dark:text-neutral font-caveat text-xs sm:text-sm md:text-base lg:text-lg opacity-50 pointer-events-none">
                                        The All-in-One POS Advantage
                                    </div>
                                    <div className="pt-1 space-y-2">
                                        <div className="relative group flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => title1Ref.current?.focus()}
                                                className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <input
                                                ref={title1Ref}
                                                type="text"
                                                value={heroFormData.title1}
                                                onChange={(e) => setHeroFormData(prev => ({ ...prev, title1: e.target.value }))}
                                                className="text-textMain dark:text-white font-poppins font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0 transition-colors"
                                                placeholder="The Future of"
                                            />
                                        </div>
                                        <div className="relative group flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => title2Ref.current?.focus()}
                                                className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <input
                                                ref={title2Ref}
                                                type="text"
                                                value={heroFormData.title2}
                                                onChange={(e) => setHeroFormData(prev => ({ ...prev, title2: e.target.value }))}
                                                className="text-primary font-poppins font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl italic w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0 transition-colors mt-1"
                                                placeholder="Point of Sale"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 sm:pt-3 md:pt-4 lg:pt-5">
                                        <div className="relative group flex items-start gap-2">
                                            <button
                                                type="button"
                                                onClick={() => subtitleRef.current?.focus()}
                                                className="absolute -left-7 top-1 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                            <textarea
                                                ref={subtitleRef}
                                                value={heroFormData.subtitle}
                                                onChange={(e) => setHeroFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                                className="text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base lg:text-lg w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0 transition-colors resize-none"
                                                placeholder="Transform your business with our cloud-based POS system."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 sm:pt-6 md:pt-8 lg:pt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                                        {[
                                            { ref: sublist1Ref, value: heroFormData.sublist1 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHeroFormData(prev => ({ ...prev, sublist1: e.target.value })), placeholder: "Real-time Analytics" },
                                            { ref: sublist2Ref, value: heroFormData.sublist2 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHeroFormData(prev => ({ ...prev, sublist2: e.target.value })), placeholder: "Inventory Management" },
                                            { ref: sublist3Ref, value: heroFormData.sublist3 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHeroFormData(prev => ({ ...prev, sublist3: e.target.value })), placeholder: "Multi-location Support" },
                                            { ref: sublist4Ref, value: heroFormData.sublist4 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHeroFormData(prev => ({ ...prev, sublist4: e.target.value })), placeholder: "24/7 Customer Support" },
                                        ].map((item, index) => (
                                            <div key={index} className="relative group flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                                                <button
                                                    type="button"
                                                    onClick={() => item.ref.current?.focus()}
                                                    className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                                                </button>
                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                                                <input
                                                    ref={item.ref}
                                                    type="text"
                                                    value={item.value}
                                                    onChange={item.onChange}
                                                    className="text-textMain3 dark:text-neutral font-interTight font-medium text-xs sm:text-sm md:text-base lg:text-base w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0 transition-colors"
                                                    placeholder={item.placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 sm:pt-8 md:pt-10 lg:pt-12 flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                                        <WebComponents.UiComponents.UiWebComponents.Button disabled className="h-8 sm:h-9 md:h-10 lg:h-11 w-full sm:w-auto lg:w-[179px] rounded-[4px] gap-2">
                                            <p className="font-interTight font-semibold text-base">Start Free Trial</p>
                                            <BsArrowRight className="w-4 h-4 text-white" />
                                        </WebComponents.UiComponents.UiWebComponents.Button>
                                        <WebComponents.UiComponents.UiWebComponents.Button variant="outline" disabled className="h-8 sm:h-9 md:h-10 lg:h-11 w-full sm:w-auto lg:w-[179px] rounded-[4px] gap-2">
                                            <p className="font-interTight font-semibold text-base">View Live Demo</p>
                                            <BsArrowRight className="w-4 h-4 text-[#475467]" />
                                        </WebComponents.UiComponents.UiWebComponents.Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 order-1 lg:order-2 items-center">
                                    <div className="w-full lg:w-[600px] h-[450px] rounded-2xl sm:rounded-3xl md:rounded-[40px] lg:rounded-[50px] border border-[#BEDDFF] bg-[#EEF6FF] overflow-hidden">
                                        {(() => {
                                            let previewImageSrc = '';
                                            if (heroFormData.heroImage) {
                                                previewImageSrc = typeof heroFormData.heroImage === 'string' ? heroFormData.heroImage : URL.createObjectURL(heroFormData.heroImage);
                                            }
                                            if (!previewImageSrc) return <Image src={Constants.assetsIcon.assets.heroImage} alt="Hero preview" width={600} height={450} className="w-full h-full object-cover rounded-2xl sm:rounded-3xl md:rounded-[40px] lg:rounded-[50px]" />;
                                            const isVideo = typeof heroFormData.heroImage !== 'string' ? (heroFormData.heroImage as File).type.startsWith('video/') : /(\.mp4|\.webm|\.ogg)$/i.test(previewImageSrc);
                                            return isVideo ? <video src={previewImageSrc} controls playsInline autoPlay muted loop className="w-full h-full object-cover rounded-2xl sm:rounded-3xl md:rounded-[40px] lg:rounded-[50px]" /> : <Image src={previewImageSrc} alt="POSPro dashboard" width={600} height={450} className="w-full h-full object-cover rounded-2xl sm:rounded-3xl md:rounded-[40px] lg:rounded-[50px]" />;
                                        })()}
                                    </div>
                                    <WebComponents.UiComponents.UiWebComponents.FileUploadRow onChange={(value: File | string | null) => setHeroFormData(prev => ({ ...prev, heroImage: value || "" }))} accept="image/*,video/*" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 p-4">
                    <WebComponents.UiComponents.UiWebComponents.Button variant="cancel" type="button" onClick={() => {
                        const defaultFeatures = Constants.commonConstants.landingStrings.hero.keyFeatures;
                        setHeroFormData({ 
                            title1: "", 
                            title2: "", 
                            subtitle: "", 
                            heroImage: "",
                            sublist1: defaultFeatures[0] || "",
                            sublist2: defaultFeatures[1] || "",
                            sublist3: defaultFeatures[2] || "",
                            sublist4: defaultFeatures[3] || "",
                        });
                    }}>{Constants.superadminConstants.cancelbutton}</WebComponents.UiComponents.UiWebComponents.Button>
                    <WebComponents.UiComponents.UiWebComponents.Button type="submit" disabled={heroSectionLoading || !heroFormData.heroImage}>{heroSectionLoading ? "Saving..." : "Save"}</WebComponents.UiComponents.UiWebComponents.Button>
                </div>
            </form>

            {showEditHeroModal && editingHero && (
                <HeroModal
                    title="Edit Hero Section"
                    onClose={() => { setShowEditHeroModal(false); setEditingHero(null); }}
                    onSubmit={() => handleSaveHeroSection()}
                    formData={heroFormData}
                    setFormData={setHeroFormData}
                />
            )}
        </div>
    );
};

export default Hero;

function HeroModal({
    title,
    onClose,
    onSubmit,
    formData,
    setFormData,
}: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    formData: SuperAdminTypes.LandingSettingPageTypes.HeroSectionFormData;
    setFormData: React.Dispatch<React.SetStateAction<SuperAdminTypes.LandingSettingPageTypes.HeroSectionFormData>>;
}) {
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(); };
    let previewImageSrc = '';
    if (formData.heroImage) {
        previewImageSrc = typeof formData.heroImage === 'string' ? formData.heroImage : URL.createObjectURL(formData.heroImage);
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl relative">
                <div className="flex justify-between items-center border-b pb-4 px-6 pt-6 border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="bg-[#F6FBFF] dark:bg-[#0D1117] relative rounded-lg overflow-hidden">
                            <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center py-6">
                                    <div className="w-full lg:w-[626px] order-2 lg:order-1">
                                        <div className="pt-1">
                                            <input type="text" value={formData.title1} onChange={(e) => setFormData(prev => ({ ...prev, title1: e.target.value }))} className="text-textMain dark:text-white font-poppins font-bold text-2xl sm:text-3xl md:text-4xl w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0" placeholder="The Future of" />
                                            <input type="text" value={formData.title2} onChange={(e) => setFormData(prev => ({ ...prev, title2: e.target.value }))} className="text-primary font-poppins font-semibold text-2xl sm:text-3xl md:text-4xl italic w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0 mt-1" placeholder="Point of Sale" />
                                        </div>
                                        <div className="pt-2">
                                            <textarea value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} className="text-textSmall dark:text-neutral font-interTight text-xs sm:text-sm md:text-base w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0 resize-none" placeholder="Description" rows={3} />
                                        </div>
                                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                            {[
                                                { value: formData.sublist1 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sublist1: e.target.value })), placeholder: "Real-time Analytics" },
                                                { value: formData.sublist2 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sublist2: e.target.value })), placeholder: "Inventory Management" },
                                                { value: formData.sublist3 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sublist3: e.target.value })), placeholder: "Multi-location Support" },
                                                { value: formData.sublist4 || "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, sublist4: e.target.value })), placeholder: "24/7 Customer Support" },
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={item.onChange}
                                                        className="text-textMain3 dark:text-neutral font-interTight font-medium text-xs sm:text-sm md:text-base w-full bg-transparent border-b-2 border-transparent focus:border-primary outline-none p-0"
                                                        placeholder={item.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-[600px] h-[450px] rounded-2xl bg-[#EEF6FF] order-1 lg:order-2 overflow-hidden">
                                        {previewImageSrc && (() => {
                                            const isVideo = typeof formData.heroImage !== 'string' ? (formData.heroImage as File).type.startsWith('video/') : /(\.mp4|\.webm|\.ogg)$/i.test(previewImageSrc);
                                            return isVideo ? (
                                                <video src={previewImageSrc} controls playsInline autoPlay muted loop className="w-full h-full object-cover rounded-2xl" />
                                            ) : (
                                                <Image src={previewImageSrc} alt="Preview" width={600} height={450} className="w-full h-full object-cover rounded-2xl" />
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <WebComponents.UiComponents.UiWebComponents.FileUploadRow label="Upload" onChange={(value) => setFormData(prev => ({ ...prev, heroImage: value ?? prev.heroImage }))} accept="image/*,video/*" />
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <WebComponents.UiComponents.UiWebComponents.Button variant="cancel" type="button" onClick={onClose}>{Constants.superadminConstants.cancelbutton}</WebComponents.UiComponents.UiWebComponents.Button>
                        <WebComponents.UiComponents.UiWebComponents.Button type="submit" disabled={!formData.heroImage}>Save</WebComponents.UiComponents.UiWebComponents.Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

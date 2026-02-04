import React from 'react';
import { Upload } from 'lucide-react';
import { WebComponents } from '@/components';
import { Constants } from '@/constant';
import { ServerActions } from '@/lib';
import { SuperAdminTypes } from '@/types';
import { useRouter } from 'next/navigation';

interface SEOProps {
    seoSettings: SuperAdminTypes.SettingTypes.SEOSettingsTypes.SEOSettings | null;
}

const SEO = ({ seoSettings: initialSettings }: SEOProps) => {
    const router = useRouter();
    const [seoSettings, setSEOSettings] = React.useState<SuperAdminTypes.SettingTypes.SEOSettingsTypes.SEOSettings | null>(initialSettings);
    const [seoFormData, setSEOFormData] = React.useState<SuperAdminTypes.SettingTypes.SEOSettingsTypes.SEOSettingsFormData>({
        seoSlug: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: [] as string[],
        seoImage: '',
        googleSiteVerification: '',
        canonicalUrl: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (initialSettings) {
            setSEOSettings(initialSettings);
            const data = initialSettings;
            setSEOFormData({
                seoSlug: data.seoSlug || '',
                metaTitle: data.metaTitle || '',
                metaDescription: data.metaDescription || '',
                metaKeywords: data.metaKeywords || [],
                seoImage: data.seoImage?.url || '',
                googleSiteVerification: data.googleSiteVerification || '',
                canonicalUrl: data.canonicalUrl || ''
            });
        }
    }, [initialSettings]);

    const handleSaveSEOSettings = async () => {
        await ServerActions.HandleFunction.handleAddCommon({
            formData: seoFormData,
            createAction: ServerActions.ServerActionslib.createSEOSettingsAction,
            setLoading: setIsLoading,
            setShowModal: () => { },
            router,
            successMessage: "SEO settings saved successfully.",
            onSuccess: (result: any) => {
                if (result?.data) {
                    const data = Array.isArray(result.data) ? result.data[0] : (result.data.data && Array.isArray(result.data.data) ? result.data.data[0] : result.data.data || result.data);
                    setSEOSettings(data);
                }
                setSavedSection('seo');
                setTimeout(() => setSavedSection(null), 2000);
            }
        });
    };

    return (
        <div className='m-4'>
            <div className="space-y-4">
                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="seoSlug">SEO Slug</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="seoSlug"
                        value={seoFormData.seoSlug}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSEOFormData((prev: any) => ({ ...prev, seoSlug: e.target.value }))}
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="metaTitle">Meta Title</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="metaTitle"
                        value={seoFormData.metaTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSEOFormData((prev: any) => ({ ...prev, metaTitle: e.target.value }))}
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="metaDescription">Meta Description</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <textarea
                        id="metaDescription"
                        value={seoFormData.metaDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSEOFormData((prev: any) => ({ ...prev, metaDescription: e.target.value }))}
                        rows={2}
                        className="h-[44px] w-full rounded-[4px] border-[0.6px] border-[#D8D9D9] dark:border-gray-600 bg-textMain2 dark:bg-gray-800 pl-3 pr-3 pt-2 text-textMain dark:text-white font-interTight font-medium text-sm leading-[14px] placeholder:text-textSmall dark:placeholder-gray-400 placeholder:font-interTight placeholder:font-normal placeholder:text-sm placeholder:leading-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[100px] resize-vertical"
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="metaKeywords">Meta Keywords (comma-separated)</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="metaKeywords"
                        value={Array.isArray(seoFormData.metaKeywords) ? seoFormData.metaKeywords.join(', ') : seoFormData.metaKeywords}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0);
                            setSEOFormData((prev: any) => ({ ...prev, metaKeywords: keywords }));
                        }}
                        placeholder="pos, point of sale, business, dashboard"
                    />
                </div>

                <div className="space-y-2">
                    <WebComponents.UiComponents.UiWebComponents.FileUploadRow
                        label="SEO Image Upload"
                        id="seoImage"
                        accept="image/*"
                        value={null}
                        currentFileUrl={typeof seoFormData.seoImage === 'string' ? seoFormData.seoImage : undefined}
                        onChange={(value: File | string | null) => {
                            if (value) {
                                setSEOFormData((prev: any) => ({ ...prev, seoImage: value }));
                            } else {
                                setSEOFormData((prev: any) => ({ ...prev, seoImage: '' }));
                            }
                        }}
                        icon={<Upload className="w-4 h-4 text-gray-500" />}
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="googleSiteVerification">Google Site Verification</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="googleSiteVerification"
                        value={seoFormData.googleSiteVerification}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSEOFormData((prev: any) => ({ ...prev, googleSiteVerification: e.target.value }))}
                        placeholder="abc123-xyz789-verifytoken"
                    />
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="canonicalUrl">Canonical URL</WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.FormInput
                        id="canonicalUrl"
                        value={seoFormData.canonicalUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSEOFormData((prev: any) => ({ ...prev, canonicalUrl: e.target.value }))}
                        placeholder="https://example.com/page"
                    />
                </div>
            </div>
            <div className="mt-8">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus
                    onClick={handleSaveSEOSettings}
                    disabled={isLoading}
                    showStatus={savedSection === 'seo'}
                >
                    {Constants.superadminConstants.saveseosettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </div>
    );
};

export default SEO;

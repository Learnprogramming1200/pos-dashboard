"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from "react-hook-form";
import * as Yup from "yup";
import { WebComponents } from '@/components';
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from '@/constant';
import { ServerActions } from '@/lib';
import { toast } from 'react-toastify';
import { SuperAdminTypes } from '@/types';
import { generalSettingsSchema } from '@/app/validation/ValidationSchema';

const formatContactNumberForSave = (countryCode = '', phoneNumber = '') => {
    return countryCode ? `${countryCode}${phoneNumber!.replace(/\s+/g, '')}` : phoneNumber!.replace(/\s+/g, '');
};


const General = ({ generalSettings: initialSettings }: { generalSettings: SuperAdminTypes.SettingTypes.GeneralSettingsTypes.GeneralSettings | null }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [savedSection, setSavedSection] = React.useState<string | null>(null);

    type FormData = Yup.InferType<typeof generalSettingsSchema>;
    const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch, getValues } = useForm<FormData>({
        resolver: yupResolver(generalSettingsSchema) as any,
        defaultValues: {
            appName: initialSettings?.appName || '',
            footerText: initialSettings?.footerText || '',
            contactCountryCode: '',
            contactNo: '',
            inquiryEmail: initialSettings?.inquiryEmail || '',
            siteDescription: initialSettings?.siteDescription || '',
            userApp: initialSettings?.userApp || '',
            businessAddress: initialSettings?.businessAddress || { shopNumber: '', buildingName: '', area: '', landmark: '', nearBy: '', country: '', state: '', city: '', postalCode: '', latitude: 0, longitude: 0 },
            logos: Object.fromEntries(Object.keys(initialSettings?.logos || {}).map(key => [key, initialSettings?.logos?.[key as keyof typeof initialSettings.logos]?.url || null])) as any
        },
    });

    const { businessAddress, contactCountryCode } = watch();

    React.useEffect(() => {
        if (initialSettings) {
            const { contactNumber, businessAddress: addr, logos, ...rest } = initialSettings;
            const match = contactNumber?.match(/^(\+\d{1,3})(\d+)$/);

            reset({
                ...rest,
                contactCountryCode: match ? match[1] : '',
                contactNo: match ? match[2] : contactNumber,
                businessAddress: {
                    shopNumber: addr?.shopNumber || '',
                    buildingName: addr?.buildingName || '',
                    area: addr?.area || '',
                    landmark: addr?.landmark || '',
                    nearBy: addr?.nearBy || '',
                    city: addr?.city || '',
                    postalCode: addr?.postalCode || '',
                    latitude: addr?.latitude || 0,
                    longitude: addr?.longitude || 0,
                    country: addr?.country || '',
                    state: addr?.state || ''
                },
                logos: Object.fromEntries(Object.keys(logos || {}).map(k => [k, logos[k as keyof typeof logos]?.url || null])) as any
            });
        }
    }, [initialSettings, reset]);

    const handleAddressChange = (field: keyof FormData['businessAddress'], value: any) => {
        setValue(`businessAddress.${field}`, value);
        if (field === 'country') {
            setValue('businessAddress.state', '');
            setValue('businessAddress.city', '');
        }
        if (field === 'state') {
            setValue('businessAddress.city', '');
        }
    };

    const onSubmitForm = async (data: FormData) => {
        setIsLoading(true);
        try {
            const result = await ServerActions.ServerActionslib.createGeneralSettingsAction({
                ...data,
                footerText: data.footerText || '',
                userApp: data.userApp || '',
                contactNumber: formatContactNumberForSave(data.contactCountryCode, data.contactNo),
                businessAddress: {
                    shopNumber: data.businessAddress?.shopNumber || '',
                    buildingName: data.businessAddress?.buildingName || '',
                    area: data.businessAddress?.area || '',
                    landmark: data.businessAddress?.landmark || '',
                    nearBy: data.businessAddress?.nearBy || '',
                    city: data.businessAddress?.city || '',
                    postalCode: data.businessAddress?.postalCode || '',
                    country: data.businessAddress?.country || '',
                    state: data.businessAddress?.state || '',
                    latitude: Number(data.businessAddress?.latitude) || 0,
                    longitude: Number(data.businessAddress?.longitude) || 0
                },
                logos: data.logos as any
            });

            if (result.success) {
                toast.success('General settings saved successfully!');
                setSavedSection('general');
                setTimeout(() => setSavedSection(null), 2000);
                router.refresh();
            } else toast.error(result.error || 'Failed to save general settings');
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save general settings');
        } finally { setIsLoading(false); }
    };

    if (isLoading && !initialSettings && !getValues('appName')) { }

    const logoFields = [
        { name: 'logos.darkLogo', label: Constants.superadminConstants.darklogo },
        { name: 'logos.lightLogo', label: Constants.superadminConstants.lightlogo },
        { name: 'logos.favicon', label: Constants.superadminConstants.favicon },
        { name: 'logos.collapsDarkLogo', label: 'Collapsed Dark Logo' },
        { name: 'logos.collapsLightLogo', label: 'Collapsed Light Logo' },
        { name: 'logos.miniLogo', label: 'Mini Logo' },
    ];

    const addressFields = ['shopNumber', 'buildingName', 'area', 'landmark', 'nearBy'];

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='m-4'>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ id: 'appName', label: 'App Name', req: true }, { id: 'footerText', label: 'Footer Text' }].map(f => (
                        <div key={f.id}>
                            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor={f.id}>{f.label} {f.req && <span className="text-red-500">*</span>}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <WebComponents.UiComponents.UiWebComponents.FormInput id={f.id} {...register(f.id as any)} required={f.req} className={errors[f.id as keyof FormData] ? "border-red-500" : ""} />
                            {errors[f.id as keyof FormData] && <p className="mt-1 text-sm text-red-500">{(errors[f.id as keyof FormData] as any).message}</p>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="contactNo">Contact No <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <Controller name="contactNo" control={control} render={({ field }) => (
                            <WebComponents.UiComponents.UiWebComponents.PhoneInputWithCountryCode countryCode={contactCountryCode || ''} phoneNumber={field.value || ''} onCountryCodeChange={(c) => setValue('contactCountryCode', c)} onPhoneNumberChange={field.onChange} placeholder="Enter contact number" required />
                        )} />
                        {errors.contactNo && <p className="mt-1 text-sm text-red-500">{errors.contactNo.message}</p>}
                    </div>
                    <div>
                        <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="inquiryEmail">Inquiry Email <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                        <WebComponents.UiComponents.UiWebComponents.FormInput id="inquiryEmail" type="email" {...register("inquiryEmail")} required className={errors.inquiryEmail ? "border-red-500" : ""} />
                        {errors.inquiryEmail && <p className="mt-1 text-sm text-red-500">{errors.inquiryEmail.message}</p>}
                    </div>
                </div>

                <div>
                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="siteDescription">Site Description <span className="text-red-500">*</span></WebComponents.UiComponents.UiWebComponents.FormLabel>
                    <WebComponents.UiComponents.UiWebComponents.Textarea id="siteDescription" {...register("siteDescription")} required className={errors.siteDescription ? "border-red-500" : ""} />
                    {errors.siteDescription && <p className="mt-1 text-sm text-red-500">{errors.siteDescription.message}</p>}
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Address</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {addressFields.slice(0, 3).map(id => (
                                <div key={id}>
                                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor={id}>{id.replace(/([A-Z])/g, ' $1').trim()}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    <WebComponents.UiComponents.UiWebComponents.FormInput id={id} {...register(`businessAddress.${id}` as any)} />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addressFields.slice(3).map(id => (
                                <div key={id}>
                                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor={id}>{id.replace(/([A-Z])/g, ' $1').trim()}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    <WebComponents.UiComponents.UiWebComponents.FormInput id={id} {...register(`businessAddress.${id}` as any)} />
                                </div>
                            ))}
                        </div>

                        <WebComponents.UiComponents.UiWebComponents.CountryStateCitySelector
                            selectedCountry={businessAddress?.country || ''}
                            onCountryChange={c => handleAddressChange('country', c)}
                            selectedState={businessAddress?.state || ''}
                            onStateChange={s => handleAddressChange('state', s)}
                            selectedCity={businessAddress?.city || undefined}
                            onCityChange={c => handleAddressChange('city', c)}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['postalCode', 'latitude', 'longitude'].map(id => (
                                <div key={id}>
                                    <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor={id}>{id.charAt(0).toUpperCase() + id.slice(1)}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                                    <WebComponents.UiComponents.UiWebComponents.FormInput id={id} type={id === 'postalCode' ? 'text' : 'number'} step="any" {...register(`businessAddress.${id}` as any)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {logoFields.map(field => (
                        <div key={field.name} className="space-y-2">
                            <WebComponents.UiComponents.UiWebComponents.FormLabel>{field.label}</WebComponents.UiComponents.UiWebComponents.FormLabel>
                            <Controller name={field.name as any} control={control} render={({ field: { value, onChange } }) => (
                                <WebComponents.UiComponents.UiWebComponents.ImageCropUpload value={value} onChange={(val: string | File | null) => onChange(typeof val === 'string' ? val : null)} />
                            )} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus onClick={handleSubmit(onSubmitForm)} showStatus={savedSection === 'general'} disabled={isLoading}>
                    {Constants.superadminConstants.savegeneralsettings}
                </WebComponents.UiComponents.UiWebComponents.SaveButtonWithStatus>
            </div>
        </form>
    );
};

export default General;

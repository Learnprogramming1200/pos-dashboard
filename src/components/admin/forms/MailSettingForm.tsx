"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Constants } from "@/constant";
import { mailSettingFormSchema } from "@/app/validation/ValidationSchema";
import * as Yup from "yup";
import { WebComponents } from "@/components";
import { AdminTypes } from "@/types";

type FormData = Yup.InferType<typeof mailSettingFormSchema>;

interface MailSettingFormProps {
  onSubmit: (data: {
    email: string;
    host: string;
    port: number;
    encryption: 'ssl' | 'tls' | 'none';
    password: string;
  }) => void;
  mailSetting?: AdminTypes.AdminMailSettingsTypes.MailSettings;
}

const MailSettingForm = ({ onSubmit, mailSetting }: MailSettingFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(mailSettingFormSchema) as any,
    defaultValues: {
      email: mailSetting?.email ?? "",
      host: mailSetting?.host ?? "",
      port: mailSetting?.port ?? 587,
      encryption: mailSetting?.encryption ?? "tls",
      password: mailSetting?.password ?? "",
    },
  });

  // Update form values when mailSetting prop changes
  React.useEffect(() => {
    if (mailSetting) {
      reset({
        email: mailSetting.email || "",
        host: mailSetting.host || "",
        port: mailSetting.port || 587,
        encryption: mailSetting.encryption || "tls",
        password: mailSetting.password || "",
      });
    }
  }, [mailSetting, reset]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      email: data.email.trim(),
      host: data.host.trim(),
      port: data.port,
      encryption: data.encryption as 'ssl' | 'tls' | 'none',
      password: data.password,
    });
  };

  return (
    <form id="mail-setting-form" onSubmit={handleSubmit(onSubmitForm)}>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <div className="col-span-1 md:col-span-2">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="email">
              {Constants.adminConstants.mailSettingStrings.emailLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              autoComplete="off"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-required">{errors.email.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="host">
              {Constants.adminConstants.mailSettingStrings.hostLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="host"
              type="text"
              placeholder="Enter SMTP host (e.g., smtp.gmail.com)"
              {...register("host")}
              autoComplete="off"
              className={errors.host ? "border-red-500" : ""}
            />
            {errors.host && (
              <p className="mt-1 text-sm text-required">{errors.host.message}</p>
            )}
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="port">
              {Constants.adminConstants.mailSettingStrings.portLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="port"
              type="number"
              placeholder="Enter SMTP port (e.g., 587, 465, 25)"
              {...register("port", { valueAsNumber: true })}
              autoComplete="off"
              className={errors.port ? "border-red-500" : ""}
            />
            {errors.port && (
              <p className="mt-1 text-sm text-required">{errors.port.message}</p>
            )}
          </div>

          <div>
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="encryption">
              {Constants.adminConstants.mailSettingStrings.encryptionLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <Controller
              name="encryption"
              control={control}
              render={({ field: { value, onChange } }) => (
                <WebComponents.UiComponents.UiWebComponents.FormDropdown
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={errors.encryption ? "border-red-500" : ""}
                >
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="tls">TLS</WebComponents.UiComponents.UiWebComponents.FormOption>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="ssl">SSL</WebComponents.UiComponents.UiWebComponents.FormOption>
                  <WebComponents.UiComponents.UiWebComponents.FormOption value="none">None</WebComponents.UiComponents.UiWebComponents.FormOption>
                </WebComponents.UiComponents.UiWebComponents.FormDropdown>
              )}
            />
            {errors.encryption && (
              <p className="mt-1 text-sm text-required">{errors.encryption.message}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <WebComponents.UiComponents.UiWebComponents.FormLabel htmlFor="password">
              {Constants.adminConstants.mailSettingStrings.passwordLabel}{" "}
              <span className="text-required">{Constants.adminConstants.requiredstar}</span>
            </WebComponents.UiComponents.UiWebComponents.FormLabel>
            <WebComponents.UiComponents.UiWebComponents.FormInput
              id="password"
              type="password"
              placeholder="Enter SMTP password"
              {...register("password")}
              autoComplete="off"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-required">{errors.password.message}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default MailSettingForm;


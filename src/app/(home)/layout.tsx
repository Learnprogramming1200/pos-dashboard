import { ReactNode, Suspense } from "react";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { ssrPublicAPI } from "@/lib/ssr-api";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeaderSkeleton from "@/components/landing/LandingHeaderSkeleton";
import LandingSkeleton from "@/components/landing/LandingSkeleton";

async function fetchSettings() {
  try {
    const [
      settingsResponse,
      trialDaysResponse,
      generalSettingsResponse,
      footerResponse,
      socialMediaResponse
    ] = await Promise.all([
      ssrPublicAPI.getMiscellaneousSettings(),
      ssrPublicAPI.getTrialDays().catch(() => null),
      ssrPublicAPI.getGeneralSettings().catch(() => null),
      ssrPublicAPI.getFooterSection().catch(() => null),
      ssrPublicAPI.getSocialMedia().catch(() => null),
    ]);
    const settings = settingsResponse?.data?.data || settingsResponse?.data || null;
    const trialDays = trialDaysResponse?.data?.data?.data ?? trialDaysResponse?.data?.data ?? trialDaysResponse?.data ?? 7;
    const generalSettings = generalSettingsResponse?.data?.data || generalSettingsResponse?.data || null;
    const footerSection = footerResponse?.data?.data || footerResponse?.data || null;
    const socialMedia = socialMediaResponse?.data?.data || socialMediaResponse?.data || null;
    return { settings, trialDays, generalSettings, footerSection, socialMedia };
  } catch {
    return { settings: null, trialDays: 7, generalSettings: null, footerSection: null, socialMedia: null };
  }
}

function isMaintenanceEnabled(settings: any): boolean {
  if (!settings || typeof settings !== "object") return false;
  return settings?.isMaintenanceMode;
}

async function HomeLayoutContent({ children }: { children: ReactNode }) {
  const { settings, trialDays, generalSettings, footerSection, socialMedia } = await fetchSettings();
  const maintenance = isMaintenanceEnabled(settings);

  if (maintenance) {
    return (
      <>
        <LandingHeader minimal={false} hideNavLinks={false} miscSettings={settings} generalSettings={generalSettings} />
        <MaintenancePage />
        <LandingFooter user={null} trialDays={trialDays} footerSection={footerSection} socialMedia={socialMedia} />
      </>
    );
  }

  return (
    <>
      <LandingHeader minimal={false} hideNavLinks={false} miscSettings={settings} generalSettings={generalSettings} />
      <main className="pt-[72px]">{children}</main>
      <LandingFooter user={null} trialDays={trialDays} footerSection={footerSection} socialMedia={socialMedia} />
    </>
  );
}

export default function HomeGroupLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayoutContent>{children}</HomeLayoutContent>
  );
}

import { WebComponents } from "@/components";
import { PageGuard } from "@/components/guards/page-guard";

export default function PaymentMethodSettingPage() {
    return (
        <PageGuard permissionKey="settings.paymentMethods">
            <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.PaymentSetting />
        </PageGuard>
    );
}
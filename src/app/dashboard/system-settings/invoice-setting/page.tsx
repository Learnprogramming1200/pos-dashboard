import { WebComponents } from "@/components";
import { ServerActions } from "@/lib/server-lib";
import { DEFAULT_DESIGN_CONFIG } from "@/types/admin/invoice-design";
import { PageGuard } from "@/components/guards/page-guard";

export default async function InvoiceSettingPage() {

    // 1. Fetch Data from Server (Server Side Rendering)
    let initialConfig = null;
    let initialTemplate = 1;

    try {
        const response = await ServerActions.ServerApilib.ssrInvoiceDesignAPI.get();
        const backendData = response?.data?.data;

        if (backendData) {
            // Map backend 'templateId' (string) to 'selectedTemplate' (number)
            if (backendData.templateId && backendData.templateId.startsWith('template')) {
                initialTemplate = parseInt(backendData.templateId.replace('template', ''));
            }

            // Cleanup Data
            const { _id, createdAt, updatedAt, __v, templateId, ...restConfig } = backendData;
            initialConfig = { ...DEFAULT_DESIGN_CONFIG, ...restConfig };
        }

    } catch (error) {
        console.warn("Failed to fetch invoice settings on server", error);
        // Fallback to defaults or null (Client will handle or use defaults)
    }

    return (
        <PageGuard permissionKey="settings.invoice">
            <WebComponents.AdminComponents.AdminWebComponents.SystemSettingsWebComponents.InvoiceSettings.InvoiceSettingsClient
                initialConfig={initialConfig}
                initialTemplate={initialTemplate}
            />
        </PageGuard>
    );
}

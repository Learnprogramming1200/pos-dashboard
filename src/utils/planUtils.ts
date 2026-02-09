import { HomeTypes } from "@/types";

/**
 * Normalizes raw plan data from the API to match the IPlan interface.
 * Handles both new API format and legacy field names.
 * @param rawPlans - The raw plan data from the API
 * @returns Normalized array of IPlan objects
 */
export function normalizePlans(rawPlans: any[]): HomeTypes.IPlan[] {
    if (!Array.isArray(rawPlans)) {
        return [];
    }

    return rawPlans.map((plan: any) => {
        // Generate a unique id from _id or id
        const id = plan._id || plan.id || '';

        return {
            // Core identifiers
            id: id,
            _id: id,

            // Basic info - handle both new and legacy field names
            name: plan.name || plan.Plan_Name || '',
            price: parseFloat(plan.price) || parseFloat(plan.Price) || 0,
            totalPrice: plan.totalPrice,
            type: plan.type || plan.Plan_Type || '',
            description: plan.description || plan.Description || '',

            // Features and modules
            features: plan.features || [],
            modules: plan.modules || plan.Modules || [],

            // Pricing options
            annual_price: plan.annual_price ?? null,
            discount: plan.discount || parseFloat(plan.Discount) || 0,
            discountType: plan.discountType || plan.Discount_Type || '',
            formattedPrice: plan.formattedPrice,

            // Currency info
            currency: plan.currency,
            currencyId: plan.currencyId,

            // Limits
            max_locations: plan.max_locations ?? plan.Total_Stores ? parseInt(plan.Total_Stores) : null,
            max_users: plan.max_users ?? null,
            storeLimit: plan.storeLimit ?? (plan.Total_Stores ? parseInt(plan.Total_Stores) : null),
            staffLimit: plan.staffLimit ?? (plan.StaffLimit ?
                (typeof plan.StaffLimit === 'string' ? parseInt(plan.StaffLimit) : plan.StaffLimit) : null),

            // Configuration
            support_level: plan.support_level || '',
            popular: plan.popular || false,
            isMostPopular: plan.isMostPopular || false,
            isRecommended: plan.isRecommended ?? plan.Is_Recommended ?? false,
            isTrial: plan.isTrial || false,
            duration: plan.duration || '',
            themes: plan.themes || [],
            posTheme: plan.posTheme || plan.Pos_Theme || '',
            planPosition: plan.planPosition ?? plan.Plan_Position,

            // Status and metadata
            status: plan.status ?? plan.Status,
            tax: plan.tax,
            createdAt: plan.createdAt || plan.Created_Date,
            updatedAt: plan.updatedAt,

            // Legacy fields for backwards compatibility
            Plan_Name: plan.Plan_Name,
            Plan_Type: plan.Plan_Type,
            Total_Stores: plan.Total_Stores,
            Price: plan.Price,
            Created_Date: plan.Created_Date,
            Status: plan.Status,
            Description: plan.Description,
            Modules: plan.Modules,
            Pos_Theme: plan.Pos_Theme,
            color: plan.color,
            textColor: plan.textColor,
            Plan_Position: plan.Plan_Position,
            Discount_Type: plan.Discount_Type,
            Discount: plan.Discount,
            Is_Recommended: plan.Is_Recommended,
            StaffLimit: plan.StaffLimit,
        };
    });
}

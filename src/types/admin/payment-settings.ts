export namespace PaymentSettingTypes {
    export type PaymentProvider = 'razorpay' | 'stripe' | 'paystack' | 'paypal' | 'flutterwave' | 'cinet' | 'sadad' | 'airtelMoney' | 'phonePe' | 'midtrans' | 'mercadopago' | 'xendit' | 'cashfree';

    export interface PaymentSettings {
        provider: PaymentProvider;
        enabled: boolean;
        credentials: {
            // Razorpay, Stripe, Paystack, Flutterwave
            secretKey?: string;
            appKey?: string;
            // Paypal
            siteId?: string;
            // CINET
            clientApiKey?: string;
            // SADAD
            domain?: string;
            // PhonePe
            appId?: string;
            merchantId?: string;
            saltId?: string;
            saltKey?: string;
            // MercadoPago
            publicKey?: string;
            // Xendit
            webhookToken?: string;
        };
    }

    export interface AllPaymentSettings {
        razorpay: PaymentSettings;
        stripe: PaymentSettings;
        paystack: PaymentSettings;
        paypal: PaymentSettings;
        flutterwave: PaymentSettings;
        cinet: PaymentSettings;
        sadad: PaymentSettings;
        airtelMoney: PaymentSettings;
        phonePe: PaymentSettings;
        midtrans: PaymentSettings;
        mercadopago: PaymentSettings;
        xendit: PaymentSettings;
        cashfree: PaymentSettings;
    }

    export type PaymentSettingsFormData = AllPaymentSettings;
}

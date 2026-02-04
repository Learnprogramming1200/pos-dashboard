
export function mapInvoiceDataForTemplate(body: any) {
    // 1. Destructure potential root properties
    const {
        business = {},
        customer = {},
        invoice = {},
        items = [],
        bank = {},
        upi = {},
        supplier,     // From user JSON
        orderDetails, // From user JSON
        totals: bodyTotals, // From user JSON
        paymentTerms, // From user JSON
        notes,        // From user JSON
        status,       // From user JSON
        createdAt,    // From user JSON
        invoiceTitle  // NEW: Support for dynamic title
    } = body || {};

    // 2. Resolve "Seller/Business" Info
    // If 'supplier' exists (user's JSON), treat it as the "Business" (Seller)
    const effectiveBusiness = supplier || business;
    const businessAddressObj = effectiveBusiness.billingAddress || effectiveBusiness.address || {};

    const companyName = effectiveBusiness.supplierName || effectiveBusiness.businessName || effectiveBusiness.companyName || 'Your Company';
    const companyAddress = [
        businessAddressObj.address1 || businessAddressObj.address || businessAddressObj.street,
        businessAddressObj.address2,
        businessAddressObj.city,
        businessAddressObj.state,
        businessAddressObj.postalCode || businessAddressObj.zip,
        businessAddressObj.country
    ].filter(Boolean).join(', ');

    const companyEmail = businessAddressObj.email || effectiveBusiness.email || '';
    const companyPhone = businessAddressObj.phone || effectiveBusiness.phone || '';

    // 3. Resolve "Customer/Billing To" Info
    // If 'orderDetails.deliveryAddress' exists, treat it as the "Customer"
    const effectiveCustomer = orderDetails?.deliveryAddress || customer;

    // Check for pre-mapped keys from server-actions or raw keys
    const customerName = effectiveCustomer.deliveryName || effectiveCustomer.name || effectiveCustomer.company || effectiveCustomer.contactPerson || 'Walk-in Customer';

    // Address Resolution
    let customerAddress = '';
    if (effectiveCustomer.deliveryAddress && typeof effectiveCustomer.deliveryAddress === 'string') {
        // Pre-mapped string
        customerAddress = effectiveCustomer.deliveryAddress;
    } else {
        // Construct from parts
        const customerAddrParts = [
            effectiveCustomer.address1 || effectiveCustomer.address || effectiveCustomer.billingAddress,
            effectiveCustomer.address2,
            effectiveCustomer.city || effectiveCustomer.billingCity,
            effectiveCustomer.state || effectiveCustomer.billingState,
            effectiveCustomer.postalCode || effectiveCustomer.billingZip,
            effectiveCustomer.country
        ].filter(Boolean);
        customerAddress = customerAddrParts.length > 0 ? customerAddrParts.join(', ') : '';
    }

    const customerEmail = effectiveCustomer.deliveryEmail || effectiveCustomer.email || '';
    const customerPhone = effectiveCustomer.deliveryPhone || effectiveCustomer.phone || '';

    // 4. Resolve Invoice Meta
    // Prioritize orderDetails for dates/PO numbers
    const invoiceNumber = invoice.invoiceNumber || orderDetails?.poNumber || body._id || ''; // Fallback to ID if no invoice number
    // Use invoiceDate -> orderDetails.purchaseDate -> createdAt -> Now
    const dateRaw = invoice.invoiceDate || orderDetails?.purchaseDate || createdAt || new Date().toISOString();
    const dueDateRaw = invoice.dueDate || orderDetails?.expectedDeliveryDate || '';
    const orderNo = invoice.purchaseOrderNumber || invoice.poNumber || orderDetails?.poNumber || '';

    const shipFromName = customer.shippingName || companyName;
    const shipFromAddress = customer.shippingAddress || companyAddress;
    const shipFromPhone = customer.shippingPhone || companyPhone; // Use mapped phone if available

    // 5. Resolve Items
    const mappedItems = (items || []).map((item: any, idx: number) => ({
        sr: idx + 1,
        name: item.productName || item.description || 'Item',
        description: item.description || '',
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        discountAmount: Number(item.discountAmount || 0),
        taxAmount: Number(item.taxAmount || 0),
        lineTotal: Number(item.lineTotal || item.lineSubtotal || 0) // Handle lineSubtotal from user JSON
    }));

    // 6. Resolve Totals
    // User JSON has 'totals' object with specific keys
    const totals = bodyTotals || body.summaryTotals || body.totals || {};

    // 7. Return Flattened Structure
    return {
        // Company / Seller Info
        companyName,
        companyAddress,
        companyEmail,
        companyPhone,
        companyWebsite: effectiveBusiness.website || '',

        // Invoice Meta
        invoiceTitle: invoiceTitle || 'INVOICE',
        invoiceNumber,
        date: dateRaw,
        dueDate: dueDateRaw,
        orderNumber: orderNo,

        // Billing To
        billingTo: {
            name: customerName,
            address: customerAddress,
            phone: customerPhone,
            email: customerEmail
        },

        // Shipping From (In many templates this is "Ship From")
        // Mapping this to the Seller/Company usually, unless specifically different.
        // Re-using company info here so "Ship From" matches the Header Company.
        shipFrom: {
            name: shipFromName,
            address: shipFromAddress,
            phone: shipFromPhone
        },

        // Items
        items: mappedItems,

        // Totals
        subTotal: Number(totals.subtotal || 0).toFixed(2),
        discount: Number(totals.totalDiscount || 0).toFixed(2),
        tax: Number(totals.totalTax || 0).toFixed(2),
        total: Number(totals.grandTotal || 0).toFixed(2),
        dueAmount: Number(totals.balanceDue || 0).toFixed(2), // balanceDue from user JSON
        amountPaid: Number(totals.amountPaid || 0).toFixed(2),

        // Footer / Terms
        paymentNote: notes || invoice.notes || paymentTerms || "Thank you for your business.",
        footerMessage: "Computer generated invoice.",

        // Bank / Extra
        bankDetails: {
            name: bank.bankName,
            accountNumber: bank.accountNumber,
            ifsc: bank.ifscCode,
            holder: bank.accountHolder
        },
        upiDetails: {
            id: upi.upiId,
            qrCode: upi.qrCode
        }
    };
}

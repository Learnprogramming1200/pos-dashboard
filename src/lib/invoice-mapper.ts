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
        invoiceTitle, // NEW: Support for dynamic title
        invoiceType   // Injected type for detecting PO/Returns
    } = body || {};

    // Logic Variables
    let effectiveBusiness; // The "Seller" / Header
    let effectiveCustomer; // The "Buyer" / Invoice To
    let shipFromOverride = null; // Specific override for "Ship From" section

    // 2. Resolve Entities based on Invoice Type
    if (invoiceType === 'PURCHASE_ORDER') {
        effectiveBusiness = business;
        effectiveCustomer = orderDetails?.deliveryAddress || customer;

        const supplierAddr = supplier?.billingAddress || {};
        shipFromOverride = {
            name: supplier?.supplierName || supplierAddr.name || supplierAddr.company,
            address: [
                supplierAddr.address1,
                supplierAddr.city,
                supplierAddr.state,
                supplierAddr.postalCode,
                supplierAddr.country
            ].filter(Boolean).join(', '),
            phone: supplierAddr.phone || supplier?.phone
        };
    } else {
        effectiveBusiness = supplier || business;
        effectiveCustomer = orderDetails?.deliveryAddress || customer;
    }

    // Resolve "Business" (Header) Info
    const businessAddressObj = effectiveBusiness.billingAddress || effectiveBusiness.address || {};
    // Ensure we handle both string and object addresses
    const companyName = effectiveBusiness.name || effectiveBusiness.supplierName || effectiveBusiness.businessName || effectiveBusiness.companyName || 'Your Company';
    let companyAddress = '';
    if (typeof businessAddressObj === 'string') {
        companyAddress = businessAddressObj;
    } else {
        companyAddress = [
            businessAddressObj.address1 || businessAddressObj.address || businessAddressObj.street,
            businessAddressObj.address2,
            businessAddressObj.city,
            businessAddressObj.state,
            businessAddressObj.postalCode || businessAddressObj.zip,
            businessAddressObj.country
        ].filter(Boolean).join(', ');
    }

    const companyEmail = effectiveBusiness.email || businessAddressObj.email || '';
    const companyPhone = effectiveBusiness.phone || businessAddressObj.phone || '';

    // Resolve "Customer" (Invoice To) Info
    const customerName = effectiveCustomer.deliveryName || effectiveCustomer.name || effectiveCustomer.company || effectiveCustomer.contactPerson || 'Walk-in Customer';

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
    const invoiceNumber = body.invoiceNumber || invoice.invoiceNumber || orderDetails?.poNumber || body._id || '';
    const dateRaw = body.invoiceDate || invoice.invoiceDate || orderDetails?.purchaseDate || createdAt || new Date().toISOString();
    const dueDateRaw = invoice.dueDate || orderDetails?.expectedDeliveryDate || '';
    const orderNo = invoice.purchaseOrderNumber || invoice.poNumber || orderDetails?.poNumber || '';

    let shipFromFinal = {};
    if (shipFromOverride) {
        shipFromFinal = shipFromOverride;
    } else {
        // Default Logic
        const shipFromName = customer.shippingName || companyName;
        const shipFromAddress = customer.shippingAddress || companyAddress;
        const shipFromPhone = customer.shippingPhone || companyPhone;
        shipFromFinal = {
            name: shipFromName,
            address: shipFromAddress,
            phone: shipFromPhone
        };
    }

    // 5. Resolve Items
    const mappedItems = (items || []).map((item: any, idx: number) => ({
        sr: idx + 1,
        // Support various name fields
        name: item.productName || item.description || 'Item',
        description: item.description || '',
        // Support returnQty vs quantity
        quantity: Number(item.quantity || item.returnQty || 0),
        unitPrice: Number(item.unitPrice || 0),
        discountAmount: Number(item.discountAmount || 0),
        taxAmount: Number(item.taxAmount || 0),
        lineTotal: Number(item.lineTotal || item.lineSubtotal || 0)
    }));

    // 6. Resolve Totals
    // User JSON has 'totals' or 'summary'
    const totals = bodyTotals || body.summary || body.summaryTotals || {};

    // 7. Return Flattened Structure
    return {
        // Company / Seller Info (Header)
        companyName,
        companyAddress,
        companyEmail,
        companyPhone,
        companyWebsite: effectiveBusiness.website || '',

        // Invoice Meta
        invoiceTitle: invoiceTitle || (invoiceType === 'PURCHASE_ORDER' ? 'PURCHASE ORDER' : 'INVOICE'),
        invoiceNumber,
        date: dateRaw,
        dueDate: dueDateRaw,
        orderNumber: orderNo,

        // Invoice To (Customer)
        billingTo: {
            name: customerName,
            address: customerAddress,
            phone: customerPhone,
            email: customerEmail
        },

        // Ship From (Supplier in PO case, Seller in Sales Invoice)
        shipFrom: shipFromFinal,

        // Items
        items: mappedItems,

        // Totals
        subTotal: Number(totals.subtotal || totals.itemsSubtotal || 0).toFixed(2),
        discount: Number(totals.totalDiscount || 0).toFixed(2),
        tax: Number(totals.totalTax || totals.taxTotal || 0).toFixed(2),
        total: Number(totals.grandTotal || totals.totalCreditAmount || 0).toFixed(2),
        dueAmount: Number(totals.balanceDue || 0).toFixed(2),
        amountPaid: Number(totals.amountPaid || totals.receivedCreditAmount || 0).toFixed(2),

        // Footer / Terms
        paymentNote: notes || invoice.notes || paymentTerms || "Thank you for your business.",
        footerMessage: "Computer generated document.",

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

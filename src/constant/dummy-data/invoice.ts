export const invoiceThumbnailData = {
    invoiceTitle: "INVOICE",
    invoiceNumber: "001",
    date: "Oct 24",
    dueDate: "Oct 29",
    orderNumber: "PO-123",
    companyName: "Raven",
    companyAddress: "123 Business Rd",
    companyEmail: "support@raven.com",
    shipFrom: { name: "Raven Corp", phone: "123-456", address: "Warehouse 4" },
    billingTo: { name: "John Doe", phone: "987-654", address: "45 Main St" },
    items: [{ sr: 1, name: "Item", quantity: 1, unitPrice: "50", discountAmount: "0", taxAmount: "0", lineTotal: "50" }],
    subTotal: "50", discount: "0", total: "50", dueAmount: "0",
    footerMessage: "Thanks", paymentNote: "Note",
};

export const invoicePreviewData = {
    invoiceTitle: "INVOICE",
    invoiceNumber: "INV-f983f4",
    date: "17/1/2026",
    dueDate: "22/1/2026",
    orderNumber: "PO-2026-065217",

    // Seller / Company Info
    companyName: "Raven Hancock",
    companyAddress: "Kataragam, Pigotts, 03, 547896, AG",
    companyEmail: "yefodo1698@canvect.com",

    // Ship From
    shipFrom: {
        name: "Raven Hancock",
        phone: "+91154546445856",
        address: "Kataragam, Pigotts, 03, 547896, AG",
    },

    // Delivery To (Bill To)
    billingTo: {
        name: "V-MART",
        phone: "+91967544257578",
        address: "f102- Laxmikant road665656, Surat, GJ, 395005",
    },

    // Items
    // Items
    items: [
        {
            sr: 1,
            name: "fgfdg",
            quantity: 90,
            unitPrice: "50.00",
            discountAmount: "99.99",
            taxAmount: "0.00",
            lineTotal: "4500.00",
        },
        // Adding a second row just for visual balance
        {
            sr: 2,
            name: "Product B",
            quantity: 10,
            unitPrice: "100.00",
            discountAmount: "0.00",
            taxAmount: "10.00",
            lineTotal: "1010.00",
        },
    ],

    // Totals
    subTotal: "4500.00",
    discount: "99.99",
    total: "4400.01",
    dueAmount: "0.00",

    // Footer
    footerMessage: "Thank you for your business.",
    paymentNote:
        "Please make the payment by the due date. This is a computer generated invoice.",
};

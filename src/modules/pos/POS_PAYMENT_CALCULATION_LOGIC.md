# POS Payment Summary Calculation Logic

This document details the authoritative logic used to calculate payment summaries in the Point of Sale (POS) system. The logic is primarily encapsulated in the `usePOSCartCore` hook (`frontend/src/modules/pos/core/hooks/usePOSCartCore.ts`) to ensure consistency across all POS screens.

## 1. Core Principles

The calculation logic follows these strict rules to ensure accuracy and compliance with tax regulations:

1.  **Discounts First**: Product and coupon discounts are always applied *before* tax calculations.
2.  **Net Amount Basis**: Taxes are calculated on the net amount (after all discounts).
3.  **Dual Tax Support**: A single product can have both **Inclusive** and **Exclusive** taxes simultaneously.
4.  **Inclusive Tax Handling**: Inclusive taxes are *extracted* from the price. They are never added on top of the `finalPayable` amount because they are already part of the product's base price.
5.  **Exclusive Tax Handling**: Exclusive taxes are calculated on the net price and *added* on top of the subtotal to form the `finalPayable`.

## 2. Calculation Flow

The calculation is performed in a specific order for every update (add item, change quantity, apply coupon, etc.):

### Step 1: Product Price
Calculate the raw total of all items before any discounts or taxes.
```typescript
Product Price = Σ (Item Price × Quantity)
```

### Step 2: Item-Level Discounts
Calculate the discount for each item individually.
- **Percentage**: `(Price × Quantity) × (Discount % / 100)`
- **Fixed**: `Discount Amount × Quantity`

```typescript
Product Discount = Σ (Item Discount Amount)
```

### Step 3: Coupon Discount Application
If a global coupon is applied, its value is calculated based on the "Discountable Amount":
```typescript
Discountable Amount = Product Price - Product Discount
```

The coupon discount is then distributed proportionally to each item to ensure accurate tax calculation per item.
- **Item Coupon Share**: `(Item Net Subtotal / Total Discountable) × Total Coupon Discount`
- **Total Item Discount**: `Item Product Discount + Item Coupon Share`

### Step 4: Tax Calculation (Per Item)
Taxes are calculated for each item using its **Net Taxable Amount** (Price × Qty - Total Item Discount).

#### A. Inclusive Taxes (Extracted)
These taxes are already inside the price. We identify how much of the price is tax.
- **Formula**: `Tax Amount = Net Taxable Amount × [Tax Rate / (100 + Tax Rate)]`
- **Note**: This amount is *not* added to the total; it is purely for reporting/display.

#### B. Exclusive Taxes (Added)
These taxes are added on top of the price.
- **Formula**: `Tax Amount = Net Taxable Amount × (Tax Rate / 100)`
- **Note**: This amount *is* added to the final payable.

### Step 5: Subtotals & Totals

#### SubTotal
The amount the customer owes before exclusive taxes and shipping.
```typescript
SubTotal = Product Price - Product Discount - Coupon Discount
```
*Note: In this system, SubTotal represents the "Net Price" paid for goods. If items have inclusive tax, the SubTotal includes that tax component.*

#### Total Tax
The sum of all collected taxes (both inclusive and exclusive).
```typescript
Total Tax = Σ (Inclusive Tax Amounts) + Σ (Exclusive Tax Amounts)
```

#### Grand Total
The final amount to be paid by the customer.
```typescript
Grand Total = SubTotal + Σ (Exclusive Tax Amounts) + Shipping - Loyalty - Gift Card
```
*Critically, Inclusive Taxes are NOT added here because they are already present in the `SubTotal`.*

## 3. Data Structures

The system uses specific interfaces to track these values:

### TaxBreakdownItem
Used to display tax details in the UI (receipts, summaries).
```typescript
interface TaxBreakdownItem {
    taxId: string;
    taxName: string;
    taxType: 'Exclusive' | 'Inclusive';
    valueType: 'Percentage' | 'Fixed';
    value: number;     // The tax rate (e.g., 10 for 10%)
    taxAmount: number; // The calculated tax currency value
}
```

### Calculated Order Item
The `adjustedOrderItems` array in `usePOSCartCore` contains these computed fields for every item:
- `discountAmount`: Total discount (Product + Distributed Coupon)
- `taxAmount`: Total tax (Inclusive + Exclusive)
- `taxBreakdown`: Array of `TaxBreakdownItem`
- `total`: Final payable amount for this line item (Includes Exclusive tax, but subtracts Loyalty/Gift card allocated if applicable logic existed, currently purely strictly item total).

## 4. UI Display Logic

While the core logic handles the math, the UI (`OrderPanelUI.tsx`) is responsible for presenting it clearly:

- **Taxable Value Display**:
    - For **Inclusive Taxes**, the UI calculates the "Taxable Value" as:
      `Item Subtotal (after discount) - Tax Amount`
    - This shows the user the "real" price of the product before the included tax was applied.

- **Tax Grouping**:
    - The UI groups taxes into "Inclusive Tax" (included in price) and "Tax" (exclusive, added to price) lists for clarity in the summary section.

## 5. Payment Methods

Payment methods like Loyalty Points and Gift Cards are treated as **Payment Tenders**, not discounts, in the final calculation stage.

```typescript
Final Payment Due = Grand Total - (Loyalty Amount + Gift Card Amount)
```

- **Loyalty/Gift Card**: These reduce the *cash* amount the customer needs to pay but do not change the `Grand Total` of the invoice itself, nor do they affect tax calculations.

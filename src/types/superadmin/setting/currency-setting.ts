export interface CurrencySetting {
  _id: string;
  isPrimary: boolean;
  currencyName: string;
  currencySymbol: string;
  currencyCode: string;
  currencyPosition: "Left" | "Right";
  thousandSeparator: string;
  decimalSeparator: string;
  numberOfDecimals: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CurrencyData {
  code: string;
  position: string;
  symbol: string;
}

export interface CurrencyFormData {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: "Left" | "Right";
  thousandSeparator: string;
  decimalSeparator: string;
  numberOfDecimals: number;
  isPrimary?: boolean;
}

import SwalHelper from "@/components/ui/swal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormInput } from "@/components/ui/FormInput";
import { Textarea } from "@/components/ui/textarea";
import FilterDropdown from "@/components/ui/FilterDropdown";
import SearchBar from "@/components/ui/SearchBar";
import StatusDropdown from "@/components/ui/StatusDropdown";
import { FormDropdown, FormOption } from "@/components/ui/FormDropdown";
import DataTable from "@/components/common/DataTable";
import * as adminStrings from "@/constant/admin";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Image from "next/image";
import { FileText, Plus, Calendar, DollarSign, X } from "lucide-react";
import SingleDatePicker from '@/components/ui/SingleDatePicker';
import { convertToYMD } from "@/constant/dateUtils";
import TimePicker from "@/components/ui/TimePicker";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { Card } from "@/components/ui/card";

import { FinanceAdminWebComponents } from "./finance";
import { AdminHRMWebComponents } from "./hrm";

import { AdminPromoWebComponents } from "./promo";
import { AdminPurchaseWebComponents } from "./purchase";
import { AdminCustomerWebComponents } from "./people";
import { InventoryWebComponents } from "./inventory";
import { AdminSalesWebComponents } from "./sales";
import { AdminStockWebComponents } from "./stock";
import { AdminTaxWebComponents } from "./tax";
import { AdminUserManagementWebComponents } from "./user-management";
import { SystemSettingsWebComponents } from "./system-settings";
import { AdminNotificationWebComponents } from "./notifications";
import ShiftCalendar from "./shift-calendar";
import { StoreManagement } from "./store";
import Barcode from "../Barcode";
import DashBoard from "./dashboard";
import Forms from "./forms"
export { Forms };
import Models from "./models"
import Reports from "./reports";
import EnhancedBarcodeGenerator from "./EnhancedBarcodeGenerator";
import { DialogHeader } from "../ui/dialog";

export const AdminWebComponents = {
  SwalHelper,
  Button,
  Badge,
  Switch,
  FormLabel,
  FormInput,
  Textarea,
  FilterDropdown,
  SearchBar,
  StatusDropdown,
  FormDropdown,
  FormOption,
  DataTable,
  DialogHeader,
  adminStrings,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Image,
  Plus,
  SingleDatePicker,
  convertToYMD,
  TimePicker,
  DateRangePicker,
  Card,
  FileText,
  Calendar,
  DollarSign,
  X,
  ShiftCalendar,
  StoreManagement,
  DashBoard,
  Barcode,
  FinanceAdminWebComponents,
  AdminHRMWebComponents,

  AdminPromoWebComponents,
  AdminPurchaseWebComponents,
  AdminSalesWebComponents,
  AdminStockWebComponents,
  AdminTaxWebComponents,
  AdminUserManagementWebComponents,
  AdminCustomerWebComponents,
  AdminNotificationWebComponents,
  InventoryWebComponents,
  SystemSettingsWebComponents,
  EnhancedBarcodeGenerator,
  Forms,
  Models,
  Reports,
};




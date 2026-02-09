import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingDown,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Receipt,
} from "lucide-react";
import type {
  SalesData,
  CategoryData,
  OrderData,
  SummaryCard,
  TopSellingProduct,
  LowStockProduct,
  RecentSale,
  TopCustomer,
  RecentlyAddedProduct,
  ExpiredProduct,
  RecentTransaction,
  PurchaseTransaction,
  CardStat,
} from "@/types/Dashboard";

export const salesData: SalesData[] = [
  { name: "Jan", sales: 4000, purchase: 2400 },
  { name: "Feb", sales: 3000, purchase: 1398 },
  { name: "Mar", sales: 2000, purchase: 9800 },
  { name: "Apr", sales: 2780, purchase: 3908 },
  { name: "May", sales: 1890, purchase: 4800 },
  { name: "Jun", sales: 2390, purchase: 3800 },
];

export const categoryData: CategoryData[] = [
  { name: "Electronics", value: 400, color: "#0088FE" },
  { name: "Clothing", value: 300, color: "#00C49F" },
  { name: "Books", value: 300, color: "#FFBB28" },
  { name: "Home", value: 200, color: "#FF8042" },
];

export const orderData: OrderData[] = [
  { name: "Mon", orders: 20 },
  { name: "Tue", orders: 35 },
  { name: "Wed", orders: 25 },
  { name: "Thu", orders: 40 },
  { name: "Fri", orders: 30 },
  { name: "Sat", orders: 45 },
  { name: "Sun", orders: 50 },
];

export const summaryCards: SummaryCard[] = [
  {
    title: "Total Sales",
    value: "$45,231.89",
    icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-primary",
  },
  {
    title: "Total Purchase",
    value: "$23,456.78",
    icon: <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-green-500",
  },
  {
    title: "Orders",
    value: "1,234",
    icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-purple-500",
  },
  {
    title: "Customers",
    value: "2,345",
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-emerald-500",
  },
  {
    title: "Sales Return",
    value: "$1,234.56",
    icon: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-red-500",
  },
  {
    title: "Purchase Return",
    value: "$567.89",
    icon: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-orange-500",
  },
  {
    title: "Expense",
    value: "$8,901.23",
    icon: <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-blue-500",
  },
  {
    title: "Profit",
    value: "$12,873.90",
    icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "bg-teal-500",
  },
];

export const topSellingProducts: TopSellingProduct[] = [
  {
    name: "Charger Cable - Lighting",
    price: "$187",
    sales: "247+ Sales",
    trend: "+25%",
    image:
      "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=100&h=100&fit=crop&crop=center",
    trendIcon: <ArrowUp className="w-3 h-3" />,
  },
  {
    name: "Yves Saint Eau De Parfum",
    price: "$145",
    sales: "289+ Sales",
    trend: "+25%",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop&crop=center",
    trendIcon: <ArrowUp className="w-3 h-3" />,
  },
  {
    name: "Apple Airpods 2",
    price: "$458",
    sales: "300+ Sales",
    trend: "+25%",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100&h=100&fit=crop&crop=center",
    trendIcon: <ArrowUp className="w-3 h-3" />,
  },
  {
    name: "Vacuum Cleaner",
    price: "$139",
    sales: "225+ Sales",
    trend: "-21%",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
    trendIcon: <ArrowDown className="w-3 h-3" />,
  },
  {
    name: "Samsung Galaxy S21 Fe 5g",
    price: "$898",
    sales: "365+ Sales",
    trend: "+25%",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop&crop=center",
    trendIcon: <ArrowUp className="w-3 h-3" />,
  },
];

export const lowStockProducts: LowStockProduct[] = [
  {
    name: "Dell XPS 13",
    id: "#665814",
    stock: "08",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Vacuum Cleaner Robot",
    id: "#940004",
    stock: "14",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "KitchenAid Stand Mixer",
    id: "#325569",
    stock: "21",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Levi's Trucker Jacket",
    id: "#124588",
    stock: "12",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Lay's Classic",
    id: "#365586",
    stock: "10",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop&crop=center",
  },
];

export const recentSales: RecentSale[] = [
  {
    name: "Apple Watch Series 9",
    category: "Electronics",
    price: "$640",
    date: "Today",
    status: "Processing",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "YETI Rambler Tumbler",
    category: "Kitchen",
    price: "$45",
    date: "15 Jan 2025",
    status: "Processing",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Gold Bracelet",
    category: "Jewelry",
    price: "$299",
    date: "12 Jan 2025",
    status: "Cancelled",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Parachute Down Duvet",
    category: "Home",
    price: "$89",
    date: "11 Jan 2025",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Osmo Genius Starter Kit",
    category: "Toys",
    price: "$129",
    date: "10 Jan 2025",
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center",
  },
];

export const topCustomers: TopCustomer[] = [
  {
    name: "John Doe",
    totalSpent: "$12,345",
    orders: 15,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Jane Smith",
    totalSpent: "$10,234",
    orders: 12,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Bob Johnson",
    totalSpent: "$9,876",
    orders: 10,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Alice Brown",
    totalSpent: "$8,765",
    orders: 8,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Charlie Wilson",
    totalSpent: "$7,654",
    orders: 7,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center",
  },
];

export const recentlyAddedProducts: RecentlyAddedProduct[] = [
  {
    name: "iPhone 15 Pro Max",
    category: "Electronics",
    price: "$1,199",
    date: "2024-01-15",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "MacBook Pro 16",
    category: "Electronics",
    price: "$2,499",
    date: "2024-01-14",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "AirPods Max",
    category: "Electronics",
    price: "$549",
    date: "2024-01-13",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "iPad Pro 12.9",
    category: "Electronics",
    price: "$1,099",
    date: "2024-01-12",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Apple TV 4K",
    category: "Electronics",
    price: "$179",
    date: "2024-01-11",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&h=100&fit=crop&crop=center",
  },
];

export const expiredProducts: ExpiredProduct[] = [
  {
    name: "Milk",
    expiryDate: "2024-01-10",
    quantity: 50,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Bread",
    expiryDate: "2024-01-12",
    quantity: 30,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Yogurt",
    expiryDate: "2024-01-15",
    quantity: 25,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Cheese",
    expiryDate: "2024-01-18",
    quantity: 15,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center",
  },
  {
    name: "Butter",
    expiryDate: "2024-01-20",
    quantity: 20,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center",
  },
];

export const recentTransactions: RecentTransaction[] = [
  {
    id: "#114589",
    customer: "Andrea Willer",
    amount: "$4,560",
    status: "completed",
    date: "24 May 2025",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "#114589",
    customer: "Timothy Sandsr",
    amount: "$3,569",
    status: "completed",
    date: "23 May 2025",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "#114589",
    customer: "Bonnie Rodrigues",
    amount: "$4,560",
    status: "pending",
    date: "22 May 2025",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "#114589",
    customer: "Randy McCree",
    amount: "$2,155",
    status: "completed",
    date: "21 May 2025",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center",
  },
  {
    id: "#114589",
    customer: "Dennis Anderson",
    amount: "$5,123",
    status: "completed",
    date: "21 May 2025",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=center",
  },
];

export const purchaseTransactions: PurchaseTransaction[] = [
  {
    id: "#114589",
    supplier: "Electro Mart",
    amount: "$1,000",
    status: "completed",
    date: "24 May 2025",
  },
  {
    id: "#114589",
    supplier: "Quantum Gadgets",
    amount: "$1,500",
    status: "completed",
    date: "23 May 2025",
  },
  {
    id: "#114589",
    supplier: "Prime Bazaar",
    amount: "$2,000",
    status: "pending",
    date: "22 May 2025",
  },
  {
    id: "#114589",
    supplier: "Alpha Mobiles",
    amount: "$1,200",
    status: "completed",
    date: "21 May 2025",
  },
  {
    id: "#114589",
    supplier: "Aesthetic Bags",
    amount: "$1,300",
    status: "completed",
    date: "21 May 2025",
  },
  {
    id: "#114589",
    supplier: "Sigma Chairs",
    amount: "$1,600",
    status: "completed",
    date: "28 May 2025",
  },
  {
    id: "#114589",
    supplier: "A-Z Store s",
    amount: "$1,100",
    status: "completed",
    date: "26 May 2025",
  },
];

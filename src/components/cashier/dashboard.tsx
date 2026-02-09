"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import {
    ShoppingCart,
    Package,
    Wallet,
    CreditCard,
    Clock,
    PlusCircle,
    Pause,
    Play,
    RotateCcw,
    DollarSign,
    Eye,
    Printer,
    LogOut,
    ChevronDown,
    Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Types
type BillStatus = 'Paid' | 'Held' | 'Refunded' | 'Processing';

interface Bill {
    id: string;
    customerName: string;
    paymentMode: string;
    amount: number;
    status: BillStatus;
    time: string;
}

// Mock Data
const mockShiftInfo = {
    isActive: true,
    startTime: '09:00 AM',
    endTime: '05:00 PM'
};

const mockCashierStats = {
    totalBills: 42,
    itemsSold: 128,
    cashCollected: 15450,
    digitalPayments: 8200,
    pendingBills: 3
};

const mockPaymentSummary = {
    cashInHand: 15450,
    cardTotal: 5200,
    upiTotal: 3000,
    expectedBalance: 23650
};

const mockSalesData = [
    { name: '08:00', sales: 400 },
    { name: '10:00', sales: 1200 },
    { name: '12:00', sales: 1800 },
    { name: '14:00', sales: 1100 },
    { name: '16:00', sales: 1500 },
    { name: '18:00', sales: 2200 },
];

const mockRecentBills: Bill[] = [
    { id: '#BILL-1204', customerName: 'Rohan Sharma', paymentMode: 'Cash', amount: 450, status: 'Paid', time: '10:24 AM' },
    { id: '#BILL-1205', customerName: 'Priya Mehra', paymentMode: 'UPI', amount: 1250, status: 'Paid', time: '10:45 AM' },
    { id: '#BILL-1206', customerName: 'Walking Customer', paymentMode: 'Cash', amount: 85, status: 'Held', time: '11:05 AM' },
    { id: '#BILL-1207', customerName: 'Amit Singh', paymentMode: 'Card', amount: 2100, status: 'Paid', time: '11:15 AM' },
    { id: '#BILL-1208', customerName: 'Sanjay Gupta', paymentMode: 'Cash', amount: 500, status: 'Refunded', time: '11:30 AM' },
];

// Sub-components matching Admin styling
function StatCard({ title, value, subtitle, icon, iconBgColor }: any) {
    return (
        <div className="bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444] shadow-sm">
            <div className="flex items-start justify-between p-5">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-[#6C757D] dark:text-gray-300 uppercase tracking-wider">{title}</p>
                    <p className="text-[24px] font-bold text-[#1C1F34] dark:text-white leading-tight mt-1">{value}</p>
                    {subtitle && <p className="text-[11px] text-[#828A90] dark:text-gray-400 font-medium uppercase mt-2">{subtitle}</p>}
                </div>
                <div className={cn("p-3 rounded-[6px] flex items-center justify-center", iconBgColor)}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({ icon, label, variant, onClick }: any) {
    const isPrimary = variant === 'primary';
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center py-8 rounded-[6px] transition-all gap-3 border-[0.5px] group min-h-[130px]",
                isPrimary
                    ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-sm"
                    : "bg-white dark:bg-[#333333] text-[#1C1F34] dark:text-white border-[#EBEBEB] dark:border-[#444444] hover:border-primary hover:text-primary"
            )}
        >
            <div className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                isPrimary ? "text-white" : "text-[#1C1F34] dark:text-white group-hover:text-primary"
            )}>
                {/* {React.cloneElement(icon as React.ReactElement, { size: 24 })} */}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[1.2px]">{label}</span>
        </button>
    );
}

function SectionCard({ title, children, className, action }: any) {
    return (
        <div className={cn("bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444] p-6 sm:p-8", className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-semibold text-[#1C1F34] dark:text-white font-poppins">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function SalesChart({ data, isDarkMode }: { data: any[], isDarkMode: boolean }) {
    const options: any = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter Tight, sans-serif',
            background: 'transparent'
        },
        theme: { mode: isDarkMode ? 'dark' : 'light' },
        colors: ['#007bff'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 95, 100]
            }
        },
        xaxis: {
            categories: data.map(d => d.name),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: isDarkMode ? '#9CA3AF' : '#828A90', fontSize: '11px', fontWeight: 500 }
            }
        },
        yaxis: {
            labels: {
                style: { colors: isDarkMode ? '#9CA3AF' : '#828A90', fontSize: '11px', fontWeight: 500 },
                formatter: (val: number) => `₹${val.toLocaleString()}`
            }
        },
        grid: {
            borderColor: isDarkMode ? '#444444' : '#F1F1F1',
            strokeDashArray: 4,
            padding: { left: 10, right: 10 }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            style: { fontSize: '12px' }
        }
    };

    const series = [{
        name: 'Revenue',
        data: data.map(d => d.sales)
    }];

    return (
        <SectionCard
            title="Sales Activity"
            action={
                <button className="flex items-center gap-2 text-[10px] font-bold text-[#6C757D] bg-[#F2F9FF] dark:bg-[#2A2A2A] px-4 py-1.5 rounded-full border border-transparent hover:border-primary transition-all uppercase tracking-widest">
                    Today <ChevronDown size={12} className="opacity-60" />
                </button>
            }
        >
            <div className="h-[320px] -ml-2">
                <ReactApexChart options={options} series={series} type="area" width="100%" height="100%" />
            </div>
        </SectionCard>
    );
}

export default function CashierDashboard() {
    const [shiftActive, setShiftActive] = React.useState(mockShiftInfo.isActive);
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';
    const cashierName = 'Priya Verma';

    const currentDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getBadgeVariant = (status: BillStatus): any => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Held': return 'warning';
            case 'Refunded': return 'danger';
            default: return 'info';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-[32px] font-bold text-[#1C1F34] dark:text-white font-poppins leading-tight">
                        {getGreeting()}, {cashierName}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-sm font-medium text-[#828A90] dark:text-gray-400">{currentDate}</p>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[#828A90] dark:text-gray-400 uppercase tracking-tight">
                            <Clock size={14} />
                            <span>{currentTime}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[1.5px] bg-white dark:bg-[#333333] w-fit px-4 py-2 rounded-full border border-[#EBEBEB] dark:border-[#444444] shadow-sm mt-4">
                        <span className="text-primary">Terminal: T-01</span>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-[#6C757D] dark:text-gray-400">Status: <span className="text-green-500">Online</span></span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                    <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase font-bold text-[#828A90] tracking-[1.5px] mb-1 opacity-80">Current Shift</p>
                        <p className="text-[18px] font-bold text-[#1C1F34] dark:text-white font-poppins">
                            {mockShiftInfo.startTime} - {mockShiftInfo.endTime}
                        </p>
                    </div>
                    {shiftActive ? (
                        <button
                            onClick={() => setShiftActive(false)}
                            className="bg-[#F4462C] hover:bg-[#D33D26] text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px]"
                        >
                            Clock Out
                        </button>
                    ) : (
                        <button
                            onClick={() => setShiftActive(true)}
                            className="bg-primary hover:bg-primaryHover text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px]"
                        >
                            Clock In
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Bills"
                    value={mockCashierStats.totalBills.toString()}
                    subtitle="Today's Count"
                    icon={<ShoppingCart size={20} className="text-primary" />}
                    iconBgColor="bg-[#EFF6FE] dark:bg-[#EFF6FE]/10"
                />
                <StatCard
                    title="Items Sold"
                    value={mockCashierStats.itemsSold.toString()}
                    subtitle="Cart Units"
                    icon={<Package size={20} className="text-[#22C55E]" />}
                    iconBgColor="bg-[#F0FDF4] dark:bg-[#F0FDF4]/10"
                />
                <StatCard
                    title="Cash"
                    value={`₹${mockCashierStats.cashCollected.toLocaleString()}`}
                    subtitle="Physical Cash"
                    icon={<Wallet size={20} className="text-[#9333EA]" />}
                    iconBgColor="bg-[#FAF5FF] dark:bg-[#FAF5FF]/10"
                />
                <StatCard
                    title="Digital"
                    value={`₹${mockCashierStats.digitalPayments.toLocaleString()}`}
                    subtitle="UPI + Card"
                    icon={<CreditCard size={20} className="text-[#F97316]" />}
                    iconBgColor="bg-[#FFF7ED] dark:bg-[#FFF7ED]/10"
                />
                <StatCard
                    title="On Hold"
                    value={mockCashierStats.pendingBills.toString()}
                    subtitle="Pending Checkout"
                    icon={<Clock size={20} className="text-[#EF4444]" />}
                    iconBgColor="bg-[#FEF2F2] dark:bg-[#FEF2F2]/10"
                />
            </div>

            {/* Quick Actions Card */}
            <SectionCard title="Quick Actions">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <QuickActionButton
                        icon={<PlusCircle />}
                        label="New Sale"
                        variant="primary"
                    />
                    <QuickActionButton
                        icon={<Pause />}
                        label="Hold Bill"
                    />
                    <QuickActionButton
                        icon={<Play />}
                        label="Resume Bill"
                    />
                    <QuickActionButton
                        icon={<RotateCcw />}
                        label="Refund"
                    />
                    <QuickActionButton
                        icon={<DollarSign />}
                        label="Cash Drawer"
                    />
                </div>
            </SectionCard>

            {/* Detailed Section: Chart and Payment Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SalesChart data={mockSalesData} isDarkMode={isDarkMode} />
                </div>

                <SectionCard title="Payment Summary" className="flex flex-col">
                    <div className="space-y-6 flex-1">
                        {[
                            { label: 'Cash in Hand', value: mockPaymentSummary.cashInHand, icon: <Wallet />, color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4] dark:bg-[#F0FDF4]/10' },
                            { label: 'Card Total', value: mockPaymentSummary.cardTotal, icon: <CreditCard />, color: 'text-primary', bg: 'bg-[#EFF6FE] dark:bg-[#EFF6FE]/10' },
                            { label: 'UPI Total', value: mockPaymentSummary.upiTotal, icon: <CreditCard />, color: 'text-[#9333EA]', bg: 'bg-[#FAF5FF] dark:bg-[#FAF5FF]/10' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-[#3D3D3D] p-2 rounded-[6px] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2.5 rounded-[6px] shadow-sm", item.bg, item.color)}>
                                        {/* {React.cloneElement(item.icon as React.ReactElement, { size: 18 })} */}
                                    </div>
                                    <span className="text-[14px] font-medium text-[#6C757D] dark:text-gray-300">{item.label}</span>
                                </div>
                                <span className="text-[16px] font-bold text-[#1C1F34] dark:text-white font-poppins">
                                    ₹{item.value.toLocaleString()}
                                </span>
                            </div>
                        ))}

                        <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB] dark:border-[#444444] mt-4">
                            <span className="text-[12px] font-bold text-[#828A90] uppercase tracking-wider">Expected Balance</span>
                            <span className="text-[24px] font-bold text-primary font-poppins">
                                ₹{mockPaymentSummary.expectedBalance.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <Button variant="default" className="w-full mt-8 h-12 font-bold bg-primary hover:bg-primaryHover text-white uppercase tracking-wider text-xs rounded-[6px]">
                        Settle Shift Balance
                    </Button>
                </SectionCard>
            </div>

            {/* Audit Log Table */}
            <SectionCard
                title="Recent Bills"
                action={
                    <button className="text-[10px] font-bold text-primary hover:text-white hover:bg-primary transition-all bg-[#F2F9FF] dark:bg-[#2A2A2A] px-4 py-2 rounded-full uppercase tracking-widest border border-transparent">
                        View Audit Log
                    </button>
                }
                className="p-0 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F8F9FA] dark:bg-[#2A2A2A] border-y border-[#EBEBEB] dark:border-[#444444]">
                                <th className="text-left py-4 px-8 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Bill ID</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Customer</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Payment</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Amount</th>
                                <th className="text-center py-4 px-4 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-4 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Time</th>
                                <th className="text-center py-4 px-8 text-[10px] font-bold text-[#828A90] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#444444]">
                            {mockRecentBills.map((bill) => (
                                <tr
                                    key={bill.id}
                                    className="group hover:bg-[#F2F9FF] dark:hover:bg-[#3D3D3D] transition-colors"
                                >
                                    <td className="py-4 px-8 text-[14px] font-bold text-[#1C1F34] dark:text-white">{bill.id}</td>
                                    <td className="py-4 px-4 text-[14px] text-[#6C757D] dark:text-gray-300">{bill.customerName}</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-[#F8F9FA] dark:bg-[#2A2A2A] px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase text-[#828A90] border border-[#EBEBEB] dark:border-[#444444]">
                                            {bill.paymentMode}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-[14px] font-bold text-[#1C1F34] dark:text-white">
                                        ₹{bill.amount.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <Badge variant={getBadgeVariant(bill.status) as any} className="px-3 py-1 font-bold text-[10px] uppercase rounded-full border-none">
                                            {bill.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-[12px] font-medium text-[#6C757D]">{bill.time}</td>
                                    <td className="py-4 px-8">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                className="w-9 h-9 flex items-center justify-center text-[#6C757D] hover:text-primary hover:bg-[#EFF6FE] rounded-[6px] transition-all"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="w-9 h-9 flex items-center justify-center text-[#6C757D] hover:text-primary hover:bg-[#EFF6FE] rounded-[6px] transition-all"
                                                title="Print"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Branded Footer */}
            <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between py-8 border-t border-[#EBEBEB] dark:border-[#444444]">
                <div className="flex items-center gap-6 text-[10px] font-bold text-[#828A90] uppercase tracking-widest mb-4 sm:mb-0">
                    <span className="flex items-center gap-2">
                        <Activity size={14} className="text-green-500" />
                        POS v2.4.1
                    </span>
                    <div className="h-3 w-px bg-gray-300"></div>
                    <span>T-01-MUMBAI</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-[#828A90] hover:text-primary font-bold text-xs uppercase tracking-wider">
                        Support
                    </Button>
                    <Button
                        variant="outline"
                        className="font-bold gap-2 px-6 h-11 border-[#EBEBEB] dark:border-[#444444] text-[#1C1F34] dark:text-white hover:bg-black hover:text-white transition-all rounded-[6px]"
                    >
                        <LogOut size={16} />
                        <span className="uppercase tracking-wider text-xs">Sign Out</span>
                    </Button>
                </div>
            </footer>
        </div>
    );
}
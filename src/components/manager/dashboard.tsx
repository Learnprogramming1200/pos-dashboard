"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
    LineChart,
    ShoppingBag,
    Building2,
    Ticket,
    Eye,
    Trash2,
    Calendar,
    ChevronDown,
    DollarSign,
    ShoppingCart,
    CreditCard,
    Users,
    RefreshCcw,
    History,
    ArrowUpRight
} from "lucide-react";
import { salesData, orderData } from "@/constant/dummy-data/dashboard";

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SummaryCard = ({ title, value, change, icon: Icon, iconBg, iconColor }: any) => (
    <div className="bg-white dark:bg-[#333333] rounded-[6px] border border-[#EBEBEB] dark:border-[#444444] mt-[12px]">
        <div className="flex flex-col px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-[#6C757D] dark:text-gray-300">{title}</p>
                    <p className="text-[20px] font-bold text-[#1C1F34] dark:text-white leading-9">{value}</p>
                </div>
                <div className={`${iconBg} rounded-[6px] p-3`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
            </div>
            <div className="pt-3">
                <p className="text-sm font-regular">
                    <span className="text-[#1AC769] dark:text-green-400 font-medium">{change}</span>
                    <span className="text-[#6C757D] dark:text-gray-400 ml-1">From Last Month</span>
                </p>
            </div>
        </div>
    </div>
);

export default function ManagerDashboard() {
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';

    // Area Chart Options
    const areaChartOptions: any = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter Tight, sans-serif',
            background: 'transparent'
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light'
        },
        colors: ['#007bff'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: isDarkMode ? '#9CA3AF' : '#828A90',
                    fontSize: '12px',
                    fontFamily: 'Inter Tight, sans-serif'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: isDarkMode ? '#9CA3AF' : '#828A90',
                    fontSize: '12px',
                    fontFamily: 'Inter Tight, sans-serif'
                },
                formatter: (val: number) => `$${val.toLocaleString()}`
            }
        },
        grid: {
            borderColor: isDarkMode ? '#444444' : '#EBEBEB',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            x: { show: true },
            y: {
                formatter: (val: number) => `$${val.toLocaleString()}`
            }
        }
    };

    const areaChartSeries = [{
        name: 'Revenue',
        data: [31000, 32000, 34000, 33000, 35000, 42000, 57258, 48000, 51000, 53000, 56000, 65000]
    }];

    // Donut Chart Options
    const donutChartOptions: any = {
        chart: {
            type: 'donut',
            fontFamily: 'Inter Tight, sans-serif',
            background: 'transparent'
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light'
        },
        colors: ['#007bff', '#3B82F6', '#60A5FA', '#93C5FD'],
        labels: ['Supplier', 'Landowners', 'Consultant', 'Contractors'],
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: '',
                            formatter: () => '123',
                            style: {
                                fontSize: '32px',
                                fontWeight: '700',
                                color: isDarkMode ? '#FFFFFF' : '#31394D',
                                fontFamily: 'Poppins, sans-serif'
                            }
                        }
                    }
                }
            }
        },
        stroke: { width: 0 }
    };

    const donutChartSeries = [40, 30, 20, 10];

    // Purchase & Sale Chart Options
    const purchaseSaleOptions: any = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent'
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light'
        },
        colors: ['#2F80ED', isDarkMode ? '#1f1f1f' : '#333333'],
        stroke: {
            curve: 'smooth',
            width: 3
        },
        dataLabels: { enabled: false },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            offsetY: -20,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            labels: {
                colors: isDarkMode ? '#D1D5DB' : '#6B7280',
            }
        },
        xaxis: {
            categories: salesData.map(item => item.name),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: isDarkMode ? '#9CA3AF' : '#6B7280',
                    fontSize: '12px',
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: isDarkMode ? '#9CA3AF' : '#6B7280',
                    fontSize: '12px',
                },
                formatter: (val: number) => val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toString()
            },
        },
        grid: {
            borderColor: isDarkMode ? '#374151' : '#F3F4F6',
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' }
    };

    // Order Statistics Chart Options
    const orderStatsOptions: any = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            background: 'transparent'
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light'
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 8,
                borderRadiusApplication: 'end',
                distributed: true,
            }
        },
        colors: ['#B1D9FF', '#B1D9FF', '#B1D9FF', '#B1D9FF', '#007AFF', '#B1D9FF', '#B1D9FF'],
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: {
            categories: orderData.map(item => item.name.toUpperCase()),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px' }
            }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: {
                style: { colors: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: '12px' }
            }
        },
        grid: {
            borderColor: isDarkMode ? '#374151' : '#F3F4F6',
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h4 className="text-textMain dark:text-white font-poppins font-semibold text-[28px] leading-9">Good morning, Mr. James Rodriguez</h4>
                    <p className="text-textSmall dark:text-textSmall font-interTight font-regular text-sm leading-6 pt-1">Have a nice day at work, Progress is excellent!</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                    <button className="bg-primary hover:bg-primaryHover text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px] transition-all shadow-sm order-2 sm:order-1">
                        Clock In
                    </button>
                    <button className="bg-dark hover:bg-gray-700 dark:bg-[#333333] dark:hover:bg-[#444444] text-white font-poppins font-semibold text-base leading-5 rounded-[4px] px-6 py-[14px] transition-all shadow-sm order-1 sm:order-2">
                        Clock Out
                    </button>
                </div>
            </div>

            {/* Insights Section */}
            <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-[30px]">
                    <div>
                        <h6 className="text-[#1C1F34] dark:text-white font-poppins font-semibold text-[20px] leading-[30px] tracking-[1%]">Insights</h6>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                className="bg-[#F2F2F2] text-textSmall font-interTight font-regular text-[12px] leading-[22px] rounded-[6px] px-6 py-2 text-left"
                            >
                                2024-03-23 to 2024-04-02
                            </button>
                        </div>
                        <button className="bg-primary hover:bg-primaryHover text-white font-poppins font-semibold text-[14px] leading-[18px] capitalize rounded-[6px] px-6 py-[10px] shadow-sm">
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <SummaryCard
                        title="Sales Amount"
                        value="$2,847.00"
                        change="+28%"
                        icon={DollarSign}
                        iconBg="bg-[#E6F9F0]"
                        iconColor="text-[#1AC769]"
                    />
                    <SummaryCard
                        title="Purchase Amount"
                        value="$1,250.00"
                        change="+12%"
                        icon={ShoppingCart}
                        iconBg="bg-[#FFF4ED]"
                        iconColor="text-[#FF8A48]"
                    />
                    <SummaryCard
                        title="Expenses"
                        value="$450.00"
                        change="+5.3%"
                        icon={CreditCard}
                        iconBg="bg-[#FFF5F5]"
                        iconColor="text-[#FF4D4F]"
                    />
                    <SummaryCard
                        title="Orders"
                        value="589"
                        change="+15.3%"
                        icon={ShoppingBag}
                        iconBg="bg-[#F5F1FF]"
                        iconColor="text-[#9B51E0]"
                    />
                    <SummaryCard
                        title="Total Staffs"
                        value="12"
                        change="+2"
                        icon={Users}
                        iconBg="bg-[#EAF5FF]"
                        iconColor="text-[#007BFF]"
                    />
                    <SummaryCard
                        title="Sales Return"
                        value="$120.00"
                        change="-2.1%"
                        icon={RefreshCcw}
                        iconBg="bg-[#FEF3F2]"
                        iconColor="text-[#F04438]"
                    />
                    <SummaryCard
                        title="Purchase Return"
                        value="$85.00"
                        change="-1.5%"
                        icon={History}
                        iconBg="bg-[#FDF4FF]"
                        iconColor="text-[#D444F1]"
                    />
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
                {/* Purchase & Sale Statistics Graph */}
                <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <p className="text-textSmall dark:text-white font-interTight font-medium text-lg leading-6">Statistics</p>
                            <h2 className="text-textMain dark:text-textSmall font-poppins font-semibold text-[28px] leading-10 mt-1">Purchase & sale</h2>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                                <Calendar size={16} />
                                <span>2025</span>
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ReactApexChart
                            options={purchaseSaleOptions}
                            series={[
                                { name: 'Sale', data: salesData.map(item => item.sales) },
                                { name: 'Purchase', data: salesData.map(item => item.purchase) }
                            ]}
                            type="line"
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Order Statistics Graph */}
                <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-lg border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <p className="text-textSmall dark:text-white font-interTight font-medium text-lg leading-6">Statistics</p>
                            <h2 className="text-textMain dark:text-textSmall font-poppins font-semibold text-[28px] leading-10 mt-1">Order Statistics</h2>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50 transition-colors">
                                <span>Weekly</span>
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ReactApexChart
                            options={orderStatsOptions}
                            series={[{
                                name: 'Orders',
                                data: orderData.map(item => item.orders)
                            }]}
                            type="bar"
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>
            </div>

            {/* Existing Charts Row (Optional - keeping for now or replacing if redundant) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Top Category Card */}
                <div className="h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
                    <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[20px] leading-8 mb-6">Top Category</h3>
                    <div className="relative h-[250px] flex items-center justify-center">
                        <ReactApexChart
                            options={donutChartOptions}
                            series={donutChartSeries}
                            type="donut"
                            width="100%"
                            height="100%"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {[
                            { name: 'Supplier', color: 'bg-[#007bff]' },
                            { name: 'Landowners', color: 'bg-[#3B82F6]' },
                            { name: 'Consultant', color: 'bg-[#60A5FA]' },
                            { name: 'Contractors', color: 'bg-[#93C5FD]' }
                        ].map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-sm ${item.color}`}></span>
                                <span className="text-sm text-[#6C757D] dark:text-gray-400 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Revenue Card */}
                <div className="lg:col-span-2 h-full px-10 py-10 bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-textMain dark:text-white font-poppins font-semibold text-[20px] leading-8">Sales Revenue</h3>
                        <div className="flex bg-[#F2F4F7] dark:bg-[#2A2A2A] rounded-lg p-1">
                            <button className="px-4 py-1.5 rounded-md text-sm font-semibold bg-primary text-white">Monthly</button>
                            <button className="px-4 py-1.5 rounded-md text-sm font-semibold text-[#6C757D] dark:text-gray-400">Yearly</button>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ReactApexChart
                            options={areaChartOptions}
                            series={areaChartSeries}
                            type="area"
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>
            </div>

            {/* Latest Transaction Section */}
            <div className="space-y-6 mt-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-textMain dark:text-white font-poppins font-semibold text-[22px] leading-8">Latest Transaction</h2>
                    <Link href="#" className="flex items-center gap-2 px-3 py-1.5 bg-[#F2F9FF] text-base text-textSmall font-interTight font-regular rounded-[25px] hover:bg-gray-50">
                        View All
                    </Link>
                </div>

                {/* First Table: Subscriptions/Plans */}
                <div className="bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#EBEBEB] dark:border-[#444444]">
                                    <th className="p-4 px-6 text-textSmall dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                                        <input type="checkbox" className="rounded border-gray-300 pointer-events-none" />
                                    </th>
                                    {['ID', 'Plan Name', 'Plan Type', 'Duration', 'Price', 'Store Limit', 'Staff Limit', 'Tax', 'Modules', 'Themes', 'Description', 'Created Date', 'Status'].map(header => (
                                        <th key={header} className="p-4 px-3 text-textMain dark:text-white font-semibold text-[13px] whitespace-nowrap">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                                                {header}
                                                <ChevronDown className="w-3 h-3 text-textSmall" />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#444444]">
                                {[1, 2, 3, 4].map((i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#3a3a3a] transition-colors group">
                                        <td className="p-4 px-6"><input type="checkbox" className="rounded border-gray-300 pointer-events-none" /></td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 font-medium whitespace-nowrap">#12</td>
                                        <td className="p-4 px-3 text-sm text-textMain dark:text-white font-semibold whitespace-nowrap">Tara Dyer</td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 font-medium whitespace-nowrap">Monthly</td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 font-medium whitespace-nowrap">6 month</td>
                                        <td className="p-4 px-3 text-sm text-textMain dark:text-white font-semibold whitespace-nowrap">$87</td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 text-center font-bold">3</td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 text-center font-bold">120</td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 text-center font-bold">GST</td>
                                        <td className="p-4 px-3 text-sm whitespace-nowrap">
                                            <div className="flex gap-1.5 flex-wrap max-w-[150px]">
                                                {['sales', 'inventory', 'sales'].map((tag, idx) => (
                                                    <span key={idx} className="bg-[#F0F7FF] text-primary text-[10px] px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-tight">{tag}</span>
                                                ))}
                                                <span className="text-primary text-[10px] font-bold mt-0.5">+5 more</span>
                                            </div>
                                        </td>
                                        <td className="p-4 px-3 text-sm whitespace-nowrap">
                                            <div className="flex gap-1.5 flex-wrap max-w-[150px]">
                                                {['light', 'dark', 'modern'].map((theme, idx) => (
                                                    <span key={idx} className="bg-[#F0F7FF] text-primary text-[10px] px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-tight">{theme}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 font-medium min-w-[150px]">Dolorum eligendi sim</td>
                                        <td className="p-4 px-3 text-sm text-textSmall dark:text-gray-400 font-medium whitespace-nowrap">8/25/2025</td>
                                        <td className="p-4 px-3 whitespace-nowrap text-center">
                                            <span className="bg-[#E6F9F0] text-[#1AC769] text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Second Table: Customer Transactions */}
                <div className="bg-white dark:bg-[#333333] rounded-[6px] border-[0.5px] border-[#EBEBEB] dark:border-[#444444] overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#EBEBEB] dark:border-[#444444] bg-[#F8F9FA] dark:bg-[#2A2A2A]">
                                    {['Name', 'Price', 'Date And Time', 'Payment Mode', 'Action'].map(header => (
                                        <th key={header} className="p-4 px-6 text-textMain dark:text-white font-semibold text-sm tracking-wider whitespace-nowrap">
                                            <div className="flex items-center justify-between group">
                                                {header}
                                                {header !== 'Action' && (
                                                    <div className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity translate-x-2">
                                                        <ChevronDown className="w-3 h-3 rotate-180" />
                                                        <ChevronDown className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#444444]">
                                {[
                                    { name: 'Courtney Henry', email: 'courtney@gmail.com', price: 'Contractor', date: 'Feb 3, 2025, 5:00 - 5:30 pm', mode: 'Feb 3, 2025, 5:00 - 5:30 pm', img: 'https://i.pravatar.cc/150?u=courtney' },
                                    { name: 'Emily Johnson', email: 'emily@gmail.com', price: 'Supplier', date: 'Mar 15, 2025, 3:00 - 3:30 pm', mode: 'Mar 15, 2025, 3:00 - 3:30 pm', img: 'https://i.pravatar.cc/150?u=emily' },
                                    { name: 'Alex Johnson', email: 'alex.john@gmail.com', price: 'Consultant', date: 'Mar 15, 2025, 3:00 - 3:30 pm', mode: 'Mar 15, 2025, 3:00 - 3:30 pm', img: 'https://i.pravatar.cc/150?u=alex1' },
                                    { name: 'Alex Johnson', email: 'alex.john@gmail.com', price: 'Contractor', date: 'Mar 15, 2025, 3:00 - 3:30 pm', mode: 'Mar 15, 2025, 3:00 - 3:30 pm', img: 'https://i.pravatar.cc/150?u=alex2' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#3a3a3a] transition-colors group">
                                        <td className="p-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EBEBEB] dark:border-[#444444] shadow-sm">
                                                    <Image src={row.img} alt={row.name} width={40} height={40} className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-textMain dark:text-white group-hover:text-primary transition-colors">{row.name}</p>
                                                    <p className="text-xs text-textSmall dark:text-gray-400">{row.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 px-6 text-sm text-textSmall dark:text-gray-300 font-bold whitespace-nowrap">{row.price}</td>
                                        <td className="p-4 px-6 text-sm text-textSmall dark:text-gray-400 font-medium whitespace-nowrap">{row.date}</td>
                                        <td className="p-4 px-6 text-sm text-textSmall dark:text-gray-400 font-medium whitespace-nowrap">{row.mode}</td>
                                        <td className="p-4 px-6 whitespace-nowrap">
                                            <div className="flex gap-4 items-center">
                                                <button title="View" className="bg-[#F0F7FF] p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button title="Delete" className="bg-[#FFF5F5] p-2 rounded-full text-danger hover:bg-danger hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}
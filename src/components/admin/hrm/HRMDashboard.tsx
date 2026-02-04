// "use client";
// import React from "react";
// import Link from "next/link";
// import { AdminWebComponents } from "..";
// import { 
//   FaUserTie, 
//   FaUsers, 
//   FaClock, 
//   FaCalendarCheck, 
//   FaCalendarPlus, 
//   FaCalendarMinus, 
//   FaDollarSign,
// } from "react-icons/fa";
// import {Constants} from "@/constant";

// export default function HRMDashboard() {
//   const [stats, setStats] = React.useState({
//     totalStaff: 0,
//     totalManagers: 0,
//     activeShifts: 0,
//     pendingLeaves: 0,
//   });

//   // Calculate stats
//   React.useEffect(() => {
//     setStats({
//       totalStaff: Constants.adminConstants.mockStaff.length,
//       totalManagers: Constants.adminConstants.mockManagers.length,
//       activeShifts: Constants.adminConstants.mockShifts.filter(s => s.status === "Active").length,
//       pendingLeaves: Constants.adminConstants.mockLeaveRequests.filter(l => l.status === "Pending").length,
//     });
//   }, []);

//   const quickActions = [
//     {
//       title: "Staff Management",
//       description: "Add, edit, and manage staff members",
//       icon: FaUsers,
//       href: "/admin/hrm/staff-manager/staff-management",
//       color: "bg-blue-500",
//     },
//     {
//       title: "Manager Management",
//       description: "Manage store managers and their permissions",
//       icon: FaUserTie,
//       href: "/admin/hrm/staff-manager/manager-management",
//       color: "bg-green-500",
//     },
//     {
//       title: "Shift Management",
//       description: "Create and manage work shifts",
//       icon: FaClock,
//       href: "/admin/hrm/shifts/management",
//       color: "bg-purple-500",
//     },
//     {
//       title: "Shift Assignment",
//       description: "Assign staff to shifts",
//       icon: FaCalendarCheck,
//       href: "/admin/hrm/shifts/assignment",
//       color: "bg-indigo-500",
//     },
//     {
//       title: "Attendance",
//       description: "Track staff attendance and time",
//       icon: FaCalendarPlus,
//       href: "/admin/hrm/attendance",
//       color: "bg-orange-500",
//     },
//     {
//       title: "Leave Management",
//       description: "Manage leave requests and types",
//       icon: FaCalendarMinus,
//       href: "/admin/hrm/leaves",
//       color: "bg-red-500",
//     },
//     {
//       title: "Holidays",
//       description: "Set and manage holidays",
//       icon: FaCalendarMinus,
//       href: "/admin/hrm/holidays",
//       color: "bg-yellow-500",
//     },
//     {
//       title: "Payroll",
//       description: "Generate and manage payroll",
//       icon: FaDollarSign,
//       href: "/admin/hrm/payroll",
//       color: "bg-emerald-500",
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{Constants.adminConstants.hrmDashboardStrings.title}</h1>
//           <p className="text-gray-600 dark:text-gray-300">{Constants.adminConstants.hrmDashboardStrings.description}</p>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <AdminWebComponents.Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{Constants.adminConstants.hrmDashboardStrings.totalStaffLabel}</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStaff}</p>
//             </div>
//             <div className="p-3 bg-blue-500 rounded-lg">
//               <FaUsers className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </AdminWebComponents.Card>

//         <AdminWebComponents.Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{Constants.adminConstants.hrmDashboardStrings.totalManagersLabel}</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalManagers}</p>
//             </div>
//             <div className="p-3 bg-green-500 rounded-lg">
//               <FaUserTie className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </AdminWebComponents.Card>

//         <AdminWebComponents.Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{Constants.adminConstants.hrmDashboardStrings.activeShiftsLabel}</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeShifts}</p>
//             </div>
//             <div className="p-3 bg-purple-500 rounded-lg">
//               <FaClock className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </AdminWebComponents.Card>

//         <AdminWebComponents.Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{Constants.adminConstants.hrmDashboardStrings.pendingLeavesLabel}</p>
//               <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingLeaves}</p>
//             </div>
//             <div className="p-3 bg-orange-500 rounded-lg">
//               <FaCalendarMinus className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </AdminWebComponents.Card>
//       </div>

//       {/* Quick Actions */}
//       <div>
//         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{Constants.adminConstants.hrmDashboardStrings.quickActionsLabel}</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {quickActions.map((action, index) => (
//             <Link key={index} href={action.href}>
//               <AdminWebComponents.Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
//                 <div className="flex items-center space-x-4">
//                   <div className={`p-3 ${action.color} rounded-lg`}>
//                     <action.icon className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
//                   </div>
//                 </div>
//               </AdminWebComponents.Card>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Staff */}
//         <AdminWebComponents.Card className="p-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{Constants.adminConstants.hrmDashboardStrings.recentStaffLabel}</h3>
//           <div className="space-y-3">
//             {Constants.adminConstants.mockStaff.slice(0, 3).map((staff) => (
//               <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                 <div>
//                   <p className="font-medium text-gray-900 dark:text-white">{staff.name}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-300">{staff.designation}</p>
//                 </div>
//                 <span className={`px-2 py-1 text-xs rounded-full ${
//                   staff.status === "Active" 
//                     ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//                     : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
//                 }`}>
//                   {staff.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="mt-4">
//             <Link href="/admin/hrm/staff-manager/staff-management">
//               <AdminWebComponents.Button variant="outline" className="w-full">{Constants.adminConstants.hrmDashboardStrings.viewAllStaffLabel}</AdminWebComponents.Button>
//             </Link>
//           </div>
//         </AdminWebComponents.Card>

//         {/* Recent Leave Requests */}
//         <AdminWebComponents.Card className="p-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{Constants.adminConstants.hrmDashboardStrings.recentLeaveRequestsLabel}</h3>
//           <div className="space-y-3">
//             {Constants.adminConstants.mockLeaveRequests.slice(0, 3).map((leave) => (
//               <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                 <div>
//                   <p className="font-medium text-gray-900 dark:text-white">{leave.staffName}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-300">{leave.leaveTypeName}</p>
//                 </div>
//                 <span className={`px-2 py-1 text-xs rounded-full ${
//                   leave.status === "Approved" 
//                     ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//                     : leave.status === "Pending"
//                     ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
//                     : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
//                 }`}>
//                   {leave.status}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="mt-4">
//             <Link href="/admin/hrm/leaves">
//               <AdminWebComponents.Button variant="outline" className="w-full">{Constants.adminConstants.hrmDashboardStrings.viewAllLeavesLabel}</AdminWebComponents.Button>
//             </Link>
//           </div>
//         </AdminWebComponents.Card>
//       </div>
//     </div>
//   );
// }

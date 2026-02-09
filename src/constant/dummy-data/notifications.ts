import { NotificationTypes } from "@/types/superadmin";

export const notificationData: NotificationTypes.ListNotification[] = [
    {
        id: '1',
        sender: 'Ant at Supabase',
        notification: 'Supa Update December 2025',
        message: 'Lots of releases this month. Plus a special gift for you!',
        type: 'System',
        isRead: false,
        isStarred: true,
        timestamp: 'Dec 16',
        date: new Date('2025-12-16')
    },
    {
        id: '2',
        sender: 'Google Analytics',
        notification: 'Attract local customers with your free Business Profile',
        message: 'Make your unique business stand out and attract more customers on Search and Maps.',
        type: 'Alert',
        isRead: false,
        isStarred: true,
        timestamp: 'Dec 16',
        date: new Date('2025-12-16')
    },
    {
        id: '3',
        sender: 'YES BANK',
        notification: 'YES Rewardz - Smart Statement for December 2025',
        message: 'Your YES Rewardz Smart Statement for December 2025 Dear Customer, You have earned...',
        type: 'Payment',
        isRead: false,
        isStarred: false,
        timestamp: 'Dec 15',
        date: new Date('2025-12-15')
    },
    {
        id: '4',
        sender: 'Tech Solutions Inc.',
        notification: 'New User Registration',
        message: 'New business owner registered: John Doe from Tech Solutions Inc.',
        type: 'User',
        isRead: true,
        isStarred: false,
        timestamp: 'Dec 14',
        date: new Date('2025-12-14')
    },
    {
        id: '5',
        sender: 'Payment System',
        notification: 'Payment Reminder',
        message: 'Subscription payment due for Premium Plan - Action required.',
        type: 'Payment',
        isRead: true,
        isStarred: false,
        timestamp: 'Dec 13',
        date: new Date('2025-12-13')
    },
    {
        id: '6',
        sender: 'Order Management',
        notification: 'New Order Received',
        message: 'Order #12345 has been placed by Customer XYZ - Total: $299.99',
        type: 'Order',
        isRead: true,
        isStarred: false,
        timestamp: 'Dec 12',
        date: new Date('2025-12-12')
    },
];


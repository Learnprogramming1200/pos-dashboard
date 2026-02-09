
import { BlogRow } from "@/types/superadmin/landingpage-setting";
import { assets as assetsIcon } from "./assets";

// Common strings used across multiple components
export const commonStrings = {
  // Action buttons
  startFreeTrial: "Start Free Trial",
  readMore: "Read More",
  watchDemo: "Watch Demo",
  requestDemo: "Request Demo",
  choosePlan: "Choose Plan",
  login: "Login",
  signOut: "Sign Out",
  profileSettings: "Profile Settings",
  contactSupport: "Contact Support",
  viewAllPosts: "View All Posts",

  // Navigation
  home: "Home",
  features: "Features",
  pricing: "Pricing",
  about: "About",
  blog: "Blog",
  faq: "FAQ",
  more: "More",
  aboutUs: "About Us",
  faqs: "FAQs",

  // Trust indicators
  trustedBy: "Trusted by",
  businesses: "businesses",
  leadingCompanies: "Trusted by leading companies",
  activeBusinesses: "Active Businesses",
  uptime: "Uptime",
  customerRating: "Customer Rating",
  support: "Support",

  // Trial and pricing
  dayFreeTrial: "14-day free trial",
  noSetupFees: "No setup fees",
  cancelAnytime: "Cancel anytime",
  saveUpTo: "Save up to 20%",
  monthly: "Monthly",
  annual: "Annual",
  perMonth: "/month",
  billedAnnually: "/month billed annually",

  // Status and badges
  mostPopular: "Most Popular",
  flexiblePricing: "Flexible Pricing",
  chooseYourPerfectPlan: "Choose Your Perfect Plan",
  flexiblePricingDescription: "Flexible pricing options designed to grow with your business. Start free and upgrade anytime.",

  // Contact and support
  needCustomSolution: "Need a custom solution?",
  contactSalesTeam: "Contact our sales team",

  // Loading states
  dateUnavailable: "Date unavailable",
  unknown: "Unknown",

  // Footer
  allRightsReserved: "All rights reserved.",
  copyright: "© 2024 POSPro. All rights reserved.",

  // Company info
  companyDescription: "The most advanced POS system for modern businesses. Streamline your operations, boost efficiency, and grow your revenue with our comprehensive solution.",
  product: "Product",
  company: "Company",
  contact: "Contact"
};

// Hero Section strings
export const heroStrings = {
  trustedByBusinesses: "The smarter POS for modern retail",
  mainTitle: "The Future of",
  pointOfSale: "Point of Sale",
  subtitle: "Transform your business with our intelligent POS system. Streamline operations, boost sales, and deliver exceptional customer experiences with cutting-edge technology.",
  keyFeatures: [
    "Real-time Analytics",
    "Multi-location Support",
    "Inventory Management",
    "24/7 Customer Support"
  ],
  trustIndicators: {
    title: "Trusted by leading companies",
    companies: ["TechCorp", "RetailMax", "FoodChain", "ServicePro"]
  },
  dashboardStats: {
    todaysSales: "Today's Sales",
    activeOrders: "Active Orders"
  }
};

// Features Grid strings
export const featuresGridStrings = {
  title: "Powerful Features for Modern Businesses",
  subtitle: "From payment processing to advanced analytics, POSPro provides everything you need to run and grow your business efficiently.",
  features: [
    {
      title: "Real-time Analytics",
      description: "Get instant insights into your business performance with comprehensive reports and dashboards."
    },
    {
      title: "Universal Payment Processing",
      description: "Accept all payment types including cards, mobile payments, and digital wallets."
    },
    {
      title: "Smart Inventory",
      description: "Automated stock tracking with low-stock alerts and supplier management."
    },
    {
      title: "Customer Insights",
      description: "Build detailed customer profiles and create targeted loyalty programs."
    },
    {
      title: "Multi-location Support",
      description: "Manage multiple stores from a single dashboard with centralized reporting."
    },
    {
      title: "Mobile POS",
      description: "Process sales anywhere with our mobile app and wireless card readers."
    },
    {
      title: "24/7 Operations",
      description: "Cloud-based system ensures your business never stops, even offline."
    },
    {
      title: "Enterprise Security",
      description: "Bank-level encryption and PCI compliance keep your data secure."
    }
  ]
};

// Product Overview strings
export const productOverviewStrings = {
  subtitle: "The All-in-One POS Advantage",
  title: "Our Product Overview",
  description: "From payment processing to advanced analytics, POSPro provides everything you need to run and grow your business efficiently.",
  dashboard1: "Main Dashboard",
  dashboard2: "Analytics Dashboard",
  dashboard3: "Financial Dashboard",
  dashboardDescription: "From fashion boutiques to electronics, groceries to gift shops, sell smarter and serve faster.",
  ctaText: "Ready to transform your business operations?",
  startTrial: "Start Free Trial",
  scheduleDemo: "Schedule Demo"
};

// Pricing Section strings
export const pricingStrings = {
  title: "Choose Your Perfect Plan",
  subtitle: "Flexible pricing options designed to grow with your business. Start free and upgrade anytime.",
  planDetails: {
    maxLocations: "Max Locations:",
    maxUsers: "Max Users:",
    support: "Support:"
  },
  bottomSection: {
    features: [
      "14-day free trial",
      "No setup fees",
      "Cancel anytime"
    ]
  }
};

// Blog Preview strings
export const blogPreviewStrings = {
  title: "Latest from Our Blog",
  subtitle: "Industry insights, tips, and updates to help grow your business",
  dummyBlogPosts: [
    {
      id: "1",
      _id: "1",
      title: "5 Ways Modern POS Systems Are Revolutionizing Retail",
      description: "In today's fast-paced retail environment, traditional cash registers simply don't cut it anymore. Modern POS systems are transforming how businesses operate, from inventory management to customer engagement. This comprehensive guide explores the key features that make next-generation POS systems essential for retail success in 2024 and beyond.",
      overview: "Discover how modern POS systems are transforming retail operations with advanced features like real-time inventory, customer analytics, and seamless payment processing.",
      createdBy: "Sarah Johnson",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      tags: ["POS Systems", "Retail", "Technology", "Business Growth"],
      slug: "5-ways-modern-pos-systems-revolutionizing-retail",
      blogImage: `${assetsIcon.demoImage.src}`,
      readTime: 5,
      isPublished: true
    },
    {
      id: "2",
      _id: "2",
      title: "Complete Guide to Restaurant POS Implementation",
      description: "Implementing a new POS system in your restaurant can seem daunting, but it doesn't have to be. This step-by-step guide covers everything from choosing the right system to training your staff and maximizing your ROI. Learn from industry experts who have helped hundreds of restaurants successfully transition to modern POS solutions.",
      overview: "Step-by-step guide to implementing a restaurant POS system, from selection to staff training and ROI optimization.",
      createdBy: "Michael Chen",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
      tags: ["Restaurant", "POS Implementation", "Staff Training", "ROI"],
      slug: "complete-guide-restaurant-pos-implementation",
      // blogImage: `${assetsIcon.restaurantPosGuide.src}`,
      blogImage: `${assetsIcon.demoImage.src}`,
      readTime: 8,
      isPublished: true
    },
    {
      id: "3",
      _id: "3",
      title: "Small Business POS: Choosing the Right Solution",
      description: "As a small business owner, every dollar counts. That's why choosing the right POS system is crucial for your success. This article breaks down the key features to look for, common pitfalls to avoid, and how to ensure your POS investment pays for itself in the first year. Includes real case studies from small businesses that made the right choice.",
      overview: "Essential guide for small businesses on selecting the right POS system that fits your budget and growth needs.",
      createdBy: "Emily Rodriguez",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-05",
      tags: ["Small Business", "POS Selection", "Budget", "Growth Strategy"],
      blogImage: `${assetsIcon.demoImage.src}`,
      readTime: 6,
      isPublished: true
    }
  ] as BlogRow[]
};

export const blogPostStrings = {
  notFoundTitle: "Blog Post Not Found",
  notFoundDescription: "The blog post you're looking for doesn't exist.",
  estimatedReadTime: "5 min read"
};

// FAQ Section strings
export const faqStrings = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about POSPro",
  contactSupport: "Still have questions? We're here to help.",
  dummyFaqs: [
    {
      id: "1",
      _id: "1",
      question: "What is POSPro and how does it work?",
      answer: "POSPro is a comprehensive point-of-sale system designed for modern businesses. It combines payment processing, inventory management, customer tracking, and advanced analytics into one seamless platform. Our cloud-based system works on any device with internet access, allowing you to manage your business from anywhere.",
      status: true,
      isPublished: true
    },
    {
      id: "2",
      _id: "2",
      question: "Is POSPro suitable for my business type?",
      answer: "Yes! POSPro is designed to work across various industries including retail, restaurants, salons, clinics, and service-based businesses. Our flexible features and customizable workflows can be tailored to meet your specific business needs, whether you're a small startup or a multi-location enterprise.",
      status: true,
      isPublished: true
    },
    {
      id: "3",
      _id: "3",
      question: "How long does it take to set up POSPro?",
      answer: "Setup time varies based on your business complexity, but most businesses can be up and running within 1-2 hours. Our guided setup process walks you through importing products, configuring payment methods, and training your staff. We also offer free setup assistance for all new customers.",
      status: true,
      isPublished: true
    },
    {
      id: "4",
      _id: "4",
      question: "What payment methods does POSPro support?",
      answer: "POSPro supports all major payment methods including credit/debit cards, mobile wallets (Apple Pay, Google Pay), bank transfers, and cash. We integrate with leading payment processors to ensure secure and reliable transactions. You can also accept multiple currencies and split payments.",
      status: true,
      isPublished: true
    },
    {
      id: "5",
      _id: "5",
      question: "Can I use POSPro offline?",
      answer: "Yes, POSPro has offline capabilities that allow you to continue processing sales even when internet connectivity is lost. All transactions are securely stored locally and automatically sync when you're back online. However, some features like real-time analytics require internet connection.",
      status: true,
      isPublished: true
    },
    {
      id: "6",
      _id: "6",
      question: "How secure is my business data with POSPro?",
      answer: "We take security seriously with bank-level encryption, PCI DSS compliance, and regular security audits. Your data is stored in secure, redundant data centers with automatic backups. We also offer role-based access controls and two-factor authentication to protect your business information.",
      status: true,
      isPublished: true
    },
    {
      id: "7",
      _id: "7",
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 customer support via phone, email, and live chat. All plans include access to our comprehensive knowledge base, video tutorials, and community forum. Premium plans also include dedicated account managers and priority support response times.",
      status: true,
      isPublished: true
    },
    {
      id: "8",
      _id: "8",
      question: "Can I integrate POSPro with other software?",
      answer: "Yes, POSPro offers extensive integration capabilities with accounting software (QuickBooks, Xero), e-commerce platforms, email marketing tools, and more. We also provide a robust API for custom integrations. Our team can help you set up the integrations that matter most to your business.",
      status: true,
      isPublished: true
    }
  ]
};

// Testimonials Section strings
export const testimonialsStrings = {
  title: "Trusted by Thousands of Businesses",
  subtitle: "See what our customers have to say about their experience with POSPro",
  stats: {
    activeBusinesses: "50,000+",
    uptime: "99.9%",
    customerRating: "4.9/5",
    support: "24/7"
  },
  dummyBusinessTypes: [
    {
      _id: "1",
      title: "Retail Stores",
      description: "Complete POS solution for retail businesses with inventory management, customer tracking, and sales analytics.",
      icon: "",
      color: "#3B82F6",
      status: true
    },
    {
      _id: "2",
      title: "Restaurants",
      description: "Streamline your restaurant operations with order management, table tracking, and kitchen display integration.",
      icon: "",
      color: "#10B981",
      status: true
    },
    {
      _id: "3",
      title: "Salons & Spas",
      description: "Manage appointments, staff schedules, and client relationships with our beauty industry POS solution.",
      icon: "",
      color: "#8B5CF6",
      status: true
    },
    {
      _id: "4",
      title: "Cafes & Bars",
      description: "Perfect for cafes and bars with quick order processing, inventory tracking, and customer loyalty programs.",
      icon: "",
      color: "#F59E0B",
      status: true
    },
    {
      _id: "5",
      title: "Healthcare Clinics",
      description: "Specialized POS for healthcare providers with patient management, billing, and appointment scheduling.",
      icon: "",
      color: "#EF4444",
      status: true
    },
    {
      _id: "6",
      title: "Service Businesses",
      description: "Versatile POS solution for service-based businesses with job tracking, invoicing, and customer management.",
      icon: "",
      color: "#06B6D4",
      status: true
    }
  ],
  dummyTestimonials: [
    {
      id: "1",
      rating: 5,
      testimonial: "POSPro has completely transformed how we manage our inventory. The real-time tracking is a lifesaver!",
      customer_name: "Sarah Johnson",
      position: "Owner",
      business_name: "Sarah's Boutique",
      business_type: "Retail"
    },
    {
      id: "2",
      rating: 5,
      testimonial: "The best restaurant POS we've ever used. Table management and kitchen display integration are seamless.",
      customer_name: "Michael Chen",
      position: "Manager",
      business_name: "The Golden Dragon",
      business_type: "Restaurant"
    },
    {
      id: "3",
      rating: 4,
      testimonial: "Incredible support and very intuitive interface. My staff picked it up in less than an hour.",
      customer_name: "Emily Rodriguez",
      position: "Founder",
      business_name: "Glow Salon",
      business_type: "Beauty & Wellness"
    }
  ]
};

// Benefits Section strings
export const benefitsStrings = {
  title: "Why Choose POSPro?",
  description: "Join thousands of businesses that trust POSPro for their daily operations",
  items: {
    increaseRevenue: {
      title: "Increase Revenue",
      description: "Average 23% revenue increase within 6 months"
    },
    saveTime: {
      title: "Save Time",
      description: "Reduce daily operations time by up to 40%"
    },
    bankLevelSecurity: {
      title: "Bank-Level Security",
      description: "PCI DSS compliant with end-to-end encryption"
    },
    support247: {
      title: "24/7 Support",
      description: "Dedicated support team available around the clock"
    },
    multiLocation: {
      title: "Multi-Location",
      description: "Manage all your locations from one dashboard"
    },
    advancedAnalytics: {
      title: "Advanced Analytics",
      description: "Real-time insights to grow your business"
    }
  }
};

// CTA Section strings
export const ctaStrings = {
  title: "Ready to Transform Your Business?",
  subtitle: "Join thousands of successful businesses using POSPro. Start your free trial today and experience the difference a modern POS system can make.",
  benefits: [
    "14-day free trial",
    "No setup fees",
    "24/7 support"
  ],
  trustIndicators: {
    trustedBy: "Trusted by 50,000+ businesses worldwide",
    rating: "★★★★★ 4.9/5 rating",
    uptime: "99.9% uptime",
    compliance: "PCI compliant"
  }
};

// Demo Request Form strings
export const demoRequestStrings = {
  title: "Request Demo",
  form: {
    fullName: "Full Name *",
    email: "Email Address *",
    phone: "Phone Number",
    companyName: "Company Name *",
    businessCategory: "Business Category",
    additionalRequirements: "Additional Requirements",
    submit: "Request Demo",
    submitting: "Submitting..."
  },
  businessCategories: [
    "Salon", "Grocery", "Clinic", "Restaurant", "Retail", "Services", "Other"
  ],
  successMessage: "Demo request submitted successfully! We'll get back to you soon."
};

// Choose Plan strings
export const choosePlanStrings = {
  title: "Choose Your Plan",
  paymentMethod: {
    title: "Payment Method",
    selectPlaceholder: "Select Payment Method"
  },
  paymentSummary: {
    title: "Payment Summary",
    planPrice: "Plan Price",
    taxVat: "Tax (VAT 5%)",
    taxBreakdown: "Tax Breakdown",
    vat: "VAT (5%)",
    totalAmount: "Total Amount"
  },
  actionSection: {
    secureCheckout: "100% secure checkout in seconds",
    proceedToPayment: "Proceed to Payment →",
    selectPaymentMethod: "Select Payment Method"
  },
  paymentMethods: [
    "Credit Card",
    "Debit Card",
    "UPI",
    "Net Banking",
    "PayPal"
  ]
};

// Landing Header strings
export const headerStrings = {
  logo: {
    brand: "POS",
    brandHighlight: "Pro"
  },
  navigation: [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' }
  ],
  moreNavigation: [
    { name: 'Blog', href: '#blog' },
    { name: 'FAQs', href: '#faq' },
    { name: 'About Us', href: '#aboutus' }
  ]
};

// Landing Footer strings
export const footerStrings = {
  description: "The most advanced POS system for modern businesses. Streamline your operations, boost efficiency, and grow your revenue with our comprehensive solution.",
  links: {
    product: ["Features", "Pricing", "FAQ"],
    company: ["About", "Blog", "Contact"]
  }
};

// Export all strings in a single object for easy access
export const landingStrings = {
  common: commonStrings,
  hero: heroStrings,
  featuresGrid: featuresGridStrings,
  productOverview: productOverviewStrings,
  benefits: benefitsStrings,
  pricing: pricingStrings,
  blogPreview: blogPreviewStrings,
  blogPost: blogPostStrings,
  faq: faqStrings,
  testimonials: testimonialsStrings,
  cta: ctaStrings,
  demoRequest: demoRequestStrings,
  choosePlan: choosePlanStrings,
  header: headerStrings,
  footer: footerStrings
};

export const CommonFilterOptions = {
  CommonStatusOptions: [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ],
  MonthOptions: [
    { name: "January", value: "0" },
    { name: "February", value: "1" },
    { name: "March", value: "2" },
    { name: "April", value: "3" },
    { name: "May", value: "4" },
    { name: "June", value: "5" },
    { name: "July", value: "6" },
    { name: "August", value: "7" },
    { name: "September", value: "8" },
    { name: "October", value: "9" },
    { name: "November", value: "10" },
    { name: "December", value: "11" },
  ]
}
export const actionOptions = [
  { name: 'Status', value: 'Status' },
  { name: 'Delete', value: 'Delete' }
];
export const activeStatusOptions = [
  { name: 'Active', value: 'Active' },
  { name: 'Inactive', value: 'Inactive' }
];

export const purchaseOrderActionsOptions = [
  { name: 'Status', value: 'Status' }
]

export const purchaseOrderStatusOptionsSelect = [
  { name: 'Draft', value: 'Draft' },
  { name: 'Approved', value: 'Approved' },
  { name: 'Billed', value: 'Billed' },
  { name: 'Cancelled', value: 'Cancelled' },
]
export const purchaseOrderStatusOptions = [
  { name: 'All', label: 'All', value: 'All' },
  { name: 'Draft', label: 'Draft', value: 'Draft' },
  { name: 'Approved', label: 'Approved', value: 'Approved' },
  { name: 'Billed', label: 'Billed', value: 'Billed' },
  { name: 'Cancelled', label: 'Cancelled', value: 'Cancelled' }
]

export const purchaseReturnStatusOptions = [
  { name: 'All Status', label: 'All', value: 'All' },
  { name: 'Draft', label: 'Draft', value: 'Draft' },
  { name: 'Approved', label: 'Approved', value: 'Approved' },
  { name: 'Returned', label: 'Returned', value: 'Returned' },
  { name: 'Credited', label: 'Credited', value: 'Credited' },
  { name: 'Cancelled', label: 'Cancelled', value: 'Cancelled' }
]

export const activeStatusOptionsPurchaseReturn = [
  { name: 'Draft', value: 'Draft' },
  { name: 'Approved', value: 'Approved' },
  { name: 'Returned', value: 'Returned' },
  { name: 'Credited', value: 'Credited' },
  { name: 'Closed', value: 'Closed' }
]
// Predefined palette for distinct colors
export const colorPalette = [
  "#10B981", "#EF4444", "#EC4899", "#3B82F6", "#F59E0B",
  "#8B5CF6", "#14B8A6", "#F97316", "#22C55E", "#06B6D4"
];

export const statusColor = {
  Active: "bg-success text-white",
  Inactive: "bg-danger text-white",
  Pending: "bg-warning text-white",
  Earned: "bg-warning text-white",
  Redeemed: "bg-success text-white",
};

export const SalesStatusOptions = [
  { label: 'All Status', value: 'All' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
];

export const superAdminScreens = [
  { id: "screen1", name: "POS 1" },
  { id: "screen2", name: "POS 2" },
  { id: "screen3", name: "POS 3" },
  { id: "screen4", name: "POS 4" },
  { id: "screen5", name: "POS 5" },
];

export const superAdminModules = [
  "Sales",
  "Inventory",
  "POS",
  "Dashboard",
  "Reports",
  "Customer",
  "Employee",
  "Purchase",
  "Returns",
  "Finance",
  "Tax"
];
export const PAYMENT_PROVIDERS = {
  razorpay: {
    name: 'Razorpay',
    requiredFields: ['key_id', 'key_secret'],
    sensitiveFields: ['key_secret'],
  },
  stripe: {
    name: 'Stripe',
    requiredFields: ['secretKey', 'appKey'],
    sensitiveFields: ['secretKey'],
  },
  paypal: {
    name: 'PayPal',
    requiredFields: ['clientId', 'clientSecret'],
    sensitiveFields: ['clientSecret'],
  },
  cinet: {
    name: 'Cinet',
    requiredFields: ['siteId', 'apiKey', 'secretKey'],
    sensitiveFields: ['apiKey', 'secretKey'],
  },
  sadad: {
    name: 'SADAD',
    requiredFields: ['siteId', 'secretKey', 'domain'],
    sensitiveFields: ['secretKey'],
  },
  airtelMoney: {
    name: 'Airtel Money',
    requiredFields: ['siteId', 'secretKey'],
    sensitiveFields: ['secretKey'],
  },
  phonePe: {
    name: 'PhonePe',
    requiredFields: ['appId', 'merchantId', 'saltId', 'saltKey'],
    sensitiveFields: ['saltKey'],
  },
  midtrans: {
    name: 'Midtrans',
    requiredFields: ['siteId'],
    sensitiveFields: [],
  },
  paystack: {
    name: 'Paystack',
    requiredFields: ['secretKey', 'appKey'],
    sensitiveFields: ['secretKey'],
  },
  flutterwave: {
    name: 'Flutterwave',
    requiredFields: ['secretKey', 'appKey'],
    sensitiveFields: ['secretKey'],
  },
};


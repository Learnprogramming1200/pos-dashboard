// Expense Management Constants
export const expenseStrings = {
  // Category Management
  categoryManagement: {
    pageTitle: "Expense Categories",
    pageDescription: "Manage your expense categories",
    addButton: "Add Category",
    editButton: "Edit Category",
    deleteButton: "Delete",
    viewDetails: "View Details",
    status: {
      active: "Active",
      inactive: "Inactive",
      all: "All Status"
    },
    form: {
      name: "Category Name",
      description: "Description",
      status: "Status",
      createdDate: "Created Date",
      lastUpdated: "Last Updated",
      validation: {
        nameRequired: "Category name is required",
        descriptionRequired: "Description is required"
      }
    },
    messages: {
      addSuccess: "Category added successfully",
      updateSuccess: "Category updated successfully",
      deleteSuccess: "Category deleted successfully",
      deleteConfirm: "Are you sure you want to delete this category?",
      statusUpdateSuccess: "Status updated successfully",
      loadError: "Failed to load expense categories"
    },
    table: {
      name: "Name",
      description: "Description",
      status: "Status",
      actions: "Actions",
      noData: "No categories found"
    }
  },
  
  // Main Expense Management
  // Page titles and headers
  pageTitle: "Expense Management",
  pageDescription: "Track and manage business expenses",
  addExpenseTitle: "Add Expense",
  editExpenseTitle: "Edit Expense",
  expenseDetailsTitle: "Expense Details",
  
  // Action buttons
  addButton: "Add Expense",
  saveButton: "Save Changes",
  cancelButton: "Cancel",
  backButton: "Back to Expenses",
  deleteButton: "Delete",
  approveButton: "Approve",
  rejectButton: "Reject",
  
  // Status
  status: {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    all: "All"
  },
  
  // Form fields
  form: {
    store: "Store",
    staff: "Staff",
    category: "Expense Category",
    amount: "Amount",
    description: "Description",
    date: "Expense Date",
    paymentMethod: "Payment Method",
    reference: "Reference",
    notes: "Notes",
    
    // Payment methods
    paymentMethods: {
      cash: "Cash",
      card: "Credit/Debit Card",
      bankTransfer: "Bank Transfer",
      cheque: "Cheque",
      digitalWallet: "Digital Wallet",
      other: "Other"
    },
    
    // Card details
    card: {
      cardNumber: "Card Number",
      cardHolderName: "Cardholder Name",
      cardType: "Card Type",
      expiryDate: "Expiry Date",
      expiryMonth: "MM",
      expiryYear: "YYYY",
      cvv: "CVV"
    },
    
    // Bank transfer details
    bankTransfer: {
      bankName: "Bank Name",
      branchName: "Branch Name",
      accountNumber: "Account Number",
      ifscCode: "IFSC Code"
    },
    
    // Cheque details
    cheque: {
      chequeNumber: "Cheque Number"
    },
    
    // Validation messages
    validation: {
      required: "This field is required",
      invalidAmount: "Please enter a valid amount",
      invalidDate: "Please enter a valid date"
    }
  },
  
  // Table columns
  table: {
    store: "Store",
    staff: "Staff",
    category: "Category",
    amount: "Amount",
    description: "Description",
    date: "Date",
    paymentMethod: "Payment Method",
    status: "Status",
    actions: "Actions"
  },
  
  // Filter options
  filters: {
    status: "Status",
    category: "Category",
    dateRange: "Date Range",
    searchPlaceholder: "Search expenses..."
  },
  
  // Status badges
  statusBadges: {
    approved: "bg-success text-white",
    rejected: "bg-danger text-white",
    pending: "bg-warning text-white"
  },
  
  // Success/error messages
  messages: {
    addSuccess: "Expense added successfully",
    updateSuccess: "Expense updated successfully",
    deleteSuccess: "Expense deleted successfully",
    approveSuccess: "Expense approved successfully",
    rejectSuccess: "Expense rejected successfully",
    error: "An error occurred. Please try again.",
    deleteConfirm: "Are you sure you want to delete this expense?",
    noExpenses: "No expenses found"
  }
};

// Export as default for easier imports
export default expenseStrings;

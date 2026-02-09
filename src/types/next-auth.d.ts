import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
      isAdmin?: boolean
      isActive?: boolean
      isSubscription?: boolean
      planName?: string | { name?: string; _id?: string }
      subscriptionDetails?: {
        purchaseDate: string
        expiryDate: string
        duration: string
        remainingDays: number
      }
      businessName?: string
      businessCategory?: string
      phone?: string
      profilePicture?: string | null
    }
    refreshToken?: string
    "pos-session"?: string
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
    isAdmin?: boolean
    isActive?: boolean
    isSubscription?: boolean
    planName?: string | { name?: string; _id?: string }
    subscriptionDetails?: {
      purchaseDate: string
      expiryDate: string
      duration: string
      remainingDays: number
    }
    businessName?: string
    businessCategory?: string
    phone?: string
    profilePicture?: string | null
    refreshToken?: string
    "pos-session"?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    refreshToken?: string
    role?: string
    isAdmin?: boolean
    isActive?: boolean
    isSubscription?: boolean
    planName?: string | { name?: string; _id?: string }
    subscriptionDetails?: {
      purchaseDate: string
      expiryDate: string
      duration: string
      remainingDays: number
    }
    businessName?: string
    businessCategory?: string
    phone?: string
    profilePicture?: string | null
    "pos-session"?: string
  }
}



import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authAPI } from "@/lib/api"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Add timeout and better error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 seconds

          const response = await authAPI.login(
            credentials.email as string,
            credentials.password as string
          )

          clearTimeout(timeoutId);

          if (response.status === 200 || response.status === 201) {
            const data = response.data as any
            const user = data?.data?.user || data?.user || data?.data?.userData || data?.userData

            // Relaxed validation: require an id; email optional (fallback to submitted email)
            const userId = user?._id || user?.id
            if (user && userId) {
              return {
                id: userId,
                email: user.email || (credentials.email as string),
                name: user.name,
                role: user.roleId?.name || user.role || user.roleName,
                isAdmin: user.isAdmin,
                isActive: user.isActive,
                isSubscription: user.isSubscription,
                planName: user.planName,
                subscriptionDetails: user.subscriptionDetails,
                businessName: user.businessName,
                businessCategory: user.businessCategory,
                phone: user.phone,
                profilePicture: user.profilePicture,
                "pos-session": (() => {
                  // Extract pos-session from Set-Cookie header
                  const setCookieHeaders = response.headers['set-cookie'];
                  if (setCookieHeaders) {
                    const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
                    const posSessionCookie = cookies.find((c: string) => c.includes('pos-session='));
                    if (posSessionCookie) {
                      const match = posSessionCookie.match(/pos-session=([^;]+)/);
                      if (match && match[1]) return match[1];
                    }
                  }
                  return undefined;
                })(),
                refreshToken: data?.data?.refreshToken || data?.refreshToken,
              }
            } else {
              console.error("Invalid user data received from backend:", user);
              return null; // This will cause NextAuth to fail and fall back to legacy auth
            }
          } else {
            console.error("Backend returned non-success status:", response.status);
            return null;
          }
        } catch (error: any) {
          console.error("NextAuth authorization error:", error)

          // Handle timeout errors
          if (error.name === 'AbortError') {
            console.error("Backend request timed out, falling back to legacy authentication");
            return null;
          }

          // Handle network errors
          if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            console.error("Network error - backend server may be down, falling back to legacy authentication");
            return null;
          }

          // Handle fetch failures
          if (error.message === 'fetch failed') {
            console.error("Fetch failed - backend server may be unreachable, falling back to legacy authentication");
            return null;
          }

          // Handle specific error cases
          if (error.response) {
            const { status, statusText, data } = error.response;
            console.error("Backend response error:", { status, statusText, data });

            // Handle rate limiting (429) - don't fail immediately, let it fall back to legacy auth
            if (status === 429) {
              console.warn("Rate limited by backend, falling back to legacy authentication");
              return null; // This will trigger fallback to legacy auth in NextAuthContext
            }

            // Handle other specific errors
            if (status === 401) {
              console.warn("Invalid credentials");
              return null;
            }

            if (status >= 500) {
              console.error("Backend server error, falling back to legacy authentication");
              return null;
            }
          } else if (error.request) {
            console.error("Network error - backend server may be down:", error.request);
            return null; // Fall back to legacy auth
          } else {
            console.error("Request setup error:", error.message);
            return null;
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token['pos-session'] = (user as any)['pos-session'];
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.isAdmin = (user as any).isAdmin;
        token.isActive = (user as any).isActive;
        token.isSubscription = (user as any).isSubscription;
        token.planName = (user as any).planName;
        token.subscriptionDetails = (user as any).subscriptionDetails;
        token.businessName = (user as any).businessName;
        token.businessCategory = (user as any).businessCategory;
        token.phone = (user as any).phone;
        token.profilePicture = (user as any).profilePicture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || '';
        session.user.role = token.role as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isActive = token.isActive as boolean;
        session.user.isSubscription = token.isSubscription as boolean;
        session.user.planName = token.planName as string | { name?: string; _id?: string };
        session.user.subscriptionDetails = token.subscriptionDetails as {
          purchaseDate: string;
          expiryDate: string;
          duration: string;
          remainingDays: number;
        };
        session.user.businessName = token.businessName as string;
        session.user.businessCategory = token.businessCategory as string;
        session.user.phone = token.phone as string;
        session.user.profilePicture = token.profilePicture as string | null;
        session['pos-session'] = token['pos-session'] as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || "6e33a5b76e66abd00cb61431131456f6",
})

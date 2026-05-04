import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

// Fix TypeScript errors by extending the default User and Session types
declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: any
  }
  interface User {
    accessToken?: string
    refreshToken?: string
    backendUser?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    backendUser?: any
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
          const fetchUrl = INTERNAL_BACKEND_URL?.includes('/api') 
            ? `${INTERNAL_BACKEND_URL}/auth/social-login`
            : `${INTERNAL_BACKEND_URL}/api/auth/social-login`;

          const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              provider: account.provider,
              providerId: account.providerAccountId,
            }),
          })

          const data = await response.json()
          
          if (response.ok) {
            // Attach our backend token to the user object so we can use it later
            user.accessToken = data.token
            user.refreshToken = data.refreshToken
            user.backendUser = data.user
            return true
          }
        } catch (error) {
          console.error("Error during social login sync:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.backendUser = user.backendUser
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.user = token.backendUser as any
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "luxeestates-secret-key-for-jwt-token-generation-2024",
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }

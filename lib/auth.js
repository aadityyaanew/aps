/**
 * lib/auth.js — NextAuth configuration.
 * Credentials provider with MySQL + bcrypt.
 */
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/services/auth.service";
import { ROLE_HOME } from "@/config/roles";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await authenticateUser(credentials.email, credentials.password);
        return user ?? null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
        token.organizationName = user.organization_name;
        token.parentCenterId   = user.parent_center_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id               = token.id;
        session.user.role             = token.role;
        session.user.organizationName = token.organizationName;
        session.user.parentCenterId   = token.parentCenterId;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      // After login redirect to role-specific home
      if (token?.role) return `${baseUrl}${ROLE_HOME[token.role]}`;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
};

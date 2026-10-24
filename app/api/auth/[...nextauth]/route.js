/**
 * app/api/auth/[...nextauth]/route.js
 * NextAuth handler — do not add logic here.
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

/**
 * NextAuth is mounted at /auth (not /api/auth) to avoid redirect loops.
 * Set NEXTAUTH_URL=http://localhost:3000/auth in .env so OAuth callbacks work.
 */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID ?? "",
      clientSecret: process.env.TWITTER_SECRET ?? "",
      version: "2.0",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID ?? "",
      clientSecret: process.env.APPLE_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
});

export { handler as GET, handler as POST };

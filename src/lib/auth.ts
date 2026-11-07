import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { loginSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        await connectDB();
        const user = await User.findOne({
          email: email.toLowerCase().trim(),
        }).lean();

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          currency: user.currency || "INR",
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.currency = (user as any).currency || "INR";
      }
      if (trigger === "update" && session) {
        if (session.currency) token.currency = session.currency;
        if (session.name) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).currency = (token.currency as string) || "INR";
      }
      return session;
    },
  },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "Expense Tracker_ledger_super_secret_session_jwt_key_2025_998877",
});

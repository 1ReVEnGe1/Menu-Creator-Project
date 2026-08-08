import connectDB from "lib/db";
import User from "models/User";
import { Role } from "models/Role"; 
import { Permission } from "models/Permission";
import NextAuth , { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface User {
    id: string;
    fullname: string;
    phone: string;
    role: string;          
    permissions: string[];  
  }

  interface Session {
    user: {
      id: string;
      fullname: string;
      phone: string;
      role: string;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

export const authOptions : NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("لطفا شماره همراه و رمز عبور را وارد کنید");
        }

        await connectDB();

        const RegisteredRole = Role;
        const RegisteredPermission = Permission;
        console.log(credentials.phone);

        const users = await User.find()
        console.log(users);
        const user = await User.findOne({ phone: credentials.phone })
          .populate({
            path: "role",
            model: RegisteredRole, 
            populate: {
              path: "permissions",
              model: RegisteredPermission,
            },
          })
          .lean();

        console.log(user);

        if (!user) {
          throw new Error("کاربری با این شماره یافت نشد یا رمز عبور اشتباه است");
        }

        if (user.isActive === false) {
          throw new Error("حساب کاربری شما غیرفعال شده است");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password || "");
        if (!isValid) throw new Error("رمز عبور اشتباه است");

        const roleObj = user.role as any;
        const permissionsStrings = roleObj?.permissions?.map((p: any) => p.name) || [];

        return {
          id: user._id.toString(),
          fullname: user.fullname,
          phone: user.phone,
          role: roleObj?.name || "USER",
          permissions: permissionsStrings,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.fullname = user.fullname;
        token.phone = user.phone;
        token.role = user.role;
        token.permissions = user.permissions;
      }

      if (trigger === "update" && session?.user) {
        token.fullname = session.user.fullname ?? token.fullname;
        token.phone = session.user.phone ?? token.phone;
        token.role = session.user.role ?? token.role;
        token.permissions = session.user.permissions ?? token.permissions;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.fullname = token.fullname as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
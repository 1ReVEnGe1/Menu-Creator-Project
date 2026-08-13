import connectDB from "lib/db";
import User from "models/User";
import { Role } from "models/Role";
import { Permission } from "models/Permission";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import type { DefaultSession } from "next-auth";

/* =========================================================
   NextAuth Type Augmentation
========================================================= */

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

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    fullname: string;
    phone: string;
    role: string;
    permissions: string[];
  }
}

/* =========================================================
   Auth Configuration
========================================================= */

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        phone: {
          label: "Phone",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        /* -------------------------------------------------
           Validate credentials
        ------------------------------------------------- */

        if (
          typeof credentials?.phone !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          throw new Error("لطفا شماره همراه و رمز عبور را وارد کنید");
        }

        const phone = credentials.phone;
        const password = credentials.password;

        /* -------------------------------------------------
           Connect to MongoDB
        ------------------------------------------------- */

        await connectDB();

        /* -------------------------------------------------
           Find user
        ------------------------------------------------- */

        const user = await User.findOne({
          phone,
        })
          .populate({
            path: "role",
            model: Role,
            populate: {
              path: "permissions",
              model: Permission,
            },
          })
          .lean();

        /* -------------------------------------------------
           User not found
        ------------------------------------------------- */

        if (!user) {
          throw new Error(
            "کاربری با این شماره یافت نشد یا رمز عبور اشتباه است"
          );
        }
        

        /* -------------------------------------------------
           Check account status
        ------------------------------------------------- */

        if (user.isActive === false) {
          throw new Error("حساب کاربری شما غیرفعال شده است");
        }

        /* -------------------------------------------------
           Verify password
        ------------------------------------------------- */

        const isValid = await bcrypt.compare(
          password,
          user.password || ""
        );

        if (!isValid) {
          throw new Error("رمز عبور اشتباه است");
        }

        /* -------------------------------------------------
           Role & Permissions
        ------------------------------------------------- */

        const roleObj = user.role as any;

        const permissionsStrings: string[] =
          roleObj?.permissions?.map((permission: any) => permission.name) ||
          [];

        /* -------------------------------------------------
           Return authenticated user
        ------------------------------------------------- */

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

  /* =======================================================
     Callbacks
  ======================================================= */

  callbacks: {
    /* -----------------------------------------------------
       JWT Callback
    ----------------------------------------------------- */

    async jwt({ token, user, trigger, session }) {
      /* -----------------------------------------------
         Initial login
      ------------------------------------------------ */

      if (user) {
        token.id = user.id;
        token.fullname = user.fullname;
        token.phone = user.phone;
        token.role = user.role;
        token.permissions = user.permissions;
      }

      /* -----------------------------------------------
         Session update
      ------------------------------------------------ */

      if (trigger === "update" && session?.user) {
        token.fullname =
          session.user.fullname ?? token.fullname;

        token.phone =
          session.user.phone ?? token.phone;

        token.role =
          session.user.role ?? token.role;

        token.permissions =
          session.user.permissions ?? token.permissions;
      }

      return token;
    },

    /* -----------------------------------------------------
       Session Callback
    ----------------------------------------------------- */

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.fullname = token.fullname;
        session.user.phone = token.phone;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }

      return session;
    },
  },

  /* =======================================================
     Pages
  ======================================================= */

  pages: {
    signIn: "/login",
  },
});
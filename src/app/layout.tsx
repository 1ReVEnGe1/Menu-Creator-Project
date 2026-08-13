import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers/Providers";

const yekanbakhFont = localFont({
  // دو بار عقب‌گرد برای خروج از src/app
  src: "../../public/fonts/YekanBakhFaNum-VF.woff",
  variable: "--font-yekanbakh",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Menus",
  description:
    "All types of party menus for barman-a including wedding, bithday, babyshower etc ... ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      className={`${yekanbakhFont.variable} h-full antialiased`}
      dir="rtl"
    >
      <body>
        <Providers>
          <Toaster position="bottom-center" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}

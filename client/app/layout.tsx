import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ShopProvider } from "@/context/shop-context";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://shopsmart-web.vercel.app"),
  title: {
    default: "ShopSmart — Smart Shopping, Trusted Choices",
    template: "%s | ShopSmart",
  },
  description:
    "ShopSmart is your trusted eCommerce destination. Modern, premium, built for scale. Discover quality products with clarity and confidence.",
  keywords: ["eCommerce", "smart shopping", "trusted", "premium", "ShopSmart"],
  authors: [{ name: "ShopSmart" }],
  creator: "ShopSmart",
  openGraph: {
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <ShopProvider>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            {children}
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

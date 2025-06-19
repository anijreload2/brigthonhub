
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ConditionalNavigation } from "@/components/conditional-navigation";
import { Footer } from "@/components/navigation/footer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
});

export const metadata: Metadata = {
  title: "BrightonHub - Nigeria's Premier Multi-Service Platform",
  description: "Transform spaces and elevate lives through exceptional service delivery across real estate, food services, marketplace, and project showcase in Nigeria.",
  keywords: "Nigeria, real estate, food services, marketplace, construction, interior design, Brighton-Hedge Limited",
  authors: [{ name: "Brighton-Hedge Limited" }],
  creator: "Brighton-Hedge Limited",
  publisher: "Brighton-Hedge Limited",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://brightonhub.ng"),
  openGraph: {
    title: "BrightonHub - Nigeria's Premier Multi-Service Platform",
    description: "Transform spaces and elevate lives through exceptional service delivery across real estate, food services, marketplace, and project showcase in Nigeria.",
    url: "https://brightonhub.ng",
    siteName: "BrightonHub",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BrightonHub - Nigeria's Premier Multi-Service Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrightonHub - Nigeria's Premier Multi-Service Platform",
    description: "Transform spaces and elevate lives through exceptional service delivery across real estate, food services, marketplace, and project showcase in Nigeria.",
    creator: "@brightonhub",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <ConditionalNavigation />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f6ef"
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Optinest Digital",
  title: {
    default: "Optinest Digital | Small Web Design & SEO Agency",
    template: "%s | Optinest Digital"
  },
  description:
    "Optinest Digital is a small web design and SEO agency helping businesses grow with fast websites, technical SEO, and conversion-focused strategy.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  },
  authors: [{ name: "Jeff Gab", url: siteUrl }],
  creator: "Jeff Gab",
  publisher: "Optinest Digital",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Optinest Digital | Small Web Design & SEO Agency",
    description:
      "Optinest Digital is live and helping brands grow through technical SEO and fast, modern websites.",
    siteName: "Optinest Digital",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Optinest Digital - Small Web Design & SEO Agency"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Optinest Digital | Web Design & SEO Agency",
    description:
      "Live web design and SEO agency founded by Jeff Gab.",
    images: ["/og.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  keywords: [
    "Optinest Digital",
    "Web Design Agency",
    "SEO Agency",
    "Technical SEO",
    "Small Agency",
    "Website Development",
    "Local SEO"
  ],
  category: "technology"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

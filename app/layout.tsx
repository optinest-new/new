import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
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
      "Optinest Digital is a small web design and SEO agency helping businesses grow with fast websites, technical SEO, and conversion-focused strategy.",
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
      "Optinest Digital is a small web design and SEO agency helping businesses grow with fast websites, technical SEO, and conversion-focused strategy.",
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
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className="bg-[#f5f6ef] text-ink">
        <header className="border-b-2 border-ink/70 bg-mist/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:gap-0 sm:px-6">
            <Link
              href="/"
              className="font-display text-xl uppercase leading-none tracking-tight text-ink hover:opacity-80 sm:text-2xl"
            >
              Optinest Digital
            </Link>
            <nav aria-label="Primary" className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-ink sm:justify-end sm:gap-6">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/clients" className="hover:underline">
                Clients
              </Link>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              <ScheduleCallModal label="Schedule a Call" className="hover:underline" />
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-8 border-t-2 border-ink/70 bg-mist/95">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-ink/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© {year} Optinest Digital. All rights reserved.</p>
            <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/clients" className="hover:underline">
                Clients
              </Link>
              <Link href="/tools" className="hover:underline">
                Tools
              </Link>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              <a href="https://facebook.com/optinestdigital" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Facebook
              </a>
              <a href="https://x.com/optinestdigital" target="_blank" rel="noopener noreferrer" className="hover:underline">
                X
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

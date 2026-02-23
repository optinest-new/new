import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AuthAwareNavLinks } from "@/components/auth-aware-nav-links";
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
    default: "Optinest Digital | SEO, Web Design, and Development for Businesses",
    template: "%s | Optinest Digital"
  },
  description:
    "Optinest Digital is a Manila, Philippines-based SEO, web design, and web development agency serving businesses worldwide with technical execution focused on qualified leads and revenue growth.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  },
  authors: [{ name: "Optinest Digital", url: siteUrl }],
  creator: "Optinest Digital",
  publisher: "Optinest Digital",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    title: "Optinest Digital | SEO, Web Design, and Development for Businesses",
    description:
      "Manila-based SEO, web design, and web development agency helping businesses worldwide increase qualified leads through technical SEO and conversion-focused websites.",
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
      "Manila-based SEO, web design, and web development agency helping businesses worldwide attract qualified leads.",
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
    "SEO Agency Manila",
    "Web Design Agency Manila",
    "Web Development Agency Philippines",
    "Technical SEO Services Philippines",
    "Local SEO Manila",
    "B2B SEO Agency",
    "Conversion-focused Web Design",
    "Lead Generation Website Development",
    "Digital Agency Philippines",
    "SEO Services Worldwide"
  ],
  other: {
    "geo.region": "PH-NCR",
    "geo.placename": "Manila, Metro Manila, Philippines",
    "geo.position": "14.5995;120.9842",
    ICBM: "14.5995, 120.9842",
    "business:contact_data:locality": "Manila",
    "business:contact_data:region": "Metro Manila",
    "business:contact_data:country_name": "Philippines",
    "business:contact_data:email": "optinestdigital@gmail.com"
  },
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
        <header className="sticky top-0 z-50 border-b-2 border-ink/70 bg-mist/90 backdrop-blur">
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
              <Link href="/services" className="hover:underline">
                Services
              </Link>
              <AuthAwareNavLinks placement="header" />
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
              <AuthAwareNavLinks placement="footer" />
              <Link href="/clients" className="hover:underline">
                Clients
              </Link>
              <Link href="/tools" className="hover:underline">
                Tools
              </Link>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              <Link href="/services" className="hover:underline">
                Services
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

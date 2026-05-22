import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AuthAwareNavLinks } from "@/components/auth-aware-nav-links";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131313"
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
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-page font-sans text-ink`}>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-x-[140%] border-2 border-primary bg-surface-base px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-black transition-transform focus:translate-x-0"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-50 border-b-2 border-white/15 bg-page/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="flex flex-col leading-none text-ink">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-primary">Optinest Digital</span>
              <span className="mt-1 font-display text-xl uppercase tracking-[-0.04em] sm:text-2xl">Design + SEO That Converts</span>
            </Link>
            <MobileNav />
          </div>
        </header>

        <div id="main-content">{children}</div>

        <footer className="mt-16 border-t-2 border-white/15 bg-[#101010]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary">Optinest Digital</p>
              <h2 className="max-w-xl font-display text-3xl uppercase leading-[0.9] tracking-[-0.04em] text-ink sm:text-4xl">
                High-performance websites, SEO systems, and client delivery with a sharper edge.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-white/72 sm:text-base">
                We redesign growth funnels, build faster digital experiences, and keep technical execution visible from strategy to delivery.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <nav aria-label="Footer" className="space-y-3">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Navigate</p>
                <div className="flex flex-col gap-2 text-sm text-white/72">
                  <Link href="/" className="hover:text-primary">Home</Link>
                  <AuthAwareNavLinks placement="footer" />
                  <Link href="/clients" className="hover:text-primary">Clients</Link>
                  <Link href="/tools" className="hover:text-primary">Tools</Link>
                  <Link href="/blog" className="hover:text-primary">Blog</Link>
                  <Link href="/services" className="hover:text-primary">Services</Link>
                </div>
              </nav>

              <div className="space-y-3">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">Connect</p>
                <div className="flex flex-col gap-2 text-sm text-white/72">
                  <a href="https://facebook.com/optinestdigital" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Facebook
                  </a>
                  <a href="https://x.com/optinestdigital" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    X
                  </a>
                  <a href="mailto:optinestdigital@gmail.com" className="hover:text-primary">
                    optinestdigital@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 px-4 py-4 text-center font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/45 sm:px-6">
            © {year} Optinest Digital. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

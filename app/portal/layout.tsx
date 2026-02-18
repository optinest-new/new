import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Client Portal",
  description:
    "Secure portal for clients to monitor project progress, ask questions, and share files.",
  alternates: {
    canonical: "/portal"
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/portal`,
    title: "Client Portal | Optinest Digital",
    description:
      "Secure portal for clients to monitor project progress, ask questions, and share files.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Portal | Optinest Digital",
    description:
      "Secure portal for clients to monitor project progress, ask questions, and share files.",
    images: ["/og.png"]
  }
};

export default function PortalLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

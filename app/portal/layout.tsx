import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optinestdigital.com";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Secure portal for clients to monitor project progress, ask questions, and share files.",
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
    description: "Secure portal for clients to monitor project progress, ask questions, and share files.",
    images: ["/og.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Portal | Optinest Digital",
    description: "Secure portal for clients to monitor project progress, ask questions, and share files.",
    images: ["/og.png"]
  }
};

export default function PortalLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="neo-panel relative mb-5 overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
          <div className="checker-bg" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="eyebrow-pop w-fit">Client portal</p>
              <h1 className="mt-4 font-display text-[clamp(2rem,4.8vw,4rem)] uppercase leading-[0.9] tracking-[-0.05em] text-ink">
                Live project visibility, approvals, billing, and files.
              </h1>
            </div>
            <div className="neo-muted-panel w-full max-w-sm px-4 py-4">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-primary/80">Workspace focus</p>
              <p className="mt-2 text-sm leading-6 text-ink/76">
                Faster mobile actions, sharper data-entry surfaces, and darker review panels for manager and client workflows.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

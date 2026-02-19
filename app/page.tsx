import Link from "next/link";
import { ScheduleCallModal } from "@/components/schedule-call-modal";

const seoSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://optinestdigital.com/#organization",
      name: "Optinest Digital",
      url: "https://optinestdigital.com/",
      logo: "https://optinestdigital.com/icon.svg",
      description:
        "Optinest Digital is a small web design and SEO agency focused on technical SEO and modern web development.",
      founder: {
        "@type": "Person",
        name: "Optinest Digital",
        jobTitle: "Senior SEO Specialist and Web Developer"
      },
      areaServed: "Worldwide",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "optinestdigital@gmail.com",
          availableLanguage: ["English"]
        }
      ],
      sameAs: [
        "https://facebook.com/optinestdigital",
        "https://x.com/optinestdigital"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://optinestdigital.com/#website",
      url: "https://optinestdigital.com/",
      name: "Optinest Digital",
      publisher: {
        "@id": "https://optinestdigital.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://optinestdigital.com/#webpage",
      url: "https://optinestdigital.com/",
      name: "Optinest Digital | Small Web Design & SEO Agency",
      isPartOf: {
        "@id": "https://optinestdigital.com/#website"
      },
      about: {
        "@id": "https://optinestdigital.com/#organization"
      }
    }
  ]
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }}
      />

      <main className="relative min-h-screen overflow-hidden text-ink">
        <div aria-hidden="true" className="checker-bg" />

        <header className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="eyebrow-pop mb-8 w-full max-w-3xl font-mono">
            Optinest Digital · Small Web Design & SEO Agency
          </p>

          <h1 className="hero-title max-w-5xl font-display text-[clamp(2.4rem,11vw,8rem)] uppercase leading-[0.9] tracking-tight">
            <span className="hero-line hero-line-top">Web Design & SEO</span>
            <br />
            <span className="hero-line hero-line-bottom">That Drives Growth</span>
          </h1>

          <p className="tagline-pop mt-6 max-w-3xl rounded-2xl border-2 border-ink/80 bg-mist/95 px-5 py-4 text-balance font-mono text-[0.98rem] font-bold leading-relaxed tracking-[0.02em] text-ink sm:text-base md:mt-7 md:px-6 md:text-xl">
            We build fast, SEO-friendly websites that help growing brands attract qualified traffic and turn visits into leads.
          </p>
          <section aria-label="Homepage actions" className="mt-10 w-full max-w-5xl md:mt-12">
            <section
              aria-label="Services call to action"
              className="mx-auto w-full max-w-3xl rounded-2xl border-2 border-ink/80 bg-[#fff8cf]/95 px-4 py-5 shadow-hard sm:px-6 sm:py-6"
            >
              <p className="font-display text-[clamp(1.4rem,3.8vw,2.1rem)] uppercase leading-[0.95] text-[#5f3f00]">
                Ready To Scale Faster?
              </p>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4f3f18] sm:text-base">
                Explore our growth-focused service offers and find the right path for traffic, design, and development.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <ScheduleCallModal
                  label="Schedule a Call"
                  className="inline-flex min-h-12 items-center gap-3 rounded-full border-2 border-ink bg-ink px-6 py-2.5 font-mono text-[0.75rem] font-bold uppercase tracking-[0.16em] text-mist transition hover:-translate-y-1 hover:shadow-hard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 sm:text-xs"
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    →
                  </span>
                </ScheduleCallModal>
                <Link
                  href="/services"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#8a5a00] bg-[#c98f00] px-7 py-2.5 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#b98200] hover:shadow-hard sm:text-xs"
                >
                  Explore Growth Services
                </Link>
              </div>
            </section>

          </section>
        </header>
      </main>
    </>
  );
}

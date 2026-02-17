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
        name: "Jeff Gab",
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

type IconProps = {
  className?: string;
};

const scheduleCallSubject = "Schedule a Call - New Project Inquiry";
const scheduleCallBody = [
  "Hi Optinest Digital,",
  "",
  "I would like to schedule a call about my project.",
  "",
  "Name:",
  "Company:",
  "Website:",
  "Service Needed (Web Design / SEO / Both):",
  "Estimated Budget:",
  "Timeline:",
  "Main Goals:",
  "Additional Details:",
  "Best Contact Number:",
  "Preferred Call Time:"
].join("\n");
const scheduleCallMailto = `mailto:optinestdigital@gmail.com?subject=${encodeURIComponent(scheduleCallSubject)}&body=${encodeURIComponent(scheduleCallBody)}`;

function FacebookIcon({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.438H7.078v-3.49h3.047V9.41c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.687.235 2.687.235V7.93H15.83c-1.492 0-1.957.925-1.957 1.874v2.268h3.328l-.531 3.49h-2.797V24C19.61 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function XIcon({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M18.902 1.153h3.68l-8.039 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
    </svg>
  );
}

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
            Building fast websites and strong SEO systems for brands ready to grow.
          </p>
          <section aria-label="Primary call to action" className="mt-10 md:mt-12">
            <a
              href={scheduleCallMailto}
              className="inline-flex items-center gap-3 rounded-full border-2 border-ink bg-ink px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-mist transition hover:-translate-y-1 hover:shadow-hard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 sm:gap-4 sm:px-8 sm:py-4 sm:text-sm"
            >
              Schedule a Call
              <span aria-hidden="true" className="text-2xl leading-none">
                →
              </span>
            </a>
          </section>

          <nav aria-label="Social links" className="mt-14 flex items-center gap-5 sm:mt-16 sm:gap-7">
            <a
              href="https://facebook.com/optinestdigital"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Optinest Digital on Facebook"
              className="text-[#1877f2] transition hover:-translate-y-1 hover:text-[#145fbd]"
            >
              <FacebookIcon className="h-8 w-8 sm:h-9 sm:w-9" />
            </a>
            <a
              href="https://x.com/optinestdigital"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Optinest Digital on X"
              className="text-[#0f1419] transition hover:-translate-y-1 hover:text-[#000]"
            >
              <XIcon className="h-8 w-8 sm:h-9 sm:w-9" />
            </a>
          </nav>
        </header>
      </main>
    </>
  );
}

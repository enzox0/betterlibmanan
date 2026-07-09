import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  FaUsers,
  FaCode,
  FaLock,
  FaGithub,
  FaDiscord,
  FaEnvelope,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaDatabase,
  FaEye,
  FaBalanceScale,
  FaGlobeAsia,
} from "react-icons/fa";
import joinUsLottie from "@/assets/lottiefiles/join-us.lottie?url";
import aboutLottie from "@/assets/lottiefiles/about.lottie?url";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

const fadeUpDelay = (delay: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay },
});

const pillars = [
  {
    icon: FaEye,
    title: "Transparency",
    description:
      "Government budgets, programs, and spending — published in plain language so every resident can understand where public funds go.",
  },
  {
    icon: FaDatabase,
    title: "Open Data",
    description:
      "All information is sourced from official government portals and made freely accessible, structured, and machine-readable.",
  },
  {
    icon: FaBalanceScale,
    title: "Accountability",
    description:
      "Track the promises of local officials, monitor ordinances, and follow the progress of public infrastructure projects.",
  },
  {
    icon: FaUsers,
    title: "Community",
    description:
      "Built by residents, for residents. Everyone is welcome to contribute data, report errors, or join the volunteer team.",
  },
];

const betterGovTools = [
  {
    name: "Transparency Portal",
    description: "Making government data accessible to every Filipino.",
    href: "https://transparency.bettergov.ph/",
  },
  {
    name: "Open Data Portal",
    description:
      "Centralizing government datasets for research and accountability.",
    href: "https://data.bettergov.ph/",
  },
  {
    name: "2026 Budget Analysis",
    description: "₱6.3T analyzed and made understandable.",
    href: "https://2026-budget.bettergov.ph/",
  },
  {
    name: "PhilGEPS Browser",
    description: "Browse Philippine procurement data openly.",
    href: "https://philgeps.bettergov.ph/",
  },
  {
    name: "Political Dynasty Tracker",
    description: "Research and data on political dynasties in the Philippines.",
    href: "https://visualizations.bettergov.ph/dynasty",
  },
  {
    name: "BetterLGU Directory",
    description:
      "A directory of civic transparency portals across the country.",
    href: "https://lgu.bettergov.ph/",
  },
];

const betterLGUs = [
  { name: "Better Solano", href: "https://bettersolano.org" },
  { name: "Better Cainta", href: "https://bettercainta.org" },
  { name: "Better Calauan", href: "https://bettercalauan.org" },
  { name: "Better General Trias", href: "https://bettergeneraltrias.org" },
  { name: "Better Allen", href: "https://betterallen.org" },
  { name: "Better Aparri", href: "https://betteraparri.org" },
  { name: "Better LB", href: "https://betterlb.org" },
  { name: "Better San Pablo", href: "https://bettersanpablo.org" },
];

const contributeItems = [
  {
    icon: FaCode,
    title: "Contribute Code",
    description:
      "The entire platform is open source. Pick up an issue, send a pull request, or suggest a new feature on GitHub.",
    cta: "View on GitHub",
    href: "https://github.com/bettergovph",
  },
  {
    icon: FaDatabase,
    title: "Contribute Data",
    description:
      "Help keep the information current — budgets, ordinances, officials, and barangay data are always evolving.",
    cta: "Email the team",
    href: "mailto:volunteers@bettergov.ph",
  },
  {
    icon: FaEnvelope,
    title: "Volunteer",
    description:
      "Not a developer? You can still help with research, writing, translation, or outreach in the community.",
    cta: "Get in touch",
    href: "mailto:volunteers@bettergov.ph",
  },
];

export function AboutSection() {
  return (
    <div className="bg-white">
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center lg:text-left leading-tight">
            About <span className="text-yellow-400">Better</span>
            <span className="text-blue-400">Libmanan</span>.org
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-300 text-center lg:text-left leading-relaxed">
            A free, volunteer-built civic transparency portal for the people of
            Libmanan, Camarines Sur — part of the{" "}
            <a
              href="https://bettergov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              BetterGov.ph
            </a>{" "}
            open governance movement.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
              Cost to residents: <span className="font-bold">₱0</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-900/40 border border-blue-700/40 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium">
              <FaLock size={12} />
              MIT + CC BY 4.0
            </div>
            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium">
              <FaMapMarkerAlt size={12} />
              Libmanan, Camarines Sur
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12"
          >
            {/* Lottie — left side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="w-48 sm:w-60 lg:w-64 shrink-0"
              aria-hidden="true"
            >
              <DotLottieReact
                src={aboutLottie}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </motion.div>

            {/* Text */}
            <div className="w-full lg:flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
                What is BetterLibmanan?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-500 max-w-3xl leading-relaxed">
                BetterLibmanan.org is an independent, civic-technology website
                that makes local government information about Libmanan —
                budgets, ordinances, officials, barangay data, and public
                services — easy for any resident to find and understand.
              </p>
              <p className="mt-3 text-sm sm:text-base text-neutral-500 max-w-3xl leading-relaxed">
                It is not an official LGU website. It is built by volunteers and
                is entirely open source. All data is sourced from public
                government portals such as the Commission on Audit (COA), the
                DBM Open Data portal, the Official Gazette, and LGU Libmanan's
                own published records.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  {...fadeUpDelay(index * 0.08)}
                  className="rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 mb-4">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 lg:items-start"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/bettergov-logo.svg"
                  alt="BetterGov.ph"
                  className="h-8 w-auto opacity-80"
                />
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Our movement
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
                Powered by BetterGov.ph
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-500 leading-relaxed max-w-2xl">
                BetterGov.ph is a volunteer-driven civic technology and open
                source movement making Philippine government data accessible,
                understandable, and actionable. It is not an organization — it
                is a network of developers, researchers, and citizens who
                believe every Filipino deserves transparent, accountable
                government.
              </p>
              <p className="mt-3 text-sm sm:text-base text-neutral-500 leading-relaxed max-w-2xl">
                BetterLibmanan is part of the{" "}
                <strong className="text-neutral-700">Better LGU</strong> program
                — a community-maintained network of civic portals covering local
                governments across the Philippines. Each portal is independently
                run by local volunteers and listed in the{" "}
                <a
                  href="https://lgu.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  BetterLGU Directory
                </a>
                .
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://about.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  Learn about BetterGov.ph
                  <FaExternalLinkAlt size={11} />
                </a>
                <a
                  href="https://lgu.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-neutral-400 transition-colors"
                >
                  Browse Better LGU portals
                  <FaGlobeAsia size={11} />
                </a>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                BetterGov.ph tools
              </p>
              {betterGovTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-900 hover:shadow-sm group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <FaExternalLinkAlt size={11} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {tool.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
              The Better LGU Network
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-500 max-w-3xl leading-relaxed">
              BetterLibmanan is part of a growing network of civic portals built
              by volunteers across the Philippines. Each portal covers a
              different city or municipality — all free, all open source, all
              maintained by the community.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {betterLGUs.map((lgu, index) => (
              <motion.a
                key={lgu.name}
                href={lgu.href}
                target="_blank"
                rel="noopener noreferrer"
                {...fadeUpDelay(index * 0.06)}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-900 hover:shadow-sm group"
              >
                <span>{lgu.name}</span>
                <FaExternalLinkAlt
                  size={10}
                  className="text-neutral-400 group-hover:text-neutral-700 transition-colors"
                />
              </motion.a>
            ))}
          </div>

          <motion.div {...fadeUpDelay(0.4)} className="mt-5">
            <a
              href="https://lgu.bettergov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              <span className="mr-2">→</span>
              View all Better LGU portals
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              What we stand for
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-2xl">
              These principles guide everything we build and publish.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-px bg-neutral-800 rounded-2xl overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Filipino-First",
                body: "Built by Filipinos, for Filipinos. Content is written for residents, not bureaucrats.",
              },
              {
                title: "Radically Open",
                body: "All code is MIT licensed. All public data is CC BY 4.0. Everything is on GitHub.",
              },
              {
                title: "Non-Partisan",
                body: "We publish facts, not endorsements. No political advertising. No sponsored content.",
              },
              {
                title: "Community-Driven",
                body: "Every change is made by volunteers. The community decides what gets built.",
              },
              {
                title: "Evidence-Based",
                body: "Every claim is sourced. We cite official records and link to primary documents.",
              },
              {
                title: "Accessible",
                body: "Designed to work on low-end devices and slow connections across Camarines Sur.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                {...fadeUpDelay(index * 0.07)}
                className="bg-gray-900 p-6"
              >
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
              Get involved
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
              BetterLibmanan is only as good as the people who build and
              maintain it. Here's how you can help.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {contributeItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  {...fadeUpDelay(index * 0.1)}
                  className="rounded-xl border border-neutral-200 bg-white p-6 flex flex-col"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 mb-4">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    {item.cta}
                    <FaExternalLinkAlt size={10} />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
              Where our data comes from
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
              All information published on BetterLibmanan is sourced from
              official public government portals. We do not create or modify
              primary data.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Commission on Audit (COA)",
                href: "https://www.coa.gov.ph",
              },
              {
                name: "DBM Open Data Portal",
                href: "https://opendata.dbm.gov.ph",
              },
              { name: "Open Data Philippines", href: "https://data.gov.ph" },
              {
                name: "Freedom of Information (FOI)",
                href: "https://foi.gov.ph",
              },
              { name: "BLGF Portal", href: "https://blgf.gov.ph" },
              {
                name: "Official Gazette of the Philippines",
                href: "https://www.officialgazette.gov.ph",
              },
            ].map((source, index) => (
              <motion.a
                key={source.name}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                {...fadeUpDelay(index * 0.06)}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-900 hover:shadow-sm group"
              >
                <span>{source.name}</span>
                <FaExternalLinkAlt
                  size={10}
                  className="text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0 ml-2"
                />
              </motion.a>
            ))}
          </div>

          <motion.p
            {...fadeUpDelay(0.4)}
            className="mt-6 text-xs text-neutral-400 max-w-2xl leading-relaxed"
          >
            If you find a data error or outdated information, please{" "}
            <a
              href="mailto:volunteers@bettergov.ph"
              className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2 transition-colors"
            >
              contact the team
            </a>{" "}
            or open an issue on GitHub so we can fix it promptly.
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-gray-900 border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12"
          >
            {/* Lottie — left side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="w-48 sm:w-60 lg:w-64 shrink-0"
              aria-hidden="true"
            >
              <DotLottieReact
                src={joinUsLottie}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </motion.div>

            {/* Text + CTAs */}
            <div className="text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Built with love by volunteers from Libmanan
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
                This platform will always be free. Join hundreds of civic-minded
                Filipinos who believe government should work for the people.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="https://about.bettergov.ph/volunteer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <FaEnvelope size={13} />
                  Volunteer with us
                </a>
                <a
                  href="https://github.com/bettergovph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:border-white transition-colors"
                >
                  <FaGithub size={13} />
                  GitHub
                </a>
                <a
                  href="https://discord.gg/bettergovph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:border-white transition-colors"
                >
                  <FaDiscord size={13} />
                  Discord
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

AboutSection.displayName = "AboutSection";

export default AboutSection;

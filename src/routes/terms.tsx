import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Philippine HIV Care Directory" },
      {
        name: "description",
        content:
          "Terms of Use governing access to the Philippine HIV Care Directory, an independent public-information mirror by Ramon Logan Jr.",
      },
      { property: "og:title", content: "Terms of Use — PH HIV Care Directory" },
      {
        property: "og:description",
        content: "User responsibilities, limitations of liability, and intellectual property terms.",
      },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-muted">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-on-surface sm:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-on-surface-muted">
          Last updated: 8 June 2026 · Effective immediately upon use of this Platform.
        </p>
      </header>

      <div className="prose-content space-y-8 text-[15px] leading-relaxed text-on-surface">
        <Section title="1. Acceptance of Terms">
          <p>
            These Terms of Use (&ldquo;Terms&rdquo;) form a binding legal agreement between you
            (&ldquo;you&rdquo;, &ldquo;User&rdquo;) and Ramon Logan Jr. (&ldquo;Operator&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;), the independent developer and operator of the
            Philippine HIV Care Directory (the &ldquo;Platform&rdquo;). By accessing, browsing,
            or otherwise using the Platform, you agree to be bound by these Terms in their
            entirety. If you do not agree, you must discontinue use immediately.
          </p>
        </Section>

        <Section title="2. Nature of the Platform; No Affiliation">
          <p>
            The Platform is an <strong>independent, non-commercial public-information mirror</strong> of
            facility data originating from the Department of Health of the Republic of the
            Philippines (&ldquo;DOH&rdquo;), specifically Department Circular No. 2026-0065
            (4 February 2026). The Platform is <strong>not</strong> operated, endorsed,
            sponsored, certified, or otherwise affiliated with the DOH, the Government of the
            Republic of the Philippines, or any of their attached agencies, bureaus, hospitals,
            or treatment hubs.
          </p>
          <p>
            All references to government circulars, facility names, and official designations are
            used solely for the purposes of identification, public education, and journalistic
            mirroring under the fair-use doctrine and Section 184 of Republic Act No. 8293
            (Intellectual Property Code of the Philippines).
          </p>
        </Section>

        <Section title="3. Not Medical Advice">
          <p>
            Information provided through the Platform is for{" "}
            <strong>general informational purposes only</strong> and does not constitute medical,
            clinical, diagnostic, therapeutic, legal, or professional advice. The Platform is{" "}
            <strong>not a substitute</strong> for consultation with a licensed physician, an
            accredited HIV treatment hub, or any qualified healthcare professional.
          </p>
          <p>
            You must always independently verify facility schedules, services, eligibility
            requirements, and contact details directly with the facility before relying on them.
            Operating hours, contact numbers, and service availability change without notice and
            outside the Operator&rsquo;s control.
          </p>
        </Section>

        <Section title="4. User Responsibilities">
          <p>You agree that you will not, and will not permit any third party to:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              Use the Platform for any unlawful, harassing, defamatory, discriminatory, or
              fraudulent purpose;
            </li>
            <li>
              Scrape, harvest, or extract data using automated means (bots, crawlers, AI agents)
              at a rate or volume that degrades Platform availability for other users;
            </li>
            <li>
              Use facility contact information for marketing, solicitation, spam, or any purpose
              not directly related to seeking or providing HIV care;
            </li>
            <li>
              Disclose, post, or transmit any personally identifiable information of patients,
              healthcare workers, or third parties through any feature of the Platform;
            </li>
            <li>
              Reverse-engineer, decompile, or attempt to derive the source code, design, or
              underlying ideas of the Platform, except where expressly permitted by Philippine
              law;
            </li>
            <li>
              Circumvent, disable, or otherwise interfere with security-related features of the
              Platform; or
            </li>
            <li>
              Misrepresent the Platform, its data, or its Operator in any public communication,
              including by implying official DOH endorsement.
            </li>
          </ul>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            Subject to the rights of the DOH in the underlying public-domain facility data,
            <strong> all original software code, user interface design, layout, typography
            choices, iconography, copy text, data structuring, taxonomies, and aggregations </strong>
            on the Platform are the exclusive intellectual property of Ramon Logan Jr. and are
            protected under Republic Act No. 8293, the Berne Convention, and applicable
            international copyright treaties.
          </p>
          <p>
            You are granted a <strong>limited, revocable, non-exclusive, non-transferable, and
            non-sublicensable license</strong> to access and use the Platform solely for personal,
            non-commercial informational purposes. No other rights are granted. Any commercial
            reuse, mirroring, white-labeling, or derivative product requires the Operator&rsquo;s
            prior written consent.
          </p>
          <p>
            All trademarks, service marks, and logos of the DOH and any referenced facilities
            remain the property of their respective owners and are used here solely for
            identification.
          </p>
        </Section>

        <Section title="6. Disclaimers; &ldquo;As Is&rdquo; Basis">
          <p>
            THE PLATFORM AND ALL CONTENT ARE PROVIDED <strong>&ldquo;AS IS&rdquo; AND
            &ldquo;AS AVAILABLE&rdquo;</strong> WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
            IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, COMPLETENESS, TIMELINESS, NON-INFRINGEMENT,
            OR UNINTERRUPTED AVAILABILITY. The Operator makes no representation that the Platform
            is free of viruses or other harmful components.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by Philippine law, in <strong>no event shall Ramon
            Logan Jr.</strong>, his successors, heirs, contractors, or affiliates be liable to
            you or any third party for any direct, indirect, incidental, consequential, special,
            exemplary, punitive, or moral damages, including but not limited to lost profits,
            lost data, medical expenses, missed appointments, delayed treatment, emotional
            distress, or reputational harm, arising out of or related to:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Your access to, use of, or inability to use the Platform;</li>
            <li>Reliance on any information presented on the Platform;</li>
            <li>Errors, inaccuracies, omissions, or delays in facility listings;</li>
            <li>Any unauthorized access to or alteration of your transmissions or data;</li>
            <li>Acts, omissions, or services of any third-party facility listed on the Platform;</li>
            <li>Any other matter relating to the Platform.</li>
          </ul>
          <p>
            The aggregate liability of the Operator, if any, shall not exceed One Hundred Pesos
            (PHP 100.00).
          </p>
        </Section>

        <Section title="8. Indemnification">
          <p>
            You agree to defend, indemnify, and hold harmless Ramon Logan Jr. and any persons
            acting on his behalf from any claim, demand, loss, liability, damage, or expense
            (including reasonable attorney&rsquo;s fees) arising from (a) your use or misuse of
            the Platform, (b) your violation of these Terms, or (c) your violation of any law or
            third-party right.
          </p>
        </Section>

        <Section title="9. Modifications">
          <p>
            The Operator may modify, suspend, or discontinue the Platform, in whole or in part,
            at any time without notice and without liability. These Terms may be updated at the
            Operator&rsquo;s discretion; continued use of the Platform after changes constitutes
            acceptance.
          </p>
        </Section>

        <Section title="10. Governing Law; Venue">
          <p>
            These Terms are governed by and construed in accordance with the laws of the Republic
            of the Philippines, without regard to its conflict-of-law provisions. Any dispute,
            controversy, or claim arising out of or relating to these Terms shall be submitted to
            the <strong>exclusive jurisdiction of the proper courts of the City of Manila,
            Philippines</strong>, to the exclusion of any other venue.
          </p>
        </Section>

        <Section title="11. Severability">
          <p>
            If any provision of these Terms is held invalid or unenforceable, the remaining
            provisions shall continue in full force and effect.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For takedown notices, legal correspondence, or general inquiries regarding these
            Terms, contact the Operator at{" "}
            <a
              href="https://www.ramonloganjr.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              ramonloganjr.com
            </a>
            .
          </p>
        </Section>

        <p className="pt-6 text-sm text-on-surface-muted">
          See also the{" "}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold tracking-tight text-on-surface">{title}</h2>
      <div className="space-y-3 text-on-surface-muted">{children}</div>
    </section>
  );
}

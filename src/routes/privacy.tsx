import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Philippine HIV Care Philippines" },
      {
        name: "description",
        content:
          "How the Philippine HIV Care Philippines handles personal data, aligned with the Philippine Data Privacy Act of 2012 (RA 10173).",
      },
      { property: "og:title", content: "Privacy Policy — PH HIV Care Philippines" },
      {
        property: "og:description",
        content: "Data handling practices, user rights under RA 10173, and contact channels.",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-muted">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-on-surface sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-on-surface-muted">
          Last updated: 8 June 2026 · Compliant with Republic Act No. 10173 (Data Privacy Act of
          2012) and the issuances of the National Privacy Commission.
        </p>
      </header>

      <div className="space-y-8 text-[15px] leading-relaxed text-on-surface">
        <Section title="1. Who We Are (Personal Information Controller)">
          <p>
            The Philippine HIV Care Philippines (the &ldquo;Platform&rdquo;) is operated by{" "}
            <strong>Ramon Logan Jr.</strong> as a sole, independent, non-commercial public-information
            project. For purposes of Republic Act No. 10173, the &ldquo;Data Privacy Act of 2012&rdquo;
            (&ldquo;DPA&rdquo;), Ramon Logan Jr. is the <strong>Personal Information Controller</strong>{" "}
            (&ldquo;PIC&rdquo;).
          </p>
        </Section>

        <Section title="2. Our Privacy Commitment">
          <p>
            We are committed to the principles of <strong>transparency, legitimate purpose, and
            proportionality</strong> set out in Section 11 of the DPA. We collect and process the
            minimum personal data strictly necessary to operate the Platform safely.
          </p>
        </Section>

        <Section title="3. What Data We Collect">
          <p>
            The Platform is a <strong>read-only directory</strong>. It does not require an account
            and does not knowingly collect sensitive personal information from users. The categories
            of data that may be processed are limited to:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Technical access logs</strong> &mdash; IP address (truncated where feasible),
              user-agent string, requested URL, timestamp, and HTTP referer, retained by our hosting
              provider for security, abuse prevention, and aggregate analytics for a period not
              exceeding ninety (90) days;
            </li>
            <li>
              <strong>Theme preference</strong> &mdash; stored locally in your browser
              (<code>localStorage</code>) and never transmitted to us;
            </li>
            <li>
              <strong>Voluntary correspondence</strong> &mdash; if you choose to email the
              Operator, we will process the contact information and message contents you provide.
            </li>
          </ul>
          <p>
            <strong>We do not</strong> collect names, addresses, government IDs, health status, HIV
            status, sexual orientation, gender identity, biometric data, or any other category of
            <em> sensitive personal information</em> as defined in Section 3(l) of the DPA.
          </p>
        </Section>

        <Section title="4. Facility Data">
          <p>
            The Platform mirrors publicly available facility information (institutional name,
            address, designated services, and official contact persons in their professional
            capacity) from DOH Department Circular No. 2026-0065 and other public records. This
            data concerns institutions and individuals in their{" "}
            <strong>professional/official capacity</strong> and is processed under the lawful basis
            of Section 12(f) of the DPA (legitimate interests in public health information access)
            and Section 4(c) (information relating to a person&rsquo;s position or function in a
            public office). Affected officers may request correction or de-listing using the
            contact channel below.
          </p>
        </Section>

        <Section title="5. Cookies and Tracking">
          <p>
            The Platform does <strong>not</strong> use third-party advertising cookies, behavioral
            tracking pixels, or cross-site fingerprinting. Only essential first-party browser
            storage (theme preference) is used.
          </p>
        </Section>

        <Section title="6. How We Use Data">
          <p>Personal data we lawfully hold is used solely to:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Operate, secure, and improve the Platform;</li>
            <li>Detect, prevent, and respond to abuse, fraud, or security incidents;</li>
            <li>Generate de-identified, aggregate usage statistics;</li>
            <li>Respond to your correspondence; and</li>
            <li>Comply with legal obligations and lawful orders.</li>
          </ul>
        </Section>

        <Section title="7. Disclosure to Third Parties">
          <p>
            We do <strong>not sell, rent, or trade</strong> personal data. Limited processing is
            performed on our behalf by our hosting and content-delivery providers, which act as
            <strong> Personal Information Processors</strong> bound by their own DPA-aligned
            obligations. Disclosure to law enforcement or regulators will occur only upon a valid
            subpoena, court order, or written demand under Philippine law.
          </p>
        </Section>

        <Section title="8. Cross-Border Transfers">
          <p>
            Hosting infrastructure may store or process data outside the Philippines. Where this
            occurs, we rely on contractual safeguards consistent with NPC Circular No. 2023-06 to
            ensure a comparable level of protection.
          </p>
        </Section>

        <Section title="9. Data Retention">
          <p>
            Access logs are retained for no more than ninety (90) days. Voluntary correspondence
            is retained only for the time reasonably necessary to address the inquiry or to comply
            with legal obligations.
          </p>
        </Section>

        <Section title="10. Security Measures">
          <p>
            We implement organizational, physical, and technical safeguards proportionate to the
            risk, including transport-layer encryption (HTTPS), least-privilege access, and
            secure-by-default hosting. No system is perfectly secure; you use the Platform at
            your own risk.
          </p>
        </Section>

        <Section title="11. Your Rights as a Data Subject">
          <p>
            Under Sections 16&ndash;19 of the DPA, you have the right to be informed, to object,
            to access, to rectification, to erasure or blocking, to damages, and to data
            portability, subject to lawful limitations. To exercise any of these rights, write to
            the Operator using the channel in Section 13 below. We will respond within a
            reasonable period not exceeding thirty (30) calendar days.
          </p>
        </Section>

        <Section title="12. Children">
          <p>
            The Platform is intended for a general audience. We do not knowingly target or
            collect personal data from children under fifteen (15) years of age. If you believe a
            child has provided personal data, please contact us so we may delete it.
          </p>
        </Section>

        <Section title="13. Contact &amp; Complaints">
          <p>
            For privacy questions, takedown requests, or to exercise your data-subject rights,
            contact the Operator through{" "}
            <a
              href="https://www.ramonloganjr.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              ramonloganjr.com
            </a>
            . If you believe your rights under the DPA have been violated and the matter cannot
            be resolved with us, you may file a complaint with the{" "}
            <strong>National Privacy Commission</strong> at{" "}
            <a
              href="https://privacy.gov.ph"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              privacy.gov.ph
            </a>
            .
          </p>
        </Section>

        <Section title="14. Updates to this Policy">
          <p>
            We may revise this Privacy Policy from time to time. Material changes will be
            indicated by updating the &ldquo;Last updated&rdquo; date above. Continued use of the
            Platform after revisions constitutes acceptance of the updated Policy.
          </p>
        </Section>

        <p className="pt-6 text-sm text-on-surface-muted">
          See also the{" "}
          <Link to="/terms" className="font-medium text-primary hover:underline">
            Terms of Use
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

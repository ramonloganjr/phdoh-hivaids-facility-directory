# Security Policy

The Philippine HIV Care Directory takes security seriously. This document explains how to report vulnerabilities and what to expect after disclosure.

## Supported Versions

Only the latest deployed version of the application receives security updates. There are no long-term support branches.

| Version          | Supported |
| ---------------- | --------- |
| `main` (current) | Yes       |
| Older revisions  | No        |

## Reporting a Vulnerability

**Please do not file public GitHub issues for security vulnerabilities.**

Report suspected vulnerabilities privately through one of the following channels:

- The contact form at <https://www.ramonloganjr.com>.
- GitHub's private vulnerability reporting feature on this repository (if enabled).

Include as much of the following as possible:

1. A clear description of the vulnerability and its potential impact.
2. Step-by-step reproduction instructions or a proof of concept.
3. The affected route, component, endpoint, or dependency.
4. The browser, operating system, and any relevant environment details.
5. Your name and contact information for follow-up (optional; anonymous reports are accepted).

## Disclosure Process

1. **Acknowledgement** within 72 hours of receipt.
2. **Triage and validation** within 7 calendar days.
3. **Fix and deployment** as soon as practicable, based on severity:
   - Critical: within 7 days.
   - High: within 14 days.
   - Medium: within 30 days.
   - Low: at the next scheduled release.
4. **Public disclosure** coordinated with the reporter, typically after a fix has been deployed.

We follow the principle of coordinated disclosure. Please give us reasonable time to address the issue before any public discussion.

## Scope

In scope:

- The web application source code and its deployment.
- Server functions and API routes under `src/routes/api/`.
- Build, CI, and deployment configuration files committed to this repository.

Out of scope:

- Third-party services (Vercel, Cloudflare, hosting providers) — report to the respective vendor.
- The underlying DOH data accuracy — file a `data-correction` issue instead.
- Social engineering, phishing, or physical attacks.
- Denial-of-service testing.
- Findings from automated scanners without a demonstrable, exploitable impact.

## Safe Harbor

Good-faith security research conducted within this scope will not result in legal action from the project owner. Please:

- Avoid privacy violations, destruction of data, and interruption or degradation of the service.
- Only interact with accounts you own or have explicit permission to access.
- Do not exploit a vulnerability beyond what is necessary to confirm its existence.

## Credit

Researchers who follow this policy are eligible to be credited in the project's release notes, with their permission.

---

Thank you for helping keep the Philippine HIV Care Directory and its users safe.

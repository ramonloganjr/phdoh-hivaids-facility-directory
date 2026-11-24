# Contributing

Thank you for considering a contribution to the Philippine HIV Care Directory, which makes accurate, official HIV care information easier to find for Filipinos. Contributions are welcome, particularly bug fixes, accessibility and performance improvements, documentation, and facility data corrections backed by an official source. Because people rely on this directory to find HIV care, accuracy and privacy take priority over new features.

## Code of Conduct

Be respectful, constructive, and patient. Harassment, discrimination, or stigmatizing language about HIV, gender, sexuality, or any group will not be tolerated. Maintainers reserve the right to remove comments, commits, issues, or pull requests that violate this principle.

## Reporting Issues

Search [existing issues](https://github.com/ramonloganjr/phdoh-hivaids-facility-directory/issues) first, then open a new one with the details below.

- **Bugs:** steps to reproduce, expected and actual behavior, the affected URL, your browser, OS, and device, and any screenshots or console errors.
- **Data corrections:** the facility, the incorrect field, and the official DOH issuance (department circular, memorandum, or LGU advisory) that supports the change. Facility data is never changed without a verifiable source.
- **Security vulnerabilities:** do not open a public issue. Report them privately as described in [SECURITY.md](./SECURITY.md).

## Proposing Enhancements

Open an issue before writing code for a new feature, refactor, or design change. Describe the problem, who it helps, and the proposed approach, and note any effect on accessibility, offline (PWA) behavior, SEO metadata, the Supabase schema, or the [mobile app](./README.md#mobile-app), which consumes this repository's data and API.

## Development Setup

Requires Node.js 24 (pinned in `package.json` to match production) and Bun 1.3 or newer.

```bash
bun install    # Installs from the committed bun.lock
bun run dev    # Starts the dev server at http://localhost:8080
```

- The committed `.env` contains only the public Supabase URL and publishable key. Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `VERCEL_DEPLOY_HOOK_URL`) belong in your local environment or the Vercel project settings, never in the repository or a `VITE_*` variable.
- `bunfig.toml` skips package versions published less than 24 hours ago. Add dependencies with `bun add` and commit the updated `bun.lock`.

## Where Changes Belong

| Change                               | Location                               | Convention                                                                                                                              |
| ------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Pages and URLs                       | `src/routes/`                          | File-based routing; `__root.tsx` is the only app shell. `src/routeTree.gen.ts` is generated: commit it, never edit it.                  |
| Admin pages                          | `src/routes/_authenticated/`           | Protected by the layout route, which redirects signed-out users to `/auth`.                                                             |
| Server logic called from the UI      | `src/lib/*.functions.ts`               | `createServerFn`, with every input checked by `.inputValidator()`.                                                                      |
| Server-only modules                  | `*.server.ts`                          | Never imported by client code; the build's import protection enforces this.                                                             |
| HTTP endpoints                       | `src/routes/api/`                      | Server route handlers. Keep `/api/public/*` responses backward compatible for the mobile app.                                           |
| Facility, FAQ, and surveillance data | `src/data/`                            | Typed datasets. Refresh coordinates with `bun run scripts/geocode-facilities.ts`.                                                       |
| Database schema                      | `supabase/migrations/`                 | Add a new timestamped migration, enable Row Level Security with explicit policies, and regenerate `src/integrations/supabase/types.ts`. |
| UI primitives and theme              | `src/components/ui/`, `src/styles.css` | shadcn/ui on Radix. Extend the semantic tokens rather than adding raw colors.                                                           |

## Coding Standards

- **TypeScript:** strict mode; avoid `any`.
- **Styling:** semantic Tailwind tokens (`bg-surface`, `text-on-surface`), never raw color classes such as `bg-white`.
- **Accessibility:** WCAG 2.1 AA, including keyboard access with visible focus, labeled controls, 4.5:1 text contrast, `prefers-reduced-motion` support, and touch targets of at least 44×44 px.
- **Metadata:** every route sets its own title (under 60 characters), description (under 160 characters), and absolute Open Graph image URL.
- **Copy:** user-facing text follows the [voice and tone guide](./docs/voice-and-tone.md), with no emojis or em dashes. Emojis are also kept out of source code and documentation unless they are part of facility data.
- **Privacy:** never log, store, or send personal or health information to third parties.

## Quality Checks

Run these before opening a pull request:

```bash
bun run lint            # ESLint, including Prettier formatting
bunx tsc --noEmit       # Type check
bun run build           # Production build (Node server preset locally)
bun run start:cpanel    # Serves the build at http://localhost:3000
bun run verify:meta     # In a second terminal: titles, Open Graph tags, canonical URLs, JSON-LD
```

There is no automated test suite yet, so also check your change in desktop Chrome and Safari, iOS Safari, and Android Chrome, in light and dark themes, and using only the keyboard.

## Submitting Pull Requests

1. Branch from `main` (for example, `fix/near-me-location-prompt`) and limit each pull request to one logical change.
2. Write commit messages in the imperative mood, such as `Add region filter to facilities page`.
3. In the description, explain what changed and why, link the related issue, list the checks you ran, and include light and dark screenshots for UI changes.
4. Vercel builds a preview deployment for each pull request; builds for pull requests from forks wait for maintainer approval. Review the preview before requesting a review.
5. Every merge to `main` deploys to production at [hivcareph.org](https://hivcareph.org), so `main` must always be releasable.

## License of Contributions

By submitting a pull request, you agree that your contribution will be licensed under the project's dual license (MIT for code, CC BY 4.0 for content), as described in the [LICENSE](./LICENSE) file. You confirm that you have the right to submit the contribution and that it does not infringe any third-party rights.

## Questions

Open an [issue](https://github.com/ramonloganjr/phdoh-hivaids-facility-directory/issues), or contact the maintainer, [Ramon Logan Jr.](https://ramonloganjr.com)

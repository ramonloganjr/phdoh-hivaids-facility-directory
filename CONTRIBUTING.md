# Contributing

Thank you for considering a contribution to the Philippine HIV Care Directory. This project exists to make accurate, official HIV care information easier to find for Filipinos, and contributions of all kinds are welcome.

## Code of Conduct

Be respectful, constructive, and patient. Harassment, discrimination, or stigmatizing language about HIV, gender, sexuality, or any group will not be tolerated. Maintainers reserve the right to remove comments, commits, issues, or pull requests that violate this principle.

## How to Contribute

### Reporting Issues

1. Search [existing issues](../../issues) to avoid duplicates.
2. Open a new issue using a clear, descriptive title.
3. Include:
   - A summary of the problem or proposal.
   - Steps to reproduce (for bugs).
   - Expected vs. actual behavior.
   - Screenshots, console errors, or network traces when relevant.
   - Browser, OS, and device information.

### Reporting Inaccurate Facility Data

If a facility detail (address, services offered, contact information) is incorrect, please open an issue labeled `data-correction` and reference the official DOH source (Department Circular, memorandum, or LGU advisory) that supports the correction. The project is a faithful mirror of official data and will not deviate from it without a verifiable source.

### Proposing Changes

For larger changes (new features, refactors, design overhauls), open a discussion or issue **before** writing code. This avoids wasted effort and ensures the change aligns with the project's direction.

### Pull Requests

1. Fork the repository and create a topic branch from `main`:
   ```bash
   git checkout -b feature/your-change
   ```
2. Install dependencies and verify the project runs:
   ```bash
   bun install
   bun run dev
   ```
3. Make your changes. Keep PRs focused — one logical change per PR.
4. Run linting and formatting before committing:
   ```bash
   bun run lint
   bun run format
   ```
5. Commit using clear, imperative messages (e.g., `Add region filter to facilities page`).
6. Push and open a pull request against `main`.
7. Fill out the PR template, link related issues, and describe testing performed.

### Coding Standards

- **TypeScript strict mode.** No `any` unless absolutely justified.
- **Design tokens only.** Use semantic Tailwind tokens (`bg-surface`, `text-on-surface`) — never raw color classes like `bg-white`.
- **Accessibility.** All new UI must be keyboard-navigable and meet WCAG 2.1 AA contrast.
- **Routing.** File-based routes under `src/routes/`. Do not edit `routeTree.gen.ts`.
- **Server logic.** Use `createServerFn` for internal RPC, `createFileRoute` under `src/routes/api/` for public endpoints.
- **No emojis** in source code, copy, or documentation unless explicitly part of facility data.
- **No em dashes** in user-facing copy.

### Commit Messages

Use imperative mood:

- Good: `Fix broken facility filter on iOS Safari`
- Avoid: `Fixed bug` or `Bug fixes`

### Testing

Manually verify your change on:

- Desktop Chrome and Safari.
- Mobile Safari (iOS) and Chrome (Android).
- Light and dark theme.
- Keyboard-only navigation.

## License of Contributions

By submitting a pull request, you agree that your contribution will be licensed under the project's dual license (MIT for code, CC BY 4.0 for content), as described in the [LICENSE](./LICENSE) file. You confirm that you have the right to submit the contribution and that it does not infringe any third-party rights.

## Questions

Open a discussion in the repository, or reach the author through <https://www.ramonloganjr.com>.

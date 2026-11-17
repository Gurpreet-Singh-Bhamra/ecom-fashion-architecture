# Quality Engineering & E2E Test Strategy

## Automation Pyramid

| Layer | Tooling | Execution Trigger | Coverage Focus |
| :--- | :--- | :--- | :--- |
| **Static Analysis** | TypeScript (`strict`), ESLint | Every commit / PR | Type safety, reducer exhaustiveness, hook rules |
| **Component / Unit** | Vitest | Every PR | Optimistic cart state transitions, rollback edge cases, currency math |
| **End-to-End (E2E)** | Playwright | PR merge to `main` & nightly | Critical checkout path, webhook failure mocks, mobile drawer navigation |
| **Accessibility** | `@axe-core/playwright` | Every PR | WCAG 2.1 AA compliance, keyboard focus traps, ARIA modal attributes |

---

## Critical Regression Gates

1. **Zero-Flake Network Mocking:** External payment and inventory endpoints are intercepted via `page.route()` during CI runs to deterministically test `409 Conflict` and `503 Service Unavailable` recovery states.
2. **Keyboard & Screen Reader Audits:** Automated assertions verify that slide-over cart drawers trap focus when open and return focus to the trigger button upon dismissal.
3. **Core Web Vitals Budget:** Lighthouse CI blocks merges if Largest Contentful Paint (LCP) exceeds 1.8s or Cumulative Layout Shift (CLS) exceeds 0.05.

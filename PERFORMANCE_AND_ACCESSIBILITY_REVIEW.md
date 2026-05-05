# DeepSkyn Performance and Accessibility Review

## Scope
This review covers the frontend application at a report level. It combines the performance metrics that should be tracked in production and the WCAG comparison for the implemented accessibility work.

## Performance Review

### Metrics to Track
The application now records metrics in the browser runtime so they can be reviewed consistently:
- `loadTimeMs`: initial page load duration from the navigation timing entry
- `domContentLoadedMs`: time to DOMContentLoaded from the same navigation entry
- `apiRequests[]`: request method, URL, status, duration, and timestamp for each Axios call through the shared client

### Collection Points
- Initial load time is captured once when the app boots in `src/app/App.tsx`.
- API response time is captured centrally in `src/app/api/http.ts`.
- The collected snapshot is exposed on `window.__deepskynPerformanceMetrics__` for debugging, review, or export.

### What to Report
When presenting the project, record these numbers for the same environment and route set:
- Landing page load time
- Dashboard route load time
- Lighthouse performance score for desktop and mobile
- Largest Contentful Paint, Time to Interactive, and Cumulative Layout Shift
- API response times for the main auth, dashboard, and chatbot flows

### Current Assessment
- The app has a single shared Axios client, so API timing is measured in one place instead of being scattered across pages.
- The app uses route-based code splitting with lazy-loaded pages, which reduces initial bundle pressure.
- Heavy interactive sections are isolated behind lazy imports and suspense boundaries.
- Final Lighthouse and real-user values still need to be run in the target environment; this report documents the collection path so the numbers can be added consistently.

## WCAG Comparison

### Overall Compliance Level
The application is currently best described as **WCAG 2.1 Level AA aligned, with partial manual audit coverage**.

### Comparison Summary
| WCAG Area | Current State | Compliance Level | Notes |
| --- | --- | --- | --- |
| Perceivable | Strong color system, text scaling, alt text, and theme contrast controls | Largely met | Good coverage in core UI, but production contrast should still be verified with tooling |
| Operable | Keyboard navigation, skip link, focus states, dialogs, and menu handling | Met in core flows | Menu and dialog patterns are implemented consistently |
| Understandable | Semantic labels, form hints, live announcements, localized copy | Mostly met | Some content-heavy pages still need final content review |
| Robust | ARIA landmarks, proper roles, and screen reader announcements | Met in core flows | Shared accessibility primitives help keep behavior consistent |

### Improvements Made
- Added a theme system with light, dark, and high-contrast modes.
- Added text-size controls and responsive typography support.
- Added a skip-to-content link and more explicit navigation labels.
- Added accessible dialogs with focus trapping and Escape-key dismissal.
- Added live announcements for route changes and settings changes.
- Added form labels, `aria-describedby`, and `aria-invalid` patterns where forms are used.

### Remaining Gaps
- A full third-party audit is still needed for production-grade scoring.
- Chart-heavy and data-dense screens should be manually tested with a screen reader.
- Lighthouse and keyboard-only checks should be repeated after backend data is connected in staging.

## Recommended Presentation Notes
Use the following talking points during review:
- Performance is now measured from one shared client, so API timings are comparable across screens.
- The app uses lazy loading to keep first render smaller.
- Accessibility work targets WCAG 2.1 AA and focuses on keyboard access, contrast, and screen reader support.
- The strongest remaining work is final verification: Lighthouse, real-user load data, and a full manual WCAG pass.
# Browser QA report

## Verdict

INCONCLUSIVE for visual regression because this workspace has no approved before/baseline captures. The current implementation passes the functional, responsive and accessibility checks listed below.

## Rendered coverage

- 390x844: exact emulated mobile viewport; no horizontal overflow or clipped primary controls.
- 768x1024: exact emulated tablet viewport; balanced hero crop and responsive navigation.
- 1440x900: exact desktop viewport; complete navigation and hero content visible above the fold.
- Desktop and mobile service grids and gallery layouts were also inspected in the live browser.

## Interaction coverage

- Mobile menu: opens from the hamburger, moves focus to the first link, closes with Escape and restores focus.
- Pricing tabs: ArrowRight moves both focus and the selected panel.
- Gallery lightbox: Enter opens, Escape closes, close control receives focus and the originating tile receives focus again.
- Primary reservation, service, phone and route affordances remained visible and reachable at their intended breakpoints.

## Automated checks

- Lighthouse desktop: Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100.
- Lighthouse mobile: Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100.
- JavaScript syntax check passed.
- All local image, video, stylesheet and script references resolve.
- No `transition: all` declarations remain.
- The local frontend evidence checker passed `design-evidence.json`.

## Known limits

- There is no approved historical screenshot baseline, so pixel-diff regression status cannot be asserted.
- External Google Fonts and Google Maps availability still depends on the visitor's network and third-party service.

## Mobile device matrix — 2026-11-07

### Devices rendered

- iPhone SE: 375x667, iPhone Safari user agent, touch enabled.
- iPhone 15 Pro: 393x852, iPhone Safari user agent, touch enabled.
- Samsung Galaxy S23: 360x780, Android Chrome user agent, touch enabled.
- Google Pixel 9: 412x915, Android Chrome user agent, touch enabled.
- iPhone and Android landscape orientations were also smoke-tested for horizontal overflow.

### Passing checks

- No document-level horizontal overflow on any portrait or landscape viewport.
- iPhone 15 Pro and Pixel 9 hero content, actions, hours and fixed bottom action bar remain separated and readable.
- Mobile gallery contains five items, reflows correctly and opens inside a viewport-sized lightbox.
- The lightbox receives focus, closes with Escape and restores focus.
- The mobile menu receives focus, closes with Escape and restores focus to the hamburger.
- The iPhone SE menu is vertically scrollable, so its final phone link remains reachable on the short viewport.
- Console: no errors, warnings or browser issues on the final Android navigation.
- Network: 31 requests checked; no failed requests.
- Mobile Lighthouse: Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100.
- Local Pixel 9 performance smoke trace: LCP 228 ms and CLS 0.01. INP was not available because the trace did not contain a qualifying field interaction.

### Findings

1. iPhone SE 375x667: the hero hours pill overlaps the scroll indicator by about 44 px, and the scroll indicator extends about 57 px behind the fixed bottom action bar.
2. Galaxy S23 360x780: the hero hours pill and scroll indicator overlap by about 27 px.
3. The hamburger's measured clickable box is 32x24 px. It meets the WCAG 2.2 AA 24 px minimum at the boundary but is smaller than the commonly recommended 44x44 px comfortable mobile target.
4. In phone landscape widths above 768 px the fixed bottom action bar is hidden by the current width-based breakpoint. The page remains usable and has no horizontal overflow.

### Platform limitation

The iPhone checks use Chrome device metrics and an iPhone Safari user agent. This verifies responsive layout, touch geometry and browser behavior in Chromium, but it is not a real WebKit/Safari run on physical iOS hardware.

# Implementation Plan: Pro Theme System

## Overview

Extend the existing theme mechanism from a color-swap system into a structurally differentiated storefront layout system. All changes are purely frontend TypeScript/React. The implementation builds incrementally: types first, then theme definitions, then rendering components (nav, card, typography, spacing), then settings UI, then enforcement.

## Tasks

- [-] 1. Extend ThemeLayout types and update theme definitions
  - [ ] 1.1 Extend `ThemeLayout` interface in `src/utils/themes.ts` with four new fields
    - Add `navStyle: 'minimal' | 'centered-logo' | 'inline-search'`
    - Add `typographyScale: 'compact' | 'editorial' | 'display'`
    - Add `cardAnatomy: 'portrait' | 'landscape' | 'square-overlay' | 'editorial-row'`
    - Add `sectionSpacing: 'tight' | 'relaxed' | 'airy'`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [x] 1.2 Update all 7 theme definitions in `src/utils/themes.ts` with the new layout fields
    - classic: `navStyle: 'minimal'`, `typographyScale: 'editorial'`, `cardAnatomy: 'portrait'`, `sectionSpacing: 'relaxed'`
    - slate: `navStyle: 'centered-logo'`, `typographyScale: 'display'`, `cardAnatomy: 'square-overlay'`, `sectionSpacing: 'airy'`
    - rose: `navStyle: 'minimal'`, `typographyScale: 'editorial'`, `cardAnatomy: 'portrait'`, `sectionSpacing: 'relaxed'`
    - forest: `navStyle: 'inline-search'`, `typographyScale: 'compact'`, `cardAnatomy: 'editorial-row'`, `sectionSpacing: 'tight'`
    - ocean: `navStyle: 'centered-logo'`, `typographyScale: 'editorial'`, `cardAnatomy: 'landscape'`, `sectionSpacing: 'relaxed'`
    - amber: `navStyle: 'minimal'`, `typographyScale: 'compact'`, `cardAnatomy: 'square-overlay'`, `sectionSpacing: 'tight'`
    - vibe: `navStyle: 'centered-logo'`, `typographyScale: 'display'`, `cardAnatomy: 'editorial-row'`, `sectionSpacing: 'airy'`
    - _Requirements: 2.5, 7.1–7.7, 11.5_

  - [ ]* 1.3 Write property test: every theme definition satisfies the complete ThemeLayout interface
    - **Property: All themes have all required ThemeLayout fields with valid values**
    - **Validates: Requirements 2.5, 2.6, 7.1–7.7**

- [ ] 2. Implement theme-aware Nav component
  - [x] 2.1 Create `src/components/storefront/Nav.tsx` with three `navStyle` variants
    - `'minimal'`: store name left-aligned, transparent background until scroll > 40px, then transitions to `ThemeTokens.navBg`; no border until scrolled
    - `'centered-logo'`: store name/logo centered, always-visible background panel using `ThemeTokens.navBg`
    - `'inline-search'`: store name left, inline search `<input>` right; collapses to search icon below 640px viewport with tap-to-expand
    - Apply `ThemeTokens.navBg`, `ThemeTokens.navBorder`, `ThemeTokens.navText` on all variants
    - Minimum touch target 44×44px for all interactive nav elements
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.4, 10.6_

  - [ ]* 2.2 Write unit tests for Nav scroll behavior and responsive collapse
    - Test minimal nav: transparent at 0px scroll, solid background after 40px scroll
    - Test inline-search nav: search input visible ≥640px, icon-only <640px
    - _Requirements: 3.5, 3.6, 10.4_

- [ ] 3. Implement theme-aware ProductCard component
  - [x] 3.1 Create `src/components/storefront/ProductCard.tsx` with four `cardAnatomy` variants
    - `'portrait'`: tall image aspect-ratio 3:4, product name and price below
    - `'landscape'`: wide image aspect-ratio 16:9 or 4:3, compact text row below; minimum image height 120px on mobile
    - `'square-overlay'`: 1:1 image with product name and price overlaid on bottom via gradient scrim
    - `'editorial-row'`: horizontal row, fixed-width square thumbnail left, text content right
    - Apply `ThemeTokens.cardBg`, `ThemeTokens.cardBorder`, `ThemeTokens.cardShadow`, `ThemeTokens.cardImageBg` on all variants
    - Show "Out of Stock" indicator on all variants when `product.stock === 0`
    - "Order on WhatsApp" button: keyboard-focusable, minimum 44×44px touch target on all variants
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.3, 10.6_

  - [ ]* 3.2 Write property test: ProductCard renders correct image aspect ratio per cardAnatomy
    - **Property: For any product and any cardAnatomy value, the image container has the correct aspect ratio class**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ]* 3.3 Write unit tests for ProductCard out-of-stock and accessibility
    - Test "Out of Stock" badge appears on all four anatomy variants when `stock === 0`
    - Test WhatsApp button has `min-h-[44px]` and is reachable via keyboard focus
    - _Requirements: 4.6, 4.7_

- [ ] 4. Implement typography scale and section spacing helpers
  - [x] 4.1 Create `src/utils/themeHelpers.ts` with `getTypographyClasses` and `getSectionSpacingClass` utilities
    - `getTypographyClasses(scale)`: returns `{ productName, sectionHeading, heroHeading, productMeta, priceLabel }` Tailwind class strings
      - `'compact'`: productName `text-sm`, sectionHeading `text-xl`, tight line-heights
      - `'editorial'`: productName `text-base`, sectionHeading `text-2xl`, relaxed line-heights
      - `'display'`: productName `text-lg`, sectionHeading `text-3xl`, generous line-heights
    - `getSectionSpacingClass(spacing)`: returns margin-bottom class string
      - `'tight'` → `mb-12`, `'relaxed'` → `mb-20`, `'airy'` → `mb-32`
    - Fall back to `'editorial'` if `typographyScale` is undefined
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.2 Write property tests for typography and spacing helpers
    - **Property: `getTypographyClasses` returns non-empty strings for all valid scale values**
    - **Property: `getSectionSpacingClass` returns the correct mb-* class for each spacing value**
    - **Property: `getTypographyClasses(undefined)` returns the same result as `getTypographyClasses('editorial')`**
    - **Validates: Requirements 5.1–5.5, 6.1–6.4**

- [ ] 5. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Integrate Nav, ProductCard, typography, and spacing into StoreFront
  - [x] 6.1 Update `src/screens/StoreFront.tsx` to use the new `Nav` component
    - Replace the existing inline nav JSX with `<Nav>`, passing `theme` and `store`
    - _Requirements: 3.1–3.6_

  - [x] 6.2 Update `SectionRenderer` in `src/screens/StoreFront.tsx` to use `ProductCard`
    - Replace inline product card JSX in `featured` and `all-products` cases with `<ProductCard>`
    - Pass `cardAnatomy` from `theme.layout.cardAnatomy`
    - _Requirements: 4.1–4.7_

  - [x] 6.3 Apply typography scale classes from `getTypographyClasses` to section headings, hero heading, product names, meta text, and price labels in `StoreFront.tsx`
    - _Requirements: 5.1–5.4_

  - [ ] 6.4 Apply section spacing from `getSectionSpacingClass` to all enabled section wrappers in `StoreFront.tsx`
    - Replace hardcoded `mb-*` values on section wrappers with the spacing helper output
    - _Requirements: 6.1–6.4_

  - [~] 6.5 Enforce Free plan restriction at the `getTheme()` call site in `StoreFront.tsx`
    - When `activeUser?.plan === 'Free'`, always call `getTheme('classic')` regardless of `store.theme`
    - _Requirements: 9.1, 9.3, 9.4_

  - [ ]* 6.6 Write unit tests for Free plan theme enforcement in StoreFront
    - Test: Free user with a Pro theme slug in store.theme renders classic theme
    - Test: Pro user renders the stored theme
    - _Requirements: 9.1, 9.3, 9.4_

- [ ] 7. Enforce Free plan restriction in the store settings API
  - [~] 7.1 Update the store settings save handler (API route or server action) to always persist `theme: 'classic'` when `UserProfile.plan === 'Free'`
    - Locate the relevant API route (e.g. `app/api/auth/profile/route.ts` or store update endpoint) and add server-side plan check
    - _Requirements: 9.2_

- [ ] 8. Update theme preview in StoreSettings UI
  - [~] 8.1 Update the theme picker in `src/components/settings/StoreSettings.tsx` to show card anatomy layout indicator
    - Add a small SVG or CSS-based miniature card anatomy indicator inside each theme swatch
    - `'square-overlay'`: square thumbnail with text overlay indicator
    - `'editorial-row'`: horizontal row layout indicator
    - `'portrait'` / `'landscape'`: vertical card layout indicator
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [~] 8.2 Add "Pro" lock badge on hover for Free users in the theme picker
    - Show a lock/Pro badge on hover over Pro themes without requiring a click
    - Continue displaying accent color, background color, and theme name
    - _Requirements: 8.5, 8.6_

- [ ] 9. Mobile-first responsive fixes
  - [~] 9.1 Ensure `grid-3col` collapses to 2 columns below 640px in `StoreFront.tsx`
    - Update `getGridClasses` so `grid-3col` uses `grid-cols-2 sm:grid-cols-3` (or equivalent flex logic)
    - _Requirements: 10.2_

  - [~] 9.2 Verify hero sections have no horizontal overflow at 375px
    - Audit `HeroSection.tsx` for any fixed widths or non-responsive padding that could cause overflow
    - Fix any issues found
    - _Requirements: 10.1, 10.5_

- [ ] 10. Backward compatibility and fallback verification
  - [~] 10.1 Verify `getTheme()` function signature is unchanged and falls back to `classic` for undefined or unknown slugs
    - Confirm existing call sites still work without modification
    - _Requirements: 11.1, 11.2, 11.4_

  - [ ]* 10.2 Write property test for `getTheme` fallback behavior
    - **Property: `getTheme(slug)` always returns a valid Theme object for any string input, including unknown slugs**
    - **Property: `getTheme(undefined)` returns the classic theme**
    - **Validates: Requirements 11.2, 11.4**

  - [~] 10.3 Verify existing `SectionConfig` `enabled` and `order` fields are still respected after refactor
    - Confirm `StoreFront.tsx` still filters and sorts sections by `enabled`/`order` after all changes
    - _Requirements: 11.3_

- [ ] 11. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The design language is TypeScript/React (Next.js with Tailwind CSS)
- Property tests validate universal correctness; unit tests validate specific examples and edge cases

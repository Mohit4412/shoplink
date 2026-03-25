# Requirements Document

## Introduction

The Pro Theme System upgrade transforms the existing theme mechanism from a color-swap system into a genuinely differentiated storefront layout system — analogous to how Shopify themes (Dawn, Debut, Sense) each deliver a distinct page structure, typography scale, navigation style, and product card design. Each of the 6 Pro themes (slate, rose, forest, ocean, amber, vibe) must feel like a different storefront, not just a recolored version of classic. The classic theme remains the Free-tier default. All changes are purely frontend; no backend schema changes are required. The storefront is primarily viewed on mobile.

---

## Glossary

- **Theme**: A named visual and structural configuration identified by a string slug (e.g. `"slate"`) stored in `StoreSettings.theme`.
- **ThemeTokens**: The color/shadow design tokens object defined in `src/utils/themes.ts`.
- **ThemeLayout**: The structural layout descriptor (`heroStyle`, `productGrid`, `cardStyle`) defined in `src/utils/themes.ts`.
- **ThemeRenderer**: A per-theme React component (or render function) responsible for the full page structure of a given theme, replacing the single shared `SectionRenderer` switch for structural concerns.
- **SectionRenderer**: The existing switch-based renderer in `StoreFront.tsx` that maps `SectionConfig.id` to JSX.
- **StoreFront**: The `src/screens/StoreFront.tsx` component that assembles the public-facing store page.
- **HeroSection**: The `src/components/storefront/sections/HeroSection.tsx` component, currently accepting `heroStyle: 'centered' | 'split' | 'fullbleed'`.
- **ProductCard**: The JSX block that renders a single product within a grid or list layout.
- **SectionConfig**: The `{ id, label, enabled, order, settings }` object from `src/types.ts` that controls which sections appear and in what order.
- **Pro_User**: A user whose `UserProfile.plan` equals `'Pro'`.
- **Free_User**: A user whose `UserProfile.plan` equals `'Free'`.
- **Classic_Theme**: The theme with id `"classic"`, the only theme available to Free_Users.
- **Theme_Preview**: The visual swatch shown in `StoreSettings` that communicates a theme's look before it is applied.
- **Nav**: The top navigation bar rendered inside `StoreFront`.
- **Typography_Scale**: The set of font sizes, weights, and line-heights that define a theme's text hierarchy.
- **Card_Anatomy**: The visual structure of a ProductCard — image ratio, text placement, button style, border treatment.

---

## Requirements

### Requirement 1: Per-Theme Structural Differentiation

**User Story:** As a Pro merchant, I want each theme to have a visually distinct page structure, so that my storefront feels like a unique brand experience rather than a recolored template.

#### Acceptance Criteria

1. THE Theme_System SHALL define at least three structurally distinct layout archetypes across the 7 themes, where "structurally distinct" means a different combination of at least two of: hero layout, product grid density, card anatomy, nav style, or typography scale.
2. WHEN a Pro_User selects a theme, THE StoreFront SHALL render that theme's unique layout archetype — not merely apply new color tokens to the existing Classic_Theme structure.
3. THE Classic_Theme SHALL retain its current layout (centered hero, 2-column boxed grid, standard nav) as the baseline.
4. WHEN two themes share the same `heroStyle` value, THE Theme_System SHALL differentiate them through at least one other structural dimension (card anatomy, grid density, nav style, or typography scale).

---

### Requirement 2: Extended ThemeLayout Descriptor

**User Story:** As a developer, I want the `ThemeLayout` type to capture all structural dimensions of a theme, so that the renderer can produce genuinely different layouts without per-theme conditional logic scattered across the codebase.

#### Acceptance Criteria

1. THE `ThemeLayout` interface SHALL be extended to include a `navStyle` field with values `'minimal'`, `'centered-logo'`, or `'inline-search'`.
2. THE `ThemeLayout` interface SHALL be extended to include a `typographyScale` field with values `'compact'`, `'editorial'`, or `'display'`.
3. THE `ThemeLayout` interface SHALL be extended to include a `cardAnatomy` field with values `'portrait'`, `'landscape'`, `'square-overlay'`, or `'editorial-row'`.
4. THE `ThemeLayout` interface SHALL be extended to include a `sectionSpacing` field with values `'tight'`, `'relaxed'`, or `'airy'`.
5. WHEN a new field is added to `ThemeLayout`, THE Theme_System SHALL assign a value for that field to every existing theme definition in `src/utils/themes.ts`.
6. IF a theme definition is missing a required `ThemeLayout` field, THEN THE TypeScript compiler SHALL emit a type error.

---

### Requirement 3: Theme-Aware Nav Rendering

**User Story:** As a Pro merchant, I want the storefront navigation bar to match my chosen theme's style, so that the nav feels like an intentional part of the overall design rather than a generic header.

#### Acceptance Criteria

1. WHEN `ThemeLayout.navStyle` is `'minimal'`, THE Nav SHALL render the store name as plain text on the left with no visible border or background until the user scrolls.
2. WHEN `ThemeLayout.navStyle` is `'centered-logo'`, THE Nav SHALL render the store logo or name centered horizontally with a visible background panel.
3. WHEN `ThemeLayout.navStyle` is `'inline-search'`, THE Nav SHALL render the store name on the left and an inline search input on the right within the nav bar.
4. THE Nav SHALL apply `ThemeTokens.navBg`, `ThemeTokens.navBorder`, and `ThemeTokens.navText` regardless of `navStyle`.
5. WHILE the user has not scrolled, THE Nav with `navStyle: 'minimal'` SHALL render with `background: transparent` and no bottom border.
6. WHEN the user scrolls more than 40px, THE Nav with `navStyle: 'minimal'` SHALL transition to a solid background using `ThemeTokens.navBg`.

---

### Requirement 4: Theme-Aware Product Card Anatomy

**User Story:** As a Pro merchant, I want product cards to have a layout that fits my theme's aesthetic, so that the product grid reinforces the overall brand feel.

#### Acceptance Criteria

1. WHEN `ThemeLayout.cardAnatomy` is `'portrait'`, THE ProductCard SHALL render a tall image (aspect ratio 3:4) above the product name and price.
2. WHEN `ThemeLayout.cardAnatomy` is `'landscape'`, THE ProductCard SHALL render a wide image (aspect ratio 16:9 or 4:3) above a compact text row.
3. WHEN `ThemeLayout.cardAnatomy` is `'square-overlay'`, THE ProductCard SHALL render a square image (aspect ratio 1:1) with the product name and price overlaid on the bottom of the image using a gradient scrim.
4. WHEN `ThemeLayout.cardAnatomy` is `'editorial-row'`, THE ProductCard SHALL render as a horizontal row with a fixed-width square thumbnail on the left and text content on the right.
5. THE ProductCard SHALL apply `ThemeTokens.cardBg`, `ThemeTokens.cardBorder`, `ThemeTokens.cardShadow`, and `ThemeTokens.cardImageBg` regardless of `cardAnatomy`.
6. WHEN a product has `stock === 0`, THE ProductCard SHALL display an "Out of Stock" indicator regardless of `cardAnatomy`.
7. THE ProductCard "Order on WhatsApp" button SHALL be reachable via keyboard focus and have a minimum touch target of 44×44px on all `cardAnatomy` variants.

---

### Requirement 5: Theme-Aware Typography Scale

**User Story:** As a Pro merchant, I want each theme to have a typography style that matches its personality, so that the text hierarchy reinforces the brand aesthetic.

#### Acceptance Criteria

1. WHEN `ThemeLayout.typographyScale` is `'compact'`, THE StoreFront SHALL apply smaller base font sizes (product name: `text-sm`, section heading: `text-xl`) and tighter line-heights.
2. WHEN `ThemeLayout.typographyScale` is `'editorial'`, THE StoreFront SHALL apply medium base font sizes (product name: `text-base`, section heading: `text-2xl`) and relaxed line-heights.
3. WHEN `ThemeLayout.typographyScale` is `'display'`, THE StoreFront SHALL apply larger base font sizes (product name: `text-lg`, section heading: `text-3xl`) and generous line-heights.
4. THE typography scale SHALL apply consistently to the hero heading, section headings, product names, product meta text, and price labels within a single theme.
5. IF `ThemeLayout.typographyScale` is not defined for a theme, THEN THE StoreFront SHALL fall back to `'editorial'` scale.

---

### Requirement 6: Theme-Aware Section Spacing

**User Story:** As a Pro merchant, I want the spacing between sections to match my theme's density, so that the page rhythm feels intentional.

#### Acceptance Criteria

1. WHEN `ThemeLayout.sectionSpacing` is `'tight'`, THE StoreFront SHALL apply `mb-12` (or equivalent) between major sections.
2. WHEN `ThemeLayout.sectionSpacing` is `'relaxed'`, THE StoreFront SHALL apply `mb-20` (or equivalent) between major sections.
3. WHEN `ThemeLayout.sectionSpacing` is `'airy'`, THE StoreFront SHALL apply `mb-32` (or equivalent) between major sections.
4. THE section spacing SHALL be applied uniformly to all enabled sections within a single page render.

---

### Requirement 7: Updated Theme Definitions for All 7 Themes

**User Story:** As a Pro merchant, I want each of the 7 themes to have a fully specified layout that makes it feel distinct, so that the theme picker offers genuinely different storefront experiences.

#### Acceptance Criteria

1. THE `classic` theme SHALL be assigned: `navStyle: 'minimal'`, `typographyScale: 'editorial'`, `cardAnatomy: 'portrait'`, `sectionSpacing: 'relaxed'`.
2. THE `slate` theme SHALL be assigned: `navStyle: 'centered-logo'`, `typographyScale: 'display'`, `cardAnatomy: 'square-overlay'`, `sectionSpacing: 'airy'`, `heroStyle: 'fullbleed'`, `productGrid: 'grid-3col'`.
3. THE `rose` theme SHALL be assigned: `navStyle: 'minimal'`, `typographyScale: 'editorial'`, `cardAnatomy: 'portrait'`, `sectionSpacing: 'relaxed'`, `heroStyle: 'split'`, `productGrid: 'grid-2col'`.
4. THE `forest` theme SHALL be assigned: `navStyle: 'inline-search'`, `typographyScale: 'compact'`, `cardAnatomy: 'editorial-row'`, `sectionSpacing: 'tight'`, `heroStyle: 'centered'`, `productGrid: 'list'`.
5. THE `ocean` theme SHALL be assigned: `navStyle: 'centered-logo'`, `typographyScale: 'editorial'`, `cardAnatomy: 'landscape'`, `sectionSpacing: 'relaxed'`, `heroStyle: 'split'`, `productGrid: 'grid-3col'`.
6. THE `amber` theme SHALL be assigned: `navStyle: 'minimal'`, `typographyScale: 'compact'`, `cardAnatomy: 'square-overlay'`, `sectionSpacing: 'tight'`, `heroStyle: 'centered'`, `productGrid: 'grid-2col'`.
7. THE `vibe` theme SHALL be assigned: `navStyle: 'centered-logo'`, `typographyScale: 'display'`, `cardAnatomy: 'editorial-row'`, `sectionSpacing: 'airy'`, `heroStyle: 'split'`, `productGrid: 'grid-3col'`.
8. WHEN any two themes share the same `heroStyle`, THE Theme_System SHALL ensure they differ in at least two other `ThemeLayout` fields.

---

### Requirement 8: Theme Preview in Settings

**User Story:** As a merchant, I want the theme picker in Store Settings to show a meaningful preview of each theme's layout, so that I can make an informed choice before saving.

#### Acceptance Criteria

1. THE Theme_Preview SHALL display a miniature representation of the theme's card anatomy style in addition to the existing color swatch.
2. WHEN a theme has `cardAnatomy: 'square-overlay'`, THE Theme_Preview SHALL show a square image thumbnail with a text overlay indicator.
3. WHEN a theme has `cardAnatomy: 'editorial-row'`, THE Theme_Preview SHALL show a horizontal row layout indicator.
4. WHEN a theme has `cardAnatomy: 'portrait'` or `'landscape'`, THE Theme_Preview SHALL show a vertical card layout indicator.
5. THE Theme_Preview SHALL continue to display the theme's accent color, background color, and name as it currently does.
6. WHEN a Free_User hovers over a Pro theme in the picker, THE Theme_Preview SHALL display a "Pro" lock badge without requiring a click.

---

### Requirement 9: Free Plan Restriction Enforcement

**User Story:** As a product owner, I want Free users to be locked to the classic theme at render time, so that Pro themes cannot be accessed by circumventing the settings UI.

#### Acceptance Criteria

1. WHEN `PublicStorefrontUser.plan` is `'Free'`, THE StoreFront SHALL call `getTheme('classic')` regardless of the value stored in `StoreSettings.theme`.
2. WHEN `UserProfile.plan` is `'Free'` and the user saves store settings, THE API SHALL persist `theme: 'classic'` regardless of the submitted theme value.
3. IF a Free_User's `StoreSettings.theme` contains a Pro theme slug in the database, THEN THE StoreFront SHALL still render the classic theme.
4. THE Free plan restriction SHALL be enforced in `StoreFront.tsx` at the `getTheme()` call site, not only in the settings UI.

---

### Requirement 10: Mobile-First Responsive Behavior

**User Story:** As a shopper on a mobile device, I want the storefront to render correctly for all themes on small screens, so that the shopping experience is not degraded on the primary viewing device.

#### Acceptance Criteria

1. THE StoreFront SHALL render all theme layouts correctly at viewport widths of 375px, 390px, and 430px (common mobile sizes).
2. WHEN `ThemeLayout.productGrid` is `'grid-3col'` and the viewport is narrower than 640px, THE StoreFront SHALL collapse the grid to 2 columns.
3. WHEN `ThemeLayout.cardAnatomy` is `'landscape'`, THE ProductCard SHALL maintain a minimum image height of 120px on mobile viewports.
4. WHEN `ThemeLayout.navStyle` is `'inline-search'` and the viewport is narrower than 640px, THE Nav SHALL collapse the search input to a search icon that expands on tap.
5. THE hero section for all `heroStyle` variants SHALL be fully visible without horizontal scrolling on a 375px viewport.
6. ALL touch targets (buttons, links, cards) SHALL have a minimum size of 44×44px on all theme variants.

---

### Requirement 11: Backward Compatibility

**User Story:** As an existing merchant, I want my storefront to continue working correctly after the theme system upgrade, so that my store is not broken by the update.

#### Acceptance Criteria

1. WHEN a store has an existing `StoreSettings.theme` value that matches a valid theme slug, THE StoreFront SHALL render that theme with the new layout system without requiring any merchant action.
2. WHEN a store has `StoreSettings.theme` set to `undefined` or an unrecognized slug, THE StoreFront SHALL fall back to the `classic` theme.
3. WHEN a store has existing `SectionConfig` data in `StoreSettings.sections`, THE StoreFront SHALL continue to respect the `enabled` and `order` fields from that data.
4. THE `getTheme()` function signature SHALL remain unchanged: it SHALL continue to accept an optional string and return a `Theme` object.
5. THE existing `ThemeTokens` fields SHALL not be removed or renamed; new fields MAY be added.

# Material Design 3 adoption — design

- **Date:** 2026-09-23
- **Status:** approved, awaiting implementation plan
- **Scope:** the 15 components in `frontend/src/components/ui/` and the token layer in `frontend/src/styles/tokens.css`

## Intent

Restyle the hand-rolled component library to follow Material Design 3, building on
the token layer rather than around it. The current components are internally
consistent but not Material: buttons use a 6px radius and a `translateY(1px)`
press, hover states swap solid background colors, `:disabled` uses 0.5 opacity,
and there is no elevation scale, type scale, or state-layer system.

Success means a developer can read any component's CSS and see M3 rules expressed
in named tokens, and a user sees Material's interaction language — state layers,
elevation, shape, and type hierarchy.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Mechanism | Keep hand-rolled CSS modules | No new runtime dependency; markup unchanged; the team owns every line. Material Web is in limited maintenance and MUI would mean rewriting all 15 components plus call sites. |
| Depth | M3 system tokens now, tonal palette later | Lower risk; keeps the palette verified on 2026-09-23. Components are written against M3 role names so a later tonal-palette swap is a token-file change, not a component rewrite. |
| Density | M3 defaults for controls, density -1 for the table | Scanning inventory rows is the app's primary job; full 52dp rows would cost roughly a quarter of the visible rows. |

### Non-goals

- Dark mode (enabled by this work, not delivered by it)
- Generated tonal palettes / the full 26 color roles
- Any change to component markup, props, or behavior
- Any change to the four status color pairs

## Source of truth

Values below are taken from m3.material.io. Doc-confirmed in this session:
shape scale, elevation levels and their component assignments, state-layer
opacities, `title-large` 22/28/0, `title-medium` 16/24/0.15, `body-large` 16/24.
The remaining type-scale rows follow the published M3 scale.

## Token additions

Additive only — no existing token is removed or renamed.

### Shape

```css
--md-shape-xs: 4px;
--md-shape-sm: 8px;
--md-shape-md: 12px;
--md-shape-lg: 16px;
--md-shape-xl: 28px;
--md-shape-full: 999px;
```

### Elevation

```css
--md-elevation-0: none;
--md-elevation-1: 0 1px 2px 0 rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15);
--md-elevation-2: 0 1px 2px 0 rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15);
--md-elevation-3: 0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.30);
--md-elevation-4: 0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px 0 rgba(0,0,0,0.30);
--md-elevation-5: 0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px 0 rgba(0,0,0,0.30);
```

The existing `--shadow-sm` / `--shadow-lg` remain until every consumer is migrated,
then they are deleted in the final step of the plan.

### State

```css
--md-state-hover: 0.08;
--md-state-focus: 0.10;
--md-state-pressed: 0.10;
--md-state-dragged: 0.16;
--md-state-disabled-content: 0.38;
--md-state-disabled-container: 0.12;
```

### Type scale

Each role is a size / line-height / tracking / weight set:

| Token | Size | Line | Tracking | Weight |
|---|---|---|---|---|
| `--md-headline-sm` | 24px | 32px | 0 | 400 |
| `--md-title-lg` | 22px | 28px | 0 | 400 |
| `--md-title-md` | 16px | 24px | 0.15px | 500 |
| `--md-title-sm` | 14px | 20px | 0.1px | 500 |
| `--md-body-lg` | 16px | 24px | 0.5px | 400 |
| `--md-body-md` | 14px | 20px | 0.25px | 400 |
| `--md-body-sm` | 12px | 16px | 0.4px | 400 |
| `--md-label-lg` | 14px | 20px | 0.1px | 500 |
| `--md-label-md` | 12px | 16px | 0.5px | 500 |

### Role aliases

Components reference these, never the underlying palette tokens directly:

```css
--md-primary:            var(--color-accent);
--md-on-primary:         var(--color-accent-contrast);
--md-primary-container:  var(--color-accent-soft);
--md-on-primary-container: var(--color-accent);
--md-surface:            var(--color-surface);
--md-surface-container:  var(--color-status-neutral-bg);
--md-on-surface:         var(--color-text);
--md-on-surface-variant: var(--color-text-muted);
--md-outline:            var(--color-border-strong);
--md-outline-variant:    var(--color-border);
--md-error:              var(--color-status-critical-text);
--md-error-container:    var(--color-status-critical-bg);
--md-inverse-surface:    var(--color-inverse-bg);
--md-inverse-on-surface: var(--color-inverse-text);
--md-inverse-primary:    var(--color-accent-on-inverse);
--md-scrim:              rgba(17, 24, 39, 0.32);
```

## State layers

The single cross-cutting mechanism. Every interactive surface gets a positioned
`::before` overlay that carries `currentColor` at the spec opacity:

```css
.interactive { position: relative; isolation: isolate; }
.interactive::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}
.interactive:hover::before   { opacity: var(--md-state-hover); }
.interactive:focus-visible::before { opacity: var(--md-state-focus); }
.interactive:active::before  { opacity: var(--md-state-pressed); }
```

This replaces every solid-background hover swap and the `translateY(1px)` press.
Consequence: `--color-accent-soft` stops being a hover color and is used only as
`--md-primary-container` for tonal fills.

Disabled uses content opacity 0.38 and, for filled variants, container opacity
0.12 — not the current blanket `opacity: 0.5`.

## Component specifications

| Component | M3 component | Treatment |
|---|---|---|
| `Button` | Common buttons | The four existing variants map onto M3 treatments with no prop change: `primary` → filled, `outline` → outlined, `ghost` → text, `ghost-accent` → text in primary. 40px height, `--md-shape-full`, `--md-label-lg`, 24px horizontal padding (12px for text), 18px icon with 8px gap, elevation 0, state layers. No `tonal` variant is added — that would be a prop change, which the non-goals forbid. |
| `IconButton` | Standard icon button | 40px box, 24px icon, `--md-shape-full`, 48px minimum touch target via padding, state layer |
| `Input` | Outlined text field | 56px height, `--md-shape-xs`, 1px `--md-outline`, 2px `--md-primary` on focus, `--md-body-lg` |
| `Select` | Outlined text field | As `Input`, plus a 24px trailing dropdown icon |
| `FormField` | Supporting text | Label `--md-body-sm` / `--md-on-surface-variant`; error state uses `--md-error` |
| `Checkbox` | Checkbox | 18px box, 2px radius, `--md-primary` when selected, 40px target |
| `Card` | Outlined card | `--md-shape-md`, 1px `--md-outline-variant`, `--md-elevation-0` |
| `Menu` | Menu | `--md-elevation-2`, `--md-shape-xs`, `--md-surface-container`, 48px items, state layers, `--md-label-lg` |
| `Drawer` | Modal side sheet | `--md-elevation-1`, 16px leading corners, existing 32% scrim already matches spec |
| `Toast` | Snackbar | `--md-inverse-surface` / `--md-inverse-on-surface`, `--md-shape-xs`, `--md-elevation-3`, action label `--md-inverse-primary` |
| `Badge` | Chip shape | `--md-shape-sm`, `--md-label-md`, existing status color pairs unchanged |
| `Table` | List conventions | `--md-outline-variant` dividers, `--md-label-lg` headers, 44px rows (density -1), row hover state layer |
| `Pagination` | Icon buttons + text buttons | Per the `Button` / `IconButton` rules above |
| `EmptyState` | — | `--md-title-md` heading, `--md-body-md` copy |
| `PageHeader` | — | `--md-headline-sm` title, `--md-body-md` description |

M3 has no data-table component; `Table` follows list conventions, which is the
closest published guidance.

## Deliberate deviations from M3

Recorded so they read as decisions rather than mistakes:

1. **Dark table header.** M3 would use a light surface with `on-surface-variant`
   labels. The dark `--color-inverse-bg` header was chosen deliberately on
   2026-09-23 and is kept as a brand deviation.
2. **System font stack, not Roboto.** `tokens.css` documents the system-only stack
   as intentional. M3 explicitly permits brand fonts, so the type scale is applied
   to the existing stack.
3. **Density -1 on the table.** M3 default row height costs roughly a quarter of
   the visible inventory rows.
4. **No ripple animation.** State layers are applied without M3's origin-based
   ripple, which would require JS per component. Opacity transitions only.

## Verification

1. Promote the throwaway contrast checker used on 2026-09-23 into the repo as
   `frontend/scripts/check-contrast.mjs`, and extend it to cover every new role
   pairing, including state-layer composites at 0.08 and 0.10 over each surface.
   A palette guarantee that only exists in a temp directory is not a guarantee.
2. Assert no component CSS contains a raw hex, `rgba(`, or hardcoded `px` radius —
   shape and color must come from tokens.
3. Screenshot each component in rest / hover / focus / disabled via the existing
   CDP harness, before and after.
4. `tsc --noEmit`, `npm run build`, and `oxlint src` clean, with no new warnings
   beyond the five pre-existing `set-state-in-effect` ones.

## Risks

- **Visual churn is large.** Every control changes size and shape at once. The
  plan should sequence tokens first, then one component per step, so any single
  step is reviewable and revertible.
- **44px table rows plus 40px buttons** may still push the toolbar taller than
  today. Verify against a screenshot before accepting.
- **The role-alias layer adds indirection.** Two names now point at one color.
  This is the price of making the later tonal-palette swap cheap, and it is only
  worth paying if that swap is actually intended.

## Follow-on work

Generating real tonal palettes from the `#25764B` seed with Google's
`material-color-utilities` (dev-time script, static committed output) would
replace the alias layer with the full 26 roles and deliver dark mode. This design
is structured so that work touches only `tokens.css`.

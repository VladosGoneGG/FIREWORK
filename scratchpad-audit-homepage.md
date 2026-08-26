# Homepage Audit: Hero / Category Icons / Catalogue Grid + Product Cards

Scope: hero/promo banner, category icon row, product grid, ProductCard, discount badge/price treatment.

## Correction to task assumption

`PromoMain.jsx` (`src/components/PromoMain/PromoMain.jsx`, uses `bannerMain.svg`) is **dead code** in the
original app — grep found zero imports/usages of `PromoMain` anywhere except its own file. The actual
homepage hero is **`PromoSlider`** (`src/components/PromoSlider/PromoSlider.jsx`), rendered from
`ProductsPage.jsx:399-403` (`shouldShowSlider ? <PromoSlider active /> : FilterBar`) whenever no
category/search/details view is active. It's an auto-advancing 3-image carousel sourced from
`public/promo/tovar-1.webp`, `tovar-2.webp`, `tovar-3.webp` (not the 3.5MB `bannerMain.svg`). The audit
below targets `PromoSlider` as the real parity target, and flags `bannerMain.svg`/`PromoMain` as
not-in-scope (do not port).

Also: the catalogue card is **`ProductCardMini`** (`src/components/ProductCardMini/ProductCardMini.jsx`),
not `src/components/ProductCard/ProductCard.jsx` — the latter is *also* dead code (only ever
self-referenced, never imported into the render tree). `ProductSection.jsx` (which lays out the grid)
imports `ProductCardMini`.

| Element | Original (file:line, exact values) | Migrated (file:line, exact values) | Gap |
|---|---|---|---|
| **Hero component identity** | `PromoSlider.jsx` — auto-rotating carousel, 3 images, 3500ms interval, 380ms ease-out translateX transition | No hero/promo component exists anywhere in `app/page.tsx` or `components/`. `bodyImgCount` on homepage = 0 (confirmed via live DOM query) | **Total gap.** Homepage has zero hero banner. Nothing to fix visually — needs to be built from scratch. |
| Hero container | `PromoSlider.jsx:46-54`: `relative w-full max-w-[665px] mx-auto rounded-[10px] overflow-hidden bg-[#f6f4f2] mb-[30px]`, `aspectRatio: '64 / 30'`. Live computed: `maxWidth: 665px`, `width: 645px` (at 1440 viewport, sidebar present), `borderRadius: 10px`, `marginBottom: 30px` | N/A | Needs: max-width 665px, 64:30 aspect ratio, 10px radius, 30px bottom margin, `#f6f4f2` placeholder bg |
| Hero images | `public/promo/tovar-1.webp` (145KB), `tovar-2.webp` (320KB), `tovar-3.webp` (99KB) — `object-cover`, crossfade via `transform: translateX()` at 380ms | No `public/promo/` directory exists in migrated app at all | **Copy `public/promo/tovar-1.webp`, `tovar-2.webp`, `tovar-3.webp`** from original `public/promo/` into migrated `public/promo/` |
| Hero out-of-scope asset | `src/assets/SVG/bannerMain.svg` (3.5MB, embeds raster photo) — imported by dead `PromoMain.jsx`, never rendered | N/A | **Do not port.** Unused in original; porting it would just bloat the bundle for no visual gain. |
| **Category icon row (aside nav)** | `CategoryFilter.jsx:121`: `<aside className="w-[240px] h-auto bg-white rounded-[20px] p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.2)] font-baron lowercase font-bold">`. Live computed: `width: 240px`, `borderRadius: 20px`, `padding: 10px`, `boxShadow: 0 0 10px rgba(0,0,0,0.2)` | `CategoryNav.tsx:12`: `<nav className="rounded-2xl bg-white p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]">`. Live computed: `width: 240px`, `borderRadius: 16px` (rounded-2xl), `padding: 10px`, `boxShadow: 0 0 10px rgba(0,0,0,0.08)` | Radius 20px→16px (smaller), shadow opacity 0.2→0.08 (much fainter — original's sidebar shadow is 2.5x stronger/more visible) |
| Category row item | `CategoryRow.jsx:44-49`: `flex items-center gap-4 my-[5px] w-[230px] h-[30px] text-[12px] rounded-[12px]`; active: `text-firework-red font-medium`; inactive: `text-[#333] hover:text-firework-red`; wrapped in `PressableButton` (press-scale 0.98) | `CategoryNav.tsx:17-19`: `flex min-h-11 items-center rounded-xl px-3`; active: `font-medium text-firework-red`; inactive: `text-[#333] hover:text-firework-red` | Text-color logic matches. No icon slot at all (see next row). No press/scale interaction on click (original scales to 0.98 on press via `PressableButton`). |
| **Category icons themselves** | `CategoryRow.jsx:53-57`: `<img src={icon} className="w-[30px] h-[30px] ${active ? 'opacity-100' : 'opacity-80'}">`. 9 unique SVGs, one per category, order-mapped by index: `icon-all1.svg, icon-sal2.svg, icon-rim3.svg, icon-fon4.svg, icon-pet5.svg, icon-ver6.svg, icon-hlop7.svg, icon-ben8.svg, icon-rak9.svg`. Confirmed live: 9 `<img>` in aside, each a 30×30 detailed SVG icon (star/badge glyph with drop-shadow filter, white rounded-square backing) | `CategoryNav.tsx` has **zero** `<img>`/`<svg>` — confirmed `navImgCount: 0` via live DOM query. Category list is plain text links only | **Total gap — no icons at all.** Copy all 9 files from `src/assets/SVG/` into migrated `public/`: `icon-all1.svg`, `icon-sal2.svg`, `icon-rim3.svg`, `icon-fon4.svg`, `icon-pet5.svg`, `icon-ver6.svg`, `icon-hlop7.svg`, `icon-ben8.svg`, `icon-rak9.svg`. Then render a 30×30 `<img>` per row (opacity 1.0 active / 0.8 inactive) in the same category order as `CategoryRow.jsx`'s `ICONS` array. |
| **Product grid layout** | `ProductSection.jsx:85`: `flex flex-wrap gap-2.5 items-start gap-y-2.5`; each cell `shrink-0 flex-[1_0_121px] max-w-[150px]`, `minWidth: 121px` — flex-wrap, not CSS grid, cards ~121-150px wide, many per row | `ProductGrid.tsx:20`: `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` — CSS grid, fixed column counts by breakpoint | Different layout system entirely (flex-wrap fixed-width vs CSS grid responsive columns). Migrated cards are notably wider per column at desktop (grid divides available width by 4-5) than original's fixed ~121-150px tiles. |
| Grid entrance animation | `ProductSection.jsx:51-56`: uses `motion` (`motion/react` — the "motion" npm package) — `motion.div` with `variants={{hidden:{opacity:0,y:14}, show:{opacity:1,y:0,transition:{ease:'easeOut',duration:0.15}}}}`, `initial='hidden' animate='show'`, keyed by section so it re-plays on filter/sort change | `ProductGrid.tsx` — plain server-rendered `<div>`, no animation, no `motion` import | **Total gap.** No entrance animation. `motion` package (`npm i motion`) is not installed in migrated app (confirmed via package.json grep) — would need adding as a client component wrapper since this is Next.js Server Components. |
| **Product card container** | `ProductCardMini.jsx:69-77`: `w-full h-[233px] bg-[#F2F2F2] rounded-[10px] p-[5px]`, `transition-[background-color,box-shadow,transform] duration-300 ease-in-out`, `hover:bg-[#efebe6] hover:shadow-[0_0px_5px_rgba(0,0,0,0.15)] hover:-translate-y-[1px]`, `focus-visible:ring-2 focus-visible:ring-[#bd52e9]`. Live computed (default/no-hover): `width: 121px, height: 233px, background: rgb(242,242,242), borderRadius: 10px, padding: 5px, boxShadow: none` | `ProductCard.tsx:20`: `group flex flex-col rounded-2xl bg-white p-3 shadow-[0_0_10px_0_rgba(0,0,0,0.08)] transition hover:shadow-[0_0_16px_0_rgba(0,0,0,0.14)]`. Live computed (default): `width: 180px, height: 341.5px, background: rgb(255,255,255), borderRadius: 16px, padding: 12px, boxShadow: 0 0 10px rgba(0,0,0,0.08)` | Multiple gaps: **background color** `#F2F2F2` (light gray) → `white` (flattened); **border-radius** 10px → 16px; **padding** 5px → 12px (much airier, loses the compact catalogue-tile feel); **shadow** original is `none` by default and only appears on hover (`0 0px 5px rgba(0,0,0,0.15)` + `-translate-y-1px` lift) — migrated has a shadow **always on** (`0 0 10px rgba(0,0,0,0.08)`) that merely intensifies on hover (`0 0 16px rgba(0,0,0,0.14)`), no translate/lift on hover at all. Card is also taller/wider overall (233px h / 121px w vs 341.5px h / 180px w) — different aspect entirely, driven by the grid-vs-flex-wrap layout difference above. |
| Card hover interaction | `bg-[#efebe6]` fill change + `shadow-[0_0px_5px_rgba(0,0,0,0.15)]` + `-translate-y-[1px]` lift, 300ms ease-in-out, plus focus ring `ring-[#bd52e9]` (purple, not the red brand color) | shadow intensifies only, no bg change, no translate/lift, focus ring `ring-firework-red` (red, differs from original's purple focus ring) | No lift-on-hover; no background tint on hover; focus-ring color differs (cosmetic, arguably migrated is more consistent) |
| Card entrance/click | Whole card is `role="button"` (`ProductCardMini.jsx:62-67`), keyboard-activatable (Enter/Space), `PressableButton`-style press only via CSS, no separate internal `<Link>` | `ProductCard.tsx:21`: card image/name/specs wrapped in a `<Link>`, cart button is a sibling `<button>` (deliberate a11y choice per code comment, not a bug) | Structurally different (article+role=button vs article+Link+button) but not a visual gap — migrated's approach is arguably more correct. Note only, not a fix. |
| Product image area | `ProductThumb.jsx:10`: `w-full h-[111px] rounded-[5px] bg-white shadow-[0_0_5px_0_rgba(0,0,0,0.15)]`, `object-cover` | `ProductCard.tsx:22`: `aspect-square rounded-xl bg-[#f6f4f2]` (radius 12px), no shadow, text-only "нет фото" placeholder (no actual product images wired up either side in this check) | Original thumb has its own drop-shadow (`0 0 5px rgba(0,0,0,0.15)`) separate from the card shadow — a **layered/nested shadow** effect (card has no shadow by default, but the photo tile inside it does). Migrated has flat single radius, no shadow on the image tile, different bg color (`#f6f4f2` vs white) and different radius (12px vs 5px). |
| Product name/manufacturer | `ProductMeta.jsx:6-11`: name `font-barlow font-semibold text-[13px] line-clamp-1`; manufacturer `text-[8px] text-[#625a51] font-bold lowercase` | `ProductCard.tsx:32-37`: manufacturer `text-xs uppercase tracking-wide text-[#9c9c9c]`; name `font-baron text-sm text-[#333]` | Order flipped (migrated shows manufacturer *above* name — same as original actually, just check casing: original manufacturer is lowercase, migrated is uppercase with tracking). Font family differs: original uses `font-barlow` for the name (not `font-baron` — the mono/display font used elsewhere), migrated uses `font-baron` for the name. Manufacturer color/size also differs (`#625a51`/8px bold vs `#9c9c9c`/12px normal). |
| **Discount badge / price treatment** | **No pill/badge exists in original** — confirmed via grep (no "скидк", "badge", "%" pattern in ProductCardMini). Discount is shown purely via typography: `PriceBlock.jsx:40-49` — old price: `relative bottom-2.5 h-[2.5px] text-[12px] font-baron lowercase line-through text-[#BD52E9] font-bold`; new price: `text-[15px] font-bold` + `руб.` suffix at `text-[8px]` | **Also no pill/badge** — matches. `ProductCard.tsx:53-58`: old price `text-xs text-[#bd52e9] line-through` (not bold); new price `font-baron text-base font-semibold text-[#333]` + literal `₽` suffix (not separately styled/sized) | Minor typography gaps only (no missing badge — both apps intentionally skip a badge pill). Old-price weight: bold→normal. New-price size: 15px→16px (close). Currency suffix: original's "руб." is a separately-styled small span (`text-[8px]`); migrated's "₽" is unstyled inline text at full size. |
| Out-of-stock badge | `ProductCardMini.jsx:83-87` via `ProductThumb.jsx:23-27`: `absolute left-1 top-1 px-1.5 py-[1px] rounded-[6px] text-[9px] bg-black/60 text-white`, text "Нет в наличии" | `ProductCard.tsx:23-27`: `absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs bg-black/60 text-white`, text "нет в наличии" | Shape differs: `rounded-[6px]` (subtle rounded rect) → `rounded-full` (pill). Position offset 1px→2px. Font size 9px→12px (text-xs). Color/opacity (`black/60`) matches. |
| Add-to-cart button | `AddToCartButton.jsx` (ProductCardMini/parts): icon-only `+`, `w-[40px] h-[25px] rounded-[10px]`, default `bg-[#cbb7ff]`, hover `bg-purple-500`, active `bg-stone-200 scale-95`, disabled `bg-[#e5e2de] text-[#9c9c9c]` | `components/cart/AddToCartButton.tsx`: text button "в корзину"/"нет в наличии", `rounded-xl text-sm`, default `bg-[#cbb7ff] text-[#333]`, hover `bg-firework-red text-white`, disabled `bg-[#e5e2de] text-[#9c9c9c]` | Original is a compact icon-only `+` button (40×25px); migrated is a full text-label button — different shape/size/content entirely, though base purple `#cbb7ff` and disabled state match. |

## Assets to copy into migrated app

From `D:\Projects\Frontend\FIREWORK-original\src\assets\SVG\` and `public\promo\`:

**Category icons (9 files, all currently missing in migrated app — copy to `public/` or import from a new `assets` dir):**
- `icon-all1.svg`
- `icon-sal2.svg`
- `icon-rim3.svg`
- `icon-fon4.svg`
- `icon-pet5.svg`
- `icon-ver6.svg`
- `icon-hlop7.svg`
- `icon-ben8.svg`
- `icon-rak9.svg`

Order matters — `CategoryRow.jsx`'s `ICONS` array maps them to category index 0-8 in that exact order.

**Hero slider images (3 files, from `public/promo/`, currently no `public/promo/` dir exists in migrated app):**
- `tovar-1.webp` (145KB)
- `tovar-2.webp` (320KB)
- `tovar-3.webp` (99KB)

**Product card param icons (4 files, used inside each ProductCardMini for shots/time/caliber/effects — not checked against migrated ProductCard.tsx, which uses no icons for these params at all, text-only `<dl>`):**
- `radius.svg` (caliber)
- `rocket.svg` (shots)
- `star.svg` (effects)
- `time.svg` (duration)

**Not needed:** `bannerMain.svg` (3.5MB, dead code in original, do not port).

## Notes on methodology

Browser screenshot tool failed twice ("Browser pane is not displayed") on both origins, so this audit
falls back entirely to live `getComputedStyle()`/DOM queries via `javascript_tool` plus source reads.
The original app's responsive split (`useMediaQuery('(max-width: 1040px)')` in
`ResponsiveRoot.jsx:12`, switching between `LayoutMobile` and desktop `App`) meant the aside/card
selectors returned nothing until the emulated viewport was explicitly forced to 1440×900 and a manual
`resize` event dispatched — worth knowing if anyone else scripts this app.

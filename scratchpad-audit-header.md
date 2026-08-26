# Header / Nav / Footer / Logo Parity Audit

Original: `D:\Projects\Frontend\FIREWORK-original` (git 27e2560, running http://localhost:5173)
Migrated: `D:\Projects\Frontend\FIREWORK` (Next.js, running http://localhost:3000)

Verified live in-browser (JS `getComputedStyle`, screenshot tool unavailable this session —
"Browser pane is not displayed" on every retry, fell back to computed-style extraction per instructions)
at 1440px (desktop) and 375px (mobile, iPhone-ish).

## Top-level structural gap

The original renders **two entirely different component trees** depending on viewport, switched at
`(max-width: 1040px)` by `useMediaQuery` in `ResponsiveRoot.jsx`:
- **Desktop (>1040px):** `Header.jsx` + `SearchHeader.jsx` (search embedded in header) + no footer/nav drawer.
- **Mobile (≤1040px):** `HeaderMobile.jsx` (sticky, different bg/shape/height) + `BurgerMobile.jsx`
  (full slide-in drawer nav with categories, filters accordion, footer links) + `BottomBarMobile.jsx`
  (fixed bottom search+cart bar).

The migrated app has **one static `SiteHeader.tsx`** rendered identically at every width — confirmed live:
at 375px it is byte-identical markup to the 1440px version (`flex-wrap` is the only "responsive" behavior).
**There is no hamburger menu, no mobile drawer, no bottom bar, and no footer component anywhere in the
migrated codebase** (`find` for `*footer*` under `components/`/`app/` returns nothing).

Note: `FooterSection.jsx` and `FooterMobile.jsx` in the **original** are also dead code — grep confirms
neither is imported/mounted by any active route (App.jsx, ResponsiveRoot, LayoutMobile). So a literal
"footer" is not actually visible in the original live app either; treat footer parity as low-priority
unless product intent was for it to be wired up (flagging, not fixing — read-only audit).

| Element | Original (file:line, exact values) | Migrated (file:line, exact values) | Gap |
|---|---|---|---|
| **Header container (desktop)** | `Header.jsx:5-11` `bg-white rounded-b-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.2)]`, width `min(1240px,calc(100vw-20px))`, centered via `mx-auto`. Live @1440px: `background-color: rgb(255,255,255)`, `box-shadow: rgba(0,0,0,0.08) 0px 0px 10px 0px` *(note: computed alpha reads 0.08 not the 0.2 in source — Tailwind arbitrary value likely simplified/overridden; source literal is `rgba(0,0,0,0.2)`)*, `border-radius: 0px 0px 20px 20px` | `SiteHeader.tsx:8` `bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.08)]`, `w-full` (no `rounded-b`, no max-width cap on the header itself — only the inner `div` gets `max-w-[1240px]`). Live @1440px: `border-radius: 0px` | Migrated header has **square corners** (missing `rounded-b-[20px]`) and is full-bleed `w-full` instead of the pill-shaped, width-capped `min(1240px,calc(100vw-20px))` original. |
| **Header padding** | `Header.jsx:13` `py-4` wraps three stacked rows (`px-4` inner row) with a `my-4 h-[2px]` divider between rows 1 and 2 | `SiteHeader.tsx:9` `px-4 py-3` single wrapper, no divider | Missing the `h-[2px] bg-[#efebe6]` divider (`Header.jsx:42`) between the top info row and the logo/search row. |
| **Top info row typography** | `Header.jsx:16-38`: three-way split — left `text-[18px] text-[#625a51]` (city), center `h2 text-xl text-[#bf53eb]` (tagline, `title` attr for a11y, `max-w-[60%]`), right `text-[18px] text-[#625a51]` (legal entity). All `font-baron`. Live: tagline `color: rgb(191,83,235)`, `font-size: 20px`, city/entity `color: rgb(98,90,81)`, `font-size: 18px` | `SiteHeader.tsx:10-15`: all three are plain `<span>` at uniform `text-sm text-[#625a51]`, tagline gets only a color override `text-firework-red`. Live: **all three at 14px**, tagline `color: rgb(192,84,235)` | No size hierarchy — original's tagline is visually the largest/most prominent element (20px vs 18px siblings); migrated flattens all three to identical 14px `text-sm`, losing the emphasis. Also no `title` attribute / no `lowercase` distinction preserved as intentionally as original. |
| **Logo** | `Logotip.jsx:1-9`: `w-[120px] h-[40px] font-baron text-[25px] text-[#bd52e9]`, text "х-прайм", wrapped in `<a href='/'>` at `Header.jsx:46-48` inside a `flex items-center gap-15 ml-[79px]` row | `SiteHeader.tsx:18-23`: `<Link href="/">` text "Салюты", `text-xl font-bold text-[#1d0353]`, `min-h-11` (a11y tap target, good addition) | **Wrong brand text** ("Салюты" vs "х-прайм" — likely intentional content change, flag for confirmation), wrong color (`#1d0353` dark blue vs `#bd52e9` purple), smaller font (`text-xl`≈20px vs `25px`), no fixed `120×40` box, and it's `font-bold` (700) vs original's default weight (400, BaronNeue regular). Live confirms: original logo `color: rgb(189,82,233)` / `font-size: 25px`; migrated `color: rgb(29,3,83)` / `font-size: 20px`. |
| **Header layout (logo+search row)** | `Header.jsx:45-55`: `flex items-center gap-15 ml-[79px]`, logo `shrink-0`, search wrapped `max-w-[665px]` | `SiteHeader.tsx:17-25`: `flex items-center justify-between gap-3`, no left margin, no search — just logo + `CartButton` | Search bar is **not in the header at all** in migrated (see Search row below); layout is a simple 2-item flex, missing the 79px left offset and 60px gap (`gap-15` = 3.75rem) that gives original its centered, spaced-out look. |
| **Search bar (desktop)** | `SearchHeader.jsx:31-59`: `border border-[#efebe6] bg-white rounded-[20px] h-[50px] w-full max-w-[665px]`, magnifying-glass icon (`loop.svg`) absolute-positioned left, decorative `forwadding.svg` placeholder image that fades on focus/input, hover state `hover:bg-[#efebe6]` on the input. Live: `border: 0.8px solid rgb(239,235,230)`, `border-radius: 20px`, `height: 50px` | Not present in `SiteHeader.tsx` at all. A `SearchForm.tsx` exists under `components/catalogue/` but is not rendered in the header/layout | **Entire search-in-header feature is missing.** No icon, no decorative placeholder graphic, no rounded pill input in the header. |
| **Mobile header** | `HeaderMobile.jsx:7-16`: `sticky top-0 z-[120]`, `h-[60px] bg-[#efebe6]`, `rounded-bl-[30px] rounded-br-[10px]` (asymmetric corners), `shadow-[0_1px_6px_rgba(0,0,0,0.08)]`. Contains burger button + logo on the left, opening-hours text + store-location text + a `CursorSvg` "directions" link (to Yandex Maps) on the right (`HeaderMobile.jsx:28-49`). Live @375px confirmed: `background-color: rgb(239,235,230)`, `border-radius: 0px 0px 10px 30px`, `height: 60px` | No separate mobile header exists — the same `SiteHeader.tsx` renders unchanged. Live @375px: `background-color: rgb(255,255,255)`, `border-radius: 0px`, markup byte-identical to desktop | **100% missing.** Different bg color, different corner radii, different height, missing hours/location/directions block, no sticky behavior tuned for mobile. |
| **Mobile hamburger + drawer nav** | `BurgerMobile.jsx` (392 lines): trigger button renders `BurgerSvg` (`components/BurgerSvg/BurgerSvg.jsx` — 40×40 white circle, purple `#BD52E9` 3-bar icon), `aria-label='Открыть меню'`. Opens via `createPortal` a Framer Motion (`motion`/`AnimatePresence` from `framer-motion`) drawer: backdrop `fixed inset-0 bg-black/30` fade (`opacity 0→1`), drawer panel `motion.aside` `w-96 bg-[#EFEBE6]` sliding in via `drawerVariants` (`x: '-100%' → 0`, `type:'tween', duration:0.22, ease:'easeOut'`). Drawer contains: full category accordion (`CategoryRow`/`SubcategoryRow`, expand/collapse via height animation `duration:0.18`), a filters accordion toggle with `BurgerCloseSvg` for closing, footer-style links (контакты / оптовикам) and legal text at the bottom. Live confirmed: `aria-label="Открыть меню"` button present at 375px. | **No burger button, no drawer, no mobile nav of any kind.** Grep for `aria-label*="menu"` / `*="меню"` in migrated header returns nothing; no `motion`/`framer-motion` usage found in `components/layout` or `components/catalogue`. | **100% missing** — this is the single largest functional/visual gap in the whole audit area. Mobile users have no way to browse categories or reach контакты/оптовикам links; there is no off-canvas navigation pattern in the migrated app at all. |
| **Footer** | `FooterSection.jsx` (desktop, **dead/unmounted**) and `FooterMobile.jsx` (mobile, **dead/unmounted**): both `bg-[#efebe6] pt-[20px] pl-[31px] min-h-[100px]`, two-column `flex gap-[59px]` list — links (контакты, оптовикам, [mobile: условия доставки]) styled `text-[12px] font-bold text-[#625a51] font-inter tracking-wider uppercase`, hover `hover:text-[#bd52e9] active:text-[#997DF5]`; second column legal/address text, address line dimmed `text-[#d2cecb]`. Mobile variant adds responsive `max-[680px]:pl-[16px] max-[680px]:pt-[16px]` and `max-[680px]:gap-6 max-[360px]:gap-4`. | No footer component exists anywhere in `components/` or `app/`. | Both apps currently render **no visible footer** (original's footer components are unmounted dead code). Not a regression per se, but if footer is meant to ship, migrated has nothing to build from structurally that isn't already dead in the source — recommend confirming intended scope with the user before recreating it. |
| **Category nav (desktop left rail)** | `CategoryFilter.jsx` (not fully audited — out of this pass's deep-read, but mounted at `App.jsx:96-104`, sits in the sticky left column, separate from Header) | `CategoryNav.tsx:11-42`: `<nav>` `rounded-2xl bg-white p-2.5 shadow-[0_0_10px_0_rgba(0,0,0,0.08)]`, simple `<ul>` of links, `text-firework-red` active state | Structurally analogous (both a rounded white card of category links) but original's `CategoryFilter`/`CategoryRow` uses `font-baron` + custom active/hover states per `CategoryRow.jsx` (not deep-read this pass — flag for a follow-up audit of the category rail specifically, since it's adjacent to nav but is its own component tree). |
| **Fonts** | `index.css:4-26`: `BaronNeue` 400/700/900 via `@font-face`, plus `Calibri`, `Inter`, `Barlow` also declared and used elsewhere (footer uses `font-inter`) | `layout.tsx:15-23`: `next/font/local` loads BaronNeue 400/700/900 only — **Calibri intentionally dropped** (documented licensing-risk decision in code comments, not a bug) — but **Inter and Barlow are not loaded either**, and the footer copy (dead in original, but the class `font-inter` is referenced) has no Inter fallback if footer is ever resurrected | Intentional (Calibri) + incidental (Inter/Barlow) font gaps — the Inter gap only matters if footer/other Inter-using components get built out. |

## Icon / asset files to copy if the drawer nav and search bar are rebuilt

None of these exist under `D:\Projects\Frontend\FIREWORK\assets\` (only `assets/fonts/` currently exists — no SVG directory at all):

- `D:\Projects\Frontend\FIREWORK-original\src\assets\SVG\loop.svg` — search magnifying-glass icon (`SearchHeader.jsx:8,41`)
- `D:\Projects\Frontend\FIREWORK-original\src\assets\SVG\forwadding.svg` — decorative search-bar placeholder graphic (`SearchHeader.jsx:7,63`)

These are inline React SVG components, not asset files — port the component source, not a file copy:
- `D:\Projects\Frontend\FIREWORK-original\src\components\BurgerSvg\BurgerSvg.jsx` — hamburger trigger icon (40×40 white circle, `#BD52E9` bars)
- `D:\Projects\Frontend\FIREWORK-original\src\components\BurgerCloseSvg\BurgerCloseSvg.jsx` — drawer close icon (46×46 white circle, `#BD52E9` X)
- `D:\Projects\Frontend\FIREWORK-original\src\components\CursorSvg\CursorSvg.jsx` — "directions" pin icon used next to store hours in `HeaderMobile.jsx`

Not header-related despite living in `assets/SVG/` (`LOGO.svg`, `ipf.svg`, `placeTelef.svg`, `radius.svg` are used by ProductDetails/ProductCart/ProductCardMini, not Header/Footer/Logotip) — do not copy for this scope.

## Motion library

Original mobile drawer/accordions use `framer-motion` (`motion`, `AnimatePresence`) — `BurgerMobile.jsx:1`,
`BottomBarMobile.jsx:2`. **Confirmed: neither `framer-motion` nor `motion` is in `D:\Projects\Frontend\FIREWORK\package.json`** —
it needs adding before the drawer/accordion animations can be rebuilt, since Tailwind alone can't produce the
`x: '-100%' → 0` tween drawer slide or the height-auto accordion animations without JS.

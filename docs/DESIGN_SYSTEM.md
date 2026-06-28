# HORIZON — Design System „Cinematic Dark Glass" v1.0

Eine **Glas-Sprache** statt Stilbruch. Dark-first, ein Akzent (Blau), viel Schwarzraum,
transluzente Ebenen. Der frühere Brutalism-Stil (harte Border, Neon-Grün/Pink, Offset-Schatten)
wird **vollständig entfernt**.

> Quelle: „HORIZON Design System.pdf". Dieses Dokument ist die umgesetzte, korrigierte Referenz.
> Tokens leben in `app/globals.css` (`:root` = Dark, `.light` = Light) + Tailwind-v4-`@theme`.

## Token → Tailwind-Utility-Mapping

| Token (CSS var) | Dark | Light | Utility |
|---|---|---|---|
| `--bg` | `#060711` | `#EDF0F7` | `bg-bg` |
| `--bg-elev` | `#0A0C16` | `#FFFFFF` | `bg-elev` |
| `--surface-1/2/3` | white 3.5/6/9% | slate 3.5/6/9% | `bg-surface-1…` |
| `--border` | white 8% | slate 10% | `border-line` |
| `--border-strong` | white 16% | slate 18% | `border-line-strong` |
| `--text-1` | `#F3F5FB` | `#0E1320` | `text-fg` |
| `--text-2` | `#AAB1C4` | `#4C546A` | `text-muted` |
| `--text-3` | `#6C7385` | `#8A91A6` | `text-faint` (min 13px) |
| `--primary-500` | `#4F7BFF` | `#2A57D8` | `text-primary-500` (Links/aktiv) |
| `--primary-600` | `#2F5FE6` | `#2348B8` | `bg-primary-600` (Button-Fill) |
| `--gold` | `#F5B33B` | `#9A6612` | `text-gold` (**nur** Rating-★) |
| `--success/warning/danger` | `#34D399/#FBBF24/#F2565B` | … | `text-success` etc. |

**Radius:** `rounded-sm`(8 chip) · `rounded-md`(12 btn) · `rounded-lg`(16 card) · `rounded-xl`(22 panel) · `rounded-2xl`(30 hero).
**Elevation:** `shadow-card`(elev-1) · `shadow-pop`(elev-3 popover) · `shadow-glow`(Primary-Button). Dark setzt auf Helligkeit + Hairline statt harter Schatten.
**Fonts:** `font-display` = Space Grotesk (Hero/Sektionen, 600/700) · `font-sans` = Inter (UI/Body, default) · `font-mono` = JetBrains Mono (Tokens/IDs).

## Typo-Skala
- Display: Grotesk 700, `clamp(44px,…,76px)`, lh 1.0, -3% — Hero
- H1: Grotesk 600, 40, lh 1.08 · H2: 32 · H3 (Karten-Header): 24
- Karten-Titel: Inter 600, 18 · Body-L: 16/1.6 · Body (default): 15/1.6 · Small/Meta: 13 · Eyebrow: 12, +8%, UPPERCASE

## Motion
- fast 120ms (Hover/Press) · base 200ms (default) · slow 320ms (Modals) · slower 480ms (Hero)
- Easing: `cubic-bezier(.2,.8,.2,1)` standard · `(.16,1,.3,1)` emphasized
- Hover: -2px + Brightness · Press: scale .98 · Inhalt blendet +8px ein · `prefers-reduced-motion` respektieren

## Komponenten-Rezepte (Tailwind)

**Glas:** `bg-elev/55 backdrop-blur-xl border border-line shadow-card` (Light: `bg-white/70`) → Utility `.glass`.

**Button** (base): `inline-flex items-center gap-2 h-11 px-5 rounded-md text-sm font-medium transition active:scale-[.98] focus-visible:ring-2 focus-visible:ring-primary-400/50 disabled:opacity-50`
- primary: `bg-primary-600 hover:bg-primary-500 text-white shadow-glow font-semibold`
- secondary: `bg-white/[.06] hover:bg-white/[.1] border border-line text-fg backdrop-blur`
- ghost: `text-muted hover:bg-white/[.05]`
- danger: `bg-danger/12 text-danger border border-line hover:bg-danger/20`
- icon: `size-11 p-0 justify-center` · sizes: sm h-9 / md h-11 / lg h-[50px]

**Anime-Karte:** Bild-Box `aspect-[2/3] rounded-lg border border-line bg-elev overflow-hidden group-hover:-translate-y-0.5 group-hover:border-line-strong group-hover:shadow-pop`; Rating-Badge `rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur` + `Star fill-gold text-gold`; Quick-Actions als `from-black/80`-Scrim, `opacity-0 group-hover:opacity-100`. Titel `text-sm font-semibold text-fg`, Meta `text-xs text-faint`.

**Input:** `h-11 w-full rounded-md bg-white/[.04] border border-line px-3.5 text-sm text-fg placeholder:text-faint hover:border-line-strong focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30`. Label: `text-[11px] font-bold uppercase tracking-wider text-faint`. Error: `border-danger focus:ring-danger/30`.

**Tabs (segmented):** Container `inline-flex gap-1 rounded-full bg-white/[.06] border border-line p-1`; aktiv `bg-white/[.09] text-fg font-semibold`, idle `text-faint hover:text-muted`, je `rounded-full px-3.5 py-1.5 text-[13px]`.

**Filter-Chip:** on `bg-primary-500/15 border-primary-500 text-primary-500` · off `bg-white/[.06] border-line text-muted hover:text-fg`.

**Badges:** Rating `bg-black/60 text-white rounded-full px-2 py-1 text-xs` + gold-Star · Count `min-w-5 h-5 bg-danger text-white rounded-full text-[11px] grid place-items-center`.

**Dropdown:** `min-w-[200px] rounded-md border border-line-strong bg-elev/80 p-1.5 shadow-pop backdrop-blur-xl`; Item `rounded-sm px-3 py-2 text-[13px] text-muted hover:bg-white/[.06] hover:text-fg`.

**Toast:** `flex items-start gap-3 rounded-md border border-line-strong bg-elev/90 p-3.5 shadow-pop backdrop-blur-xl`, bottom-right, 3s; Motion y:16→0; Varianten success/danger/primary (Icon-Akzent).

**Status nie nur über Farbe** — immer Punkt/Icon + Label (Farbfehlsichtigkeit).

## Screen-Redesigns (Kurz)
- **Home/Hero:** stärkerer Links-Scrim (Titel AA), Buttons Primary/Secondary statt Mix, Quick-Cards gleiche Glas-Behandlung, Rail-Header als Eyebrow+Titel, Carousel-Pfeile als Icon-Buttons.
- **Suche:** Suchfeld groß (h-56) mit Icon + Focus-Ring, Filter-Chips darunter, Ergebnisse als Standard-Karten-Grid, Backdrop dunkler.
- **Hintergründe:** Landscape-Karten 16:9 r-lg + Bottom-Scrim, aktive Auswahl Primary-Ring + Check, „aktiv" als Info-Alert, Reset als Danger-Soft.
- **Legal:** sticky Sidebar-Nav (aktiv gefüllt), Content in r-xl-Karten, klare H2/H3.
- **Profil:** Inputs nach Spec (sichtbarer Border/Focus), Labels Caption-Uppercase, Avatar mit Ring, Logout Danger-Soft / Speichern Primary.
- **Home (eingeloggt):** Sektion-Header (Icon+Eyebrow+Titel), Activity-Feed als saubere Liste, Empty-States, 64px Sektions-Rhythmus.
- **Browse-Grid:** festes Gap + Spalten (2/3/4/6), ein Hover-System, Rating-Badges vereinheitlicht, Skeletons beim Laden.

## Umsetzungs-Status
- ✅ Fundament: Tokens (`globals.css`), `@theme`, Fonts (next/font), `.glass`, Body auf Tokens
- ✅ Watchlist-Button (Brutalist → Primary/Danger), Toast (System-Spec)
- ⬜ AnimeCard, Header/Nav, Inputs, Tabs/Chips, Dropdown, Empty-States, Skeletons
- ⬜ Screen-Politur (Home, Suche, Hintergründe, Legal, Profil, Browse-Grid)
- ⬜ Headings auf `font-display` umstellen
- ⬜ Cleanup: Legacy-Accent-Tokens entfernen, wenn keine Komponente sie mehr nutzt

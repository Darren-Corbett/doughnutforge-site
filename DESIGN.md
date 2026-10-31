---
name: Doughnut Forge website
description: The app's own colours, tab tones and system fonts, laid out as a plain, honest marketing and support site.
colors:
  forge-blue: "#1da1f2"
  forge-green: "#00ba7c"
  forge-orange: "#ff7a00"
  forge-violet: "#794bc4"
  forge-pink: "#f91880"
  ink-blue: "#09649c"
  ink-blue-dark: "#4cb5f5"
  ink-green: "#00704a"
  ink-green-dark: "#00c785"
  ink-orange: "#9c4a00"
  ink-orange-dark: "#ff8e26"
  ink-violet: "#6e3ebc"
  ink-violet-dark: "#ad91db"
  ink-pink: "#b00554"
  ink-pink-dark: "#fb6bae"
  night: "#15202b"
  night-panel: "#1e2732"
  night-line: "#38444d"
  page: "#f5f8fa"
  surface: "#ffffff"
  border: "#cbd5e1"
  card-border: "#e2e8f0"
  text: "#14171a"
  text-heading: "#0f172a"
  text-body: "#334155"
  text-secondary: "#475569"
  text-on-night: "#ffffff"
  text-secondary-on-night: "#cbd5e1"
  text-caption-on-night: "#94a3b8"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "clamp(38px, 10.5vw, 76px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "clamp(34px, 9vw, 60px)"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  section-title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "clamp(28px, 7vw, 44px)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  tagline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "clamp(20px, 5.5vw, 26px)"
    fontWeight: 800
    lineHeight: 1.25
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body-lead:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    letterSpacing: "0.1em"
  button:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif"
    fontSize: "17px"
    fontWeight: 800
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, Liberation Mono, monospace"
    fontSize: "15px"
    lineHeight: 1.5
rounded:
  code: "4px"
  focus: "6px"
  control: "10px"
  image: "12px"
  panel: "16px"
  card: "20px"
  sheet: "24px"
  pill: "9999px"
spacing:
  base: "4px"
  gutter: "16px"
  gutter-wide: "24px"
  stack-sm: "12px"
  stack-md: "16px"
  card-pad: "20px"
  stack-lg: "28px"
  section-y: "56px"
  section-y-wide: "80px"
components:
  button-primary:
    backgroundColor: "{colors.forge-blue}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
    height: "48px"
  button-quiet:
    textColor: "{colors.text-on-night}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
    height: "48px"
  button-outline:
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
    height: "48px"
  card-platform:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px 20px 22px"
  card-platform-dark:
    backgroundColor: "{colors.night-panel}"
    rounded: "{rounded.card}"
    padding: "20px 20px 22px"
  prose-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.sheet}"
    padding: "24px 20px"
  header:
    backgroundColor: "{colors.night}"
    textColor: "{colors.text-on-night}"
  page-hero:
    backgroundColor: "{colors.night}"
    textColor: "{colors.text-on-night}"
    padding: "36px 16px 44px"
  language-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "20px"
---

# Design System: Doughnut Forge website

## Overview

**Creative North Star: "The App, Unfolded"**

The site is the app laid out flat and explained page by page. Its colours, tab tones, system fonts and dark night surfaces all come from the app, so someone who has seen the app recognises the site, and the reverse. Nothing here is a separate marketing brand.

Every page opens on a night band, the app's dark colour, carrying the page's one heading. Below it, plain light sections (dark in dark mode) hold the facts in short blocks of heavy type. The app's five tab colours label the features, in the same order and with the same names. The feel is sturdy and friendly: heavy type, pill buttons, thick 2px edges and big round corners. Confident, never fussy.

The site follows the system light or dark setting with no script and no switch. It must hold up in 30 languages at 320px wide, so every rule about type and layout serves long words and other writing systems first.

**Key Characteristics:**
- The night band (`#15202b`) opens every page, in both themes.
- One loud colour, the app's blue; the four other tab tones label features only.
- System fonts only, at weights 800 and 900 for anything that is not body text.
- Flat surfaces with 2px edges; shadows only on things that float.
- Big, friendly corners (16 to 24px) and pill buttons.

## Colors

The app's palette, unchanged: a sky blue, four tab tones, and cool blue-grey neutrals that run from a night colour to near white.

### Primary
- **Forge Blue** (`forge-blue`): the primary button, the focus ring, the language menu's current-language dot, the encryption scan line. The one colour allowed to shout.

### Secondary
- **Forge Green** (`forge-green`): means "yours and ready". It edges the platform cards that are on sale, the "what your contact sees" pane, and the rule above the home page extras.

### Tertiary
- **Tab tones** (`forge-orange`, `forge-violet`, `forge-pink`, plus blue and green): the app's tab colours. Each feature row takes its tab's tone for its top rule and its ink for its name. Violet ink also sets the closing statement ("Privacy should not be a monthly bill."). A Forge Pink edge marks the support page's warning not to share secret files.

### Neutral
- **Night** (`night`): the header, every page hero, the home phones band, and the whole page in dark mode.
- **Night Panel** (`night-panel`): cards, panels and the footer in dark mode; the stranger's pane in the hero.
- **Night Line** (`night-line`): every edge in dark mode and on night bands, including the quiet button's border.
- **Page** (`page`) and **Surface** (`surface`): the light page and the cards and sheets on it.
- **Border** (`border`) and **Card Border** (`card-border`): edges in light mode. The outline button and language panel use the stronger one; cards, prose sheets and FAQ rules use the lighter one.
- **Text** (`text`), **Heading** (`text-heading`), **Body** (`text-body`), **Secondary** (`text-secondary`): near-black for headings and buttons, slate for reading text, a lighter slate for supporting lines.
- **On Night** (`text-on-night`, `text-secondary-on-night`, `text-caption-on-night`): white headings, light slate body text and a dimmer slate for captions on the night colour. Light slate is also the body text colour in dark mode.

### Named Rules
**The Ink Rule.** Coloured text and icons always use the ink version of a colour (`ink-*`, with its `-dark` partner in dark mode), which reaches 4.5:1 on every background. The bright tones (`forge-*`) are for borders, dots, rules and fills only.

**The Dark Text on Blue Rule.** The primary button puts near-black (`text`) on Forge Blue, at 6.4:1. White on Forge Blue fails contrast and is never used.

**The No New Colours Rule.** Every colour comes from the app. A new colour starts in the app, never here.

## Typography

**Display Font:** the system interface font (`system-ui` and its platform fallbacks)
**Body Font:** the same system font
**Label/Mono Font:** the system monospace font, only for ciphertext and inline code

**Character:** One family, worked hard through weight. Headings at 900 with tight tracking feel solid and direct; body text at 400 stays light and easy to read. Using the system font means nothing to download and every writing system covered.

### Hierarchy
- **Display** (`display`): the home page heading only, at most 12 characters wide per line.
- **Headline** (`headline`): the heading in every other page's night band, at most 18ch.
- **Section title** (`section-title`): each section's heading, at most 20ch. The closing statement and the feature row names use the same weight and tracking at a smaller size, about 26 to 38px.
- **Tagline** (`tagline`): the short second line under a night-band heading, in blue ink for night (`ink-blue-dark`).
- **Title** (`title`): card names (24px, 900), feature row and FAQ headings (19px, 800), blog headings (21px and 18px, 800).
- **Body** (`body`, `body-lead`): 17px for reading text, 18px for leads and section text; line length held to about 38 to 42rem. Blog prose runs at a line height of 1.65.
- **Label** (`label`): uppercase small headings in the footer and language menu.

### Named Rules
**The Fit the Longest Word Rule.** Large headings set their size in `--fs`, never in `font-size`. A shared rule in `global.css` shrinks a heading just enough for its longest word to fit the column (`src/middleware.ts` measures it). Words never break or hyphenate, in any language.

**The Script-Aware Spacing Rule.** Japanese, Chinese, Korean, Thai and Hindi get normal letter spacing, and taller heading line heights (1.25, or 1.35 for Thai and Hindi), overriding each component's Latin settings.

## Layout

A single column, phone first, that widens into grids.

- **Container:** 72rem wide, centred, with 16px gutters on phones and 24px from 768px.
- **Sections:** 56px top and bottom on phones, 80px from 768px. Every section is a size container, so headings fit their own column.
- **Night bands:** the page hero pads 36px top and 44px bottom on phones (56px and 64px from 768px). The home hero pads 40px and 48px, rising to 72px and 80px.
- **Grids:** platform cards go from one column to two at 640px and three at 1024px. Feature rows put the tab name beside its text at 768px (5:7). The home phone row shows two phones on small screens and three from 768px, the middle one set 40px lower.
- **Rhythm:** 4px base. 12px between a heading and its text, 16px between cards, 28 to 32px before a group.
- **Header:** every link stays visible on phones, in a row under the logo, with no menu button. Below 360px the links shrink (14px text, 2px side padding) so all four fit one row in every language.
- **Breakpoints:** 360px (header only), 640px, 768px, 1024px.
- Layout uses logical properties (`margin-inline`, `padding-inline`, `inset-inline`), so a right-to-left language can be added without a redesign.

## Elevation & Depth

Flat by default. Depth comes from the night band against the page and from 2px edges, not from shadows. Shadows appear only on things that float above the page.

### Shadow Vocabulary
- **Lifted pane** (`box-shadow: 0 18px 40px rgb(0 0 0 / 0.45)`): the "what your contact sees" pane, overlapping the stranger's pane in the home hero.
- **Floating menu** (`box-shadow: 0 18px 40px rgb(0 0 0 / 0.25)`): the language menu panel.
- **Device** (`box-shadow: 0 18px 36px rgb(0 0 0 / 0.35)`): phone screenshots.
- **Scan glow** (`box-shadow: 0 0 18px #1da1f2`): the blue line that sweeps across the note during the encryption animation.

### Named Rules
**The Floats Only Rule.** A shadow means something sits on top of something else. Cards, sheets and buttons at rest have none.

**The Dark Mode Edge Rule.** In dark mode the page is the same night colour as the hero, so the hero band and the phones band get a 2px bottom or top edge in Night Line.

## Shapes

Big, friendly corners and thick edges.

- **Pills** (`rounded.pill`): every button and the header links' hover shape.
- **Cards** (`rounded.card`, 20px): platform cards, the hero panes, the language menu, the press kit's copy blocks.
- **Sheets** (`rounded.sheet`, 24px): the blog and prose reading sheets, and the `/go/` handoff card.
- **Panels** (`rounded.panel`, 16px): smaller boxes in blog diagrams, the support page's warning and the Technical details page.
- **Small** (12px images in prose, 10px language links, 6px focus ring, 4px inline code).
- **Edges:** 2px borders throughout; 3px rules on feature rows and the extras block, in their tab tone.
- Phone screenshots use a proportional corner (11% / 5.2%) with a 3px Night Line edge, so they read as devices.

The site defines 8, 12 and 16px corner tokens and a blue glow shadow (`shadow-glow`) in `global.css`. No page uses them; pages write the values above directly.

## Components

### Buttons
Sturdy pills with heavy labels.
- **Shape:** pill, at least 48px tall, 10px by 24px padding, 17px at 800.
- **Primary:** Forge Blue with near-black text.
- **Quiet (on night bands):** no fill, 2px Night Line border, white text.
- **Outline (on light backgrounds):** no fill, 2px Border edge (Night Line in dark mode).
- **Long labels** wrap between words and stay centred.
- **Focus:** a 3px Forge Blue outline, 3px offset, on every focusable element.

### Cards / Containers
- **Platform cards:** Surface (Night Panel in dark mode), 20px corners, 2px Card Border edge (Night Line in dark mode), 20px padding. A card for a platform on sale gets a Forge Green edge in both themes; a "Coming soon" card shows its status in bold blue ink and has no link. The store badge sits at the bottom so badges line up across a row.
- **Prose sheets:** Surface, 24px corners, 2px Card Border edge, 24px by 20px padding, 42rem wide.

### Navigation
- **Header:** the night colour on every page. Logo and name on the left, four links, then the language menu. Links are 15px at 700 in light slate, white on hover with a faint white fill; the current page is white with a 2px blue-ink underline, 8px below the text.
- **Language menu:** a panel hanging below the header (across it on phones), 20px corners, 2px edge and the floating menu shadow. Languages sit in two columns of 44px-tall links; the current one is in blue ink with a blue dot.
- **Footer:** Surface (Night Panel in dark mode) with a 2px top edge; uppercase label headings over link lists, in one, two or three columns.

### Feature rows (signature)
The app's tabs as coloured rows. Each row has a 3px top rule in its tab tone, the app's own tab name in that tab's ink at section-title weight, then a 19px heading and 17px text. From 768px the name sits beside the text.

### Encryption specimen (signature)
The home hero's two overlapping panes. "What anyone else sees" is a Night Panel pane with a blue dot and monospace ciphertext in blue ink. "What your contact sees" is a white pane with a Forge Green edge and dot, lifted by the pane shadow and offset 8% inward. On load, a blue scan line sweeps across the note and turns it into ciphertext (1.8s, `cubic-bezier(0.65, 0, 0.35, 1)`, after 0.6s). Reduced motion removes the animation.

### FAQ
Native `details` elements between 2px Card Border rules, 46rem wide. Each question is a 19px heading, at least 56px tall to tap, with a blue-ink plus that turns into a minus when open.

### Store badges
The official store badge for each platform on sale, as each store's guidelines require. A branded fallback badge replaces an official one only when a content blocker hides it.

## Do's and Don'ts

### Do:
- **Do** open every page with the night band and its one heading.
- **Do** use ink colours for any coloured text, and the bright tones only for borders, dots, rules and fills.
- **Do** put near-black text on Forge Blue.
- **Do** set large heading sizes in `--fs` so the fit-the-longest-word rule applies.
- **Do** keep tap targets at least 44px (48px for buttons).
- **Do** give the app's features their own tab names and tab tones, in the app's order.
- **Do** check every page at 320px and 360px, in both themes, and in a long-word language.

### Don't:
- **Don't** add a colour, font or brand mark that is not in the app.
- **Don't** load web fonts, icon fonts or anything from another server.
- **Don't** put white text on Forge Blue.
- **Don't** break or hyphenate words to make text fit; change the layout instead.
- **Don't** add shadows to cards, sheets or buttons at rest.
- **Don't** hide the header links behind a menu button on phones.
- **Don't** tighten letter spacing in Japanese, Chinese, Korean, Thai or Hindi.
- **Don't** use Forge Green to decorate; it means on sale or yours.

# The Pall — Approved public homepage copy

**Owner revision:** 2026-10-29. Supersedes the earlier short homepage description and the assistant-written promotional feature sections. The site at `/` must distribute this owner-authored copy among the appropriate visual sections rather than reproducing it as one uninterrupted block.

## THE GAME

# Make a living. Find your own way.

*The Pall* is a free-to-play, persistent browser MMORPG set in a harsh, industrial world. Your character, skills, possessions and progress remain between sessions.

Nearly a century ago, a catastrophe called **The Plume** poisoned much of the world. Nobody knows what caused it. Now, most survivors live behind the enormous walls of Grand Cylinder City, where factories run day and night and thousands struggle to earn their keep. Beyond the walls lie dangerous, largely uncharted territories. And farther still, **the Pall**, where few dare venture.

**You're just another person trying to get by.**

Learn a trade, take jobs, build a business, explore or fight your way through trouble. There are no fixed classes. How you develop your skills, earn your coin and spend your days is entirely up to you.

But there's more to life here than making money.

**Mature, story-driven quests** explore corruption, exploitation, poverty, survival and the darker side of human nature. You'll meet people with their own troubles and motives, face uncomfortable choices and uncover stories that don't always have a clear right or wrong. Sometimes, doing the decent thing comes at a price.

**Crafting is a profession in its own right.** Gather resources, refine materials, manufacture components and assemble equipment. Your skills, tools, workshop, materials and decisions affect the quality of what you produce. There's genuine depth to mastering a trade.

And unlike many MMORPGs, **early-game materials don't become useless at higher levels**. Coal, iron, leather, cloth and basic components remain part of advanced production, maintenance and repairs. Even the best equipment needs ordinary materials and the craftsmen who produce them. A newcomer supplying basic goods can still have a place in the endgame economy.

Beyond the city, procedurally generated territories offer new places to explore, resources to uncover and dangers to face. Discover something valuable? Sell the information to other players, or keep it for yourself. Just make sure you're prepared. Equipment, supplies and decisions matter, especially when trouble turns into tactical, turn-based combat.

Be a craftsman, merchant, explorer, fighter, or a little of everything. You don't have to chase the same goals as everyone else.

**No pay-to-win. No forced PvP. No fixed classes.**

*The Pall* is in active development, with new locations, quests, professions and gameplay systems being introduced as the world takes shape.

## Presentation contract

- Use the supplied text throughout the landing page: game introduction in the hero, setting and ordinary-person hook directly after, player freedom, story-driven quests, crafting, economy, exploration/tactical combat, no pay-to-win pledge, and actual development status.
- Preserve The Pall logo, approved city panorama, supplied UI fonts, account links and public links to the canonical `/introduction`. The original owner-approved in-world lore remains untouched.
- Do not add back assistant-authored marketing paragraphs, speculative feature claims, player statistics, testimonials, fake release dates or a donation platform not approved by the owner.
- The owner wrote “You're are Just another person trying to get by”; only the obvious grammar and accidental capitalisation were corrected to “You're just another person trying to get by.” No other owner-authored meaning or copy has been rewritten.
- Product information about procedurally generated territories, the player economy, advanced crafting and later content is the **game's intended design**, not a claim these systems are playable in the current browser build. The active-development statement remains conspicuous.
- Free-to-play/no-pay-to-win/no-forced-PvP are owner-approved commitments. Do not introduce donor mechanics or exclusive purchases without separate approval.

## Approved landing-page visual correction — 2026-10-29

The public homepage now reuses the existing **owner-approved transparent nine-slice dialogue frame** `/ui-kit/frames/dialogue-frame-trim.png` around each main body-text section. The supplied **button-normal-trim.png**, **button-hover-trim.png** and **button-pressed-trim.png** sprites apply to the actual Create Account, Sign In and signed-in character CTA links; links continue to navigate normally, and focus outlines remain visible. No new artwork is invented.

For **readability, only prose paragraphs** in the homepage's narrative panels and hero description change to regular Georgia serif (17–19px on framed copy, about 18–20px in the hero), stronger dark ink on parchment, and 1.6–1.65 line spacing. The original headline sizes, font families and section-heading presentation must **not** change. Button labels retain the existing owner-approved font. The exact owner-authored text, including inline emphasis, remains intact.

Keep the ornamental parchment behind actual reading copy rather than behind artwork, labels or the skyline; the homepage is a public entry page, not a gameplay dialogue. Source assertions check the frame and button sprite paths, headings, font isolation, all approved copy paragraphs, and account navigation. Test local assets with `npm run verify:owner-ui-kit`, and source/UI types with `npm run verify:entry-pages` and `npm run check:web`.

## Owner-approved alternating illustration layout — 2026-10-29

The public homepage alternates real art and copy in six adjoining sections, in narrative order. On desktop: **Grand Cylinder City skyline art / World text**, **Your Path text / The Pall-zone art**, **records-room art / Stories text**, **Crafting text / workshop art**, **crafting-items art / Economy text**, **Exploration text / Grey Marches art**. On mobile the text remains grouped with its heading above each corresponding illustration; no content is dropped.

The homepage branding logo is larger (up to 174px wide) and its neighbouring **“A CITY ENDURES”** motto is removed **from this page**. The city artwork in the World section is framed from the **top** so that the sky and peak of the Grand Cylinder remain visible rather than showing the lower buildings again. Approved reading-parchment and three-state buttons remain intact, as does every paragraph of the owner's approved copy.

Three owner-provided image files are installed locally by unpacking `The_Pall_Homepage_Landscape_Assets_Patch.zip` **from the `platform` directory**:
- `apps/web/static/locations/homepage/pall-zone.webp` ← `ThePallZone-Background01.png`
- `apps/web/static/locations/homepage/crafting-items.webp` ← `CraftingItems.png`
- `apps/web/static/locations/homepage/grey-marches.webp` ← `GreyMarches_background01.png`

Images were converted to web-optimised WebP without repainting, reinterpreting or inventing any game visuals. Existing Workshop, Records and City assets are reused. They are **not committed as binary files** through the source-code connector. `npm run verify:homepage-art` checks all six local illustrations; `npm run verify:entry-pages` checks structure, panel order, assets and literal approved copy.

**Important privacy directive:** The Pall is a **closed-source game**. Never expose the private source-code repository or a public code-hosting/documentation link from any player-visible page. The previous repository links in Development have been removed. The only remaining link there leads to the first-party World Introduction page; curate genuine in-game patch notes and a roadmap later, without linking to the underlying source-code host.

## Full-width section backgrounds and logo placement — 2026-10-29 (latest)

The owner reviewed the alternating thumbnail-style sections and changed the visual direction: the **same six owner illustrations now cover their entire respective sections**, with headings and approved parchment-text frames overlaid on the artwork. Preserve the alternating **left/right reading-panel positions**, not separate Image/Text columns. Text stays legible through directional dark gradients; on mobile, a darker lower gradient keeps prose readable without hiding the entire illustration.

The section sequence remains unchanged: World → classless Path → Stories → Crafting → Economy → Grey Marches exploration. The city backdrop must still privilege the **top skyline and Cylinder peak** (`background-position:center top`). Use the existing six files; no revised image archive is required.

The owner's two marked empty areas now show the **approved full-size logo** from `/ui-kit/branding/logo-full.png`: centred in a brand divider between the Free to Play pledge and Development, and as a significantly larger link on the **left side of the footer**. The header's approved compact logo remains. Do not restore the `A CITY ENDURES` text.

Keep paragraph typography, original headings, nine-slice dialogue artwork, real button-state artwork, account actions and every word of approved homepage copy intact. The game remains closed-source: there must be no developer repository links anywhere on public pages. The logo asset is already part of the installed owner UI kit, so no new ZIP or database migration is needed.

Verification after pulling: `npm run verify:owner-ui-kit`, `npm run verify:homepage-art`, `npm run verify:entry-pages`, `npm run check:web`, and `npm run build -w @the-pall/web`. Code-level checks do **not** substitute for browser/layout inspection.

## Unified city masthead and larger header logo — 2026-10-29

The owner approved one final refinement of the first screen: the **main navigation now blends directly into the city hero**, rather than sitting on a separate black band. Wrap the homepage navigation and hero in a single `.landing-masthead` using **one continuous instance** of the existing `/ui-kit/resources/TheCityVista.png`. Do not duplicate it as a hero-specific background image, which can cause misaligned city buildings across the navigation border. Use restrained translucent gradients for navigation contrast and hero prose legibility.

The top-left, owner-approved compact logo becomes larger (responsive `clamp(188px,16.5vw,248px)` on desktop, `clamp(162px,35vw,205px)` on mobile); the old “A CITY ENDURES” text remains absent. The existing full-size logos in the middle-page divider and footer stay unchanged. Navigation links, account behavior, the approved gameplay copy, six background illustration sections, frames and buttons are unaffected. No new image pack or database migration is required.

Verification: `npm run verify:entry-pages` now checks that the header and hero share a single panorama source and that the top-left logo is larger and responsive. Review the actual page at `/` for seamless city architecture between nav and hero, readable links, and no horizontal overflow at narrower widths.

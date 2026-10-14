# DevScaleSolution — agency website

A static, dark-theme marketing site built with **HTML5, CSS3 and vanilla JavaScript**.
No framework, no bundler, no build step. Open it through any static server and it works.

Live URL (canonical): <https://devscalesolution.pages.dev/>

---

## Run it locally

Any static server will do. Pick one:

```bash
# Node
npm start                 # npx serve . -l 3000  → http://localhost:3000

# Python
npm run start:python      # or: python3 -m http.server 3000
```

Opening `index.html` directly from the file system also works, but use a server for the most realistic test.

Check the project structure (paths, anchors, ARIA references, JS syntax):

```bash
npm run validate
```

This is a static check only. It does not replace testing in real browsers.

---

## Project structure

```
devscalesolution/
├── index.html
├── css/
│   ├── main.css          design tokens, base, layout, header, hero, section layouts
│   ├── components.css    buttons, service/work cards, dialog, editor, FAQ, form
│   ├── animations.css    keyframes, hero entrance, scroll reveals, reduced motion
│   └── responsive.css    mobile-first breakpoints
├── js/
│   ├── config.js         ← the one file you edit for business details
│   ├── navigation.js     sticky header, mobile menu, active-section highlight
│   ├── animations.js     reveals, headline word split, process timeline
│   ├── portfolio.js      concept filter + concept dialogs
│   ├── faq.js            accessible accordion
│   ├── contact.js        validation + submit handling + direct-contact CTA
│   └── main.js           bootstraps modules, year, social links, back-to-top
├── img/
│   ├── logo/             mark.svg, favicon.svg
│   └── og-image.png      1200×630 social sharing image
├── scripts/validate.js   dependency-free project check
├── package.json
└── LICENSE
```

**Why there is no `scss/`, `less/`, `gulpfile.js`, `lib/` or `mail/`:** the brief says the site must run without a
build step, and shipping a second copy of the styles would let them drift out of sync. If you later want Sass, move the CSS
into partials and add a build script at that time.

---

## Configure your business details (`js/config.js`)

Nothing unverified is hard-coded. Add details only when they are real.

| Setting | What it does |
| --- | --- |
| `availability.show` / `availability.text` | Hero availability pill. Hide it or change the wording. |
| `contact.formEndpoint` | HTTPS endpoint that receives the form (e.g. Formspree). Empty = **demo mode**. |
| `contact.email` | Enables the “Send this by email instead” fallback and the direct-contact CTA. |
| `contact.directCta` | Custom label/URL for the direct-contact button (booking page, WhatsApp, etc.). |
| `contact.minSubmitSeconds` | Minimum time on page before a submit is accepted (bot deterrent). |
| `social` | Footer social links. Only appear when you list them (HTTPS only). |

### The contact form is in demo mode until you connect it

With `formEndpoint` empty, the form validates input and then tells the visitor clearly that **nothing was sent**
(and offers a mailto/copy fallback). It never pretends to deliver a message.

To connect it:

1. Create a form at a provider such as [Formspree](https://formspree.io) (or your own endpoint).
2. Paste the HTTPS URL into `contact.formEndpoint` in `js/config.js`.
3. Test a real submission and confirm it arrives. The success message only appears when the endpoint returns an OK response.

**Spam protection included:** hidden honeypot field (`_gotcha`), minimum time-to-submit, server-side-friendly field names.
**Recommended next:** enable your provider’s spam filtering/CAPTCHA, or add [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
(site key is public; the secret key must live on the server/provider, never in this repo).

### Structured data

`index.html` contains a minimal `ProfessionalService` JSON-LD block (name, URL, description). Add address, phone,
email or social profiles there only once they are verified.

---

## Customising content

- **Copy:** all text is plain HTML in `index.html`.
- **Colours / type / spacing:** tokens at the top of `css/main.css` (`:root`).
- **Concept projects:** the three previews are inline SVG in the `#work` section and are labelled “Concept project”.
  When you have real work, replace the SVG with a real image (`<img loading="lazy" width height alt>`), update the title and
  objective, and remove the “Concept project” badge and dialog text.
- **Testimonials:** the “Our approach” section (`#approach`) is deliberately written so it can be swapped for real,
  approved client quotes. Don’t publish a quote without the client’s permission.
- **Fonts:** Space Grotesk and Manrope load from Google Fonts. If blocked, system fonts take over. To self-host, download the
  font files, add `@font-face` rules to `css/main.css`, and remove the three Google Fonts `<link>` tags.
- **Social image:** replace `img/og-image.png` (1200×630) to change link previews.

---

## Animation system

- Page entrance: pure CSS (staggered headline words, content, hero visual). Finishes in about a second.
- Scroll reveals: one `IntersectionObserver`; elements are unobserved after they appear.
- Headline word reveal: words are wrapped in spans, but the text stays real text in the DOM.
- Process timeline: a single `requestAnimationFrame`-throttled scroll listener, active only while the timeline is near the viewport.
- Only `transform` and `opacity` are animated for scroll effects. No parallax, no scroll hijacking.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, scripted reveals are not enabled and CSS animations collapse to their end state.
- **No-JS safety:** hidden states only apply after JavaScript sets `.js-ready`, so content is visible if scripts fail.

I chose not to add a custom cursor; it would add complexity and accessibility risk without a clear benefit.

---

## Deploy

The site is plain static files, so it works on any static host.

**Cloudflare Pages** (matches the `pages.dev` URL):

1. Push this folder to a Git repository.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset: **None**. Build command: *(empty)*. Build output directory: `/` (the repo root).
4. Deploy. If you add a custom domain, update the canonical URL and `og:`/`twitter:` URLs in `index.html`.

Other hosts (Netlify, GitHub Pages, Vercel static, any web server) only need the folder contents uploaded as-is.

---

## Manual QA checklist

Run this in a real browser before launch:

- [ ] Every nav link scrolls to its section and headings sit clear of the sticky header
- [ ] Mobile menu opens, closes with link tap and Esc, and traps focus behind the overlay
- [ ] Tab through the whole page: focus is always visible; FAQ and filters work from the keyboard
- [ ] Concept dialogs open, close with Esc / the close button / backdrop click
- [ ] Form: empty submit shows errors; valid submit shows the demo-mode message (or real success once connected)
- [ ] 320 px, 390 px, 768 px, 1024 px, 1440 px: no horizontal scroll
- [ ] OS “reduce motion” enabled: nothing slides or fades in
- [ ] Lighthouse accessibility / performance pass

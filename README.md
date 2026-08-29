# Logovilage — website + admin panel

A dark, premium-styled static site (no build step) with a visual admin panel (Decap CMS) so you can
update portfolio items, pricing, blog posts, site text, and even your logo — without touching code.

Design notes: dark "Nightfall Village" theme, animated LV logomark (draws itself on load), custom
cursor, ambient glow, glass-style cards, and a scrolling services marquee. Colours, fonts and effects
all live in `css/style.css` and `js/main.js` if you ever want to adjust them.

## What's inside
```
index.html, about.html, work.html, pricing.html,
blog.html, blog-post.html, contact.html, privacy-policy.html
css/style.css        → all design/colours
js/main.js           → loads content JSON into the pages
content/*.json        → EVERYTHING editable: portfolio, pricing, blogs, site text
admin/                → the visual editor (Decap CMS)
uploads/              → uploaded images land here automatically
netlify.toml           → Netlify config
```

## 1. Put this on GitHub
1. Create a new empty repository on github.com (e.g. `logovillage`).
2. Upload this whole folder into it (drag-and-drop on github.com works, or use `git push` if you're comfortable with git).

## 2. Connect it to Netlify
1. On app.netlify.com → **Add new site → Import an existing project → GitHub** → pick the repo.
2. Build command: leave empty. Publish directory: `.` (already set in netlify.toml).
3. Click **Deploy**. You'll get a `something.netlify.app` URL — confirm the site loads.

## 3. Add your custom domain
1. Site settings → **Domain management → Add a domain** → enter `logovilage.com`.
2. Netlify shows you DNS records (usually an A record + CNAME). Add those at wherever you bought the domain.
3. Wait for DNS to propagate (can take from minutes to a few hours) — Netlify issues a free HTTPS certificate automatically once it verifies.

## 4. Turn on the admin panel (one-time setup)
1. Site settings → **Identity → Enable Identity**.
2. Still in Identity → **Registration** → set to **Invite only** (so strangers can't sign up).
3. Identity → **Services → Git Gateway → Enable Git Gateway**.
4. Go to the **Identity** tab (top of the Netlify dashboard for this site) → **Invite users** → enter your own email.
5. Check your inbox → click the invite link → it opens your site and asks you to set a password.
6. After setting a password you're logged in and redirected to `/admin`.

From now on, log in any time at **logovilage.com/admin**.

## 5. How to update things — day to day

**Add/edit a portfolio piece:** `/admin` → *Our Work (Portfolio)* → *Portfolio Items* → click into the file → **Add item** → fill in title, category, description, and click the image box to upload a photo straight from your computer → **Save**, then **Publish**. Live in under a minute.

**Change a price or package feature:** `/admin` → *Pricing Packages* → edit the fields directly (price, features list, highlight toggle) → **Publish**.

**Write a blog post:** `/admin` → *Blog Posts* → **Add item** → title, a URL-friendly slug (e.g. `my-first-post`, no spaces), date, cover image, short excerpt, and the full article (supports headings, bold, lists — formatted like a simple word processor) → **Publish**.

**Upload your own logo (optional):** `/admin` → *Site Text* → *Custom Site Logo* → upload an image. Once set, it replaces the animated LV mark in the header and footer everywhere on the site. Leave it empty to keep the default animated mark.

**Update homepage text / About Us / contact details:** `/admin` → *Site Text* → edit → **Publish**.

**Uploading images — where and how:** Anywhere you see an image field in the admin panel, click it and either drag a file in or pick one from your computer. Decap CMS stores it in the `/uploads` folder of your GitHub repo automatically and links it in — you never need to touch a file path yourself. This is the simplest option and needs no extra account.
　*(Optional upgrade later: connect a Cloudinary account for faster image delivery/auto-resizing — ask if you want this added; not required to launch.)*

## 6. Is Netlify fast?
Yes — this site has no server and no database; every page is plain HTML served from Netlify's global CDN, so it loads quickly worldwide. The only "wait" is the few seconds Netlify takes to redeploy after you click Publish in the admin panel.

## 7. Before going live — replace the placeholders
- `content/work.json` — swap the 6 sample portfolio pieces for your real projects (via `/admin`, not by editing the file directly, once it's live).
- `content/pricing.json` — the Basic/SME/Startup prices and features are starting suggestions — adjust to what you actually want to charge.
- `content/blogs.json` — 2 sample posts are included; delete or replace via `/admin`.
- `content/site.json` — placeholder email/phone/WhatsApp number — update via `/admin`.
- Footer copyright / social links — currently plain text in the HTML files, edit directly if needed.
- Contact form — already wired to Netlify Forms (no backend needed); submissions appear in Netlify dashboard → **Forms**. Consider turning on email notifications there.

## 8. GDPR / privacy
`privacy-policy.html` is a starting template, not legal advice — review and adjust it (or have it reviewed) before relying on it, especially since you're collecting names/emails via the contact form.

# Give Me The Pitch Site

Projet Next.js qui sert actuellement les pages HTML legacy du site, avec des routes Next dediees pour chaque page principale.

## Routes

- `/theroom` -> `theroom.html`
- `/keyaccess` -> `keyaccess.html`
- `/mareenoire` -> `maréenoire.html`
- `/formtest` -> `formtest.html`
- `/cgu` -> `cgu.html`
- `/confidentialite` -> `confidentialite.html`
- `/cookies` -> `cookies.html`
- `/mentions-legales` -> `mentions-legales.html`
- `/nda` -> `nda.html`

## Structure

- `app/` : routes Next.js
- `app/[slug]/page.js` : fallback pour toute page legacy non encore declaree
- `components/LegacyPageRenderer.js` : rendu des pages legacy
- `lib/site-pages.js` : manifeste central des pages et slugs
- `lib/legacy-route.js` : helper commun pour les routes dediees
- `lib/legacy-html.js` : lecture et adaptation des fichiers HTML existants
- `public/` : assets web servis par Next, dont les teasers video
- `*.html` : sources legacy encore actives

## Dev

```bash
npm run dev -- --hostname 0.0.0.0
```

## Notes

- Les liens internes vers `*.html` sont reecrits vers les routes Next.
- Les pages sont lues directement depuis les fichiers HTML source pour refleter les modifications sans rebuild.
- La prochaine vraie etape est d'extraire `theroom`, `keyaccess` et `mareenoire` en composants React natifs, section par section.

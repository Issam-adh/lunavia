# Lunavia Travel & Tourism

The complete Angular project for Lunavia’s French and Arabic travel website, including the rotating world map, private bilingual content editor and production server.

## Open in VS Code on Windows

Extract the ZIP. Open the folder containing `package.json` in VS Code. Use Node.js 24.15 or later in the Node 24 LTS line. In the integrated terminal run

```sh
npm ci
npm start
```

Open http://127.0.0.1:4200 for the site and http://127.0.0.1:4200/admin for the editor. At first launch the terminal displays the local test username and a random password. Sign in and change both under **Identifiant et mot de passe**. Local drafts and settings persist in `.lunavia-local/`. Each extracted copy has its own development database. The hosted site has separate credentials and storage.

## Edit and publish

Select a section and language. Search for the current wording, edit it, and select **Enregistrer le brouillon** to save privately. **Publier les textes** makes both language versions visible on the next page load. Shared phrases appear consistently wherever the same bilingual pair is used. Updates from two editor tabs are checked against the saved revision.

## Development and private deployment

```sh
npm run check
npm test
npm run build
```

`npm start` serves the complete local application and editor. `npm run start:angular` starts Angular’s frontend development server. The production build puts the Angular routes, local media, editor templates and API in a Worker at `dist/server/index.js`. Keep the existing Sites project identity and owner-only audience. The `DB` binding uses the migration under `drizzle/`. Set `LUNAVIA_ADMIN_USER` and the secret `LUNAVIA_ADMIN_PASSWORD` in Sites for initial provisioning. Subsequent credential changes take place in the authenticated editor. A hosted admin session also requires the private site’s authenticated identity.

The globe uses locally bundled Natural Earth coastlines and respects the existing pause, reduced-motion and off-screen controls.

## Project structure

- `src/app/store.ts`: agency contact information, French/Arabic destination content, itineraries, language and favorites.
- `src/app/pages.ts`: page behavior, filtering, routing data and inquiry preparation.
- `src/app/home.html`, `destinations.html`, `detail.html`, `contact.html`, `about.html`: page templates.
- `src/app/app.html`: shared navigation, footer and contact shortcuts.
- `src/styles.css`: responsive styling and animations, including reduced-motion support.
- `public/images/credits.json`: image sources and credits.
- `server/` and `drizzle/` contain the editor API, login and editor pages, session handling and SQL schema.

## Content and inquiries

The agency name, address, services, two phone numbers and email were taken from Lunavia's public Facebook page. Destination examples, suggested durations and sample itineraries are explicitly presented as inspiration, not bookable offers or confirmed inventory. Replace them with agency-approved packages when available.

The contact-page and footer directions links use the exact Google Maps listing supplied by the agency: https://maps.app.goo.gl/SWYfZvRjhtC3eXrCA?g_st=ac. The location URL is defined once as `agencyMaps` in `src/app/store.ts`.

The form lets visitors choose WhatsApp or email first, validates and prepares an inquiry, then offers `mailto:` and WhatsApp links. Visitors review and send from their own application. The server stores editor accounts and website copy. Visitors complete their inquiries in their own email or WhatsApp app. Form content stays in page memory; language and favorites are stored only in the visitor's local browser.

The official gold globe-and-aircraft logo was retrieved from Lunavia’s public Facebook profile photo. The original image bytes are unchanged; CSS frames its mark and wordmark into a responsive header treatment. The WhatsApp shortcut uses the agency's listed primary phone number; the agency should confirm it is WhatsApp-enabled before a public launch.

## Assets

Photos are bundled locally. Sources and creators are in `public/images/credits.json`. Photography is used under the Unsplash and Pexels licenses. Typefaces are Cormorant Garamond, DM Sans and Noto Sans Arabic from Google Fonts, with local font files. Font licenses are included in `public/fonts/`.


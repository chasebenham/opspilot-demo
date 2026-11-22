# OpsPilot Demo

A browser-local portfolio simulation of a fictional enterprise. The full OpsPilot application uses FastAPI, PostgreSQL, and OpenAI; this standalone demo does not contact them. Its simulated role selector is not authentication. Avoid entering real or sensitive information: browser storage is local to your browser and is not production persistence.

## Local setup

```powershell
npm install
npm run dev
```

Open the Vite URL under `/opspilot/`. `npm test` runs deterministic tests; `npm run build` produces static assets in `dist/`. No backend, database, environment file, or paid API calls are required.

## Hosting in Astro and Netlify

Run `npm ci` and `npm run build`, then copy the **contents** of `dist/` into your Astro site's `public/opspilot/` directory. Deploy the Astro site normally to Netlify. Vite uses `/opspilot/` as its asset base and the demo uses hash routing, so `https://chasebenham.com/opspilot/#/requests` works after refresh without custom redirects. Do not publish the demo repository's source map or local browser data.

## Scenarios and limitations

Try the guided IT incident, $4,500 purchase approval, and marketing campaign project. Use the demo-user switcher to simulate different responsibilities. The clock is simulated; incident targets are simplified elapsed minutes. Reset Demo restores the known fictional dataset. Browser local storage can be cleared by the browser and is not shared with other visitors. The CRM panel replays a sanitized, previously recorded synthetic model response; the other four panels are authored illustrations. No panel calls an AI service. User-entered text is never sent to a server by the demo. Analytics and financial scenarios are fictional illustrations, not measured business value. The simulated controls are not a security boundary and no financial transaction occurs.

The source and limitations for the historical three-case evaluation are recorded in [evaluation provenance](docs/evaluation-provenance.md). Browser storage is scoped to the site's origin and browser profile; other scripts on the same origin may be able to read it.

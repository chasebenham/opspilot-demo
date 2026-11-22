# OpsPilot Demo

A browser-local portfolio simulation of a fictional enterprise. The full OpsPilot application uses FastAPI, PostgreSQL, and OpenAI; this standalone demo does not contact them. Its simulated role selector is not authentication. Avoid entering real or sensitive information: browser storage is local to your browser and is not production persistence.

## Local setup

```powershell
npm install
npm run dev
```

Open the Vite URL under `/opspilot/`. `npm test` runs deterministic tests; `npm run build` produces static assets in `dist/`. No backend, database, environment file, or paid API calls are required.

## Publish inside a static HTML portfolio

The Vite production base is `/opspilot/` and the app uses hash routing. The build output is **`dist/`**; copy its contents into the portfolio's `opspilot/` folder, keeping its `assets/` subfolder intact. These commands modify the portfolio folder only when you run them.

```powershell
Set-Location 'C:\Users\chase\Documents\GitHub\opspilot-demo'
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed; nothing was copied.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed; nothing was copied.' }
$demoOutput = 'C:\Users\chase\Documents\GitHub\opspilot-demo\dist'
$portfolioDemo = 'C:\Users\chase\Documents\Chase_Website\Website\opspilot'
New-Item -ItemType Directory -Force -Path $portfolioDemo | Out-Null
Copy-Item -Path (Join-Path $demoOutput '*') -Destination $portfolioDemo -Recurse -Force
```

After reviewing the copied files, commit and publish the HTML portfolio using its usual process. Link to `/opspilot/` from the portfolio. Hash URLs such as `/opspilot/#/requests` support navigation and refresh without server-side route rewrites. Test through an HTTP static server; opening HTML directly with `file://` cannot resolve the absolute asset paths.

For future updates, repeat the test and build commands in the independent demo repository, copy the updated `dist/` contents, and republish the portfolio. Copying overwrites matching names but does not remove older hashed assets; review obsolete files in the portfolio's `opspilot/assets/` folder during deployment. Do not copy `node_modules`, the source tree, or local storage. No backend, API key, or paid service is needed.

## Scenarios and limitations

Try the guided IT incident, $4,500 purchase approval, and marketing campaign project. Use the demo-user switcher to simulate different responsibilities. The clock is simulated; incident targets are simplified elapsed minutes. Reset Demo restores the known fictional dataset. Browser local storage can be cleared by the browser and is not shared with other visitors. The CRM panel replays a sanitized, previously recorded synthetic model response; the other four panels are authored illustrations. No panel calls an AI service. User-entered text is never sent to a server by the demo. Analytics and financial scenarios are fictional illustrations, not measured business value. The simulated controls are not a security boundary and no financial transaction occurs.

The source and limitations for the historical three-case evaluation are recorded in [evaluation provenance](docs/evaluation-provenance.md). Browser storage is scoped to the site's origin and browser profile; other scripts on the same origin may be able to read it.

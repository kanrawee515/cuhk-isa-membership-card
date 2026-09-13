# ISA Membership Card

A lookup tool for the International Student Association. Members enter their
Student ID and full name to see a flippable 3D membership card with their
name, SID, a QR code, and join date.

## Running it

No build step or server required — just open `index.html` in a browser.

Optionally, to serve it over HTTP (e.g. for testing), run on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then visit `http://localhost:8000`.

## Adding or editing members

There are two ways to manage the roster:

### Option A: Local file (default)

Edit [`data/members.js`](data/members.js) and add an entry to the `MEMBERS`
array:

```js
{ sid: "12345678", name: "Full Name", joinDate: "2025-09-01" }
```

- `sid` — student ID, as a string (preserves leading zeros)
- `name` — matched case-insensitively against what the member types
- `joinDate` — ISO date `YYYY-MM-DD`

This is used automatically whenever `SHEET_CSV_URL` in `config.js` is empty.

### Option B: Live Google Sheet

Lets anyone with edit access to the sheet update the roster without touching
code — the site re-fetches it on every page load.

1. Create a Google Sheet with a header row: `sid`, `name`, `joinDate` (exact
   spelling, any column order). Fill in one row per member.
2. **File → Share → Publish to web**. Under "Link", choose the specific
   sheet/tab and set the format to **Comma-separated values (.csv)**, then
   click **Publish**.
3. Copy the generated URL (looks like
   `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`).
4. Paste it into [`config.js`](config.js):
   ```js
   const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv";
   ```
5. Serve the site over HTTP (see "Running it" above, or once deployed to
   GitHub Pages) — the browser blocks this fetch when the page is opened
   directly as a local `file://` path.

If the sheet can't be reached (no internet, wrong URL, sheet unpublished),
the site automatically falls back to `data/members.js` and shows a small
notice under the search button.

## Deploying

Since this is a static site (HTML/CSS/JS, no backend), it can be hosted for
free on GitHub Pages: push this repo to GitHub, then enable Pages for the
`main` branch in the repo settings.

## Project structure

```
index.html        Page markup and card layout
style.css          Styling, including the 3D flip animation
script.js          Lookup logic, sheet fetching/CSV parsing, QR generation, flip interaction
config.js          Set SHEET_CSV_URL here to pull data from a published Google Sheet
data/members.js    Local/fallback membership list
lib/qrcode.js      Third-party QR code generator (kazuhikoarase/qrcode-generator)
serve.ps1          Optional local static file server (PowerShell)
```

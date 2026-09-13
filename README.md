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

### Option B: Live Google Sheet (recommended — keeps real member data out of git)

Lets anyone with edit access to the sheet update the roster without touching
code or committing to the repo — the site re-fetches it on every page load.

1. Create a Google Sheet with a header row: `sid`, `name`, `joinDate` (exact
   spelling, any column order). Fill in one row per member.
2. Make sure it's shared as **"Anyone with the link" → Viewer** (Share
   button, top right).
3. Build the CSV export URL from the sheet's ID (the long string in its
   normal edit URL, `https://docs.google.com/spreadsheets/d/<ID>/edit`):
   ```
   https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=Sheet1
   ```
   (replace `Sheet1` if your tab is named differently)
4. Paste it into [`config.js`](config.js):
   ```js
   const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=Sheet1";
   ```
5. Serve the site over HTTP (see "Running it" above, or once deployed to
   GitHub Pages) — the browser blocks this fetch when the page is opened
   directly as a local `file://` path.

If the sheet can't be reached (no internet, wrong URL, sharing not enabled),
the site automatically falls back to `data/members.js` and shows a small
notice under the search button.

**Privacy note:** "Anyone with the link" means exactly that — anyone who has
or guesses the sheet/CSV URL can read it, and that URL is visible to anyone
who inspects the live site's network requests. This keeps real member data
out of the public git history (which can't be un-published later), but it is
not real access control. Don't rely on this for data that needs to stay
private from the general public.

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

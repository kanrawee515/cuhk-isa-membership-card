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

Edit [`data/members.js`](data/members.js) and add an entry to the `MEMBERS`
array:

```js
{ sid: "12345678", name: "Full Name", joinDate: "2025-09-01" }
```

- `sid` — student ID, as a string (preserves leading zeros)
- `name` — matched case-insensitively against what the member types
- `joinDate` — ISO date `YYYY-MM-DD`

## Deploying

Since this is a static site (HTML/CSS/JS, no backend), it can be hosted for
free on GitHub Pages: push this repo to GitHub, then enable Pages for the
`main` branch in the repo settings.

## Project structure

```
index.html        Page markup and card layout
style.css          Styling, including the 3D flip animation
script.js          Lookup logic, QR generation, flip interaction
data/members.js    Editable membership list
lib/qrcode.js      Third-party QR code generator (kazuhikoarase/qrcode-generator)
serve.ps1          Optional local static file server (PowerShell)
```

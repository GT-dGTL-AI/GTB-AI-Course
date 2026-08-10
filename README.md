# GT Bharat — Course Landing Page + Registration System

A responsive, animated 3-section landing page (Courses → Mentor → Register) built with
plain HTML/CSS/JS, styled after growthschool.io's design language, backed by a
Google Apps Script + Google Sheets registration pipeline. Deployable on GitHub Pages
with zero build tools.

## 1. What's inside

```
index.html                    Single-page site: header + 3 sections + modal
css/style.css                 All styling (design tokens, layout, animations, responsive rules)
js/main.js                    Scroll reveal, plan sync, coupon logic, form submit, confetti modal
assets/logo.svg                GT Bharat logo (placeholder, editable SVG — swap anytime)
assets/mentor-placeholder.jpg  Placeholder mentor photo — replace with the real photo later
google-apps-script/Code.gs     Backend script: receives form POSTs, writes rows to Google Sheets
```

No frameworks, no npm install, no build step. Open `index.html` in a browser and it works.
Place the downloaded `index.html`, `style.css`, `main.js`, `logo.svg`, and `Code.gs` files
into this exact folder structure on your machine before deploying.

## 2. Design language notes

Matched to growthschool.io's dark, high-contrast style:
- Dark navy/near-black background (`#0B0B14`) with purple (`#7C3AED`) + gold (`#FFC233`)
  gradient accents, mirroring GrowthSchool's purple/yellow branding.
- `Poppins` for headings (bold, punchy), `Inter` for body copy — same pairing style as the
  reference site.
- Rounded pill buttons, soft glowing card shadows, generous section padding (100–120px),
  large hero typography with `clamp()` for fluid scaling.
- Section content is centered in a `1160px` max-width container with consistent side gutters,
  matching GrowthSchool's content rhythm.

## 3. Section-by-section

**Header** — Fixed, blurred glass background, GT Bharat logo (SVG, edit colors/text directly
in `assets/logo.svg`), desktop nav + mobile hamburger menu. A right-side scroll-spy dot nav
highlights the active section for intuitive jump-scrolling.

**Section 1 — Courses** — Two pricing cards, 3-Month (₹30,000) vs 1-Year (₹60,000), reusing
GrowthSchool's "AI Training 10M+ Professionals" headline (reworded for GT Bharat) and its
"sneak peek of what you'll get" subhead. Feature checklists use GrowthSchool's course
benefits (AI tools access, frameworks, custom GPT bot, personal branding, certificate,
community access) with **Hands-on live projects** and **1:1 placement support** enabled only
on the 1-Year plan and struck-through/disabled on the 3-Month plan, per your spec.

**Section 2 — Meet Your Mentor** — Same layout/structure as GrowthSchool's mentor block
(photo, bio, stat cards), content rewritten for **Jigyasu Bhatnagar, Associate Director,
GT Bharat**. The mentor photo is a placeholder (`assets/mentor-placeholder.jpg`) — swap the
file with the real photo, keeping the same filename, or update the `src` in `index.html`.

**Section 3 — Register** — Full form (name, email, phone, college, degree, passing-out year,
current status, referral source, notes) plus a plan selector synced to Section 1's "Choose
Plan" buttons. Coupon field only accepts `GTBHARATSAVE`, applies a live 50% discount with a
before/after price breakdown, and the Register button submits to your Google Apps Script
endpoint, then shows a confetti + "Thanks for registering" modal.

## 4. Google Apps Script + Sheets setup (Task 2)

This replaces a traditional backend/database. Submissions land as rows in a Google Sheet,
which **is** your live CSV — Sheets can be downloaded as `.csv` anytime, and an optional
scheduled export script is included if you want actual `.csv` files in Drive.


### Step-by-step

1. **Create the Sheet**
   - Go to [sheets.google.com](https://sheets.google.com) → Blank spreadsheet.
   - Rename it, e.g. `GT Bharat Registrations`.

2. **Add the Apps Script**
   - In the Sheet, go to `Extensions > Apps Script`.
   - Delete any starter code, paste the full contents of `google-apps-script/Code.gs`.
   - Save the project (e.g. name it `GT Bharat Backend`).

3. **Initialize headers**
   - In the Apps Script editor toolbar, select the function `setupSheetHeaders` from the
     dropdown next to the Run button, then click **Run**.
   - The first time you run it, Google will ask you to authorize the script — click
     **Review permissions**, choose your account, click **Advanced > Go to GT Bharat
     Backend (unsafe)** (this warning is normal for personal scripts), then **Allow**.
   - Check your Sheet — a `Registrations` tab should now have a bold header row.

4. **Deploy as a Web App**
   - Click **Deploy > New deployment**.
   - Click the gear icon next to "Select type" → choose **Web app**.
   - Description: `GT Bharat form endpoint` (optional).
   - **Execute as**: `Me`.
   - **Who has access**: `Anyone`.
   - Click **Deploy**, authorize again if prompted.
   - Copy the generated **Web app URL** — it looks like:
     `https://script.google.com/macros/s/AKfycb.../exec`

5. **Connect the front-end**
   - Open `js/main.js`.
   - Find the line near the top:
     ```js
     const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
     ```
   - Replace the placeholder string with your copied `/exec` URL.
   - Save.

6. **Test it**
   - Open `index.html` (locally or once deployed), fill the form, click Register.
   - Refresh your Google Sheet — a new row should appear in `Registrations`.
   - If nothing appears: open the Apps Script editor → `Executions` (left sidebar) to see
     error logs, or re-check the deployment access setting is `Anyone`.

7. **Redeploy after script changes**
   - Any time you edit `Code.gs`, you must create a **new deployment version** (Deploy >
     Manage deployments > pencil icon > New version) or the live `/exec` URL keeps running
     the old code.

### Getting an actual `.csv` file (optional)

- **Manual**: In the Sheet, `File > Download > Comma-separated values (.csv)` anytime.
- **Automated**: In `Code.gs`, fill in `FOLDER_ID` inside `exportRegistrationsAsCsv()` with
  a Google Drive folder ID, run it once to test, then add a time-driven trigger
  (`Triggers` icon in the Apps Script editor → `Add Trigger` → function
  `exportRegistrationsAsCsv` → `Time-driven` → e.g. daily) to auto-generate a fresh CSV file
  in Drive on a schedule.

### Why `mode: 'no-cors'` in the fetch call

Google Apps Script Web Apps don't return CORS headers that browsers accept for reading the
response directly from a third-party domain (like your GitHub Pages URL). Using
`no-cors` lets the POST request go through and the row still gets written — you just can't
read the JSON response back in JS. The code accounts for this: it treats "no network error
thrown" as success and shows the modal. This is the standard, well-documented workaround
used in most Apps-Script-as-a-form-backend tutorials.

## 5. Deploying on GitHub Pages

1. Create a new GitHub repository, e.g. `gt-bharat-site`.
2. Add all files (`index.html`, `css/`, `js/`, `assets/`) to the repo root — **do not**
   include the `google-apps-script/` folder if you'd rather keep that private (it's just
   reference code, not required at runtime once you have the deployed URL).
3. Commit and push:
   ```bash
   git init
   git add .
   git commit -m "Initial GT Bharat site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/gt-bharat-site.git
   git push -u origin main
   ```
4. On GitHub: repo → **Settings > Pages** → under "Build and deployment", set **Source** to
   `Deploy from a branch`, branch `main`, folder `/ (root)` → **Save**.
5. Wait ~1 minute, then your site is live at:
   `https://<your-username>.github.io/gt-bharat-site/`
6. Make sure `APPS_SCRIPT_URL` in `js/main.js` is already set to your real deployed Apps
   Script URL **before** this push, since GitHub Pages serves static files as-is.

No build tools, no `npm install`, no server — GitHub Pages just serves the static files
directly, and the Apps Script Web App handles all the data persistence.

## 6. Local development / testing

No installation is required. Two options:

- **Simplest**: double-click `index.html` to open it in a browser. (Note: some browsers
  restrict `fetch` from `file://` origins — if the form submit silently fails locally, use
  the option below instead.)
- **Recommended**: serve it locally with any static server, e.g. with Python (already on
  your machine):
  ```bash
  cd gt-bharat-site
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

## 7. Customization checklist

- Replace `assets/mentor-placeholder.jpg` with the real mentor photo (keep same filename or
  update the `src` attribute in `index.html`'s `#mentor` section).
- Edit `assets/logo.svg` text/colors if you want a different GT Bharat logo treatment.
- Adjust course feature bullets or pricing in `index.html`'s `#courses` section — prices are
  also mirrored in the `data-price` attributes on both the pricing cards and the plan radio
  inputs in the register form, so update both places if prices change.
- Coupon code is hardcoded as `GTBHARATSAVE` inside `js/main.js` (`VALID_COUPON` constant) —
  change it there if needed.

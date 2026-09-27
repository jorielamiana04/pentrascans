# Pentra Finance on GitHub Pages

This folder is the complete, ready-to-run Pentra Finance app (Personal Finance and Tindahan). There is nothing to build.

## Put it online (about 5 minutes, no commands)

1. On github.com, create a **new repository** (for example `pentra-finance`). On a free GitHub account it must be **Public** for Pages to work.
2. Click **uploading an existing file**, then drag **everything** from this folder into the page: `index.html`, `sw.js`, `manifest.webmanifest`, the `icons` folder, the `ocr` folder and the rest. Click **Commit changes**.
3. Open **Settings > Pages**. Under Build and deployment choose **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, then **Save**.
4. Wait 1 to 3 minutes. Pentra is live at `https://YOUR-USERNAME.github.io/pentra-finance/`.

**Updating later:** upload the new files over the old ones (same names). GitHub republishes by itself.

**Prefer automatic publishing?** This folder also contains `.github/workflows/deploy-pages.yml`. If it was uploaded (some computers hide folders that start with a dot), choose **Source: GitHub Actions** in step 3 instead, and every change you commit is published automatically.

## Good to know

- **Tindahan online backup (once).** In Pentra, tap **Set up** next to the backup status, then **Copy setup code**, paste it into your Supabase SQL Editor and press **Run** (the same code is in `supabase-setup/pentra-tindahan-online-backup.sql`). After that, every phone you sign in on backs up and syncs by itself. See `docs/ONLINE-BACKUP.md`.
- **Accounts and email links.** If you use Pentra accounts, open your Supabase dashboard, go to Authentication, then URL Configuration, and add your GitHub address (for example `https://YOUR-USERNAME.github.io/pentra-finance/`) to Redirect URLs. Sign-in works without this, but sign-up confirmation and password-reset emails need it.
- **Is it safe that the code is public?** Yes. Your records are never in the repository. They live on the phone and, when you sign in, in your Supabase database, where row-level security lets each person reach only their own data. The key inside the code is Supabase's public "anon" key, which is designed to be published.
- **Each web address keeps its own on-device records.** A phone that uses both your Netlify copy and your GitHub copy keeps two separate on-device copies. Signed-in data syncs through Supabase to both.
- **Security on GitHub.** GitHub Pages ignores Netlify's `_headers` file, so the same Content Security Policy is built into the page itself, plus a guard that hides Pentra if another website tries to show it inside a frame. The two remaining headers are handled by the browser: the camera is guarded by the browser's own permission prompt, and modern browsers already default to the same referrer policy.
- **Scanner and offline use** work the same on GitHub: the reading engine is served from your own site, and the app installs and opens without internet.

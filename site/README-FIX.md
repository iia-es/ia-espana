# Fix for "Tu profesión" buttons

The deployed GitHub Pages site (`site/` folder) ships an older `scroll-app.js`
that injects a small inline card instead of opening the full profession page.
That's why the chips and ranking buttons "don't work" — nothing visible happens
beyond a tiny card rendering far down the page.

## What to copy into your repo

Replace these two files in your `iia-es/ia-espana` repo, **inside the `site/`
folder**, with the versions in this folder:

1. `site/scroll-app.js` — the new version uses the full-screen
   `#profession-overlay` that's already in your `site/index.html`. Clicking a
   chip, hitting Enter in the search, clicking a ranking row, or clicking a dot
   in the scatter chart all now open the overlay with the job's exposure,
   salary, demand, peer comparison and methodology.

2. `site/app.css` — moves the back button to the top-**left** with a left-arrow
   icon (`← Volver`) and dims the masthead/rail behind the overlay so the page
   transition reads as a new view.

You can leave `site/index.html` as is — the overlay div it already contains
(`#profession-overlay`) is what the new JS targets.

Once pushed, the GitHub Pages workflow (`deploy-pages.yml`) will redeploy
automatically.

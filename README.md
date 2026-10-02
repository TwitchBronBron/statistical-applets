# Statistical Applets (restored)

Self-hosted restoration of the BFW / W. H. Freeman "Statistical Applets" that used to live at
`digitalfirst.bfwpub.com/stats_applet/`. They are HTML5 (jQuery + jQuery UI + Raphaël SVG); no Flash or Java.

> **Why this exists:** the original website was taken down, and the Wayback Machine copies don't work. This
> repository exists only to keep the applets usable. If the original site is ever restored, I'm happy to take
> this one down.

```
npm start        # http://localhost:8081/
```

`public/` is a static site with no build step, so any static host can serve it as-is.

## Publishing (GitHub Pages)

`.github/workflows/pages.yml` publishes `public/` on every push to `master`. One-time setup: in the repo's
**Settings → Pages**, set **Source** to **GitHub Actions**. All site paths are relative, so it works at
`https://<user>.github.io/<repo>/`. To test that locally, run `BASE=/statistical-applets npm start` and open
`http://localhost:8081/statistical-applets/` (in Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`).

## Layout

- `captures/` holds the original "Save Page As" captures of the Wayback pages. They're kept for reference only:
  they aren't published, and they contain Wayback's own rewritten copies of the files.
- `public/stats_applet/` mirrors the original site tree: wrapper pages (`stats_applet_*.html`), shared
  `css/` and `js/` (the BFW "digfir" quiz player), and `asset/<applet>/` (the interactive applet each wrapper iframes).
- `public/vendor/mathjax/` is a trimmed MathJax 2.7.9, replacing the retired `cdn.mathjax.org`.
- `tools/server.mjs` is the zero-dependency dev server behind `npm start` (`PORT` and `BASE` env vars are optional).
- `tools/fetch-wayback.mjs` downloads original files from the Wayback Machine in raw `id_` mode (no toolbar or
  URL rewriting), and follows relative `src`/`href`/`url()` references:
  `npm run fetch -- stats_applet/stats_applet_1_anova.html`

## Local patches

Changes to the archived files are marked with `LOCAL PATCH` comments where the file type allows it.

- `js/stats_applet.js`: loads the vendored MathJax with a real `<script>` tag; guards `MathJax.Hub.Queue`;
  shows the "Quiz Me" button by default (it used to need an LMS or `?quiz_me=true`; `?quiz_me=false` now hides it).
- Wrapper pages: removed the dead `admin.brightcove.com` script tag (used only for video figures), and replaced
  equation images from the dead `angel.bfwpub.com/intellipro/geteq.ashx` renderer with MathJax TeX. Wayback
  captured that renderer only after it went down. The fetch script makes both changes automatically.
- `asset/common/jquery.ui.touch-punch.min.js` and `asset/common/css/styleMain.css`: the original server never had
  these (Wayback only captured its default page in their place). Touch Punch is the stock 0.2.3 release from
  cdnjs, and `styleMain.css` is an empty placeholder.
- `asset/common/css/ui-lightness/images/`: stock jQuery UI 1.8.20 theme images missing from the archive,
  taken from `code.jquery.com`.

## Reconstructed applets

Some applets' own code wasn't archived (not in Wayback, archive.today, or Macmillan's rehosted copies). Those are
rebuilt to work with the original page and quiz. They're marked "reconstructed" on the landing page, and their
own page shows a notice above the applet. Treat them with more scrutiny than the restored originals.

### Statistical Power (`asset/09_power/`)

- **From the originals:** the page text, all quiz questions, and the quiz's answer key. The 2005 Java "Power"
  applet that the HTML5 version was ported from (`power.jar` from W. H. Freeman's archived companion sites,
  decompiled) supplied the model: inputs, default values, two stacked curves on one x scale, the yellow α area,
  the red power area, and axis ticks at μ₀ ± 2 and ± 4 standard errors. Layout, colors, fonts and buttons come
  from the sibling Statistical Significance applet.
- **Designed for the rebuild:** exact positions of the curves and labels, the gray captions above each curve, and
  the dashed line at the cutoff value. Power is computed with exact normal math; the Java version used a
  two-decimal z table, so the lost original may have shown slightly different digits.
- **Known difference:** n allows up to 250, not the "50 or fewer" in the page text (carried over from the Java
  version), because question 4's answer is n = 95.
- **Verified:** power matches hand calculations for one- and two-sided tests, and a full quiz run using only the
  applet's displayed values scores 10/10.

The gradebook integration (ARGA) and the answer-validator web service are gone and aren't emulated. Quizzes are
scored client-side in the browser.

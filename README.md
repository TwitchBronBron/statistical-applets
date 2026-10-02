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

Some applets' own code wasn't archived anywhere (not in Wayback, archive.today, Common Crawl, or Macmillan's
rehosted copies). Those are
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

### The Central Limit Theorem (`asset/3_cltmean/`)

- **From the originals:** the page text, quiz, and answer key (exponential means at n = 2 are skewed right and at
  n = 50 roughly symmetric; uniform means at n = 3 are "too flat" against the Normal curve). The controls the
  instructions name: population choice, sample size, a button that generates 10,000 samples, and "Show Normal
  curve". From the earlier Java version of this applet: populations with mean 1 and SD 1, and the convention of
  a blue sampling distribution with a red Normal curve. Style follows the sibling Confidence Intervals applet.
- **Designed for the rebuild:** the whole layout, the small population picture at the top, the histogram (40
  bins over µ ± 4σ/√n), the sample-size steps (1–5, 10, 15, 20, 25, 30, 40, 50, 75, 100), and the summary line
  comparing the means' actual average and SD to the CLT's predictions.
- **Note:** question 3's model answer says the exponential case at n = 100 "might still be very slightly skewed
  to the left". That's the original text; any remaining skew is to the right. It's a free-response question, so
  it doesn't affect grading.
- **Verified:** the SD of the 10,000 means matches σ/√n for every population and n tried, the quiz's expected
  shapes show up as described, and a full quiz run scores 10/10.

### Mean and Median (`asset/6_meanmed/`)

- **From the originals:** more survived here than for the others: the applet's own `index.html` (its controls
  and layout), the page's quiz hook (`js/stats_applet_6_meanmed.js`, which checks that n ≥ 5 and the mean exactly
  equals the median), the page text, and the quiz. Behavior follows the page's instructions and the Java "Mean and
  Median" applet it replaced (`meanmedian.jar`, decompiled): click below the line to add a point, points stack,
  drag to move or onto the trash to remove, red median arrow, green mean arrow, one yellow arrow when equal.
  Styling follows the sibling Correlation applet, which has the same page structure.
- **Designed for the rebuild:** `style.css`, `math_script.js` and `main_script.js` (lost). Points snap to a grid
  of about 100 steps across the range (0.1 for the default 0 to 10), which stands in for the Java version's
  5-pixel snapping and makes "mean equals median" exactly reachable. Tick labels on the line, the trash icon's
  look, and the "mean = … median = …" number formatting (up to 4 decimals). Clicking UPDATE with a new range
  clears the points.
- **Verified:** mean and median match hand calculations while adding, stacking, dragging, and trashing points,
  and a full quiz run scores 10/10 (including question 2, which reads the applet's mean and median).

### Normal Density Curve (`asset/7_norm/`)

- **From the originals:** the applet's own `index.html` survived (Mean, Std. Dev., 2-Tail, UPDATE), along with
  the page text and quiz. Behavior follows the Java "Normal Curve" applet it replaced (`NormalCurve.jar`,
  decompiled), whose instructions are nearly word for word the same: two green flags starting at mean ± 1 SD;
  with the flags in order the two tails are shaded and each tail's area is shown, and with the flags crossed the
  area between them is shaded; 2-Tail mirrors the flags around the mean; flags keep their position in SD units
  when the mean or SD changes; areas to 4 decimals. From the HTML5 page text: the shaded area is dark yellow, the
  axis is marked to 4 SD each side, and flag values are always shown.
- **Designed for the rebuild:** `style.css`, `math_script.js` and `main_script.js` (lost), including colors,
  label placement, and exact normal math (the Java version used a two-decimal z table). Flag values snap to a
  clean step just coarser than one pixel (0.02 when SD = 1, 0.1 when SD = 5), so values like 50 or −10 can be hit
  exactly; the Java version moved in raw pixels.
- **Verified:** areas match standard normal tables (±1 → 0.1587 each tail, crossed ±1 → 0.6827, ±1.96 → 0.0250),
  and a full quiz run done by dragging the flags scores 10/10.

### Probability (`asset/10_prob/`)

- **From the originals:** the page text and quiz (which picks a random probability of heads for each student).
  Behavior follows the Java "Probability" applet it replaced (`Probability.jar`, decompiled): probability of
  heads and number of tosses, Toss, Reset, "Show true probability" as a green line, a heads/tails bar with
  "# Heads = h/n = …" and "# Tails = …" counts, a plot of the proportion of heads after each toss (with dots for
  the first 40 tosses), and at most 500 tosses in all. The coin pictures in `images/` are the Java applet's own.
- **Designed for the rebuild:** the layout (controls on the left as in the sibling applets; the Java version had
  them along the bottom), the plot's axis lengths (10, 20, 50, 100, 200, 300, 400, 500 tosses), and batch size: a
  single Toss can do up to the 500-toss total, with large batches animated faster (the Java version allowed 40 per
  click, and the quiz asks for 500 tosses). The coin strip shows the most recent 25 coins. Changing the
  probability and clicking Toss starts a fresh run so a plot never mixes two coins (the Java version applied a new
  probability only on Reset).
- **Verified:** counts and proportions add up, the 500-toss limit holds, a probability above 1 is clamped to 1,
  and a full quiz run scores 10/10.

### Simple Random Sample (`asset/13_srs/`)

- **From the originals:** the applet's own `index.html` survived (population and sample-size fields, SAMPLE,
  RESET, "Copy sample to clipboard" with its text box and instructions), plus the page's quiz hook
  (`js/stats_applet_13_srs.js`, which grades the mean of a 3-ball sample from 10 balls and tells students to
  RESET between samples), the page text (populations of 1 to 144, a "Population hopper"), and the quiz. Behavior
  follows the Java "Random Sample" applet (`RandomSample.jar`, decompiled): sampling without replacement, and
  further SAMPLE clicks keep drawing from the balls left until RESET. The LOTTO wordmark in `images/` is the Java
  applet's own.
- **Designed for the rebuild:** `style.css`, `math_script.js` and `main_script.js` (lost): the 12×12 hopper grid
  with gaps where drawn balls left, the Sample area, the animation of balls moving between them, and the red
  numbered balls (after the Java applet's red ball). The sample mean is deliberately not displayed, since the quiz
  asks students to calculate it. Default population 100 and sample size 10, as in the Java version.
- **Verified:** draws never repeat a ball, repeated SAMPLE clicks accumulate, RESET refills the hopper, the copy
  box lists the sample, and a full quiz run scores 10/10 (questions 3–5 are graded by the original quiz hook from
  the applet's own samples).

### Statistical Significance for One Proportion (`asset/generic_versions/21_sigprop/`)

- **From the originals:** the page text (H₀ for p, the alternative, α, n up to 30,000, either the number of
  successes X or a true p with NEW SAMPLE), the quiz, and its answer key. This is one of the later "generic"
  applets, with no Java ancestor; it's modeled on the surviving Statistical Significance applet for means
  (`14_signif`), which has the same controls and display. The method is fixed by the answer key: a z test using
  p₀ in the standard error with no continuity correction (p₀ = .75, n = 150, X = 105 gives P = 0.157 two-sided
  and 0.079 one-sided).
- **Designed for the rebuild:** the code, layout, and labels. The observed proportion is labeled "Sample
  proportion" rather than p̂, because the hat symbol doesn't render reliably in the drawing. The display also
  shows "X = … of n = …".
- **Verified:** P-values match the answer key to 4 decimals, about 10% of simulated samples are significant at
  α = 0.10 when H₀ is true, and a full quiz run scores 10/10.

The gradebook integration (ARGA) and the answer-validator web service are gone and aren't emulated. Quizzes are
scored client-side in the browser.

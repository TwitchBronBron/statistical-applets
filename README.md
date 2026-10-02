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
  to the left". That's the original text, and it's wrong for sample means (any remaining skew is to the right).
  It describes t statistics instead: the One-Sample t Statistic page shares this quiz, and its applet does show
  a slight left skew there. It's a free-response question, so it doesn't affect grading.
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

### P-Value for a Test of One Proportion (`asset/generic_versions/22_pvalprop/`)

- **From the originals:** the page text and quiz with its answer key. Like the One Proportion significance applet
  (which shares its math), this is a later "generic" applet with no Java ancestor. It's modeled on the surviving
  P-Value applet for means (`12_pvalue`): a thin blue line at the observed value (mirrored for a two-sided test),
  the P-value shaded yellow, and a thick blue arrow below the axis pointing in the direction(s) of Hₐ. The answer
  key fixes the method: the same z test as the significance applet, with p₀ = 0.67 as the question says
  ("about 67%"); the exact two-thirds would not match the key.
- **Designed for the rebuild:** the code, layout, and labels ("Sample proportion" for p̂, plus "X = … of n = …").
- **Original quiz error:** question 3 ("Which sample size will give more certain results?") has n = 20 as the
  correct answer in the publisher's own key; n = 1000 is the right answer. The quiz is the original encrypted
  content and isn't changed here; the page's notice mentions it.
- **Verified:** P-values match the answer key (0.251, 0.022, 0.223), and a full quiz run scores 4/4.

### Sampling Distribution of a Proportion (`asset/generic_versions/24_sampdistprop/`)

- **From the originals:** the page text (p from 0 to 1, n from 20 to 2000, GENERATE ONE SAMPLE, GENERATE SAMPLES
  for 10,000 at once, "Show Normal Curve") and the 16-question quiz. A later "generic" applet with no Java
  ancestor. Layout follows the Central Limit Theorem rebuild, its closest sibling.
- **Designed for the rebuild:** the code and layout, the histogram (bars aligned to the possible values X/n, on a
  scale of p ± 4.5 standard deviations clipped to 0 to 1, so skew against 0 or 1 shows), highlighting the most
  recent single sample, and the summary of the simulated distribution's mean and standard deviation (which
  questions 13, 15 and 16 ask about). The theoretical standard deviation is deliberately not displayed, since
  question 14 asks students to compute it. Changing p or n starts over.
- **Verified:** the simulated mean and SD match p and √(p(1−p)/n); the quiz's shapes appear as described
  (right-skewed for p = .05, n = 75; left-skewed for p = .95, n = 75; symmetric for p = .95, n = 750); 10,000
  samples at n = 2000 take under half a second; a full quiz run scores 16/16.

### Distribution of the One-Sample t Statistic (`asset/distonesamplet/`)

- **From the originals:** the page text, whose instructions match the Central Limit Theorem applet's except that
  it plots t statistics and a "Show t curve" overlay (t with n − 1 degrees of freedom), and the quiz. No Java
  ancestor. Built from the Central Limit Theorem rebuild: same populations (mean 1, SD 1), sample-size slider, and
  10,000 samples per click.
- **Designed for the rebuild:** sample sizes start at 2 (s needs two observations), the histogram uses a fixed
  scale of −5 to 5 so shapes are comparable across n, and the count of t statistics beyond ±5 is shown (with
  n = 2, the t distribution has very heavy tails).
- **Original quiz errors (important for teachers):** this page's quiz is the Central Limit Theorem quiz, nearly
  word for word, and two of its answer keys describe sample means rather than t statistics. Measured on 10,000 t
  statistics: for an exponential population at n = 2 the distribution is clearly skewed *left* (quartile skewness
  −0.43), but question 1 expects "skewed right"; for a uniform population at n = 3 it's *more peaked* than the t
  curve (37% of values within ±0.5 against 33% for the curve), but question 2 expects "too flat". Question 3's
  model answer (slight left skew at n = 100) does match t statistics. The page's notice warns about this.
- **Verified:** with a Normal population the t statistics match the t curve (as theory says), and the shapes
  above were measured from the applet's own output.

### Chi-square Goodness of Fit Test (`asset/19_chisquare/`)

- **From the originals:** the page text (Bag Count and α sliders, POUR NEW BAG, SHOW HOPPER VALUES, NEW HOPPER,
  a table of color counts with the test against equal proportions, five colors), the quiz, and the page's quiz
  hook (`js/stats_applet_19_chisquare.js`), which takes the hopper's red share for question 1 and completes
  questions 3 and 4 after five bags of 20 and of 200. No Java ancestor.
- **Designed for the rebuild:** all code and layout: the hopper and bag drawings, the five colors (red, orange,
  yellow, green, blue), slider steps (bags of 10–500; α of 0.01, 0.025, 0.05, 0.10), the results table, and a
  tally of bags poured and rejected. New hoppers have proportions of 20% each jittered by up to about ±9 points
  (rounded to 0.1%), so bags of 20 reject equal proportions about 10–15% of the time and bags of 200 usually do,
  as question 5 expects. The applet reports to the quiz only on load, NEW HOPPER, and POUR NEW BAG, because the
  hook counts every report as a bag.
- **Verified:** χ² and P-values match hand calculations (df = 4), and a full quiz run scores 10/10.

### Normal Approximation to Binomial Distributions (`asset/2_cltbinom/`)

- **From the originals:** the applet's own `index.html` survived (n and p sliders with number boxes), along with
  the page text and quiz. Behavior follows the Java "Normal Approximation to Binomial" applet it replaced
  (`clt_binomial.jar`, decompiled), whose instructions match nearly word for word: n from 1 to 100 (default 10),
  p from 0.01 to 0.99 in steps of 0.01 (default 0.7), yellow bars for the binomial probabilities on an axis from
  −1 to n + 1, the red Normal curve with the same mean and standard deviation, a line at the mean labeled np, and
  a "Probability" axis. The mean line is gray, as the HTML5 page text says (it was red in the Java version).
- **Designed for the rebuild:** `style.css`, `math_script.js` and `main_script.js` (lost): layout, tick spacing,
  and a tooltip giving each bar's exact probability on hover (an addition). The number boxes can be typed in as
  well as set with the sliders.
- **Verified:** probabilities match standard binomial values (P(X = 8) = 0.1964 for n = 16, p = 0.5), and a full
  quiz run scores 10/10.

The gradebook integration (ARGA) and the answer-validator web service are gone and aren't emulated. Quizzes are
scored client-side in the browser.

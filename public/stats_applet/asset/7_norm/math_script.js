// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not.
// The Java original used a two-decimal z table; this is accurate well past the four decimals shown.

// standard normal CDF, P(Z <= z). Zelen & Severo (Abramowitz & Stegun 26.2.17), |error| < 7.5e-8
function Phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989422804014327 * Math.exp(-z * z / 2);
    var p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? 1 - p : p;
}

// standard normal density
function phi(z) {
    return 0.3989422804014327 * Math.exp(-z * z / 2);
}

// smallest "nice" step (1, 2, or 5 times a power of ten) at least as large as `min_step`
function nice_step(min_step) {
    var pow = Math.pow(10, Math.floor(Math.log(min_step) / Math.LN10));
    var mults = [1, 2, 5, 10];
    for (var i = 0; i < mults.length; i++) {
        if (mults[i] * pow >= min_step - 1e-12) return mults[i] * pow;
    }
    return 10 * pow;
}

// decimal places needed to show multiples of `step`
function step_decimals(step) {
    return Math.max(0, Math.ceil(-Math.log(step) / Math.LN10 - 1e-9));
}

// round to 4 significant digits for axis labels (as the Java original did), dropping trailing zeros
function axis_label(v) {
    if (Math.abs(v) < 1e-12) return "0";
    return String(parseFloat(v.toPrecision(4)));
}

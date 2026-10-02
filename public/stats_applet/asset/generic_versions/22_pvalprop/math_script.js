// LOCAL RECONSTRUCTION (see applet.html). Shared with 21_sigprop.
// z test for one proportion with the normal approximation, using p0 in the standard error and no
// continuity correction. That's what this quiz's answer key implies: p0 = .67, n = 1000, X = 680 gives
// P = 0.251 for Ha: p > p0; X = 700 gives 0.022; n = 20, X = 15 gives 0.223.

// standard normal CDF, P(Z <= z). Zelen & Severo (Abramowitz & Stegun 26.2.17), |error| < 7.5e-8
function Phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989422804014327 * Math.exp(-z * z / 2);
    var p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? 1 - p : p;
}

// inverse standard normal CDF (Acklam's rational approximation, relative error < 1.2e-9)
function invPhi(p) {
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var plow = 0.02425, q, r;
    if (p < plow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > 1 - plow) {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}

// tail: "gt" (Ha: p > p0), "lt" (Ha: p < p0), "ne" (two-sided)
// Returns the sample proportion, z, P-value, and the rejection region for p-hat at level alpha.
function proportion_test(p0, x, n, alpha, tail) {
    var se = Math.sqrt(p0 * (1 - p0) / n);
    var phat = x / n;
    var z = (phat - p0) / se;
    var p_value, low = null, high = null;
    if (tail == "gt") {
        p_value = 1 - Phi(z);
        high = p0 + invPhi(1 - alpha) * se;
    } else if (tail == "lt") {
        p_value = Phi(z);
        low = p0 - invPhi(1 - alpha) * se;
    } else {
        p_value = 2 * (1 - Phi(Math.abs(z)));
        high = p0 + invPhi(1 - alpha / 2) * se;
        low = p0 - invPhi(1 - alpha / 2) * se;
    }
    return { se: se, phat: phat, z: z, p_value: p_value, low: low, high: high };
}

// number of successes in n independent trials with success probability p
function binomial_sample(n, p) {
    var x = 0;
    for (var i = 0; i < n; i++) {
        if (Math.random() < p) x++;
    }
    return x;
}

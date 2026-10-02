// LOCAL RECONSTRUCTION (see applet.html). The Java original used a two-decimal z table;
// these are accurate to well beyond the four decimal places displayed.

// standard normal density
function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}

// standard normal CDF, P(Z <= z). Zelen & Severo (Abramowitz & Stegun 26.2.17), |error| < 7.5e-8
function Phi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989422804014327 * Math.exp(-z * z / 2);
    var p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? 1 - p : p;
}

// inverse standard normal CDF: the z with P(Z <= z) = p. Acklam's rational approximation,
// relative error < 1.2e-9
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

// Rejection region and power of a z test for a mean.
//   tail: "gt" (Ha: mu > mu0), "lt" (Ha: mu < mu0), or "ne" (two-sided)
// Returns {low, high, power}: reject H0 when xbar <= low or xbar >= high (null = no bound).
function power_analysis(mu0, alt_mu, sigma, n, alpha, tail) {
    var se = sigma / Math.sqrt(n);
    var low = null, high = null;
    if (tail == "gt") {
        high = mu0 + invPhi(1 - alpha) * se;
    } else if (tail == "lt") {
        low = mu0 - invPhi(1 - alpha) * se;
    } else {
        high = mu0 + invPhi(1 - alpha / 2) * se;
        low = mu0 - invPhi(1 - alpha / 2) * se;
    }
    var power = 0;
    if (low !== null) {
        power += Phi((low - alt_mu) / se);
    }
    if (high !== null) {
        power += 1 - Phi((high - alt_mu) / se);
    }
    return { se: se, low: low, high: high, power: power };
}

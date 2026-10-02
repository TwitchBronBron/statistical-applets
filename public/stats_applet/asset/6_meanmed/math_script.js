// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not.
// Points are stored as integer grid indices, so the mean and median are computed exactly and
// "mean equals median" (which the quiz checks) is a real, reachable condition.

// a "nice" grid step (1, 2, 2.5, or 5 times a power of ten) giving at most `max_steps` steps over the range
function nice_step(range, max_steps) {
    var raw = range / max_steps;
    var pow = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var mults = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < mults.length; i++) {
        if (mults[i] * pow >= raw - 1e-12) return mults[i] * pow;
    }
    return 10 * pow;
}

function mean_of(values) {
    var s = 0;
    for (var i = 0; i < values.length; i++) s += values[i];
    return s / values.length;
}

function median_of(values) {
    var a = values.slice(0).sort(function(x, y){ return x - y; });
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// round away floating-point noise so equal values compare equal
function clean(v) {
    return Math.round(v * 1e9) / 1e9;
}

// up to 4 decimals, trailing zeros removed
function format_value(v) {
    return String(parseFloat(v.toFixed(4)));
}

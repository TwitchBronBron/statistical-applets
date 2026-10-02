// LOCAL RECONSTRUCTION (see index.html).

var COLORS = [
    { key: "red", name: "Red", fill: "#e02424" },
    { key: "orange", name: "Orange", fill: "#ff8c1a" },
    { key: "yellow", name: "Yellow", fill: "#ffd60a" },
    { key: "green", name: "Green", fill: "#2fa84f" },
    { key: "blue", name: "Blue", fill: "#2f6fe0" }
];

// A new hopper: proportions near 1/5 each but not equal, rounded to 0.1% and summing to exactly 1.
// Jitter of up to +/-45% of 20% (about +/-9 percentage points) means bags of 200 usually reject the
// null hypothesis of equal proportions while bags of 20 rarely do.
function new_hopper_proportions() {
    var w = [], sum = 0, i;
    for (i = 0; i < COLORS.length; i++) {
        w[i] = 1 + (Math.random() * 0.9 - 0.45);
        sum += w[i];
    }
    var p = [], total = 0, largest = 0;
    for (i = 0; i < COLORS.length; i++) {
        p[i] = Math.round(1000 * w[i] / sum);     // in tenths of a percent
        total += p[i];
        if (p[i] > p[largest]) largest = i;
    }
    p[largest] += 1000 - total;
    for (i = 0; i < p.length; i++) p[i] /= 1000;
    return p;
}

// one bag of n candies from the hopper: counts per color
function pour_bag(p, n) {
    var counts = [], i;
    for (i = 0; i < p.length; i++) counts[i] = 0;
    for (var k = 0; k < n; k++) {
        var u = Math.random(), c = 0;
        for (i = 0; i < p.length; i++) {
            c += p[i];
            if (u < c || i == p.length - 1) { counts[i]++; break; }
        }
    }
    return counts;
}

// chi-square goodness of fit against equal proportions
function chi_square_equal(counts, n) {
    var expected = n / counts.length, x2 = 0;
    for (var i = 0; i < counts.length; i++) {
        x2 += Math.pow(counts[i] - expected, 2) / expected;
    }
    var df = counts.length - 1;
    return { x2: x2, df: df, expected: expected, p_value: chi_square_upper(x2, df) };
}

// P(chi-square with df degrees of freedom > x), for even df (here df = 4): exact closed form
function chi_square_upper(x, df) {
    var term = 1, sum = 1;
    for (var k = 1; k < df / 2; k++) {
        term *= (x / 2) / k;
        sum += term;
    }
    return Math.exp(-x / 2) * sum;
}

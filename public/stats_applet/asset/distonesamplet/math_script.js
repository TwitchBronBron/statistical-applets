// LOCAL RECONSTRUCTION (see applet1.html). Shared with the Central Limit Theorem rebuild (3_cltmean):
// all three populations have mean 1 and standard deviation 1.

var POP_MEAN = 1;
var POP_SD = 1;
var SQRT3 = Math.sqrt(3);

function RN_Normal (mean, sd) {
	var v1, v2, s;
	do {
		v1 = 2 * Math.random() - 1;
		v2 = 2 * Math.random() - 1;
	} while ((s = v1 * v1 + v2 * v2) >= 1);
	s = Math.sqrt ((-2 * Math.log(s)) / s);
	return v1 * s * sd + mean * 1.0;
}

// one observation from the population
function draw_observation(population) {
    if (population == "exponential") {
        return -Math.log(1 - Math.random());               // Exponential, mean 1, SD 1
    } else if (population == "uniform") {
        return 1 - SQRT3 + 2 * SQRT3 * Math.random();      // Uniform(1 - sqrt3, 1 + sqrt3): mean 1, SD 1
    }
    return RN_Normal(POP_MEAN, POP_SD);                    // Normal(1, 1)
}

// population density, for drawing the population
function population_density(population, x) {
    if (population == "exponential") {
        return x < 0 ? 0 : Math.exp(-x);
    } else if (population == "uniform") {
        return (x >= 1 - SQRT3 && x <= 1 + SQRT3) ? 1 / (2 * SQRT3) : 0;
    }
    return gaussian(POP_SD, POP_MEAN, x);
}

function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}

// one-sample t statistics, t = (xbar - mu) / (s / sqrt(n)), for `count` samples of size n (n >= 2)
function t_statistics(population, n, count) {
    var ts = new Array(count);
    for (var i = 0; i < count; i++) {
        var sum = 0, sumsq = 0;
        for (var j = 0; j < n; j++) {
            var x = draw_observation(population);
            sum += x;
            sumsq += x * x;
        }
        var mean = sum / n;
        var s = Math.sqrt(Math.max(0, (sumsq - n * mean * mean) / (n - 1)));
        ts[i] = (mean - POP_MEAN) / (s / Math.sqrt(n));
    }
    return ts;
}

// log of the gamma function (Lanczos approximation)
function log_gamma(x) {
    var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    var ser = 1.000000000190015;
    for (var j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// density of the t distribution with df degrees of freedom
function t_density(t, df) {
    var logc = log_gamma((df + 1) / 2) - log_gamma(df / 2) - 0.5 * Math.log(df * Math.PI);
    return Math.exp(logc - (df + 1) / 2 * Math.log(1 + t * t / df));
}

function mean_of(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i];
    return s / a.length;
}

function sd_of(a) {
    var m = mean_of(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / (a.length - 1));
}

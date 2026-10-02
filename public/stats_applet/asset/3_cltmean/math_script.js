// LOCAL RECONSTRUCTION (see index.html).
// All three populations have mean 1 and standard deviation 1, as in the Java original's exponential,
// so the Normal curve the Central Limit Theorem predicts is the same for each: N(1, 1/sqrt(n)).

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

// means of `count` samples of size n
function sample_means(population, n, count) {
    var means = new Array(count);
    for (var i = 0; i < count; i++) {
        var sum = 0;
        for (var j = 0; j < n; j++) {
            sum += draw_observation(population);
        }
        means[i] = sum / n;
    }
    return means;
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

// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not.

// binomial probabilities P(X = k) for k = 0..n, computed with a stable recurrence
function binomial_pmf(n, p) {
    var probs = new Array(n + 1);
    // start from log P(X = 0) and step k -> k+1 with the ratio (n-k)/(k+1) * p/(1-p)
    var logp = n * Math.log(1 - p), ratio = Math.log(p) - Math.log(1 - p);
    for (var k = 0; k <= n; k++) {
        probs[k] = Math.exp(logp);
        logp += Math.log(n - k) - Math.log(k + 1) + ratio;
    }
    return probs;
}

function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}

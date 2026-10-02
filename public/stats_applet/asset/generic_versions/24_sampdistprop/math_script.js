// LOCAL RECONSTRUCTION (see applet.html).

// number of successes in n independent trials with success probability p
function binomial_sample(n, p) {
    var x = 0;
    for (var i = 0; i < n; i++) {
        if (Math.random() < p) x++;
    }
    return x;
}

function gaussian(sigma, mitt, x){
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(- Math.pow(x - mitt, 2) / (2 * Math.pow(sigma, 2)));
}

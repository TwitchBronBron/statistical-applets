// LOCAL RECONSTRUCTION (see index.html).

// one coin toss: true = heads
function toss_coin(p_heads) {
    return Math.random() < p_heads;
}

// x-axis length for the plot: the smallest of these that fits all tosses so far
var PLOT_LENGTHS = [10, 20, 50, 100, 200, 300, 400, 500];
function plot_length(n) {
    for (var i = 0; i < PLOT_LENGTHS.length; i++) {
        if (n <= PLOT_LENGTHS[i]) return PLOT_LENGTHS[i];
    }
    return PLOT_LENGTHS[PLOT_LENGTHS.length - 1];
}

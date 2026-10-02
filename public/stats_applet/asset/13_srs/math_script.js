// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not.

// draw `count` items at random, without replacement, from `pool` (which is not modified)
function draw_without_replacement(pool, count) {
    var a = pool.slice(0), out = [];
    count = Math.min(count, a.length);
    for (var i = 0; i < count; i++) {
        var j = i + Math.floor(Math.random() * (a.length - i));
        var t = a[i]; a[i] = a[j]; a[j] = t;
        out.push(a[i]);
    }
    return out;
}

function mean_of(values) {
    var s = 0;
    for (var i = 0; i < values.length; i++) s += values[i];
    return s / values.length;
}

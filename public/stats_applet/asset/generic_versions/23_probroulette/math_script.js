// LOCAL RECONSTRUCTION (see applet.html). An American roulette wheel: 38 slots, 1 to 36, 0, and 00.

// slots in the order they sit around an American wheel ("00" is written as a string)
var WHEEL_ORDER = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00",
                   27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2];
var RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// slots in numeric order, for the bar graph
var SLOTS = [0, "00"];
for (var i = 1; i <= 36; i++) SLOTS.push(i);

function slot_color(s) {
    if (s === 0 || s === "00") return "green";
    return RED_NUMBERS.indexOf(s) >= 0 ? "red" : "black";
}

// events of interest; each tests a slot
var EVENTS = [
    { id: "two", label: "Spin a 2", test: function(s){ return s === 2; } },
    { id: "red", label: "Spin a red number", test: function(s){ return slot_color(s) == "red"; } },
    { id: "black", label: "Spin a black number", test: function(s){ return slot_color(s) == "black"; } },
    { id: "even", label: "Spin an even number", test: function(s){ return typeof s == "number" && s > 0 && s % 2 == 0; } },
    { id: "odd", label: "Spin an odd number", test: function(s){ return typeof s == "number" && s % 2 == 1; } },
    { id: "low", label: "Spin 1 to 18", test: function(s){ return typeof s == "number" && s >= 1 && s <= 18; } },
    { id: "high", label: "Spin 19 to 36", test: function(s){ return typeof s == "number" && s >= 19; } },
    { id: "dozen", label: "Spin 1 to 12", test: function(s){ return typeof s == "number" && s >= 1 && s <= 12; } },
    { id: "green", label: "Spin 0 or 00", test: function(s){ return slot_color(s) == "green"; } }
];

// true probability of an event: (outcomes in the event) / 38
function event_probability(ev) {
    var k = 0;
    for (var i = 0; i < SLOTS.length; i++) if (ev.test(SLOTS[i])) k++;
    return { count: k, p: k / SLOTS.length };
}

// one spin of a fair wheel
function spin_wheel() {
    return SLOTS[Math.floor(Math.random() * SLOTS.length)];
}

// x-axis length for the proportion plot: the smallest of these that fits all spins so far
var PLOT_LENGTHS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
function plot_length(n) {
    for (var i = 0; i < PLOT_LENGTHS.length; i++) {
        if (n <= PLOT_LENGTHS[i]) return PLOT_LENGTHS[i];
    }
    return PLOT_LENGTHS[PLOT_LENGTHS.length - 1];
}

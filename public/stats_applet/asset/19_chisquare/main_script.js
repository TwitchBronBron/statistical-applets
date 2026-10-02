// LOCAL RECONSTRUCTION (see index.html). Follows the page's instructions: Bag Count and alpha sliders;
// POUR NEW BAG samples n candies from the hopper; the table shows each color's count and the chi-square
// goodness-of-fit test against equal proportions; SHOW HOPPER VALUES reveals the hopper's true proportions;
// NEW HOPPER starts over with new proportions. Reports to the quiz hook (js/stats_applet_19_chisquare.js) on
// load, NEW HOPPER, and POUR NEW BAG only: the hook counts every report as a bag for questions 3 and 4.

module_main = new function(){
    this.N_STEPS = [10, 20, 30, 40, 50, 75, 100, 150, 200, 300, 400, 500];
    this.ALPHA_STEPS = [0.01, 0.025, 0.05, 0.10];
    this.HOPPER_CANDIES = 170;
    this.n = 20;
    this.alpha = 0.05;
    this.p = null;            // hopper proportions, in COLORS order
    this.shown = false;
    this.bag = null;          // { counts, test }
    this.tally = { bags: 0, rejected: 0 };

    var Applet_Communication = function (){
        return {
            report_action : function report_action(action) {
                try {
                    var f = null;
                    if (!(window.receive_applet_action === undefined)) {
                        f = window.receive_applet_action;
                    } else if (window.parent && !(window.parent.receive_applet_action === undefined)) {
                        f = window.parent.receive_applet_action;
                    } else if (window.opener && !(window.opener.receive_applet_action === undefined)) {
                        f = window.opener.receive_applet_action;
                    }
                    if (f) {
                        f(action);
                    }
                } catch(e) {}
            }
        }
    };

    this.report = function(){
        var freq = {}, counts = {};
        for (var i = 0; i < COLORS.length; i++) {
            freq[COLORS[i].key] = this.p[i];
            if (this.bag) counts[COLORS[i].key] = this.bag.counts[i];
        }
        Applet_Communication().report_action({
            n: this.n,
            alpha: this.alpha,
            hopper_frequencies: freq,
            counts: this.bag ? counts : null,
            chi_square: this.bag ? this.bag.test.x2 : null,
            p_value: this.bag ? this.bag.test.p_value : null,
            reject: this.bag ? this.bag.test.p_value <= this.alpha : null
        });
    };

    // the hopper: a funnel holding candies whose colors follow the hopper proportions
    this.draw_hopper = function(){
        var p = this.paper;
        var funnel = "M20 20 L300 20 L300 150 L185 205 L185 225 L135 225 L135 205 L20 150 Z";
        p.path(funnel).attr({ fill: "#fff", stroke: "#666", "stroke-width": 2 });
        p.text(160, 12, "Hopper").attr({ "font-size": "13", "font-weight": "bold", fill: "#292929", "font-family": "Arial" });
        // fill the funnel's rectangular part with candies at random positions
        var dots = this.hopper_dots;
        for (var i = 0; i < dots.length; i++) {
            p.circle(dots[i].x, dots[i].y, 5).attr({ fill: COLORS[dots[i].c].fill, stroke: "#333", "stroke-width": 0.5 });
        }
    };

    this.make_hopper_dots = function(){
        this.hopper_dots = [];
        for (var i = 0; i < this.HOPPER_CANDIES; i++) {
            var u = Math.random(), c = 0, acc = 0;
            for (var k = 0; k < this.p.length; k++) { acc += this.p[k]; if (u < acc) { c = k; break; } c = k; }
            this.hopper_dots.push({ x: 30 + Math.random() * 260, y: 30 + Math.random() * 110, c: c });
        }
    };

    // the bag: candies sorted by color in rows
    this.draw_bag = function(animate){
        var p = this.paper;
        p.rect(30, 245, 260, 215, 14).attr({ fill: "#fffaf0", stroke: "#a0855b", "stroke-width": 2 });
        p.text(160, 237, this.bag ? "Bag of " + this.n + " candies" : "Bag").attr({ "font-size": "13", "font-weight": "bold", fill: "#292929", "font-family": "Arial" });
        if (!this.bag) return;
        var r = this.n > 200 ? 3 : (this.n > 75 ? 4 : 6);
        var pitch = 2 * r + 2, cols = Math.floor(240 / pitch);
        var set = p.set(), idx = 0;
        for (var c = 0; c < COLORS.length; c++) {
            for (var k = 0; k < this.bag.counts[c]; k++, idx++) {
                var cx = 40 + r + (idx % cols) * pitch, cy = 255 + r + Math.floor(idx / cols) * pitch;
                set.push(p.circle(cx, cy, r).attr({ fill: COLORS[c].fill, stroke: "#333", "stroke-width": 0.5 }));
            }
        }
        if (animate) {
            set.attr({ opacity: 0 });
            set.animate({ opacity: 1 }, 350);
        }
    };

    this.update_table = function(){
        var rows = "";
        for (var i = 0; i < COLORS.length; i++) {
            var c = COLORS[i];
            rows += "<tr><td class='color'><span class='swatch' style='background:" + c.fill + "'></span>" + c.name + "</td>"
                + "<td>" + (this.bag ? this.bag.counts[i] : "&ndash;") + "</td>"
                + "<td>" + (this.n / COLORS.length).toFixed(1) + "</td>"
                + "<td>" + (this.shown ? (this.p[i] * 100).toFixed(1) + "%" : "?") + "</td></tr>";
        }
        rows += "<tr class='total'><td class='color'>Total</td><td>" + (this.bag ? this.n : "&ndash;") + "</td><td>" + this.n
            + "</td><td>" + (this.shown ? "100.0%" : "?") + "</td></tr>";
        $("#table tbody").html(rows);

        if (this.bag) {
            var t = this.bag.test, reject = t.p_value <= this.alpha;
            $("#test").html("&chi;<sup>2</sup> = " + t.x2.toFixed(2) + ", &nbsp;df = " + t.df + ", &nbsp;P-value = " + t.p_value.toFixed(4) + "<br>"
                + (reject ? "<span class='reject'>Reject H<sub>0</sub></span>" : "<span class='keep'>Do not reject H<sub>0</sub></span>")
                + " at &alpha; = " + this.alpha
                + "<br><span style='font-size:12px;color:#666'>H<sub>0</sub>: all five colors are equally likely (20% each)</span>");
        } else {
            $("#test").html("<span style='color:#666'>Click POUR NEW BAG to pour a bag of " + this.n + " candies.</span>");
        }
        $("#tally").html(this.tally.bags
            ? "Bags of " + this.n + " poured from this hopper: " + this.tally.bags + " &nbsp;(H<sub>0</sub> rejected for " + this.tally.rejected + ")"
            : "");
        $("#show_hopper").text(this.shown ? "HIDE HOPPER VALUES" : "SHOW HOPPER VALUES");
    };

    this.redraw = function(animate_bag){
        this.paper.clear();
        this.draw_hopper();
        this.draw_bag(animate_bag);
        this.update_table();
    };

    // a change of bag size or alpha starts a new tally (and clears the shown bag)
    this.settings_changed = function(){
        this.bag = null;
        this.tally = { bags: 0, rejected: 0 };
        this.redraw(false);
    };

    this.pour = function(){
        var counts = pour_bag(this.p, this.n);
        this.bag = { counts: counts, test: chi_square_equal(counts, this.n) };
        this.tally.bags++;
        if (this.bag.test.p_value <= this.alpha) this.tally.rejected++;
        this.redraw(true);
        this.report();
    };

    this.new_hopper = function(){
        this.p = new_hopper_proportions();
        this.make_hopper_dots();
        this.shown = false;
        this.bag = null;
        this.tally = { bags: 0, rejected: 0 };
        this.redraw(false);
        this.report();
    };

    this.initialize = function(){
        var self = this;
        this.paper = Raphael(document.getElementById("notepad"), $("#notepad").width(), $("#notepad").height());
        $("#results").appendTo("#notepad");   // keep the table above the drawing

        $("#bag_count_slider").slider({
            range: "min", min: 1, max: this.N_STEPS.length, value: this.N_STEPS.indexOf(this.n) + 1,
            slide: function(e, ui){ $("#bag_count").val(self.N_STEPS[ui.value - 1]); },
            change: function(e, ui){ self.n = self.N_STEPS[ui.value - 1]; $("#bag_count").val(self.n); self.settings_changed(); }
        });
        $("#alpha_slider").slider({
            range: "min", min: 1, max: this.ALPHA_STEPS.length, value: this.ALPHA_STEPS.indexOf(this.alpha) + 1,
            slide: function(e, ui){ $("#alpha").val(self.ALPHA_STEPS[ui.value - 1]); },
            change: function(e, ui){ self.alpha = self.ALPHA_STEPS[ui.value - 1]; $("#alpha").val(self.alpha); self.settings_changed(); }
        });
        $("#bag_count").val(this.n);
        $("#alpha").val(this.alpha);

        $("#pour").click(function(){ self.pour(); });
        $("#show_hopper").click(function(){ self.shown = !self.shown; self.update_table(); });
        $("#new_hopper").click(function(){ self.new_hopper(); });
        this.new_hopper();
    };
}

$(window).load(function(){
    module_main.initialize();
});

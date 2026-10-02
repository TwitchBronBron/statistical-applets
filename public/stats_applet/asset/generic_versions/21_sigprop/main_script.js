// LOCAL RECONSTRUCTION (see applet.html). Mirrors 14_signif (Statistical Significance) for a proportion:
// the curve is the sampling distribution of p-hat when H0 is true, N(p0, sqrt(p0(1-p0)/n)); the yellow area
// is the set of p-hat values significant at level alpha; the blue line is the observed p-hat. The x scale
// is p0 +/- 4 standard errors, as in 14_signif.

module_main = new function(){
    this.paper = null;
    this.max_n = 30000;
    this.defaults = { p0: 0.5, alpha: 0.05, n: 100, x: 50, p_true: 0.5 };
    this.p0 = 0.5;
    this.alpha = 0.05;
    this.n = 100;
    this.x = 50;              // successes: typed (opt1) or simulated (opt2)
    this.p_true = 0.5;
    this.simulated_x = null;

    var text_attrs = { "font-size": "14", "fill": "#292929", "font-family": "Verdana" };

    this.tail = function(){
        if ($("#ha2").is(":checked")) return "lt";
        if ($("#ha3").is(":checked")) return "ne";
        return "gt";
    };
    this.simulating = function(){ return $("#opt2").is(":checked"); };

    this.px = function(v){ return this.plot_x + this.plot_width / 2 + (v - this.p0) / this.se * (this.plot_width / 8); };
    this.lo = function(){ return this.p0 - 4 * this.se; };
    this.hi = function(){ return this.p0 + 4 * this.se; };
    this.py = function(v){
        var z = (v - this.p0) / this.se;
        return this.plot_y - this.plot_height * Math.exp(-0.5 * z * z);
    };

    this.area = function(from, to, color){
        from = Math.max(from, this.lo());
        to = Math.min(to, this.hi());
        if (to <= from) return;
        var steps = Math.max(2, Math.round(this.px(to) - this.px(from)));
        var path = "M" + this.px(from).toFixed(1) + " " + this.plot_y;
        for (var i = 0; i <= steps; i++) {
            var v = from + (to - from) * i / steps;
            path += "L" + this.px(v).toFixed(1) + " " + this.py(v).toFixed(1);
        }
        path += "L" + this.px(to).toFixed(1) + " " + this.plot_y + "Z";
        this.paper.path(path).attr({ fill: "#ffba00", stroke: "none" });
    };

    this.redraw = function(){
        var p = this.paper;
        p.clear();
        this.se = Math.sqrt(this.p0 * (1 - this.p0) / this.n);
        var x = this.simulating() ? this.simulated_x : this.x;
        var r = proportion_test(this.p0, x, this.n, this.alpha, this.tail());

        // significant region (area = alpha), then the curve
        if (r.low !== null) this.area(-Infinity, r.low);
        if (r.high !== null) this.area(r.high, Infinity);
        var path = "", steps = this.plot_width;
        for (var i = 0; i <= steps; i++) {
            var v = this.lo() + (this.hi() - this.lo()) * i / steps;
            path += (i ? "L" : "M") + this.px(v).toFixed(1) + " " + this.py(v).toFixed(1);
        }
        p.path(path).attr({ stroke: "#e13f3f", "stroke-width": 1.5 });

        // axis with ticks at p0 +/- 2 and 4 standard errors (as in 14_signif)
        p.path("M" + this.plot_x + " " + this.plot_y + "L" + (this.plot_x + this.plot_width) + " " + this.plot_y).attr("stroke", "#666666");
        for (var k = -4; k <= 4; k += 2) {
            var tv = this.p0 + k * this.se;
            var tx = Math.round(this.px(tv)) + 0.5;
            p.path("M" + tx + " " + (this.plot_y + 5) + "L" + tx + " " + (this.plot_y - 5)).attr("stroke", "#666666");
            p.text(tx, this.plot_y + 15, (Math.round(tv * 10000) / 10000).toFixed(3)).attr(text_attrs);
        }

        // observed p-hat: blue line (clamped to the plot if it's off the scale), with its labels
        var lx = Math.max(this.plot_x, Math.min(this.plot_x + this.plot_width, this.px(r.phat)));
        p.path("M" + lx + " " + this.plot_y + "L" + lx + " " + (this.plot_y - this.plot_height - 10)).attr({ stroke: "#3b60ff", "stroke-width": 3 });
        var label_x = Math.max(this.plot_x + 110, Math.min(this.plot_x + this.plot_width - 110, lx));
        var top = this.plot_y - this.plot_height - 75;
        // ("Sample proportion" rather than p-hat: SVG text can't place a combining hat reliably)
        p.text(label_x, top, "X = " + x + " of n = " + this.n).attr(text_attrs);
        p.text(label_x, top + 20, "Sample proportion = " + r.phat.toFixed(4)).attr(text_attrs);
        p.text(label_x, top + 40, "P-value = " + r.p_value.toFixed(4)).attr(text_attrs);

        var verdict = (r.p_value <= this.alpha ? "Significant" : "Not significant") + " at level " + this.alpha;
        p.text(this.plot_x + this.plot_width / 2, this.plot_y + 50, verdict).attr(text_attrs);
        this.result = r;
    };

    this.update_ha_labels = function(){
        $("#lha1").html("<i>p</i> &gt; " + this.p0);
        $("#lha2").html("<i>p</i> &lt; " + this.p0);
        $("#lha3").html("<i>p</i> &ne; " + this.p0);
    };

    // input id -> setting, parser, and validity check
    var fields = {
        p0: { key: "p0", parse: parseFloat, ok: function(v){ return v > 0 && v < 1; } },
        alpha: { key: "alpha", parse: parseFloat, ok: function(v){ return v > 0 && v < 1; } },
        n: { key: "n", parse: function(s){ return parseInt(s, 10); }, ok: function(v){ return v >= 1; } },
        opt_field1: { key: "x", parse: function(s){ return parseInt(s, 10); }, ok: function(v){ return v >= 0; } },
        opt_field2: { key: "p_true", parse: parseFloat, ok: function(v){ return v >= 0 && v <= 1; } }
    };

    this.read_field = function(id){
        var f = fields[id];
        var v = f.parse($("#" + id).val());
        if (!isNaN(v) && f.ok(v)) {
            this[f.key] = (id == "n") ? Math.min(v, this.max_n) : v;
        }
        if (this.x > this.n) this.x = this.n;    // X can't exceed n
        $("#" + id).val(this[f.key]);
        $("#opt_field1").val(this.x);
        if (id == "p0") this.update_ha_labels();
    };

    this.write_inputs = function(){
        for (var id in fields) $("#" + id).val(this[fields[id].key]);
        this.update_ha_labels();
    };

    this.new_sample = function(){
        this.simulated_x = binomial_sample(this.n, this.p_true);
    };

    // apply one field (on blur/Enter) or all of them (UPDATE / NEW SAMPLE)
    this.apply = function(id){
        var old_n = this.n, old_p = this.p_true;
        if (id) {
            this.read_field(id);
        } else {
            for (var k in fields) this.read_field(k);
        }
        // a simulated sample is redrawn when asked for, or when n or the true p changes
        if (this.simulating() && (!id || this.n != old_n || this.p_true != old_p || this.simulated_x === null)) {
            this.new_sample();
        }
        this.redraw();
    };

    this.set_mode = function(){
        $("#u_button").html(this.simulating() ? "NEW SAMPLE" : "UPDATE");
        if (this.simulating() && this.simulated_x === null) this.new_sample();
        this.redraw();
    };

    this.reset = function(){
        for (var k in this.defaults) this[k === "x" ? "x" : k] = this.defaults[k];
        this.simulated_x = null;
        $("#ha1").prop("checked", true);
        this.write_inputs();
        if (this.simulating()) this.new_sample();
        this.redraw();
    };

    this.initialize = function(){
        var self = this;
        this.width = $("#notepad").width();
        this.height = $("#notepad").height();
        this.plot_x = 50;
        this.plot_width = this.width - 100;
        this.plot_y = this.height - 100;
        this.plot_height = this.height - 260;
        this.paper = Raphael(document.getElementById("notepad"), this.width, this.height);

        $("#p0, #alpha, #n, #opt_field1, #opt_field2")
            .blur(function(){ self.apply(this.id); })
            .keydown(function(e){
                if (e.which == 13) { e.preventDefault(); self.apply(this.id); }
            });
        $("#ha1, #ha2, #ha3").click(function(){ self.redraw(); });
        $("#opt1, #opt2").click(function(){ self.set_mode(); });
        $("#u_button").click(function(e){ e.preventDefault(); self.apply(); });
        $("#c_button").click(function(e){ e.preventDefault(); self.reset(); });
        this.reset();
    };
}

$(window).load(function(){
    module_main.initialize();
});

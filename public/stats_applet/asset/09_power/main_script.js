// LOCAL RECONSTRUCTION (see applet.html).
// Top curve: sampling distribution of xbar when H0 is true; yellow area = alpha.
// Bottom curve: sampling distribution of xbar when the alternative is true; red area = power.
// Both share one x scale (mu0 +/- 4 standard errors), as in the Java original.

module_main = new function(){
    this.paper = null;
    this.width = 0;
    this.height = 0;
    this.plot_x = 50;
    this.plot_width = 425;
    this.top_axis_y = 215;
    this.bottom_axis_y = 455;
    this.curve_height = 135;

    this.defaults = { H0: 0, alpha: 0.05, sigma: 1, n: 10, alt_mean: 0.316 };
    this.max_n = 250;
    this.H0 = 0;
    this.alpha = 0.05;
    this.sigma = 1;
    this.n = 10;
    this.alt_mean = 0.316;

    var text_attrs = { "font-size": "14", "fill": "#292929", "font-family": "Verdana" };
    var caption_attrs = { "font-size": "12", "fill": "#666666", "font-family": "Verdana", "text-anchor": "start" };

    this.tail = function(){
        if ($("#ha2").is(":checked")) return "lt";
        if ($("#ha3").is(":checked")) return "ne";
        return "gt";
    };

    // x pixel for a value of xbar
    this.px = function(v){
        return this.plot_x + this.plot_width / 2 + (v - this.H0) / this.se * (this.plot_width / 8);
    };

    this.range_min = function(){ return this.H0 - 4 * this.se; };
    this.range_max = function(){ return this.H0 + 4 * this.se; };

    // y pixel of a normal curve (peak normalized to curve_height) centered at `center`
    this.py = function(v, center, axis_y){
        var z = (v - center) / this.se;
        return axis_y - this.curve_height * Math.exp(-0.5 * z * z);
    };

    this.draw_axis = function(axis_y){
        var axis = this.paper.path("M" + this.plot_x + " " + axis_y + "L" + (this.plot_x + this.plot_width) + " " + axis_y);
        axis.attr("stroke", "#666666");
        for (var k = -4; k <= 4; k += 2) {
            var v = this.H0 + k * this.se;
            var x = Math.round(this.px(v));
            this.paper.path("M" + x + " " + (axis_y + 5) + "L" + x + " " + (axis_y - 5)).attr("stroke", "#666666");
            this.paper.text(x, axis_y + 15, (Math.round(v * 10000) / 10000).toFixed(3)).attr(text_attrs);
        }
    };

    this.draw_curve = function(center, axis_y){
        var steps = this.plot_width;
        var lo = this.range_min(), hi = this.range_max();
        var path = "";
        for (var i = 0; i <= steps; i++) {
            var v = lo + (hi - lo) * i / steps;
            path += (i == 0 ? "M" : "L") + this.px(v).toFixed(1) + " " + this.py(v, center, axis_y).toFixed(1);
        }
        this.paper.path(path).attr({ "stroke": "#e13f3f", "stroke-width": 1.5 });
    };

    // fill the area under a curve between `from` and `to` (clipped to the plotted range)
    this.shade = function(center, axis_y, from, to, color){
        from = Math.max(from, this.range_min());
        to = Math.min(to, this.range_max());
        if (to <= from) return;
        var steps = Math.max(2, Math.round((this.px(to) - this.px(from))));
        var path = "M" + this.px(from).toFixed(1) + " " + axis_y;
        for (var i = 0; i <= steps; i++) {
            var v = from + (to - from) * i / steps;
            path += "L" + this.px(v).toFixed(1) + " " + this.py(v, center, axis_y).toFixed(1);
        }
        path += "L" + this.px(to).toFixed(1) + " " + axis_y + "Z";
        this.paper.path(path).attr({ "fill": color, "stroke": "none" });
    };

    this.shade_rejection = function(r, center, axis_y, color){
        if (r.low !== null) this.shade(center, axis_y, -Infinity, r.low, color);
        if (r.high !== null) this.shade(center, axis_y, r.high, Infinity, color);
    };

    this.draw_critical_line = function(v){
        if (v === null || v < this.range_min() || v > this.range_max()) return;
        var x = Math.round(this.px(v)) + 0.5;
        // one segment per plot, stopping short of the labels above each curve
        var axes = [this.top_axis_y, this.bottom_axis_y];
        for (var i = 0; i < axes.length; i++) {
            this.paper.path("M" + x + " " + (axes[i] - this.curve_height + 5) + "L" + x + " " + axes[i])
                .attr({ "stroke": "#888888", "stroke-dasharray": "- " });
        }
    };

    // text on a background box, so lines behind it don't run through it (as the Java original did)
    this.boxed_text = function(x, y, s, attrs){
        var t = this.paper.text(x, y, s).attr(attrs);
        var b = t.getBBox();
        this.paper.rect(b.x - 4, b.y - 1, b.width + 8, b.height + 2, 3)
            .attr({ "fill": "#f6f7f8", "stroke": "none" })
            .insertBefore(t);
        return t;
    };

    this.clamp_label_x = function(x){
        return Math.min(Math.max(x, this.plot_x + 70), this.plot_x + this.plot_width - 70);
    };

    this.redraw = function(){
        this.se = this.sigma / Math.sqrt(this.n);
        var r = power_analysis(this.H0, this.alt_mean, this.sigma, this.n, this.alpha, this.tail());
        this.result = r;

        this.paper.clear();

        // shaded areas first, so the curves and axes draw over them
        this.shade_rejection(r, this.H0, this.top_axis_y, "#ffba00");
        this.shade_rejection(r, this.alt_mean, this.bottom_axis_y, "#e13f3f");

        this.draw_curve(this.H0, this.top_axis_y);
        this.draw_curve(this.alt_mean, this.bottom_axis_y);
        this.draw_axis(this.top_axis_y);
        this.draw_axis(this.bottom_axis_y);
        this.draw_critical_line(r.low);
        this.draw_critical_line(r.high);

        this.paper.text(this.plot_x - 35, this.top_axis_y - this.curve_height - 25, "H₀ true: µ = " + this.H0).attr(caption_attrs);
        this.paper.text(this.plot_x - 35, this.bottom_axis_y - this.curve_height - 25, "Alternative true: µ = " + this.alt_mean).attr(caption_attrs);

        this.boxed_text(this.clamp_label_x(this.px(this.H0)), this.top_axis_y - this.curve_height - 10, "α = " + this.alpha, text_attrs);
        this.boxed_text(this.clamp_label_x(this.px(this.alt_mean)), this.bottom_axis_y - this.curve_height - 10,
            "Power = " + r.power.toFixed(4), text_attrs);
    };

    this.update_ha_labels = function(){
        $("#lha1").html("µ > " + this.H0);
        $("#lha2").html("µ < " + this.H0);
        $("#lha3").html("µ ≠ " + this.H0);
    };

    // input id -> setting it controls, and how to parse/validate it
    var fields = {
        h0: { key: "H0", parse: parseFloat, ok: function(v){ return true; } },
        alpha: { key: "alpha", parse: parseFloat, ok: function(v){ return v > 0 && v < 1; } },
        sigma: { key: "sigma", parse: parseFloat, ok: function(v){ return v > 0; } },
        n: { key: "n", parse: function(s){ return parseInt(s, 10); }, ok: function(v){ return v > 0; } },
        alt_mean: { key: "alt_mean", parse: parseFloat, ok: function(v){ return true; } }
    };

    // read one field, keeping the previous value if it's invalid, and show the value in use
    this.read_field = function(id){
        var f = fields[id];
        var v = f.parse($("#" + id).val());
        if (!isNaN(v) && f.ok(v)) {
            this[f.key] = (id == "n") ? Math.min(v, this.max_n) : v;
        }
        $("#" + id).val(this[f.key]);
        if (id == "h0") this.update_ha_labels();
    };

    this.write_inputs = function(){
        for (var id in fields) {
            $("#" + id).val(this[fields[id].key]);
        }
        this.update_ha_labels();
    };

    // apply one field (on blur/Enter), or all of them (UPDATE)
    this.apply = function(id){
        if (id) {
            this.read_field(id);
        } else {
            for (var k in fields) this.read_field(k);
        }
        this.redraw();
    };

    this.reset = function(){
        for (var k in this.defaults) {
            this[k] = this.defaults[k];
        }
        $("#ha1").prop("checked", true);
        this.write_inputs();
        this.redraw();
    };

    this.initialize = function(){
        this.width = $("#notepad").width();
        this.height = $("#notepad").height();
        this.plot_width = this.width - 100;
        this.paper = Raphael(document.getElementById("notepad"), this.width, this.height);

        $("#h0, #alpha, #sigma, #n, #alt_mean")
            .blur(function(){ module_main.apply(this.id); })
            .keydown(function(e){
                if (e.which == 13) {
                    e.preventDefault();
                    module_main.apply(this.id);
                }
            });
        $("#ha1, #ha2, #ha3").click(function(){ module_main.redraw(); });
        $("#u_button").click(function(e){
            e.preventDefault();
            module_main.apply();
        });
        $("#c_button").click(function(e){
            e.preventDefault();
            module_main.reset();
        });

        this.reset();
    };
}

$(window).load(function(){
    module_main.initialize();
});

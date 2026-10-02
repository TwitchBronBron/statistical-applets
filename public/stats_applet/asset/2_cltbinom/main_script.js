// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not. Behavior follows the page's
// instructions and the Java "Central Limit Theorem / Normal Approximation to Binomial" applet it replaced
// (clt_binomial.jar): sliders for n (1 to 100, default 10) and p (0.01 to 0.99, default 0.7); bars show the
// binomial probabilities; a vertical line marks the mean np (gray, per the HTML5 page text); the red curve is the
// Normal density with the same mean and standard deviation. Hovering a bar shows its probability.

module_main = new function(){
    this.n = 10;
    this.p = 0.7;
    this.MIN_N = 1;
    this.MAX_N = 100;

    var text_attrs = { "font-size": "12", "fill": "#292929", "font-family": "Verdana" };

    this.redraw = function(){
        var P = this.paper;
        P.clear();
        var W = this.W, H = this.H;
        var x0 = 70, x1 = W - 20, y_top = 25, y_axis = H - 70;
        var n = this.n, p = this.p;
        var probs = binomial_pmf(n, p);
        var mean = n * p, sd = Math.sqrt(n * p * (1 - p));

        // x scale runs from -1 to n + 1, as in the Java original
        var lo = -1, hi = n + 1;
        var px = function(x){ return x0 + (x - lo) / (hi - lo) * (x1 - x0); };
        var peak = 1 / (sd * Math.sqrt(2 * Math.PI)), max_bar = 0;
        for (var k = 0; k <= n; k++) max_bar = Math.max(max_bar, probs[k]);
        var ymax = Math.max(peak, max_bar) * 1.05;
        var py = function(v){ return y_axis - v / ymax * (y_axis - y_top); };

        // bars (binomial probabilities), with the exact probability as a tooltip
        var gap = Math.min(2, (px(1) - px(0)) * 0.15);
        for (k = 0; k <= n; k++) {
            var left = px(k - 0.5) + gap / 2, right = px(k + 0.5) - gap / 2;
            P.rect(left, py(probs[k]), Math.max(0.5, right - left), y_axis - py(probs[k]))
                .attr({ fill: "#f4db77", stroke: "#c9a83a", "stroke-width": 0.5, title: "P(X = " + k + ") = " + probs[k].toFixed(4) });
        }

        // Normal curve with the same mean and standard deviation
        var path = "", steps = x1 - x0;
        for (var i = 0; i <= steps; i++) {
            var x = lo + (hi - lo) * i / steps;
            path += (i ? "L" : "M") + px(x).toFixed(1) + " " + py(gaussian(sd, mean, x)).toFixed(1);
        }
        P.path(path).attr({ stroke: "#e13f3f", "stroke-width": 2 });

        // axes: probability ticks on the left; 0, n, and the mean below
        P.path("M" + x0 + " " + y_axis + "L" + x1 + " " + y_axis).attr("stroke", "#666");
        P.path("M" + x0 + " " + y_axis + "L" + x0 + " " + y_top).attr("stroke", "#666");
        var raw = ymax / 5, pow = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
        var step = [1, 2, 2.5, 5, 10].map(function(m){ return m * pow; }).filter(function(s){ return s >= raw; })[0];
        var dec = Math.max(0, -Math.floor(Math.log(step) / Math.LN10) + (step / pow == 2.5 ? 1 : 0));
        for (var t = 0; t <= ymax + 1e-12; t += step) {
            var ty = Math.round(py(t)) + 0.5;
            P.path("M" + (x0 - 5) + " " + ty + "L" + x0 + " " + ty).attr("stroke", "#666");
            P.text(x0 - 9, ty, t.toFixed(dec)).attr(text_attrs).attr("text-anchor", "end");
        }
        P.text(18, (y_top + y_axis) / 2, "Probability").attr(text_attrs).rotate(-90);
        var xtick = function(v, label){
            var x = Math.round(px(v)) + 0.5;
            P.path("M" + x + " " + y_axis + "L" + x + " " + (y_axis + 5)).attr("stroke", "#666");
            P.text(x, y_axis + 16, label).attr(text_attrs);
        };
        xtick(0, "0");
        xtick(n, String(n));

        // gray line at the mean, labeled with np
        var mx = Math.round(px(mean)) + 0.5;
        P.path("M" + mx + " " + (y_axis + 10) + "L" + mx + " " + y_top).attr({ stroke: "#888", "stroke-width": 2 });
        var label = "np = " + parseFloat(mean.toFixed(2));
        var lt = P.text(mx, y_axis + 36, label).attr(text_attrs);
        var lb = lt.getBBox();
        if (lb.x < 4) lt.attr("x", lt.attr("x") + 4 - lb.x);
        if (lb.x + lb.width > W - 4) lt.attr("x", lt.attr("x") - (lb.x + lb.width - W + 4));
    };

    this.set_n = function(v){
        v = Math.round(v);
        if (isNaN(v)) v = this.n;
        this.n = Math.max(this.MIN_N, Math.min(this.MAX_N, v));
        $("#n").val(this.n);
        $("#n_slider").slider("value", this.n);
        this.redraw();
    };

    this.set_p = function(v){
        if (isNaN(v)) v = this.p;
        this.p = Math.round(Math.max(0.01, Math.min(0.99, v)) * 100) / 100;
        $("#p").val(this.p.toFixed(2));
        $("#p_slider").slider("value", Math.round(this.p * 100));
        this.redraw();
    };

    this.initialize = function(){
        var self = this;
        this.W = $("#notepad").width();
        this.H = $("#notepad").height();
        this.paper = Raphael(document.getElementById("notepad"), this.W, this.H);

        $("#n_slider").slider({
            range: "min", min: this.MIN_N, max: this.MAX_N, value: this.n,
            slide: function(e, ui){ self.n = ui.value; $("#n").val(ui.value); self.redraw(); }
        });
        $("#p_slider").slider({
            range: "min", min: 1, max: 99, value: Math.round(this.p * 100),
            slide: function(e, ui){ self.p = ui.value / 100; $("#p").val(self.p.toFixed(2)); self.redraw(); }
        });
        // the number boxes can be typed in too (Enter or leaving the box applies them)
        $("#n").on("change", function(){ self.set_n(parseFloat($(this).val())); });
        $("#p").on("change", function(){ self.set_p(parseFloat($(this).val())); });
        $("#enter_form").on("submit", function(e){ e.preventDefault(); $("#n, #p").trigger("change"); });

        $("#n").val(this.n);
        $("#p").val(this.p.toFixed(2));
        this.redraw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

// LOCAL RECONSTRUCTION (see applet.html). Follows the page's instructions: choose p (0 to 1) and n (20 to
// 2000); GENERATE ONE SAMPLE adds one sample proportion at a time, GENERATE SAMPLES adds 10,000; "Show Normal
// Curve" overlays N(p, sqrt(p(1-p)/n)). The histogram, its mean and standard deviation, and the most recent
// sample are shown. Changing p or n starts over.

module_main = new function(){
    this.BATCH = 10000;
    this.MIN_N = 20;
    this.MAX_N = 2000;
    this.MAX_BARS = 60;
    this.p = 0.5;
    this.n = 100;
    this.counts = null;     // counts[x] = number of samples with x successes
    this.total = 0;
    this.last_x = null;

    var text_attrs = { "font-size": "12", "fill": "#292929", "font-family": "Verdana" };

    this.clear = function(){
        this.counts = new Array(this.n + 1);
        for (var i = 0; i <= this.n; i++) this.counts[i] = 0;
        this.total = 0;
        this.last_x = null;
    };

    // read p and n; start over if either changed
    this.read_inputs = function(){
        var p = parseFloat($("#p").val()), n = parseInt($("#n").val(), 10);
        if (isNaN(p)) p = this.p;
        if (isNaN(n)) n = this.n;
        p = Math.max(0, Math.min(1, p));
        n = Math.max(this.MIN_N, Math.min(this.MAX_N, n));
        $("#p").val(p);
        $("#n").val(n);
        if (p != this.p || n != this.n || !this.counts) {
            this.p = p;
            this.n = n;
            this.clear();
        }
    };

    this.generate = function(how_many){
        this.read_inputs();
        for (var i = 0; i < how_many; i++) {
            var x = binomial_sample(this.n, this.p);
            this.counts[x]++;
            this.last_x = x;
        }
        this.total += how_many;
        if (how_many > 1) this.last_x = null;    // only highlight a sample taken on its own
        this.redraw();
    };

    // x range: p +/- 4.5 standard deviations, kept within the possible values 0..1
    this.range = function(){
        var sd = Math.sqrt(this.p * (1 - this.p) / this.n);
        var half = Math.max(4.5 * sd, 0.05);
        var kmin = Math.max(0, Math.ceil((this.p - half) * this.n));
        var kmax = Math.min(this.n, Math.floor((this.p + half) * this.n));
        return { sd: sd, kmin: kmin, kmax: kmax };
    };

    this.redraw = function(){
        var p = this.paper;
        p.clear();
        var W = this.W, axis_y = this.H - 60, top = 95, x0 = 50, x1 = W - 30;
        var R = this.range(), n = this.n;
        var vals_per_bar = Math.max(1, Math.ceil((R.kmax - R.kmin + 1) / this.MAX_BARS));
        var lo = (R.kmin - 0.5) / n, hi = (R.kmax + 0.5) / n;
        var px = function(v){ return x0 + (v - lo) / (hi - lo) * (x1 - x0); };

        // bars: each covers vals_per_bar consecutive possible values of p-hat
        var bars = [], off_scale = 0, k;
        for (k = 0; k <= n && this.counts; k++) {
            if (k < R.kmin || k > R.kmax) { off_scale += this.counts[k]; continue; }
            var b = Math.floor((k - R.kmin) / vals_per_bar);
            bars[b] = (bars[b] || 0) + this.counts[k];
        }
        var bar_w = vals_per_bar / n;
        var normal_peak = R.sd > 0 ? 1 / (R.sd * Math.sqrt(2 * Math.PI)) : 0;
        var max_density = normal_peak;
        for (var j = 0; j < bars.length; j++) {
            if (bars[j]) max_density = Math.max(max_density, bars[j] / (this.total * bar_w));
        }
        var scale = (axis_y - top) / (max_density * 1.05 || 1);
        var last_bar = this.last_x === null ? -1 : Math.floor((this.last_x - R.kmin) / vals_per_bar);

        if (this.total) {
            for (j = 0; j < bars.length; j++) {
                if (!bars[j]) continue;
                var start = (R.kmin + j * vals_per_bar - 0.5) / n;
                var h = bars[j] / (this.total * bar_w) * scale;
                p.rect(px(start), axis_y - h, px(start + bar_w) - px(start), h)
                    .attr({ fill: j == last_bar ? "#1d3bb3" : "#8aa0ff", stroke: "#3b60ff", "stroke-width": 0.75 });
            }
        } else {
            p.rect(x0 + 60, top + 90, x1 - x0 - 120, 50, 4).attr({ fill: "#e9eaeb", stroke: "none" });
            p.text((x0 + x1) / 2, top + 115, "Click GENERATE ONE SAMPLE or GENERATE SAMPLES")
                .attr({ "font-size": "15", fill: "#3d3d3d", "font-family": "Arial" });
        }

        if ($("#show_normal").is(":checked") && R.sd > 0) {
            var path = "", steps = x1 - x0;
            for (var i = 0; i <= steps; i++) {
                var v = lo + (hi - lo) * i / steps;
                path += (i ? "L" : "M") + px(v).toFixed(1) + " " + (axis_y - gaussian(R.sd, this.p, v) * scale).toFixed(1);
            }
            p.path(path).attr({ stroke: "#e13f3f", "stroke-width": 2 });
        }

        // axis with "nice" tick marks
        p.path("M" + x0 + " " + axis_y + "L" + x1 + " " + axis_y).attr("stroke", "#666666");
        var span = hi - lo, raw = span / 7, pow = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
        var step = [1, 2, 2.5, 5, 10].map(function(m){ return m * pow; }).filter(function(s){ return s >= raw; })[0];
        var dec = Math.max(0, -Math.floor(Math.log(step) / Math.LN10) + (step / pow == 2.5 ? 1 : 0));
        for (var t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) {
            var tx = Math.round(px(t)) + 0.5;
            p.path("M" + tx + " " + axis_y + "L" + tx + " " + (axis_y + 5)).attr("stroke", "#666666");
            p.text(tx, axis_y + 16, t.toFixed(dec)).attr(text_attrs);
        }
        p.text((x0 + x1) / 2, axis_y + 38, "Sample proportion").attr(text_attrs);

        // summary (HTML so p-hat renders properly)
        var html = "<span class='caption'>Sampling distribution of <i>p&#770;</i> for <i>n</i> = " + n + ", <i>p</i> = " + this.p + "</span><br>";
        if (this.total) {
            var sum = 0, sumsq = 0;
            for (k = 0; k <= n; k++) {
                var ph = k / n;
                sum += this.counts[k] * ph;
                sumsq += this.counts[k] * ph * ph;
            }
            var mean = sum / this.total;
            var sd = this.total > 1 ? Math.sqrt(Math.max(0, (sumsq - this.total * mean * mean) / (this.total - 1))) : 0;
            html += "Samples: " + this.total.toLocaleString("en-US")
                + " &nbsp;|&nbsp; Mean of <i>p&#770;</i> = " + mean.toFixed(4)
                + " &nbsp;|&nbsp; Std. dev. of <i>p&#770;</i> = " + sd.toFixed(4);
            if (this.last_x !== null) {
                html += "<br>Last sample: <i>X</i> = " + this.last_x + " successes, <i>p&#770;</i> = " + (this.last_x / n).toFixed(4);
            }
            if (off_scale) {
                html += "<br><span class='caption'>" + off_scale + (off_scale == 1 ? " sample proportion is" : " sample proportions are") + " off the scale</span>";
            }
        }
        $("#stats").html(html);
    };

    this.initialize = function(){
        var self = this;
        this.W = $("#notepad").width();
        this.H = $("#notepad").height();
        this.paper = Raphael(document.getElementById("notepad"), this.W, this.H);
        $("#stats").appendTo("#notepad");    // keep the summary above the drawing
        $("#generate_one").click(function(){ self.generate(1); });
        $("#generate_many").click(function(){ self.generate(self.BATCH); });
        $("#show_normal").click(function(){ self.redraw(); });
        $("#p, #n").on("change", function(){ self.read_inputs(); self.redraw(); })
            .keydown(function(e){ if (e.which == 13) { e.preventDefault(); self.read_inputs(); self.redraw(); } });
        this.read_inputs();
        this.redraw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

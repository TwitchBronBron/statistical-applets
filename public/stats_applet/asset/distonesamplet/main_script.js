// LOCAL RECONSTRUCTION (see applet1.html). Adapted from the Central Limit Theorem rebuild:
// top: the chosen population; bottom: histogram of 10,000 one-sample t statistics for samples of size n, on
// a fixed scale of -5 to 5, with an optional overlay of the t distribution with n - 1 degrees of freedom.

module_main = new function(){
    this.NUM_SAMPLES = 10000;
    this.NUM_BINS = 50;
    this.T_RANGE = 5;
    this.N_STEPS = [2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
    this.POP_NAMES = { exponential: "Exponential", uniform: "Uniform", normal: "Normal" };

    this.paper = null;
    this.population = "exponential";
    this.n = 2;
    this.ts = null;         // null until GENERATE is clicked

    // layout
    this.plot_x = 40;
    this.plot_width = 465;
    this.pop_axis_y = 95;
    this.pop_height = 55;
    this.hist_axis_y = 410;
    this.hist_height = 235;

    var text_attrs = { "font-size": "13", "fill": "#292929", "font-family": "Verdana" };
    var caption_attrs = { "font-size": "12", "fill": "#666666", "font-family": "Verdana", "text-anchor": "start" };

    this.hist_px = function(t){
        return this.plot_x + (t + this.T_RANGE) / (2 * this.T_RANGE) * this.plot_width;
    };

    this.draw_population = function(){
        var lo = -2, hi = 4, top = 1.1;    // exponential peaks at 1
        var self = this;
        var px = function(x){ return self.plot_x + (x - lo) / (hi - lo) * self.plot_width; };
        var py = function(d){ return self.pop_axis_y - d / top * self.pop_height; };

        var path = "M" + px(lo) + " " + this.pop_axis_y;
        var steps = this.plot_width;
        for (var i = 0; i <= steps; i++) {
            var x = lo + (hi - lo) * i / steps;
            path += "L" + px(x).toFixed(1) + " " + py(population_density(this.population, x)).toFixed(1);
        }
        path += "L" + px(hi) + " " + this.pop_axis_y + "Z";
        this.paper.path(path).attr({ "fill": "#d9d9d9", "stroke": "#666666", "stroke-width": 1.5 });

        this.paper.path("M" + this.plot_x + " " + this.pop_axis_y + "L" + (this.plot_x + this.plot_width) + " " + this.pop_axis_y).attr("stroke", "#666666");
        for (var t = lo; t <= hi; t++) {
            var x = Math.round(px(t)) + 0.5;
            this.paper.path("M" + x + " " + (this.pop_axis_y - 4) + "L" + x + " " + (this.pop_axis_y + 4)).attr("stroke", "#666666");
            this.paper.text(x, this.pop_axis_y + 13, t).attr($.extend({}, text_attrs, { "font-size": "11" }));
        }
        this.paper.text(this.plot_x, 16, "Population: " + this.POP_NAMES[this.population] + " (µ = 1, σ = 1)").attr(caption_attrs);
    };

    this.draw_hist_axis = function(){
        var y = this.hist_axis_y;
        this.paper.path("M" + this.plot_x + " " + y + "L" + (this.plot_x + this.plot_width) + " " + y).attr("stroke", "#666666");
        for (var t = -this.T_RANGE; t <= this.T_RANGE; t++) {
            var x = Math.round(this.hist_px(t)) + 0.5;
            this.paper.path("M" + x + " " + (y - 5) + "L" + x + " " + (y + 5)).attr("stroke", "#666666");
            this.paper.text(x, y + 15, t).attr(text_attrs);
        }
    };

    this.draw_histogram = function(){
        var lo = -this.T_RANGE, hi = this.T_RANGE;
        var bin_w = (hi - lo) / this.NUM_BINS;
        var counts = [], off_scale = 0, i, df = this.n - 1;
        for (i = 0; i < this.NUM_BINS; i++) counts[i] = 0;
        for (i = 0; i < this.ts.length; i++) {
            var b = Math.floor((this.ts[i] - lo) / bin_w);
            if (b < 0 || b >= this.NUM_BINS || isNaN(b)) {
                off_scale++;
            } else {
                counts[b]++;
            }
        }

        // y scale in density units, so the t curve can be overlaid directly
        var max_density = t_density(0, df);
        for (i = 0; i < this.NUM_BINS; i++) {
            max_density = Math.max(max_density, counts[i] / (this.ts.length * bin_w));
        }
        var scale = this.hist_height / (max_density * 1.08);

        var bar_w = this.plot_width / this.NUM_BINS;
        for (i = 0; i < this.NUM_BINS; i++) {
            if (!counts[i]) continue;
            var h = counts[i] / (this.ts.length * bin_w) * scale;
            this.paper.rect(this.plot_x + i * bar_w, this.hist_axis_y - h, bar_w, h)
                .attr({ "fill": "#8aa0ff", "stroke": "#3b60ff", "stroke-width": 0.75 });
        }

        if ($("#show_normal").is(":checked")) {
            var path = "", steps = this.plot_width;
            for (i = 0; i <= steps; i++) {
                var t = lo + (hi - lo) * i / steps;
                var y = this.hist_axis_y - t_density(t, df) * scale;
                path += (i == 0 ? "M" : "L") + this.hist_px(t).toFixed(1) + " " + y.toFixed(1);
            }
            this.paper.path(path).attr({ "stroke": "#e13f3f", "stroke-width": 2 });
        }

        var note = "t curve: t distribution with n − 1 = " + df + (df == 1 ? " degree" : " degrees") + " of freedom";
        this.paper.text(this.plot_x, 445, note).attr(caption_attrs);
        if (off_scale) {
            this.paper.text(this.plot_x, 462, off_scale + (off_scale == 1 ? " t statistic was" : " t statistics were")
                + " beyond ±" + this.T_RANGE + " (off the scale)").attr(caption_attrs);
        }
    };

    this.redraw = function(){
        this.paper.clear();
        this.draw_population();
        this.paper.text(this.plot_x, 140, "Distribution of " + (this.ts ? "10,000 " : "") + "t statistics, n = " + this.n).attr(caption_attrs);
        this.draw_hist_axis();
        if (this.ts) {
            this.draw_histogram();
        } else {
            var box = this.paper.rect(this.plot_x + 40, 255, this.plot_width - 80, 50, 4);
            box.attr({ "fill": "#e9eaeb", "stroke": "none" });
            this.paper.text(this.plot_x + this.plot_width / 2, 280, "Click GENERATE to take 10,000 samples of size n = " + this.n)
                .attr({ "font-size": "15", "fill": "#3d3d3d", "font-family": "Arial" });
        }
    };

    this.clear_samples = function(){
        this.ts = null;
        this.redraw();
    };

    this.initialize = function(){
        var self = this;
        this.paper = Raphael(document.getElementById("notepad"), $("#notepad").width(), $("#notepad").height());

        $("#sample_size_slider").slider({
            range: "min",
            value: 1,
            min: 1,
            max: this.N_STEPS.length,
            slide: function(event, ui){
                $("#sample_size").val(self.N_STEPS[ui.value - 1]);
            },
            change: function(event, ui){
                self.n = self.N_STEPS[ui.value - 1];
                $("#sample_size").val(self.n);
                self.clear_samples();
            }
        });
        $("#sample_size").val(this.n);

        $("input[name=population]").click(function(){
            self.population = $(this).val();
            self.clear_samples();
        });
        $("#show_normal").click(function(){ self.redraw(); });
        $("#generate").click(function(){
            self.ts = t_statistics(self.population, self.n, self.NUM_SAMPLES);
            self.redraw();
        });

        this.redraw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

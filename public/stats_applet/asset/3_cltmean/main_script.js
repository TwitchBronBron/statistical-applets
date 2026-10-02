// LOCAL RECONSTRUCTION (see index.html).
// Top: the chosen population. Bottom: histogram of 10,000 sample means of size n, on a scale of
// mu +/- 4 sigma/sqrt(n), with an optional overlay of the Normal curve the CLT predicts.

module_main = new function(){
    this.NUM_SAMPLES = 10000;
    this.NUM_BINS = 40;
    this.N_STEPS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
    this.POP_NAMES = { exponential: "Exponential", uniform: "Uniform", normal: "Normal" };

    this.paper = null;
    this.population = "exponential";
    this.n = 1;
    this.means = null;      // null until GENERATE is clicked

    // layout
    this.plot_x = 40;
    this.plot_width = 465;
    this.pop_axis_y = 95;
    this.pop_height = 55;
    this.hist_axis_y = 352;
    this.hist_height = 190;

    var text_attrs = { "font-size": "13", "fill": "#292929", "font-family": "Verdana" };
    var caption_attrs = { "font-size": "12", "fill": "#666666", "font-family": "Verdana", "text-anchor": "start" };

    this.se = function(){ return POP_SD / Math.sqrt(this.n); };
    this.hist_min = function(){ return POP_MEAN - 4 * this.se(); };
    this.hist_max = function(){ return POP_MEAN + 4 * this.se(); };

    this.hist_px = function(v){
        return this.plot_x + (v - this.hist_min()) / (this.hist_max() - this.hist_min()) * this.plot_width;
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
        for (var k = -4; k <= 4; k += 2) {
            var v = POP_MEAN + k * this.se();
            var x = Math.round(this.hist_px(v)) + 0.5;
            this.paper.path("M" + x + " " + (y - 5) + "L" + x + " " + (y + 5)).attr("stroke", "#666666");
            this.paper.text(x, y + 15, v.toFixed(3)).attr(text_attrs);
        }
    };

    this.draw_histogram = function(){
        var lo = this.hist_min(), hi = this.hist_max();
        var bin_w = (hi - lo) / this.NUM_BINS;
        var counts = [], off_scale = 0, i;
        for (i = 0; i < this.NUM_BINS; i++) counts[i] = 0;
        for (i = 0; i < this.means.length; i++) {
            var b = Math.floor((this.means[i] - lo) / bin_w);
            if (b < 0 || b >= this.NUM_BINS) {
                off_scale++;
            } else {
                counts[b]++;
            }
        }

        // y scale in density units, so the Normal curve can be overlaid directly
        var normal_peak = 1 / (this.se() * Math.sqrt(2 * Math.PI));
        var max_density = normal_peak;
        for (i = 0; i < this.NUM_BINS; i++) {
            max_density = Math.max(max_density, counts[i] / (this.means.length * bin_w));
        }
        var scale = this.hist_height / (max_density * 1.08);

        var bar_w = this.plot_width / this.NUM_BINS;
        for (i = 0; i < this.NUM_BINS; i++) {
            if (!counts[i]) continue;
            var h = counts[i] / (this.means.length * bin_w) * scale;
            this.paper.rect(this.plot_x + i * bar_w, this.hist_axis_y - h, bar_w, h)
                .attr({ "fill": "#8aa0ff", "stroke": "#3b60ff", "stroke-width": 0.75 });
        }

        if ($("#show_normal").is(":checked")) {
            var path = "", steps = this.plot_width;
            for (i = 0; i <= steps; i++) {
                var v = lo + (hi - lo) * i / steps;
                var y = this.hist_axis_y - gaussian(this.se(), POP_MEAN, v) * scale;
                path += (i == 0 ? "M" : "L") + this.hist_px(v).toFixed(1) + " " + y.toFixed(1);
            }
            this.paper.path(path).attr({ "stroke": "#e13f3f", "stroke-width": 2 });
        }

        var stats = "Mean of the sample means = " + mean_of(this.means).toFixed(4)
            + "  |  SD of the sample means = " + sd_of(this.means).toFixed(4);
        this.paper.text(this.plot_x, 383, stats).attr(caption_attrs).attr("fill", "#292929");
        var predicted = "Central Limit Theorem: µ = 1, σ/√n = " + this.se().toFixed(4);
        if (off_scale) {
            predicted += "  |  " + off_scale + (off_scale == 1 ? " mean was" : " means were") + " off the scale";
        }
        this.paper.text(this.plot_x, 400, predicted).attr(caption_attrs);
    };

    this.redraw = function(){
        this.paper.clear();
        this.draw_population();
        this.paper.text(this.plot_x, 140, "Distribution of " + (this.means ? "10,000 " : "") + "sample means, n = " + this.n).attr(caption_attrs);
        this.draw_hist_axis();
        if (this.means) {
            this.draw_histogram();
        } else {
            var box = this.paper.rect(this.plot_x + 40, 215, this.plot_width - 80, 50, 4);
            box.attr({ "fill": "#e9eaeb", "stroke": "none" });
            this.paper.text(this.plot_x + this.plot_width / 2, 240, "Click GENERATE to take 10,000 samples of size n = " + this.n)
                .attr({ "font-size": "15", "fill": "#3d3d3d", "font-family": "Arial" });
        }
    };

    this.clear_samples = function(){
        this.means = null;
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
            self.means = sample_means(self.population, self.n, self.NUM_SAMPLES);
            self.redraw();
        });

        this.redraw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

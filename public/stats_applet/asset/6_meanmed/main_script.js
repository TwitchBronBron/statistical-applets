// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not. Behavior follows
// the page's instructions and the Java "Mean and Median" applet it replaced (meanmedian.jar):
// click below the line to add a point, points at the same spot stack, drag a point along the line to
// move it or onto the trash to remove it, red arrow = median, green arrow = mean, one yellow arrow when
// they're equal. Points are reported to the quiz as {n, mean, median} (see js/stats_applet_6_meanmed.js).

module_main = new function(){
    this.MAX_POINTS = 100;
    this.lower = 0;
    this.upper = 10;
    this.points = [];       // grid indices, in insertion order
    this.paper = null;
    this.arrow_set = null;

    var label_attrs = { "font-size": "13", "fill": "#292929", "font-family": "Verdana" };

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

    this.layout = function(){
        this.W = $("#notepad").width();
        this.H = $("#notepad").height();
        this.line_y = Math.round(this.H / 2);
        this.x0 = 40;
        this.x1 = this.W - 85;
        this.trash = { x: this.W - 62, y: this.line_y - 22, w: 26, h: 32 };
        this.step = nice_step(this.upper - this.lower, 100);
        this.K = Math.round((this.upper - this.lower) / this.step);
    };

    this.px = function(k){ return this.x0 + k / this.K * (this.x1 - this.x0); };
    this.k_at = function(x){
        var k = Math.round((x - this.x0) / (this.x1 - this.x0) * this.K);
        return Math.max(0, Math.min(this.K, k));
    };
    this.value = function(k){ return clean(this.lower + k * this.step); };

    // mean and median of a list of grid indices, plus whether they're exactly equal
    this.stats = function(ks){
        if (!ks.length) return null;
        var sum = 0;
        for (var i = 0; i < ks.length; i++) sum += ks[i];
        var a = ks.slice(0).sort(function(x, y){ return x - y; });
        var m = Math.floor(a.length / 2);
        var median2 = a.length % 2 ? 2 * a[m] : a[m - 1] + a[m];     // twice the median index
        var equal = (2 * sum == a.length * median2);
        var mean = clean(this.lower + this.step * sum / a.length);
        var median = equal ? mean : clean(this.lower + this.step * median2 / 2);
        return { n: a.length, mean: mean, median: median, mean_k: sum / a.length, median_k: median2 / 2, equal: equal };
    };

    this.in_trash = function(x, y){
        var t = this.trash;
        return x >= t.x - 6 && x <= t.x + t.w + 6 && y >= t.y - 6 && y <= t.y + t.h + 6;
    };

    this.draw_trash = function(highlight){
        var t = this.trash, p = this.paper;
        var color = highlight ? "#d11717" : "#666666";
        var set = p.set();
        set.push(p.rect(t.x - 2, t.y, t.w + 4, 4, 1).attr({ fill: color, stroke: "none" }));            // lid
        set.push(p.rect(t.x + t.w / 2 - 5, t.y - 4, 10, 4, 1).attr({ fill: color, stroke: "none" }));  // handle
        set.push(p.path("M" + t.x + " " + (t.y + 6) + "L" + (t.x + 3) + " " + (t.y + t.h) + "L" + (t.x + t.w - 3) + " " + (t.y + t.h) + "L" + (t.x + t.w) + " " + (t.y + 6) + "Z")
            .attr({ fill: highlight ? "#f6d0d0" : "#e4e4e4", stroke: color, "stroke-width": 1.5 }));
        for (var i = 1; i <= 3; i++) {
            var x = t.x + t.w * i / 4;
            set.push(p.path("M" + x + " " + (t.y + 10) + "L" + x + " " + (t.y + t.h - 4)).attr({ stroke: color }));
        }
        var self = this;
        set.attr({ cursor: "pointer", title: "Drag a point here to remove it. Click to remove all points." });
        set.click(function(){ self.clear(); });
        return set;
    };

    this.draw_axis = function(){
        var p = this.paper;
        p.path("M" + this.x0 + " " + this.line_y + "L" + this.x1 + " " + this.line_y).attr({ stroke: "#292929", "stroke-width": 1.5 });
        var tick = nice_step(this.upper - this.lower, 10);
        var first = Math.ceil(this.lower / tick - 1e-9) * tick;
        for (var v = first; v <= this.upper + 1e-9; v += tick) {
            var x = Math.round(this.px((v - this.lower) / this.step)) + 0.5;
            p.path("M" + x + " " + (this.line_y - 4) + "L" + x + " " + (this.line_y + 4)).attr({ stroke: "#666666" });
            p.text(x, this.line_y - 34, format_value(clean(v))).attr(label_attrs);
        }
    };

    // a downward-pointing arrow above the line at grid position k
    this.arrow = function(k, color){
        var x = this.px(k), tip = this.line_y - 3;
        return this.paper.path("M" + x + " " + tip + "L" + (x - 6) + " " + (tip - 8) + "L" + (x - 2.5) + " " + (tip - 8)
            + "L" + (x - 2.5) + " " + (tip - 20) + "L" + (x + 2.5) + " " + (tip - 20) + "L" + (x + 2.5) + " " + (tip - 8)
            + "L" + (x + 6) + " " + (tip - 8) + "Z").attr({ fill: color, stroke: "#000", "stroke-width": 1 });
    };

    this.draw_arrows = function(ks){
        if (this.arrow_set) this.arrow_set.remove();
        this.arrow_set = this.paper.set();
        var s = this.stats(ks);
        if (s) {
            if (s.equal) {
                this.arrow_set.push(this.arrow(s.mean_k, "#ffe000"));
            } else {
                this.arrow_set.push(this.arrow(s.median_k, "#ff0000"));
                this.arrow_set.push(this.arrow(s.mean_k, "#00c000"));
            }
        }
        $("#mean_span").text(s ? format_value(s.mean) : "–");
        $("#median_span").text(s ? format_value(s.median) : "–");
        return s;
    };

    this.draw_points = function(){
        var self = this, counts = {};
        for (var i = 0; i < this.points.length; i++) {
            var k = this.points[i];
            var level = counts[k] || 0;
            counts[k] = level + 1;
            var dot = this.paper.circle(this.px(k), this.line_y + 9 + level * 11, 5)
                .attr({ fill: "#e13f3f", stroke: "#a01010", cursor: "move" });
            dot.index = i;
            dot.drag(
                function(dx, dy){
                    var x = Math.max(self.x0 - 10, Math.min(self.trash.x + self.trash.w, this.ox + dx));
                    var y = Math.max(self.line_y + 4, Math.min(self.line_y + 60, this.oy + dy));
                    this.attr({ cx: x, cy: y });
                    var over = self.in_trash(x, y);
                    if (over != this.over_trash) {
                        this.over_trash = over;
                        self.trash_set.remove();
                        self.trash_set = self.draw_trash(over);
                    }
                    // update the arrows live, as if the point were dropped here
                    var ks = self.points.slice(0);
                    if (over) {
                        ks.splice(this.index, 1);
                    } else {
                        ks[this.index] = self.k_at(x);
                    }
                    self.draw_arrows(ks);
                },
                function(){
                    this.ox = this.attr("cx");
                    this.oy = this.attr("cy");
                    this.over_trash = false;
                    this.attr({ fill: "#3b60ff", stroke: "#1d3bb3" });
                    this.toFront();
                },
                function(){
                    if (this.over_trash) {
                        self.points.splice(this.index, 1);
                    } else {
                        self.points[this.index] = self.k_at(this.attr("cx"));
                    }
                    self.changed();
                }
            );
        }
    };

    this.redraw = function(){
        this.paper.clear();
        this.arrow_set = null;
        var self = this;
        // background click target for adding points below the line
        this.paper.rect(0, 0, this.W, this.H).attr({ fill: "#fff", "fill-opacity": 0, stroke: "none" })
            .click(function(e){
                // offset() is the border edge; the drawing starts inside the border
                var np = $("#notepad"), off = np.offset();
                var x = e.pageX - off.left - parseInt(np.css("border-left-width"), 10);
                var y = e.pageY - off.top - parseInt(np.css("border-top-width"), 10);
                if (y > self.line_y && x >= self.x0 - 6 && x <= self.x1 + 6 && !self.in_trash(x, y)) {
                    self.add_point(self.k_at(x));
                }
            });
        this.draw_axis();
        this.trash_set = this.draw_trash(false);
        this.draw_points();
        return this.draw_arrows(this.points);
    };

    this.changed = function(){
        var s = this.redraw();
        Applet_Communication().report_action(s ? { n: s.n, mean: s.mean, median: s.median } : { n: 0, mean: null, median: null });
    };

    this.add_point = function(k){
        if (this.points.length >= this.MAX_POINTS) return;
        this.points.push(k);
        this.changed();
    };

    this.clear = function(){
        this.points = [];
        this.changed();
    };

    this.update_range = function(){
        var lo = parseFloat($("#lVal").val()), hi = parseFloat($("#uVal").val());
        if (!isNaN(lo) && !isNaN(hi) && hi > lo) {
            this.lower = lo;
            this.upper = hi;
            this.points = [];   // existing points would no longer sit on the new grid
        }
        $("#lVal").val(this.lower);
        $("#uVal").val(this.upper);
        this.layout();
        this.changed();
    };

    this.initialize = function(){
        var self = this;
        this.layout();
        this.paper = Raphael(document.getElementById("notepad"), this.W, this.H);
        $("#lVal").val(this.lower);
        $("#uVal").val(this.upper);
        $("#u_button").click(function(e){ e.preventDefault(); self.update_range(); });
        $("#c_button").click(function(e){ e.preventDefault(); self.clear(); });
        $("#lVal, #uVal").keydown(function(e){
            if (e.which == 13) { e.preventDefault(); self.update_range(); }
        });
        this.redraw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

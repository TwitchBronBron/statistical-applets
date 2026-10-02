// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not. Behavior follows the
// page's instructions and the Java "Normal Curve" applet it replaced (NormalCurve.jar):
//  - two green flags; with the flags in order, the two tails are shaded and each tail's area is shown,
//    and with the flags crossed (right flag left of the left flag) the area between them is shaded;
//  - "2-Tail" keeps the flags symmetric around the mean;
//  - flags start at mean -/+ 1 SD and keep their position in SD units when the mean or SD changes.
// Following the HTML5 page text: the shaded area is dark yellow, the axis is marked to 4 SD on each
// side, and each flag's value is always shown at its top.

module_main = new function(){
    this.RANGE = 4.25;          // plotted half-width, in standard deviations
    this.mean = 0;
    this.sd = 1;
    this.zl = -1;               // left flag, in SD units from the mean
    this.zr = 1;                // right flag
    this.two_tail = true;

    var label_attrs = { "font-size": "13", "fill": "#292929", "font-family": "Verdana" };
    var FLAG = "#0a7d00", SHADE = "#ffba00", CURVE = "#e13f3f";

    this.layout = function(){
        this.W = $("#notepad").width();
        this.H = $("#notepad").height();
        this.margin = 45;
        this.half = (this.W - 2 * this.margin) / 2;
        this.xc = this.W / 2;
        this.axis_y = this.H - 60;
        this.peak_y = 100;
        this.flag_top = 52;
    };

    // Flag values snap to a "nice" step just coarser than one pixel (e.g. 0.1 when SD = 5), so values
    // like 50 or -10 can be hit exactly instead of 49.986.
    this.set_grid = function(){
        this.step = nice_step(2 * this.RANGE * this.sd / (2 * this.half));
        this.decimals = step_decimals(this.step);
    };
    this.snap_z = function(z){
        var v = Math.round(this.value(z) / this.step) * this.step;
        z = (v - this.mean) / this.sd;
        return Math.max(-this.RANGE, Math.min(this.RANGE, z));
    };

    this.xz = function(z){ return this.xc + z / this.RANGE * this.half; };
    this.zx = function(x){ return Math.max(-this.RANGE, Math.min(this.RANGE, (x - this.xc) / this.half * this.RANGE)); };
    this.yz = function(z){ return this.axis_y - (this.axis_y - this.peak_y) * Math.exp(-0.5 * z * z); };
    this.value = function(z){ return this.mean + z * this.sd; };

    this.curve_path = function(za, zb, closed){
        var steps = Math.max(2, Math.round(this.xz(zb) - this.xz(za)));
        var path = closed ? "M" + this.xz(za).toFixed(1) + " " + this.axis_y + "L" : "M";
        for (var i = 0; i <= steps; i++) {
            var z = za + (zb - za) * i / steps;
            path += (i ? "L" : "") + this.xz(z).toFixed(1) + " " + this.yz(z).toFixed(1);
        }
        if (closed) path += "L" + this.xz(zb).toFixed(1) + " " + this.axis_y + "Z";
        return path;
    };

    // text in a white box with a thin border, like the Java original's drawBoxedString
    this.boxed = function(set, x, y, s, anchor){
        var t = this.paper.text(x, y, s).attr(label_attrs).attr("text-anchor", anchor || "middle");
        var b = t.getBBox();
        // keep it inside the drawing
        var dx = Math.min(0, this.W - 4 - (b.x + b.width + 3)) + Math.max(0, 4 - (b.x - 3));
        if (dx) { t.attr("x", t.attr("x") + dx); b = t.getBBox(); }
        var r = this.paper.rect(b.x - 3, b.y - 1, b.width + 6, b.height + 2).attr({ fill: "#fff", stroke: "#292929", "stroke-width": 0.75 });
        t.toFront();
        set.push(r, t);
    };

    this.draw_static = function(){
        this.paper.clear();
        this.handles = null;
        var y = this.axis_y;
        this.paper.path("M" + this.margin + " " + y + "L" + (this.W - this.margin) + " " + y).attr("stroke", "#292929");
        for (var k = -4; k <= 4; k++) {
            var x = Math.round(this.xz(k)) + 0.5;
            this.paper.path("M" + x + " " + (y - 4) + "L" + x + " " + (y + 4)).attr("stroke", "#292929");
            this.paper.text(x, y + 16, axis_label(this.value(k))).attr(label_attrs);
        }
        this.dynamic = this.paper.set();
        this.curve = null;
    };

    this.draw_flag = function(set, z, points_left){
        var x = Math.round(this.xz(z)) + 0.5, top = this.flag_top;
        set.push(this.paper.path("M" + x + " " + top + "L" + x + " " + this.axis_y).attr({ stroke: FLAG, "stroke-width": 2 }));
        var tip = points_left ? x - 12 : x + 12;
        set.push(this.paper.path("M" + x + " " + top + "L" + tip + " " + (top + 6) + "L" + x + " " + (top + 12) + "Z")
            .attr({ fill: FLAG, stroke: FLAG }));
        this.boxed(set, x, top - 14, this.value(z).toFixed(this.decimals));
    };

    this.draw_dynamic = function(){
        this.dynamic.remove();
        var set = this.dynamic = this.paper.set();
        var zl = this.zl, zr = this.zr, R = this.RANGE;

        if (zl <= zr) {
            if (zl > -R) set.push(this.paper.path(this.curve_path(-R, zl, true)).attr({ fill: SHADE, stroke: "none" }));
            if (zr < R) set.push(this.paper.path(this.curve_path(zr, R, true)).attr({ fill: SHADE, stroke: "none" }));
        } else {
            set.push(this.paper.path(this.curve_path(zr, zl, true)).attr({ fill: SHADE, stroke: "none" }));
        }
        set.push(this.paper.path(this.curve_path(-R, R, false)).attr({ stroke: CURVE, "stroke-width": 2 }));

        // the axis sits on top of the shading
        set.push(this.paper.path("M" + this.margin + " " + this.axis_y + "L" + (this.W - this.margin) + " " + this.axis_y).attr("stroke", "#292929"));

        this.draw_flag(set, zl, true);
        this.draw_flag(set, zr, false);

        var label_y = this.axis_y - 18;
        if (zl <= zr) {
            this.boxed(set, this.xz(zl) - 8, label_y, Phi(zl).toFixed(4), "end");
            this.boxed(set, this.xz(zr) + 8, label_y, (1 - Phi(zr)).toFixed(4), "start");
        } else {
            this.boxed(set, (this.xz(zl) + this.xz(zr)) / 2, this.axis_y - 62, (Phi(zl) - Phi(zr)).toFixed(4));
        }
        if (this.handles) this.handles.toFront();
    };

    this.make_handles = function(){
        var self = this;
        var make = function(which){
            var h = self.paper.rect(0, self.flag_top - 4, 18, self.axis_y - self.flag_top + 4)
                .attr({ fill: "#fff", "fill-opacity": 0, stroke: "none", cursor: "ew-resize" });
            h.which = which;
            h.drag(
                function(dx){
                    var z = self.snap_z(self.zx(this.ox + dx));
                    if (this.which == "left") {
                        self.zl = z;
                        if (self.two_tail) self.zr = -z;
                    } else {
                        self.zr = z;
                        if (self.two_tail) self.zl = -z;
                    }
                    self.place_handles();
                    self.draw_dynamic();
                },
                function(){ this.ox = self.xz(this.which == "left" ? self.zl : self.zr); }
            );
            return h;
        };
        this.handle_l = make("left");
        this.handle_r = make("right");
        this.handles = this.paper.set(this.handle_l, this.handle_r);
        this.place_handles();
    };

    this.place_handles = function(){
        this.handle_l.attr("x", this.xz(this.zl) - 9);
        this.handle_r.attr("x", this.xz(this.zr) - 9);
    };

    this.redraw = function(){
        this.draw_static();
        this.draw_dynamic();
        this.make_handles();
    };

    this.update = function(){
        var m = parseFloat($("#mean").val()), s = parseFloat($("#sd").val());
        if (!isNaN(m)) this.mean = m;
        if (!isNaN(s) && s > 0) this.sd = s;
        $("#mean").val(this.mean);
        $("#sd").val(this.sd);
        // flags keep their position in SD units (as in the Java original), snapped to the new grid
        this.set_grid();
        this.zl = this.snap_z(this.zl);
        this.zr = this.two_tail ? -this.zl : this.snap_z(this.zr);
        this.redraw();
    };

    this.set_two_tail = function(on){
        this.two_tail = on;
        if (on) this.zr = -this.zl;    // as in the Java original: mirror the right flag onto the left one
        this.place_handles();
        this.draw_dynamic();
    };

    this.initialize = function(){
        var self = this;
        this.layout();
        this.paper = Raphael(document.getElementById("notepad"), this.W, this.H);
        $("#mean").val(this.mean);
        $("#sd").val(this.sd);
        this.two_tail = $("#tails_number").is(":checked");
        this.set_grid();
        $("#update").click(function(e){ e.preventDefault(); self.update(); });
        $("#mean, #sd").keydown(function(e){
            if (e.which == 13) { e.preventDefault(); self.update(); }
        });
        $("#tails_number").click(function(){ self.set_two_tail($(this).is(":checked")); });
        this.redraw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

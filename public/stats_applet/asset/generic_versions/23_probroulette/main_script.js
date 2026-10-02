// LOCAL RECONSTRUCTION (see applet.html). Follows the page's instructions: choose an event and a number of
// spins; each spin's outcome feeds a bar graph of individual results (all 38 slots) and a plot of the proportion
// of spins in the event; "Show true probability" draws P(event) as a green line; RESET starts over. Changing the
// event re-scores the same spins.

module_main = new function(){
    this.MAX_TOTAL = 10000;
    this.outcomes = [];
    this.event = EVENTS[0];
    this.busy = false;
    this.angle = 0;

    var text_attrs = { "font-size": "12", "fill": "#292929", "font-family": "Verdana" };
    var FILL = { red: "#d40000", black: "#1a1a1a", green: "#0a8a2e" };

    this.wheel = { cx: 112, cy: 112, r: 96, inner: 58 };
    this.plot = { x0: 60, x1: 670, y0: 420, y1: 245 };
    this.bars = { x0: 60, x1: 670, y0: 605, y1: 492 };

    // the wheel is drawn once; spinning rotates it so the result sits under the pointer at the top
    this.draw_wheel = function(){
        var p = this.paper, W = this.wheel, n = WHEEL_ORDER.length, step = 2 * Math.PI / n;
        var set = p.set();
        set.push(p.circle(W.cx, W.cy, W.r + 6).attr({ fill: "#7a4a1f", stroke: "#4a2a0f" }));
        for (var i = 0; i < n; i++) {
            var a0 = -Math.PI / 2 + i * step, a1 = a0 + step;
            var path = "M" + (W.cx + W.inner * Math.cos(a0)) + " " + (W.cy + W.inner * Math.sin(a0))
                + "L" + (W.cx + W.r * Math.cos(a0)) + " " + (W.cy + W.r * Math.sin(a0))
                + "A" + W.r + " " + W.r + " 0 0 1 " + (W.cx + W.r * Math.cos(a1)) + " " + (W.cy + W.r * Math.sin(a1))
                + "L" + (W.cx + W.inner * Math.cos(a1)) + " " + (W.cy + W.inner * Math.sin(a1))
                + "A" + W.inner + " " + W.inner + " 0 0 0 " + (W.cx + W.inner * Math.cos(a0)) + " " + (W.cy + W.inner * Math.sin(a0)) + "Z";
            set.push(p.path(path).attr({ fill: FILL[slot_color(WHEEL_ORDER[i])], stroke: "#c9a227", "stroke-width": 0.75 }));
            var am = a0 + step / 2, tr = (W.r + W.inner) / 2 + 8;
            set.push(p.text(W.cx + tr * Math.cos(am), W.cy + tr * Math.sin(am), String(WHEEL_ORDER[i]))
                .attr({ "font-size": "8", "font-weight": "bold", fill: "#fff", "font-family": "Arial" })
                .rotate(am * 180 / Math.PI + 90));
        }
        set.push(p.circle(W.cx, W.cy, W.inner).attr({ fill: "#c9a227", stroke: "#8a6d12" }));
        set.push(p.circle(W.cx, W.cy, W.inner - 14).attr({ fill: "#7a4a1f", stroke: "none" }));
        this.wheel_set = set;
        // pointer at the top
        p.path("M" + (W.cx - 8) + " " + (W.cy - W.r - 14) + "L" + (W.cx + 8) + " " + (W.cy - W.r - 14) + "L" + W.cx + " " + (W.cy - W.r + 4) + "Z")
            .attr({ fill: "#ffd60a", stroke: "#333" });
    };

    this.rotate_to = function(slot, ms){
        var n = WHEEL_ORDER.length, i = WHEEL_ORDER.indexOf(slot);
        // rotate so slot i's center is at the top, always turning forward a bit
        var target = -(i + 0.5) * 360 / n;
        while (target <= this.angle + 200) target += 360;
        this.angle = target;
        var t = "r" + target + "," + this.wheel.cx + "," + this.wheel.cy;
        if (ms) this.wheel_set.animate({ transform: t }, ms, "<>");
        else this.wheel_set.transform(t);
    };

    this.draw_charts = function(){
        if (this.chart_set) this.chart_set.remove();
        var p = this.paper, set = this.chart_set = p.set();
        var n = this.outcomes.length, ev = this.event, truth = event_probability(ev);

        // proportion of spins in the event, after each spin
        var P = this.plot, len = plot_length(Math.max(n, 1));
        var px = function(i){ return P.x0 + (i - 1) / Math.max(1, len - 1) * (P.x1 - P.x0); };
        var py = function(v){ return P.y0 - v * (P.y0 - P.y1); };
        set.push(p.rect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1).attr({ fill: "#fff", stroke: "#bbb" }));
        set.push(p.text(P.x0, P.y1 - 12, "Proportion of spins in the event: " + ev.label.replace(/^Spin /, "")).attr(text_attrs).attr("text-anchor", "start"));
        for (var t = 0; t <= 10; t++) {
            var y = Math.round(py(t / 10)) + 0.5;
            set.push(p.path("M" + (P.x0 - 5) + " " + y + "L" + P.x0 + " " + y).attr("stroke", "#292929"));
            if (t % 5 == 0) set.push(p.text(P.x0 - 9, y, ["0", "0.5", "1.0"][t / 5]).attr(text_attrs).attr("text-anchor", "end"));
        }
        var xt = len <= 20 ? (len == 10 ? 1 : 2) : len / 10;
        for (var i = 1; i <= len; i++) {
            if (i != 1 && i % xt) continue;
            var x = Math.round(px(i)) + 0.5;
            set.push(p.path("M" + x + " " + P.y0 + "L" + x + " " + (P.y0 + 5)).attr("stroke", "#292929"));
            set.push(p.text(x, P.y0 + 15, i).attr(text_attrs));
        }
        set.push(p.text((P.x0 + P.x1) / 2, P.y0 + 30, "Spins").attr(text_attrs));
        if ($("#show_prob").is(":checked")) {
            var yp = py(truth.p);
            set.push(p.path("M" + P.x0 + " " + yp + "L" + P.x1 + " " + yp).attr({ stroke: "#00a032", "stroke-width": 2 }));
        }
        var hits = 0;
        if (n) {
            // for long runs, plot every k-th point (the line looks the same)
            var every = Math.max(1, Math.floor(n / 1500)), path = "";
            for (i = 0; i < n; i++) {
                if (ev.test(this.outcomes[i])) hits++;
                if (i % every == 0 || i == n - 1) path += (path ? "L" : "M") + px(i + 1).toFixed(1) + " " + py(hits / (i + 1)).toFixed(1);
            }
            set.push(p.path(path).attr({ stroke: "#3b60ff", "stroke-width": 1.5 }));
        }

        // bar graph of individual results, one bar per slot; slots in the event are marked
        var B = this.bars, counts = {}, max = 0;
        for (i = 0; i < SLOTS.length; i++) counts[SLOTS[i]] = 0;
        for (i = 0; i < n; i++) { counts[this.outcomes[i]]++; }
        for (i = 0; i < SLOTS.length; i++) max = Math.max(max, counts[SLOTS[i]]);
        var bw = (B.x1 - B.x0) / SLOTS.length;
        set.push(p.text(B.x0, B.y1 - 14, "Individual results (number of spins landing in each slot)").attr(text_attrs).attr("text-anchor", "start"));
        set.push(p.path("M" + B.x0 + " " + B.y0 + "L" + B.x1 + " " + B.y0).attr("stroke", "#666"));
        for (i = 0; i < SLOTS.length; i++) {
            var s = SLOTS[i], c = counts[s];
            var h = max ? c / max * (B.y0 - B.y1) : 0, bx = B.x0 + i * bw;
            if (c) set.push(p.rect(bx + 1, B.y0 - h, bw - 2, h).attr({ fill: FILL[slot_color(s)], stroke: "none", title: s + ": " + c + (c == 1 ? " spin" : " spins") }));
            var in_event = ev.test(s);
            set.push(p.text(bx + bw / 2, B.y0 + 11, String(s)).attr({ "font-size": "9", fill: in_event ? "#000" : "#888", "font-weight": in_event ? "bold" : "normal", "font-family": "Arial" }));
            if (in_event) set.push(p.rect(bx + 2, B.y0 + 19, bw - 4, 4).attr({ fill: "#ffba00", stroke: "none" }));
        }
        if (max) set.push(p.text(B.x0 - 9, B.y1, max).attr(text_attrs).attr("text-anchor", "end"));
        set.push(p.text(B.x0 - 9, B.y0, "0").attr(text_attrs).attr("text-anchor", "end"));
        set.push(p.text(B.x1, B.y0 + 29, "■ marks the slots in the event").attr({ "font-size": "10", fill: "#b07d00", "font-family": "Arial", "text-anchor": "end" }));

        // summary beside the wheel
        var last = n ? this.outcomes[n - 1] : null;
        var html = n
            ? "Last spin: <span class='big' style='color:" + (slot_color(last) == "black" ? "#1a1a1a" : FILL[slot_color(last)]) + "'>" + last + "</span> (" + slot_color(last) + ")<br>"
            : "Choose an event and a number of spins, then click SPIN.<br>";
        html += "Spins so far: " + n + "<br>";
        html += "Event: " + ev.label + "<br>";
        html += "Spins in the event: " + hits + (n ? " &nbsp;(proportion " + (hits / n).toFixed(4) + ")" : "") + "<br>";
        if ($("#show_prob").is(":checked")) {
            html += "True probability: " + truth.count + "/38 = " + truth.p.toFixed(4);
        }
        $("#summary").html(html);
    };

    this.spin = function(){
        if (this.busy) return;
        var requested = parseInt($("#num_spins").val(), 10);
        if (isNaN(requested) || requested < 1) requested = 1;
        $("#num_spins").val(requested);
        var count = Math.min(requested, this.MAX_TOTAL - this.outcomes.length);
        if (count <= 0) return;

        // up to 400 ms per spin, but never more than about 2.5 s for the whole batch
        var self = this, done = 0;
        var interval = Math.max(30, Math.min(400, 2500 / count));
        var per_tick = Math.max(1, Math.round(count * interval / 2500));
        this.busy = true;
        $("#spin_button").addClass("busy");
        var step = function(){
            var s;
            for (var k = 0; k < per_tick && done < count; k++, done++) {
                s = spin_wheel();
                self.outcomes.push(s);
            }
            self.rotate_to(s, interval * 0.85);
            self.draw_charts();
            if (done < count) {
                setTimeout(step, interval);
            } else {
                self.busy = false;
                $("#spin_button").removeClass("busy");
            }
        };
        step();
    };

    this.reset = function(){
        if (this.busy) return;
        this.outcomes = [];
        this.draw_charts();
    };

    this.initialize = function(){
        var self = this;
        this.paper = Raphael(document.getElementById("notepad"), $("#notepad").width(), $("#notepad").height());
        $("#summary").appendTo("#notepad");
        var options = "";
        for (var i = 0; i < EVENTS.length; i++) options += "<option value='" + i + "'>" + EVENTS[i].label + "</option>";
        $("#event").html(options).on("change", function(){
            self.event = EVENTS[parseInt($(this).val(), 10)];
            self.draw_charts();
        });
        $("#spin_button").click(function(e){ e.preventDefault(); self.spin(); });
        $("#reset_button").click(function(e){ e.preventDefault(); self.reset(); });
        $("#show_prob").click(function(){ self.draw_charts(); });
        $("#num_spins").keydown(function(e){ if (e.which == 13) { e.preventDefault(); self.spin(); } });
        this.draw_wheel();
        this.draw_charts();
    };
}

$(window).load(function(){
    module_main.initialize();
});

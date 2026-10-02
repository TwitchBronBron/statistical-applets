// LOCAL RECONSTRUCTION (see index.html). Behavior follows the page's instructions and the Java
// "Probability" applet (Probability.jar): toss a coin with a chosen probability of heads; a bar and
// "# Heads / # Tails" counts show the totals; a plot shows the proportion of heads after each toss
// (with dots for the first 40 tosses); "Show true probability" draws the true probability as a green
// line; at most 500 tosses in all; RESET starts over.

module_main = new function(){
    this.MAX_TOTAL = 500;
    this.MAX_COINS_SHOWN = 25;
    this.p = 0.5;              // probability of heads for the current run
    this.outcomes = [];        // true = heads
    this.busy = false;
    this.paper = null;

    var text_attrs = { "font-size": "13", "fill": "#292929", "font-family": "Verdana" };
    var small_attrs = { "font-size": "12", "fill": "#292929", "font-family": "Verdana" };

    this.layout = function(){
        this.W = $("#notepad").width();
        this.H = $("#notepad").height();
        this.bar = { x: 70, y: 130, w: 34, h: 300 };
        this.plot = { x0: 250, x1: this.W - 25, y0: 430, y1: 130 };   // y0 = bottom (proportion 0)
    };

    this.heads_count = function(){
        var h = 0;
        for (var i = 0; i < this.outcomes.length; i++) if (this.outcomes[i]) h++;
        return h;
    };

    this.draw = function(){
        var p = this.paper;
        p.clear();
        var n = this.outcomes.length, h = this.heads_count();

        // heads/tails bar: white (heads) from the top, red (tails) below, as in the Java original
        var b = this.bar;
        p.rect(b.x, b.y, b.w, b.h).attr({ fill: n ? "#dc0000" : "#fff", stroke: "#000" });
        if (n) {
            p.rect(b.x, b.y, b.w, b.h * h / n).attr({ fill: "#fff", stroke: "#000" });
        }
        var frac = function(k){ return n ? (k / n).toFixed(2) : "0"; };
        p.text(b.x + b.w / 2, b.y - 16, "# Heads = " + h + "/" + n + " = " + frac(h)).attr(text_attrs);
        p.text(b.x + b.w / 2, b.y + b.h + 18, "# Tails = " + (n - h) + "/" + n + " = " + frac(n - h)).attr(text_attrs);

        // plot of the proportion of heads after each toss
        var P = this.plot, len = plot_length(n);
        var px = function(i){ return P.x0 + (i - 1) / Math.max(1, len - 1) * (P.x1 - P.x0); };
        var py = function(v){ return P.y0 - v * (P.y0 - P.y1); };
        p.rect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1).attr({ fill: "#fff", stroke: "#bbb" });
        for (var t = 0; t <= 10; t++) {
            var y = Math.round(py(t / 10)) + 0.5;
            p.path("M" + (P.x0 - 5) + " " + y + "L" + P.x0 + " " + y).attr({ stroke: "#292929" });
            if (t % 5 == 0) p.text(P.x0 - 9, y, ["0", "0.5", "1.0"][t / 5]).attr(small_attrs).attr("text-anchor", "end");
        }
        var xt = len <= 20 ? (len == 10 ? 1 : 2) : len / 10;
        for (var i = 1; i <= len; i++) {
            if (i != 1 && i % xt) continue;
            var x = Math.round(px(i)) + 0.5;
            p.path("M" + x + " " + P.y0 + "L" + x + " " + (P.y0 + 5)).attr({ stroke: "#292929" });
            p.text(x, P.y0 + 15, i).attr(small_attrs);
        }
        p.text((P.x0 + P.x1) / 2, P.y0 + 36, "Tosses").attr(text_attrs);
        p.text(P.x0 - 45, (P.y0 + P.y1) / 2, "Proportion heads").attr(text_attrs).rotate(-90);

        if ($("#show_prob").is(":checked")) {
            var yp = py(this.p);
            p.path("M" + P.x0 + " " + yp + "L" + P.x1 + " " + yp).attr({ stroke: "#00a032", "stroke-width": 2 });
        }

        if (n) {
            var path = "", heads = 0, dots = n <= 40;
            for (i = 0; i < n; i++) {
                if (this.outcomes[i]) heads++;
                var cx = px(i + 1), cy = py(heads / (i + 1));
                path += (i ? "L" : "M") + cx.toFixed(1) + " " + cy.toFixed(1);
                if (dots) p.circle(cx, cy, 2.5).attr({ fill: "#dc0000", stroke: "none" });
            }
            p.path(path).attr({ stroke: "#dc0000", "stroke-width": 1.5 });
        }
    };

    // coins from the current batch, newest last; the newest shows its "spinning" frame first
    this.show_coins = function(batch, spinning){
        var html = "", start = Math.max(0, batch.length - this.MAX_COINS_SHOWN);
        for (var i = start; i < batch.length; i++) {
            var frame = (spinning && i == batch.length - 1) ? 1 : 2;   // frame 2 = landed coin
            html += "<div class='coin " + (batch[i] ? "heads" : "tails") + "' style='background-position: 0 " + (-60 * frame) + "px'></div>";
        }
        $("#coins").html(html);
    };

    this.set_flip_frame = function(k){
        $("#flipper").css("background-position", "0 " + (-60 * (k % 4)) + "px");
    };

    this.read_p = function(){
        var v = parseFloat($("#prob_heads").val());
        if (isNaN(v)) v = this.p;
        v = Math.max(0, Math.min(1, v));    // clamp to 0..1, as the Java original did
        $("#prob_heads").val(v);
        return v;
    };

    this.reset = function(){
        if (this.busy) return;
        this.p = this.read_p();
        this.outcomes = [];
        this.show_coins([], false);
        this.set_flip_frame(0);
        this.draw();
    };

    this.toss = function(){
        if (this.busy) return;
        var p = this.read_p();
        if (p != this.p) {
            // a different coin: start a fresh run rather than mix two probabilities in one plot
            this.p = p;
            this.outcomes = [];
        }
        var requested = parseInt($("#num_tosses").val(), 10);
        if (isNaN(requested) || requested < 1) requested = 1;
        $("#num_tosses").val(requested);
        var count = Math.min(requested, this.MAX_TOTAL - this.outcomes.length);
        if (count <= 0) return;

        // animate: up to 150 ms per toss, but never more than about 2.5 s for the whole batch
        var self = this, batch = [], done = 0, tick = 0;
        var interval = Math.max(16, Math.min(150, 2500 / count));
        var per_tick = Math.max(1, Math.round(count * interval / 2500));
        this.busy = true;
        $("#toss_button").addClass("busy");
        var step = function(){
            for (var k = 0; k < per_tick && done < count; k++, done++) {
                var heads = toss_coin(self.p);
                self.outcomes.push(heads);
                batch.push(heads);
            }
            self.set_flip_frame(++tick);
            self.show_coins(batch, done < count);
            self.draw();
            if (done < count) {
                setTimeout(step, interval);
            } else {
                self.set_flip_frame(0);
                self.show_coins(batch, false);
                self.busy = false;
                $("#toss_button").removeClass("busy");
            }
        };
        step();
    };

    this.initialize = function(){
        var self = this;
        this.layout();
        this.paper = Raphael(document.getElementById("notepad"), this.W, this.H);
        $("#coin_strip").appendTo("#notepad");   // keep the coin strip above the drawing
        this.p = this.read_p();
        $("#toss_button").click(function(e){ e.preventDefault(); self.toss(); });
        $("#reset_button").click(function(e){ e.preventDefault(); self.reset(); });
        $("#show_prob").click(function(){ self.draw(); });
        this.draw();
    };
}

$(window).load(function(){
    module_main.initialize();
});

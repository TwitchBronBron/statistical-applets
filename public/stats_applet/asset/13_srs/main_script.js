// LOCAL RECONSTRUCTION: this applet's index.html survived, but this file did not. Behavior follows the
// page's instructions, its quiz hook (js/stats_applet_13_srs.js), and the Java "Random Sample" applet
// (RandomSample.jar): a population of numbered lotto balls 1..N in a "Population hopper"; SAMPLE draws n
// balls at random without replacement into the Sample area, and further clicks keep drawing from the balls
// left; RESET puts every ball back. Each SAMPLE reports {pop_n, sample_size, values, mean} to the quiz.

module_main = new function(){
    this.MAX_POP = 144;
    this.COLS = 12;
    this.SAMPLE_COLS = 11;
    this.PITCH = 27;
    this.R = 11.5;
    this.pop_n = 100;
    this.hopper = [];     // ball numbers still in the hopper
    this.sample = [];     // ball numbers in the Sample area, in the order drawn
    this.balls = {};      // ball number -> Raphael set (circle + label)
    this.busy = false;

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

    this.hopper_origin = { x: 22, y: 100 };
    this.sample_origin = { x: 380, y: 100 };

    this.hopper_slot = function(k){
        var i = k - 1;
        return { x: this.hopper_origin.x + 18 + (i % this.COLS) * this.PITCH,
                 y: this.hopper_origin.y + 18 + Math.floor(i / this.COLS) * this.PITCH };
    };
    this.sample_slot = function(i){
        return { x: this.sample_origin.x + 18 + (i % this.SAMPLE_COLS) * this.PITCH,
                 y: this.sample_origin.y + 18 + Math.floor(i / this.SAMPLE_COLS) * this.PITCH };
    };

    this.make_ball = function(k, pos){
        var p = this.paper;
        var c = p.circle(pos.x, pos.y, this.R).attr({ fill: "r(0.35, 0.3)#ff6b6b-#d40000", stroke: "#8a0000" });
        var t = p.text(pos.x, pos.y, k).attr({ "font-size": k > 99 ? "10" : "12", "font-weight": "bold", fill: "#fff", "font-family": "Arial" });
        return p.set(c, t);
    };

    this.move_ball = function(set, pos, ms){
        set[0].animate({ cx: pos.x, cy: pos.y }, ms, "<>");
        set[1].animate({ x: pos.x, y: pos.y }, ms, "<>");
    };

    this.draw_frame = function(){
        var p = this.paper, h = this.hopper_origin, s = this.sample_origin;
        var hw = this.COLS * this.PITCH + 10, sw = this.SAMPLE_COLS * this.PITCH + 10;
        var title = { "font-size": "15", "font-weight": "bold", fill: "#292929", "font-family": "Arial", "text-anchor": "start" };
        p.image("images/Lotto.gif", h.x, h.y - 78, 110, 50);
        p.text(h.x + 120, h.y - 16, "Population hopper").attr(title);
        p.text(s.x, h.y - 16, "Sample").attr(title);
        p.rect(h.x, h.y, hw, this.COLS * this.PITCH + 10, 6).attr({ fill: "#fff", stroke: "#bbb" });
        p.rect(s.x, s.y, sw, 14 * this.PITCH + 10, 6).attr({ fill: "#fff", stroke: "#bbb" });
    };

    this.read_population = function(){
        var v = parseInt($("#population").val(), 10);
        if (isNaN(v) || v < 1) v = this.pop_n;
        v = Math.min(v, this.MAX_POP);
        $("#population").val(v);
        return v;
    };

    this.read_sample_size = function(){
        var v = parseInt($("#sample_size").val(), 10);
        if (isNaN(v) || v < 1) v = 1;
        $("#sample_size").val(v);
        return v;
    };

    this.reset = function(){
        if (this.busy) return;
        this.pop_n = this.read_population();
        this.paper.clear();
        this.draw_frame();
        this.hopper = [];
        this.sample = [];
        this.balls = {};
        for (var k = 1; k <= this.pop_n; k++) {
            this.hopper.push(k);
            this.balls[k] = this.make_ball(k, this.hopper_slot(k));
        }
        $("#copy_sample_ta_div").hide();
    };

    this.take_sample = function(){
        if (this.busy) return;
        if (this.read_population() != this.pop_n) {
            this.reset();    // a new population size takes effect with a fresh hopper
        }
        var size = this.read_sample_size();
        var drawn = draw_without_replacement(this.hopper, size);
        if (!drawn.length) return;

        var self = this;
        for (var i = 0; i < drawn.length; i++) {
            this.hopper.splice(this.hopper.indexOf(drawn[i]), 1);
        }
        var first_slot = this.sample.length;
        this.sample = this.sample.concat(drawn);

        // animate each ball into the Sample area, one after another (faster for big samples)
        var ms = Math.max(120, Math.min(450, 2500 / drawn.length));
        var gap = ms * 0.6;
        this.busy = true;
        $("#update").addClass("busy");
        drawn.forEach(function(k, j){
            setTimeout(function(){
                self.balls[k].toFront();
                self.move_ball(self.balls[k], self.sample_slot(first_slot + j), ms);
            }, j * gap);
        });
        setTimeout(function(){
            self.busy = false;
            $("#update").removeClass("busy");
        }, (drawn.length - 1) * gap + ms + 20);

        if ($("#copy_sample_ta_div").is(":visible")) this.fill_copy_box();
        Applet_Communication().report_action({
            pop_n: this.pop_n,
            sample_size: size,
            values: this.sample.slice(0),
            mean: mean_of(this.sample)
        });
    };

    this.fill_copy_box = function(){
        $("#copy_sample_ta").val(this.sample.join("\n"));
    };

    this.copy_sample = function(){
        this.fill_copy_box();
        $("#copy_sample_ta_div").show();
        $("#copy_sample_ta").focus().select();
        try {
            if (navigator.clipboard && this.sample.length) navigator.clipboard.writeText(this.sample.join("\n"));
        } catch(e) {}
    };

    this.initialize = function(){
        var self = this;
        this.paper = Raphael(document.getElementById("notepad"), $("#notepad").width(), $("#notepad").height());
        $("#population").val(this.pop_n);
        $("#sample_size").val(10);
        $("#update").click(function(e){ e.preventDefault(); self.take_sample(); });
        $("#reset").click(function(e){ e.preventDefault(); self.reset(); });
        $("#copy_sample").click(function(e){ e.preventDefault(); self.copy_sample(); });
        $("#population, #sample_size").keydown(function(e){
            if (e.which == 13) { e.preventDefault(); self.take_sample(); }
        });
        this.reset();
    };
}

$(window).load(function(){
    module_main.initialize();
});

module_main = new function(){
    this.draw_mode = 0;
    this.paper = new Object();
    this.width = 0;
    this.height = 0;
    this.plot_width = 325;
    this.plot_height = 325;
    this.plot_x = 50;
    this.plot_y = 50;
    this.H0 = 0;
    this.n = 10;
    this.max_n = 250;
    this.sigma = 1;
    this.mean_x = 0;
    this.data_mas = new Array();
    this.mitt = 0;
    this.experimental_sigma = 1;
    this.p;
    
    var Applet_Communication = function (){
        return {
            report_action : function report_action(action) {
                var f = null;
                if(!(window.receive_applet_action === undefined))
                {
                    f = window.receive_applet_action;
                }
                else if(window.opener)
                    if(!(window.opener.receive_applet_action === undefined))
                    {
                        f = window.opener.receive_applet_action;
                    }
                if (f)
                {
                    f(action);
                }
            }
        }
    };
    
    this.create_plot = function(){
        var axis = this.paper.path("M" + this.plot_x + " " + this.plot_y + "L" + (this.plot_x + this.plot_width) + " " + this.plot_y);
        axis.attr("stroke", "#666666");
    
    }
    
    this.draw_gaussian = function(ch){

        // brb: this.HO is the value currently in H<sub>0</sub>
        
        //var date = new Date();
        //var start_time = date.getTime();
        
    	var y_offset_1 = 100;
    	var y_offset_2 = 0;

        var gaussian_left = this.paper.path("M0 0");
        gaussian_left.attr("stroke", "#e13f3f");
        
        var gaussian_middle = this.paper.path("M0 0");
        gaussian_middle.attr("stroke", "#e13f3f");
        
        var gaussian_right = this.paper.path("M0 0");
        //gaussian_right.attr("stroke", "#e13f3f");
        gaussian_right.attr("stroke", "#556677");
        
        var coeff_y = this.plot_height / gaussian(this.sigma, this.H0, this.H0);
        var coeff_x = this.plot_width / (8 * this.sigma);
        var x = 0;
        var border_x = 0;
        if(!ch){
            x = Math.round((this.mean_x - this.H0) * coeff_x);
            border_x = this.mean_x;
        } else { 
            x = Math.round((get_mean_X() - this.H0) * coeff_x);
            border_x = get_mean_X();
        }
        var y0 = this.plot_y;
        var y1 = this.plot_y - this.plot_height - 30;

        var mean_x_loc;
        if (ch == 1){
            mean_x_loc = Math.round((get_mean_X() - this.H0) * coeff_x) + this.plot_x + this.plot_width / 2;
        }else{
            mean_x_loc = Math.round((this.mean_x - this.H0) * coeff_x) + this.plot_x + this.plot_width / 2;
        }

        if (mean_x_loc > this.plot_width+20) {
        	mean_x_loc = this.plot_width+20;
        } else if (mean_x_loc < 80) {
        	mean_x_loc = 80;
        }
    	
        // draw mean line
        if($("#ha1").is(':checked') || $("#ha2").is(':checked')){
            x += this.plot_width / 2 + this.plot_x;
            var p_line = this.paper.path("M" + x + " " + y0 + "L" + x + " " + y1);
            p_line.attr("stroke", "#3b60ff");
        }
        if($("#ha3").is(':checked')){
            var p_line = this.paper.path("M" + (x + this.plot_width / 2 + this.plot_x) + " " + y0 + "L" + (x + this.plot_width / 2 + this.plot_x) + " " + y1);
            p_line.attr("stroke", "#3b60ff");
            p_line = this.paper.path("M" + (this.plot_width / 2 - x + this.plot_x) + " " + y0 + "L" + (this.plot_width / 2 - x + this.plot_x) + " " + y1);
            p_line.attr("stroke", "#3b60ff");
        }

                
        if(ch == 1)
            this.p = get_pvalue(this.experimental_sigma, this.H0, get_mean_X() , this.n);
        else
            this.p = get_pvalue(this.experimental_sigma, this.H0, this.mean_x, this.n);
        
        
        var sx, sy;
        if($("#ha1").is(':checked') || $("#ha2").is(':checked')){

            var path = "M" + this.plot_x + " " + this.plot_y;

            //var for_count_1 = 0;
            var x_coord;
            
            // brb: gaussian left, x coord. should never be below 0
            // or above 525
            for(x = this.H0 - 4 * this.sigma; x <= border_x; x += (8 * this.sigma) / this.plot_width){
                sx = Math.round((x - this.H0) * coeff_x);
                sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

                x_coord = sx + this.plot_x + this.plot_width / 2;
                if (x_coord >= 0 && x_coord <= 525) {
                    path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
                }
                //for_count_1++;
            }

            //for_1_date = new Date();
            
            path += "L" + (sx + this.plot_x + this.plot_width / 2) + " " + this.plot_y;

            gaussian_left.attr("path", path);
			
			// set sx/sy here in case the loop above never executed
			sx = Math.round((x - this.H0) * coeff_x);
			sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

            path = "M" + (sx + this.plot_x + this.plot_width / 2) + " " + this.plot_y;
	    path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);

            //var for_count_2 = 0;
            
            // brb: gaussian left, x coord. should never be below 0
            // or above 525
            for(x = border_x; x <= this.H0 + 4 * this.sigma; x += (8 * this.sigma) / this.plot_width){
                sx = Math.round((x - this.H0) * coeff_x);
                sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

                x_coord = sx + this.plot_x + this.plot_width / 2;
                if (x_coord >= 0 && x_coord <= 525) {
                    path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
                }
                //for_count_2++;
            }

            //for_2_date = new Date();

            gaussian_right.attr("path", path);
            //gauss_right = new Date();

        }

        
        if($("#ha3").is(':checked')){
            var path = "M" + this.plot_x + " " + this.plot_y;
            for(x = this.H0 - 4 * this.sigma; x <= Math.min(2 * this.H0 - border_x, border_x); x += (8 * this.sigma) / this.plot_width){
                sx = Math.round((x - this.H0) * coeff_x);
                sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

                x_coord = sx + this.plot_x + this.plot_width / 2;
                if (x_coord >= 0 && x_coord <= 525) {
                    path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
                }
            }

			// set sx/sy here in case the loop above never executed
			sx = Math.round((x - this.H0) * coeff_x);
			sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

            path += "L" + (sx + this.plot_x + this.plot_width / 2) + " " + this.plot_y;

            gaussian_left.attr("path", path);
            gaussian_left.attr("fill", "#ffba00");

            path = "M" + (sx + this.plot_x + this.plot_width / 2) + " " + this.plot_y;
			path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
            for(x = Math.min(2 * this.H0 - border_x, border_x); x <= Math.max(2 * this.H0 - border_x, border_x); x += (8 * this.sigma) / this.plot_width){
                sx = Math.round((x - this.H0) * coeff_x);
                sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

                x_coord = sx + this.plot_x + this.plot_width / 2;
                if (x_coord >= 0 && x_coord <= 525) {
                    path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
                }
            }

			// set sx/sy here in case the loop above never executed
			sx = Math.round((x - this.H0) * coeff_x);
			sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

            path += "L" + (sx + this.plot_x + this.plot_width / 2) + " " + this.plot_y;

            gaussian_middle.attr("path", path);

            path = "M" + (sx + this.plot_x + this.plot_width / 2) + " " + this.plot_y;
			path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
            for(x = Math.max(2 * this.H0 - border_x, border_x); x <= this.H0 + 4 * this.sigma; x += (8 * this.sigma) / this.plot_width){
                sx = Math.round((x - this.H0) * coeff_x);
                sy = Math.round(gaussian(this.sigma, this.H0, x) * coeff_y);

                x_coord = sx + this.plot_x + this.plot_width / 2;
                if (x_coord >= 0 && x_coord <= 525) {
                    path += "L" + (sx + this.plot_x + this.plot_width / 2)  + " " + (this.plot_height - sy + y_offset_1);
                }
            }

            gaussian_right.attr("path", path);
            gaussian_right.attr("fill", "#ffba00");
            
              
            var text = "P-value = " + (Math.round(2 * this.p * 100000) / 100000).toFixed(4);
            var p_text = this.paper.text(mean_x_loc, 50, text);
            p_text.attr("font-size", "14");
            p_text.attr("fill", "#292929");
            p_text.attr("font-family", "Verdana");
        
        }        

        if($("#ha1").is(':checked')){
            gaussian_right.attr("fill", "#ffba00");            
            if (this.H0 > this.mean_x)
                this.p = 1 - this.p;
            var text = "P-value = " + (Math.round(this.p*100000)/100000).toFixed(4);
            var p_text = this.paper.text(mean_x_loc, 50, text);
            p_text.attr("font-size", "14");
            p_text.attr("fill", "#292929");
            p_text.attr("font-family", "Verdana");
        }
        if($("#ha2").is(':checked')){
            gaussian_left.attr("fill", "#ffba00");  
            
            if (this.H0 < this.mean_x)
                this.p = 1 - this.p;        
            text = "P-value = " + (Math.round(this.p*10000)/10000).toFixed(4);
            var p_text = this.paper.text(mean_x_loc, 50, text);
            p_text.attr("font-size", "14");
            p_text.attr("fill", "#292929");
            p_text.attr("font-family", "Verdana");
        }
        
        if (ch == 1){
            var text = "Sample Mean = " + get_mean_X().toFixed(4);
        }else{
            var text = "Sample Mean = " + this.mean_x;
        }
        
		var mean_x_text = this.paper.text(mean_x_loc, 30, text);
	
		mean_x_text.attr("font-size", "14");
		mean_x_text.attr("fill", "#292929");
		mean_x_text.attr("font-family", "Verdana");

        if (ch == 1){
            for(var i = 0; i < Xmas.length; i++){
                var x_circle = Math.round((Xmas[i] - this.H0) * coeff_x) + this.plot_x + this.plot_width / 2;           
                var y_circle = this.plot_y - y_offset_2;
                if (!(x_circle < this.plot_x || x_circle > this.plot_x + this.plot_width)){
                    var circle = this.paper.circle(x_circle, y_circle, 3);
                    circle.attr("fill", "#000099");
                } 
            }
        }

		// arrow at bottom of graph
		var dline
        if ($("#ha1").is(':checked') || $("#ha3").is(':checked')) {
            dline = this.paper.path("M" + Math.round((this.plot_x + this.plot_width / 2 + 7)) + " " + (this.plot_y + 50)
            	+ "L" + (this.plot_x + this.plot_width) + " " + (this.plot_y + 50));
            dline.attr("stroke", "#0000cc");
            dline.attr("stroke-width", "4");
            dline.attr("arrow-end", "block");
        }
        if ($("#ha2").is(':checked') || $("#ha3").is(':checked')){
            dline = this.paper.path("M" + Math.round((this.plot_x + this.plot_width / 2 - 7)) + " " + (this.plot_y + 50)
            	+ "L" + (this.plot_x) + " " + (this.plot_y + 50));
            dline.attr("stroke", "#0000cc");
            dline.attr("stroke-width", "4");
            dline.attr("arrow-end", "block");
        }

        //var end_date = new Date();
        //var end_time = end_date.getTime();
    }
    
    this.draw_marker = function(n){
        var step = 8 * this.sigma / n;
        var coeff_x = this.plot_width / (8 * this.sigma);
        for(var i = 0; i <= n; i++){
            var x = Math.round(step * i * coeff_x) + this.plot_x;
            var y0 = this.plot_y + 5;
            var y1 = this.plot_y - 5;
            var marker = this.paper.path("M" + x + " " + y0 + "L" + x + " " + y1);
            marker.attr("stroke", "#666666");
            var text = (Math.round((step * i - 8 * this.sigma / 2 + this.H0) * 10000) / 10000).toFixed(3);
            marker = this.paper.text(x, y0 + 10, text);
            marker.attr("font-size", "14");
            marker.attr("fill", "#292929");
            marker.attr("font-family", "Verdana");
        }
    }
    
    this.update_pline = function(){
        if($("#trueProb").is(':checked')){
            var y = this.plot_y + this.plot_height - Math.round(this.plot_height * this.prob);
            this.prob_line.attr("path", "M" + this.plot_x + " " + y + "L" 
                + (this.plot_x + this.plot_width) + " " + y);
            this.prob_line.show();
        } else 
            this.prob_line.hide();
    }
    
    this.update_bound_text = function(){
        this.xBound_text.attr("text", this.Xscale);
    }
    
    this.get_coeff_x  = function (){
        return this.plot_width / this.Xscale;
    };
    
    this.update_plot = function(){
        if(this.len > this.Xscale){
            this.Xscale += Math.round(this.Xscale * 0.2);
            this.update_bound_text();
        }
        var coeff = this.get_coeff_x();
        var path = "M" + this.plot_x + " " + (this.plot_y + this.plot_height);
        for(var i = 1; i < this.hProp.length; i++)
            path += "L" + (this.plot_x + Math.round(i * coeff)) + " " + 
            ((this.plot_y + this.plot_height) - Math.round(this.plot_height * this.hProp[i]));
        this.proportion_line.attr("path", path);
    }
    
    this.reset = function(){
        this.paper.clear();
        this.create_plot();
        this.update_pline();
        this.Xscale = 10;
        this.hProp = new Array();
        Xmas = new Array();
        this.len = 0;
        this.count = 0;
        for(;;){
            this.prob = Math.random();
            if(this.prob >= 0.3 && this.prob <= 0.9)
                break;
        }
        this.prob_line.hide();
        $("#hits").html("Hits = 0/0 = 0%");
        $("#misses").html("Misses = 0/0 = 0%");
    }
    
    this.generate_sample = function(){
        Xmas = new Array();
        for(var i = 0; i < this.n; i++){
            Xmas[i] = RN_Normal(this.mitt, this.experimental_sigma);
        }           
    }
    
    this.redraw = function(){
        this.sigma = this.experimental_sigma/Math.sqrt(this.n);

        //var date = new Date();
        //var paper_start = date.getTime();

        this.paper.clear();
        //date = new Date();
        //var paper_end = date.getTime();

        //date = new Date();
        //var plot_start = date.getTime();

        this.create_plot();
        //date = new Date();
        //var plot_end = date.getTime();

        //date = new Date();
        //var gauss_start = date.getTime();

        this.draw_gaussian(this.draw_mode);
        //date = new Date();
        //var gauss_end = date.getTime();

        //date = new Date();
        //var marker_start = date.getTime();

        this.draw_marker(4);
        //date = new Date();
        //var marker_end = date.getTime();

    }
    
    this.initialize = function(){
        this.width = $("#notepad").width();
        this.height = $("#notepad").height();
        this.plot_width = this.width - 100;
        this.plot_height = this.height - 200;
        this.plot_y = this.height - 100;
        // see corresponding y_offset vars in draw_gaussian
        
        this.paper = Raphael(document.getElementById("notepad"), this.width, this.height);
        this.create_plot();
        
        $("#h0").val(this.H0);
        $("#h0").blur(function(){

            if(parseFloat($("#h0").val()) || parseFloat($("#h0").val()) == 0)
                module_main.H0 = parseFloat($("#h0").val());
            else 
                $("#h0").val(module_main.H0);
            $("#lha1").html("µ > " + module_main.H0);
            $("#lha2").html("µ < " + module_main.H0);
            $("#lha3").html("µ ≠ " + module_main.H0);

	    module_main.redraw();
        });
        
        $("#sigma").val(this.experimental_sigma);
        $("#sigma").blur(function(){
            if(parseFloat($("#sigma").val()) && parseFloat($("#sigma").val()) > 0)
                module_main.experimental_sigma = parseFloat($("#sigma").val());
            else 
                $("#sigma").val(module_main.experimental_sigma);
			module_main.redraw();
        });
        
        $("#n").val(this.n);
        $("#n").blur(function(){
        	var tmp = parseInt($("#n").val());
        	if (tmp > module_main.max_n) {
        		tmp = module_main.max_n;
        	}
            if(!isNaN(tmp) && tmp > 0 && tmp != module_main.n) {
                module_main.n = tmp;
				if($("#opt2").is(":checked")){
					module_main.generate_sample();
				}
            }
            $("#n").val(module_main.n);
			module_main.redraw();
        });
        
        $("#opt_field1").val(this.mean_x);
        $("#opt_field1").blur(function(){
			if(parseFloat($("#opt_field1").val()) || parseFloat($("#opt_field1").val()) == 0)
				module_main.mean_x = parseFloat($("#opt_field1").val());
			else 
				$("#opt_field1").val(module_main.mean_x);
			module_main.redraw();
        });

        $("#opt_field2").val(this.mean_x);
        $("#opt_field2").blur(function(){
			if(parseFloat($("#opt_field2").val()) || parseFloat($("#opt_field2").val()) == 0)
				module_main.mitt = parseFloat($("#opt_field2").val());
			else 
				$("#opt_field2").val(module_main.mitt);
			module_main.redraw();
        });

        $("#opt1").click(function(){
        	module_main.draw_mode = 0;
            module_main.mean_x = parseFloat($("#opt_field1").val());            
            $("#u_button").html("UPDATE"); 
            module_main.redraw();
        });
        $("#opt2").click(function(){
        	module_main.draw_mode = 1;
            module_main.mitt = parseFloat($("#opt_field2").val());
            $("#u_button").html("NEW SAMPLE");
            module_main.generate_sample();
            module_main.redraw(); 
        });
        
        $("#ha1").attr("checked", "");
        $("#ha1").click(function(){
            module_main.redraw();
        });
        $("#ha2").click(function(){
            module_main.redraw();
        });
        $("#ha3").click(function(){
            module_main.redraw();
        });
        
        $("#lha1").html("µ > " + this.H0);
        $("#lha2").html("µ < " + this.H0);
        $("#lha3").html("µ ≠ " + this.H0);
        
        $("#c_button").click(function(){
            module_main.H0 = 0;
            module_main.experimental_sigma = 1;
            module_main.n = 10;
            module_main.mean_x = 0;
            module_main.mean_x = 0;
            module_main.mitt = 0;
            $("#lha1").html("µ > " + module_main.H0);
            $("#lha2").html("µ < " + module_main.H0);
            $("#lha3").html("µ ≠ " + module_main.H0);
            $("#mean_x").val(module_main.mean_x);
            $("#mitt").val(module_main.mitt);
            $("#h0").val(module_main.H0);
            $("#sigma").val(module_main.experimental_sigma);
            $("#n").val(module_main.n);
            $("#opt_field1").val(module_main.mean_x);
            $("#opt_field2").val(module_main.mitt);

            if($("#opt2").is(":checked")){
                module_main.generate_sample();
            }
            module_main.redraw();
        });
        $("#u_button").click(function(){
            if($("#opt2").is(":checked")){
                module_main.generate_sample();
            }
            module_main.redraw();         
        });
        $("#opt1").attr("checked", "");     
        this.draw_gaussian();
        this.draw_marker(4);
        module_main.redraw();
    }
}

$(window).load(function(){
    module_main.initialize();
});

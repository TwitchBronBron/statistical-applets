$(document).ready(function() {
    module_main.initialize();
});

module_main = new function() {
	
	// # of samples to show on the screen
	this.samples_showing = 25;
	
    this.plot_x = 50;
    this.plot_width = 400;
    this.plot_y = 20;
    this.plot_height = 120;
    //Coordinates and parameters for place where lines are drawn
    this.image_x = this.plot_x;
    this.image_y = this.plot_y + this.plot_height + 30;
    this.image_height = 400;
    this.image_width = this.plot_width;

    this.line_spacing = this.image_height / this.samples_showing;

    //Parameters for gaussian
    this.sigma = 1;
    this.mu = 0;
    
    this.animation_time = 250;
    
    this.default_conf_lvl = 95;
    this.conf_lvl = this.default_conf_lvl;
    
    this.min_sample_size = 5;
    this.max_sample_size = 250;
    this.default_sample_size = 20;
    
	this.gauss_scale = 1.5;
	
    this.samples = new Array();
    this.sample_size = this.default_sample_size;
    
    this.expanded_line = null;
    this.expanded_points = new Array();
    
	
    //Draw Population Distribution urve, Sampling Distribution curve, X-axis and marks, the Mean (green line), and the legend lines.
    this.draw_gaussian = function(){
		
		// Draw the Population Distribution curve.
        var gauss = this.paper.path("M0 0");
        gauss.attr("stroke", "#666666"); // Was #e13f3f.
        //var coeff_y = this.plot_height / gaussian(this.sigma, this.mu, 0);
        var coeff_y = (this.plot_height / (1 / (this.sigma * Math.sqrt(2 * Math.PI) / Math.sqrt(this.sample_size))) * this.gauss_scale); //
        var current_x = this.plot_x;
        var current_y = this.plot_y + this.plot_height;
        
        var path = "M" + current_x + " " + current_y;
        //for(var x = (- 4 * this.sigma); x <= 4*this.sigma; x += (8 * this.sigma) / this.plot_width) {
        for(var x = (- 3.2 * this.sigma); x <= 3.2 * this.sigma; x += (6.4 * this.sigma) / this.plot_width) {
            current_x = Math.round(x * this.coeff_x) + this.plot_width/2 + this.plot_x;
            current_y = this.plot_y + this.plot_height - Math.round(gaussian(this.sigma, this.mu, x) * coeff_y);
            path += "L" + current_x  + " " + current_y;
        }
        gauss.attr("path", path);
		
		// Draw the Sampling Distribution curve.
		var samp_dist = this.paper.path("M 0 0");
		samp_dist.attr("stroke", "#990000");
		samp_dist.attr("stroke-dasharray", "-");
        var coeff_y = this.plot_height / sampling_dist(0, this.sample_size, this.mu, this.sigma);
        //var coeff_y = this.plot_height / (1 / (this.sigma * Math.sqrt(2 * Math.PI) / Math.sqrt(this.sample_size)));  // 1/(sigma*sqrt(2*pi)/sqrt(n))
        var current_x = this.plot_x;
        var current_y = this.plot_y + this.plot_height;
		
        var path = "M" + current_x + " " + current_y;
        //for(var x = (- 4 * this.sigma); x <= 4*this.sigma; x += (8 * this.sigma) / this.plot_width) {
        for(var x = (- 3.2 * this.sigma); x <= 3.2 * this.sigma; x += (6.4 * this.sigma) / this.plot_width) {
            current_x = Math.round(x * this.coeff_x) + this.plot_width/2 + this.plot_x;
            //current_y = this.plot_y + this.plot_height - Math.round(gaussian(this.sigma, this.mu, x) * coeff_y);
            current_y = this.plot_y + this.plot_height - Math.round(sampling_dist(x, this.sample_size, this.mu, this.sigma) * coeff_y);
            path += "L" + current_x  + " " + current_y;
        }
        samp_dist.attr("path", path);
		
		// Draw the X-axis line.
        var axis = this.paper.path("M" + this.plot_x + " " + (this.plot_y + this.plot_height) + "L" + (this.plot_x + this.plot_width) + " " + (this.plot_y + this.plot_height));
        axis.attr("stroke", "#999999");
		
		// Draw the X-axis marks.
        for (var x = (- 3 * this.sigma); x <= 3 * this.sigma; x += this.sigma){
            var mark_x = Math.round(x * this.coeff_x) + this.plot_width/2 + this.plot_x;
            var mark = this.paper.path("M" + mark_x + " " + (this.plot_y + this.plot_height - 5) + "L" + mark_x + " " + (this.plot_y + this.plot_height + 5));
            mark.attr("stroke", "#999999");
        }
		
		// Draw the Mean (green line).
        var green_line = this.paper.path("M" + (this.plot_x + this.plot_width/2) + " " + this.plot_y + "L" + (this.plot_x + this.plot_width/2) + " " + (this.image_y + this.image_height));
        green_line.attr("stroke", "#00CC33");
		
		// Draw the legend (grey solid line and red dashed line).
        var legend_pop = this.paper.path("M 20 25 l 20 0");
        legend_pop.attr("stroke", "#666666");
        var legend_sample = this.paper.path("M 20 45 l 20 0");
        legend_sample.attr("stroke", "#990000");
		legend_sample.attr("stroke-dasharray", "-");
		
    }
    
	
    this.hide_expanded_points = function() {
		for (var i = 0; i < this.expanded_points.length; i++) {
			this.expanded_points[i].remove();                
		}    
		this.expanded_points = new Array();
		this.expanded_line = null;
    }
    
	
    // this function can receive an event or an index
    this.show_all_points = function(arg) {
    	var index = null;
    	if (typeof(arg) == "object") {
			// we only do something if the click is within the CI area
			if (arg.pageY >= this.notepad_y + this.image_y - 4) {
				index = Math.floor((arg.pageY - (this.notepad_y + this.image_y) + 4)/this.line_spacing);
				
				// index can't be greater than or equal to this.samples_showing
				if (index >= this.samples_showing) {
					index = this.samples_showing - 1;
				}
				
				// if index is > the number of lines showing, do the last line
				if (index > module_main.total) {
					index = module_main.total -1 ;
				}
    		} else {
    			return;
    		}
    		
    		// if we've taken more than samples_showing samples, we have to adjust the index
    		if (this.total > this.samples_showing) {
    			index = this.total - (this.samples_showing - index);
    		}
    		
    	} else {
    		index = arg;
    	}
    	
		// if we didn't just re-click on the line that was last expanded, expand the clicked line
		if (this.expanded_line != index) {
			
			// remove any points that were there previously (have to do this inside the conditional because hide_expanded_points sets this.expanded_line to null)
			this.hide_expanded_points();
			
			// Draw the sample points.
			var s = this.samples[index];
			for (var i = 0; i < s.values.length; ++i) {
				var y = s.draw_object[1].data("y") + ((Math.random()-.5) * 2) + 8;
				var x = s.values[i] * this.coeff_x + this.plot_width/2 + this.plot_x + ((Math.random()-.5) * 2);
				var point = this.paper.circle(x, y, 1.5);
				point.attr("fill", "#cc9933");
				point.attr("stroke", "#cc9933"); // ffcc66
				this.expanded_points[i] = point;
			}
			
			this.expanded_line = index;
		
		// else we did just re-click, so just hide previously-expanded points
		} else {
			this.hide_expanded_points();
    	}
    }
    
	
	// Convert a confidence level to a z-score.
    this.get_ci = function(sample) {
		
        var z;
		
		//z = ANorm(1 - (1 - this.conf_lvl) / 2); // z = InvNorm(1-(1-C)/2)
		
		z = CIToZScore(this.conf_lvl);
        
		// Replaced per client.
        //var margin_err = z * sample.se;
        var margin_err = z * (this.sigma/Math.sqrt(this.sample_size));
		
        sample.upper_limit = sample.mean + margin_err;
        sample.lower_limit = sample.mean - margin_err;
        
		if (sample.upper_limit >= this.mu && sample.lower_limit <= this.mu) {
			sample.hit = 1;
		} else {
			sample.hit = 0;
		}
		
    }
        
    //Draw interval. If redraw == false we take into account increasing hit number.
    //If redraw = true it means that this function is used for redrawing existing intervals
    this.draw_interval = function(sample, y) {
        var arr = new Array();

        //var left_x = (this.image_x + Math.round((4 * this.sigma + sample.lower_limit)*this.coeff_x));
        //var right_x = (this.image_x + Math.round((sample.upper_limit + 4 * this.sigma)*this.coeff_x));
        var left_x = (this.image_x + Math.round((3.2 * this.sigma + sample.lower_limit)*this.coeff_x));
        var right_x = (this.image_x + Math.round((sample.upper_limit + 3.2 * this.sigma)*this.coeff_x));
        if (left_x < this.image_x)
            left_x = this.image_x;
        if (right_x < this.image_x)
            return new Array();
        if (right_x > this.width - this.image_x)
            right_x = this.width - this.image_x;
        if (left_x > this.width - this.image_x)
            return new Array();
		
		// if y is not sent in...
		if (y == null) {
			// if the number of samples is < samples_showing, set y based on the number of samples
			if (this.total < this.samples_showing) {
				y = (this.image_y + this.total * this.line_spacing);
				
			// otherwise it goes at the bottom; others should have already been moved up
			} else {
				y = (this.image_y + (this.samples_showing-1) * this.line_spacing);
			}
		}
            
        var line = this.paper.path("M" + left_x + " " + y + "L" + right_x + " " + y);
        var colour = "#555555";
        line.attr("stroke", colour);
        line.attr("stroke-width", 2);                     
        if (!(sample.upper_limit >= this.mu && sample.lower_limit <= this.mu)){
            colour = "#e13f3f";
            line.attr("stroke", colour);                     
        }
        
        arr[0] = line;
        //var point_x = this.image_x + Math.round((sample.mean + 4 * this.sigma) * this.coeff_x);
        var point_x = this.image_x + Math.round((sample.mean + 3.2 * this.sigma) * this.coeff_x);
        if (point_x >= this.image_x && point_x <= this.image_x + this.image_width){
            var point = this.paper.circle(point_x, y, 3);
            point.attr("fill", colour);  
            point.attr("stroke", colour); 
            point.data("y", y);
            point.data("left_x", left_x);
            point.data("right_x", right_x);
            point.data("point_x", point_x);
            point.data("line_color", colour);            
            
            arr[1] = point;
        }
        return arr;
    }
    
    this.remove_line = function(so) {
		for (key in so.draw_object){
			so.draw_object[key].remove();                    
		}
		so.draw_object = null;
    }
    
    //Generate practical value of population proportion
    this.generate_samples = function(number_of_samples) {
    	// hide expanded points if there
		this.hide_expanded_points();

    	// clear out all existing ci's if number_of_samples > 1
    	if (number_of_samples > 1) {
    		for (var i = 0; i < this.samples.length; ++i) {
    			var so = this.samples[i];
				this.remove_line(so);
    		}
    	}
    	
    	var this_y = null;
        for (var i = 0; i < number_of_samples; i++) {
        	var s = new Object();
        	
        	// generate the sample
        	s.values = new Array();
            for (var j = 0; j < this.sample_size; j++) {
                s.values[j] = (RN_Normal(this.mu, this.sigma));
            }
            
            s.mean = get_mean(s.values);
            s.se = get_standard_error(s.values);
            
            // if number_of_samples is 1, ...
            if (number_of_samples == 1) {
				// if we've already shown more than this.samples_showing lines, push previous ones up
				if (this.total >= this.samples_showing) {
					for (var j = 1; j < this.samples_showing; ++j) {
						var so = this.samples[this.total - j];
						var y = so.draw_object[1].data("y") - this.line_spacing;
						this.remove_line(so);
						so.draw_object = this.draw_interval(so, y);
					}
					
					// now remove the next-previous one altogether
					var so = this.samples[this.total - j];
					this.remove_line(so);
				}
			
			// else determine where this one should be
        	} else {
	    		this_y = this.image_y + i * this.line_spacing;
        	}
        	
			// draw new interval
			this.get_ci(s);
            s.draw_object = this.draw_interval(s, this_y);
			
			this.samples.push(s);

            this.total++;
            this.hit += s.hit;
            this.show_stats();

			// if we added one, show the points for it
            if (number_of_samples == 1) {
	            this.show_all_points(this.total-1);
	        }
        }
    }
    
    this.show_stats = function() {
        $("#hit").val(this.hit);
        $("#total").val(this.total);
        var p = "–";
        if (this.total > 0) {
        	p = Math.round(1000*this.hit/this.total)/1000;
        }
		if (p >= 0) {percent_text = Math.round((p * 100)) + "%";}
		else {percent_text = "N/A";}
        $("#percent").val(percent_text);
    }
    
    // Redraw the ci's and recalculate the stats after changing the confidence level
    this.redraw_objects = function() {
    	this.hit = 0;
        for (var key = 0; key < this.samples.length; key++) {
        	var so = this.samples[key];
        	// recalculate ci
        	this.get_ci(so);
        	this.hit += so.hit;
        	
        	// redraw if necessary
			if (so.draw_object != null) {
				var y = so.draw_object[1].data("y");
				this.remove_line(so);
				so.draw_object = this.draw_interval(so, y);
			}
			
			// show stats
        	this.show_stats();
        }
    }
    
    //Set default value
    this.set_defaults = function(){
	    this.samples = new Array();
        this.hit = 0;
        this.total = 0;
        this.coeff_x = this.plot_width / (6.4 * this.sigma);
    }
    
    this.reset = function() {
		module_main.paper.clear();
		module_main.set_defaults();           
		module_main.draw_gaussian();
		this.show_stats();
    }
    
    //Define callbacks and paper object
    this.initialize = function(){
        this.width = $("#notepad").width();
        this.height = $("#notepad").height();
        this.paper = Raphael(document.getElementById("notepad"), this.width, this.height);
        var offset = $("#notepad").offset();
        this.notepad_x = offset.left;
        this.notepad_y = offset.top + 3; 
        this.expansion = false;
        $("#notepad").click(function(event) {
            module_main.show_all_points(event);
        });
		
        this.set_defaults();
        this.draw_gaussian();
		
        $(function() {
            $( "#conf_lvl_slider" ).slider({
                range: "min",
                value: 15,  // Default value
                min: 1,
                max: 21,
                slide: function( event, ui ) {
                    if(ui.value == 1) $( "#conf_lvl" ).val(80);
                    if(ui.value == 2) $( "#conf_lvl" ).val(81);
                    if(ui.value == 3) $( "#conf_lvl" ).val(82);
                    if(ui.value == 4) $( "#conf_lvl" ).val(83);
                    if(ui.value == 5) $( "#conf_lvl" ).val(84);
                    if(ui.value == 6) $( "#conf_lvl" ).val(85);
                    if(ui.value == 7) $( "#conf_lvl" ).val(86);
                    if(ui.value == 8) $( "#conf_lvl" ).val(87);
                    if(ui.value == 9) $( "#conf_lvl" ).val(88);
                    if(ui.value == 10) $( "#conf_lvl" ).val(89);
                    if(ui.value == 11) $( "#conf_lvl" ).val(90);
                    if(ui.value == 12) $( "#conf_lvl" ).val(91);
                    if(ui.value == 13) $( "#conf_lvl" ).val(92);
                    if(ui.value == 14) $( "#conf_lvl" ).val(93);
                    if(ui.value == 15) $( "#conf_lvl" ).val(94);
                    if(ui.value == 16) $( "#conf_lvl" ).val(95);
                    if(ui.value == 17) $( "#conf_lvl" ).val(96);
                    if(ui.value == 18) $( "#conf_lvl" ).val(97);
                    if(ui.value == 19) $( "#conf_lvl" ).val(98);
                    if(ui.value == 20) $( "#conf_lvl" ).val(99);
                    if(ui.value == 21) $( "#conf_lvl" ).val(99.5);
					//for (i = 1; i <= 99; i ++) {
					//	if (ui.value == i) {$("#conf_lvl").val(i);}
					//}
                    module_main.conf_lvl = $( "#conf_lvl" ).val();
                    module_main.redraw_objects();                    
                }                
            });
            $("#conf_lvl").val(module_main.default_conf_lvl);
        });
        
        $(function() {
            $( "#sample_size_slider" ).slider({
                range: "min",
                value: 4,
                min: 1,
                max: 13,
                slide: function( event, ui ) {
                    if(ui.value == 1) $( "#sample_size" ).val(5);
                    if(ui.value == 2) $( "#sample_size" ).val(10);
                    if(ui.value == 3) $( "#sample_size" ).val(15);
                    if(ui.value == 4) $( "#sample_size" ).val(20);
                    if(ui.value == 5) $( "#sample_size" ).val(25);
                    if(ui.value == 6) $( "#sample_size" ).val(30);
                    if(ui.value == 7) $( "#sample_size" ).val(40);
                    if(ui.value == 8) $( "#sample_size" ).val(50);
                    if(ui.value == 9) $( "#sample_size" ).val(75);
                    if(ui.value == 10) $( "#sample_size" ).val(100);
                    if(ui.value == 11) $( "#sample_size" ).val(150);
                    if(ui.value == 12) $( "#sample_size" ).val(200);
                    if(ui.value == 13) $( "#sample_size" ).val(250);
                    module_main.sample_size = $( "#sample_size" ).val();
                },
                change: function(event, ui) {
                	module_main.reset();
                }
            });
            $("#sample_size").val(module_main.default_sample_size);
        });
        
        this.show_stats();

        $("#sample_1").click(function(event){            
            if(module_main.total < 9900) {
				if (module_main.expansion == false) {
						module_main.generate_samples(1);    
				} else {
					module_main.narrowing_animation(event);
					setTimeout('module_main.generate_samples(1)', this.animation_time);
				}
			}
        });

        $("#sample_more").click(function(event){            
            if(module_main.total < 9900) {
                if (module_main.expansion == false) {
                    module_main.generate_samples(module_main.samples_showing);    
            	} else {
					module_main.narrowing_animation(event);
					setTimeout('module_main.generate_samples(module_main.samples_showing)', this.animation_time);
				}
            }
        });

        $("#reset").click(function(){
        	module_main.reset();
        });
    }    
}
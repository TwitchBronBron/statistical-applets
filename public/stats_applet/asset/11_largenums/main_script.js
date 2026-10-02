// indexOf method for arrays; supported in other browsers but not IE
function array_indexOf(arr, obj){
	for(var i=0; i<arr.length; i++){
		if(arr[i]==obj){
			return i;
		}
	}
	return -1;
}

$(window).load(function(){
    module_main.initialize();
});
module_main = new function(){
    //Define plot size
    this.plot_width = 400;
    this.plot_height = 400;
    this.plot_x = 200;
    this.plot_y = 50;
    //Define size for dice container(rect on left side)
    this.dice_container_x = 20;
    this.dice_container_y = 100;  
    this.dice_container_width = 120;
    this.dice_container_height = this.height - 50;
    //Define default dice number
    this.dice_number = 1;
    //THis grid need for drawing dices in the dice continer
    this.grid = new Array();
    //Define default interval id for timer. Need to forbid any clicks while series of roles is going on.
    this.intervalID = 0;
    //Define dice gride. Contain information about centers of points in dice depending on value.
    this.dice_grid = new Array();
    for (var i = 0; i < 6; i++)
        this.dice_grid[i] = new Array();    
    this.dice_grid[0][0] = [20, 20];
    this.dice_grid[1][0] = [30, 10];
    this.dice_grid[1][1] = [10, 30];
    this.dice_grid[2][0] = [10, 10];
    this.dice_grid[2][1] = [20, 20];
    this.dice_grid[2][2] = [30, 30];
    this.dice_grid[3][0] = [10, 10];
    this.dice_grid[3][1] = [30, 10];
    this.dice_grid[3][2] = [10, 30];
    this.dice_grid[3][3] = [30, 30];
    this.dice_grid[4][0] = [10, 10];
    this.dice_grid[4][1] = [30, 10];
    this.dice_grid[4][2] = [10, 30];
    this.dice_grid[4][3] = [30, 30];
    this.dice_grid[4][4] = [20, 20];
    this.dice_grid[5][0] = [10, 10];
    this.dice_grid[5][1] = [10, 20];
    this.dice_grid[5][2] = [10, 30];
    this.dice_grid[5][3] = [30, 10];
    this.dice_grid[5][4] = [30, 20];
    this.dice_grid[5][5] = [30, 30];
    //Contain information about steps of scaling
    this.scale_values = new Array();
    this.scale_values[0] = 10;
    this.scale_values[1] = 20;
    this.scale_values[2] = 50;
    this.scale_values[3] = 100;
    this.scale_values[4] = 150;
    this.scale_values[5] = 300;
    this.count = 0;   
    
    this.rolls = 1;
    
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
    //Define grid for dice container
    this.create_grid = function(){
        for(var i = 1; i <= 10; i++){
            this.grid[i] = new Array();
            if (i%2 == 1){
                this.grid[i][0] = this.dice_container_x + 10;
                this.grid[i][1] = this.dice_container_y + 60*(parseInt(i/2)+1) - 50;           
            }else{
                this.grid[i][0] = this.dice_container_x + 70;
                this.grid[i][1] = this.dice_container_y + 60*parseInt(i/2) - 50;                    
            }
        }
    }
    //Draw one dice. Index defines location of the dice in the dice container. Number define a number of points that will be shown on current dice.
    this.draw_dice = function(index, number){        
        var square = this.paper.rect(this.grid[index][0], this.grid[index][1], 40, 40);
        square.attr("stroke", "#000000");    
        this.dice_set.push(square);
        for(var i = 0; i <= number; i++){
            for(var key in this.dice_grid[number]){
                var point = this.paper.circle(this.grid[index][0]+this.dice_grid[number][key][0], this.grid[index][1]+this.dice_grid[number][key][1], 3);
                point.attr("fill", "#000000");
                this.dice_set.push(point);
            }
        }
    }    
    //Draw rectangle. All dices will be drawn inside thise rectangle.
    this.draw_dice_container = function(){
        this.dice_container = this.paper.rect(this.dice_container_x, this.dice_container_y, this.dice_container_width, this.dice_container_height = this.height - 200);
        this.dice_container.attr("fill", "#fff");
        this.dice_container.attr("stroke", "#d7d7d7");         
    }
    //Draw axes and labels for future plot.
    this.draw_axis = function(){
        this.Yaxis = this.paper.path("M" + this.plot_x + " " + (this.plot_y - 25) + "L" + this.plot_x + " " + (this.plot_y + this.plot_height));
        this.Yaxis.attr("stroke", "#d7d7d7");
        this.Xaxis = this.paper.path("M" + this.plot_x + " " + (this.plot_y + this.plot_height) + "L" + (this.plot_x + this.plot_width + 15) + " " + (this.plot_y + this.plot_height));
        this.Xaxis.attr("stroke", "#d7d7d7");   
        for (var i = 0; i < 11; i++){
            var line = this.paper.path("M" + (this.plot_x-5) + " " + (this.plot_y + i*this.plot_height/10) + "L" + (this.plot_x+5) + " " + (this.plot_y + i*this.plot_height/10));
            line.attr("stroke", "#d7d7d7");            
            
        }
        var mText = this.paper.text(this.plot_x-30, this.plot_y + this.plot_height, this.dice_number);
        mText.attr("font-size", "14");
        mText.attr("text-anchor", "start");
        mText.attr("fill", "#292929");
        mText.attr("font-family", "Helvetica Neue"); 
        var mText = this.paper.text(this.plot_x-30, this.plot_y + this.plot_height/2, 7*this.dice_number/2);
        mText.attr("font-size", "14");
        mText.attr("text-anchor", "start");
        mText.attr("fill", "#292929");
        mText.attr("font-family", "Helvetica Neue"); 
        var mText = this.paper.text(this.plot_x-30, this.plot_y, 6*this.dice_number);
        mText.attr("font-size", "14");
        mText.attr("text-anchor", "start");
        mText.attr("fill", "#292929");
        mText.attr("font-family", "Helvetica Neue"); 
        
        for (var i = 0; i < 10; i++){
            line = this.paper.path("M" + (this.plot_x + (i+1)*this.plot_width/10)  + " " + (this.plot_y + this.plot_height - 5) + "L" + (this.plot_x + (i+1)*this.plot_width/10) + " " + (this.plot_y + this.plot_height + 5));
            line.attr("stroke", "#d7d7d7");
            
            mText = this.paper.text(this.plot_x + (i+1)*this.plot_width/10, this.plot_y + this.plot_height + 15, (this.scale_values[this.scale_index]*0.1*(i+1)).toFixed(0));            
            mText.attr("font-size", "14");
            mText.attr("text-anchor", "middle");
            mText.attr("fill", "#292929");
            mText.attr("font-family", "Helvetica Neue");            
        }
        var mText = this.paper.text(this.plot_x-60, this.plot_y - 30, "Average");
        mText.attr("font-size", "14");
        mText.attr("text-anchor", "start");
        mText.attr("fill", "#292929");
        mText.attr("font-family", "Helvetica Neue");
        mText = this.paper.text(this.plot_x + this.plot_width/2, this.plot_y + this.plot_height + 35, "Number of rolls");
        mText.attr("font-size", "14");
        mText.attr("text-anchor", "middle");
        mText.attr("fill", "#292929");
        mText.attr("font-family", "Helvetica Neue");

        this.totaltext = this.paper.text(this.dice_container_x + this.dice_container_width - 10, this.dice_container_y + this.dice_container_height + 15, "This roll: —");
        this.totaltext.attr("font-size", "14");
        this.totaltext.attr("text-anchor", "end");
        this.totaltext.attr("fill", "#292929");
        this.totaltext.attr("font-family", "Helvetica Neue");

        this.ntext = this.paper.text(this.dice_container_x + this.dice_container_width - 10, this.dice_container_y + this.dice_container_height + 50, "# of Rolls: 0");
        this.ntext.attr("font-size", "14");
        this.ntext.attr("text-anchor", "end");
        this.ntext.attr("fill", "#292929");
        this.ntext.attr("font-family", "Helvetica Neue");

        this.meantext = this.paper.text(this.dice_container_x + this.dice_container_width - 10, this.dice_container_y + this.dice_container_height + 75, "Mean: —");
        this.meantext.attr("font-size", "14");
        this.meantext.attr("text-anchor", "end");
        this.meantext.attr("fill", "#292929");
        this.meantext.attr("font-family", "Helvetica Neue");
    }
    //Make one roll. This function take integer random value from 0 to 5 and draw dice with corresponding value. Also this function sumarise values and number of rolls.
    this.make_roll = function(){
        var total = 0;
        for(var i = 1; i <= this.dice_number; i++){
            var number = getRandomInt(0,5);
            this.draw_dice(i, number);   
            total = total + number + 1;                       
        }
        this.total_array.push(total);
        var text = "This roll: " + total;
        this.totaltext.attr("text", text); 
        this.roll_number = this.roll_number + 1;  
        this.sum_totals = this.sum_totals + total;
        
        text = "# of Rolls: " + this.roll_number;
        this.ntext.attr("text", text);

        var mean = (this.sum_totals / this.roll_number).toFixed(2);
        text = "Mean: " + mean;
        this.meantext.attr("text", text);
    }
    //Draw one average point
    this.draw_mean_point = function(){
        var average = this.sum_totals/this.roll_number;           
        var current_x = this.plot_x + Math.round(this.coeff_x*this.roll_number);
        var current_y = this.plot_y + this.plot_height - Math.round(this.coeff_y*(average-this.dice_number));
        var previous_x = this.plot_x + Math.round(this.coeff_x*(this.roll_number-1));
        if (this.roll_number != 1){
            var previous_y = this.plot_y + this.plot_height - Math.round(this.coeff_y*(this.average_array[this.average_array.length - 1]-this.dice_number));
            var line = this.paper.path("M" + previous_x + " " + previous_y + "L" + current_x + " " + current_y);
            line.attr("stroke", "#e13f3f");
        }
        var point = this.paper.circle(current_x, current_y, 2);
        point.attr("fill", "#e13f3f");        
        this.average_array.push(average);       
    };
    //Redraw all average points. This fuction is called only after rescaling.
    this.draw_all_graph = function(){
        var average = this.sum_totals/this.roll_number;
        this.average_array.push(average);
        var graph = this.paper.path("M0 0");
        var x = this.plot_x + Math.round(this.coeff_x);
        var y = this.plot_y + this.plot_height - Math.round(this.coeff_y*(this.average_array[0]-this.dice_number));        
        var path = "M" + x + " " + y;
        var point = this.paper.circle(x, y, 2);
        point.attr("fill", "#e13f3f");    
        for(var i = 2; i <= this.roll_number; i++){
            x = this.plot_x + Math.round(this.coeff_x*i);
            y = this.plot_y + this.plot_height - Math.round(this.coeff_y*(this.average_array[i-1]-this.dice_number));  
            path += "L" + x + " " + y;   
            point = this.paper.circle(x, y, 2);
            point.attr("fill", "#e13f3f"); 
        }
        graph.attr("path", path);
        graph.attr("stroke", "#e13f3f");
    }
    //Draw one total point
    this.draw_total_point = function(){
        var x = this.plot_x + Math.round(this.coeff_x*this.roll_number);
        var y = this.plot_y + this.plot_height - Math.round(this.coeff_y*(this.total_array[this.roll_number-1]-this.dice_number));
        var point = this.paper.circle(x, y, 2);
        point.attr("fill", "#ffba00");
        this.totals_set.push(point);         
        
    }
    //This function calls all necessary functions to maintain draw process
    this.main = function(){  
        //Draw while counter less than chosen number of rolls per one series
        if(this.count < this.rolls){
            //Number of rolls should be less than 300
            if (this.roll_number <= 299){
                //Called if it's time to rescaling
                var io = array_indexOf(this.scale_values, this.roll_number);
                if(io!=-1){
                    this.scale_index = io + 1;
                    this.coeff_x = this.plot_width/(this.scale_values[this.scale_index]);
                    this.paper.clear();
                    this.dice_set = this.paper.set();
                    this.mean_line = this.paper.path("M" + this.plot_x + " " + (this.plot_y + this.plot_height/2) + "L" 
                        + (this.plot_x + this.plot_width) + " " + (this.plot_y + this.plot_height/2));
                    if ($("#show_mean").is(":checked"))
                        this.mean_line.show();
                    else
                        this.mean_line.hide();                   
                    this.mean_line.attr("stroke", "#3b60ff");
                    this.draw_dice_container();             
                    this.draw_axis();                    
                    this.make_roll();
                    this.draw_all_graph();            
                    this.count = this.count + 1;
                    this.show_totals();
                    if($("#show_totals").is(":checked"))
                        this.draw_total_point();
                    this.data_load();
                    return;
                }           
                 
                this.remove_all_dices();                
                this.make_roll();
                this.draw_mean_point();
                if($("#show_totals").is(":checked"))
                    this.draw_total_point();
                this.count++;
                this.data_load();
            }else {
                this.count = this.rolls;
            }
        }

        if(this.count >= this.rolls){
            if (this.intervalID != 0 && this.intervalID != null) {
	            clearInterval(this.intervalID);
	        }
            this.count = 0;
            this.intervalID = 0;            
        }
        
    } 
    //Remove all dices.    
    this.remove_all_dices = function(){
        var element = this.dice_set.pop();
        while(element){
                    this.dice_set.exclude(element);
                    element.remove();
                    element = this.dice_set.pop();
            
                }        
    }
    
    //Draw or remove all total points
    this.show_totals = function(){
        if($("#show_totals").is(":checked")){
            for(var key = 0; key < this.total_array.length; key++){
                var x = this.plot_x + Math.round(this.coeff_x*(key + 1));
                var y = this.plot_y + this.plot_height - Math.round(this.coeff_y*(this.total_array[key]-this.dice_number));
                var point = this.paper.circle(x, y, 2);
                point.attr("fill", "#ffba00");
                this.totals_set.push(point);               
            }            
        }else{
            var element = this.totals_set.pop();
            while(element){
                this.totals_set.exclude(element);
                element.remove();
                element = this.totals_set.pop();
            
            }
        }
    }
    //Send data
    this.data_load = function(){
        Applet_Communication().report_action({
            rolls : this.roll_number, // Number of rolls
            average : this.sum_totals/this.roll_number, // Average value of the rolls
            mean : 7*this.dice_number/2 // Mean value
            
        });
    }
    //This function reset all parameters to defaults except dice number.
    this.set_defaults = function(){  
        this.paper.clear();
        this.draw_dice_container();
        this.scale_index = 0;         
        this.draw_axis();  
        //Current number of completed rolls.
        this.roll_number = 0;
        //Contain all totals
        this.total_array = new Array();
        //Contain all average values
        this.average_array = new Array(); 
        //Define scale coefficients 
        this.coeff_y = this.plot_height/(this.dice_number*5);        
        this.coeff_x = this.plot_width/(this.scale_values[this.scale_index]);
        //Set for drawing and removing totals
        this.totals_set = this.paper.set();
        //Set for drawing and removing dices
        this.dice_set = this.paper.set();         
        this.mean_line = this.paper.path("M" + this.plot_x + " " + (this.plot_y + this.plot_height/2) + "L" 
            + (this.plot_x + this.plot_width) + " " + (this.plot_y + this.plot_height/2));
        this.mean_line.attr("stroke", "#3b60ff");
        this.mean_line.hide();
        $("#show_totals").removeAttr("checked");
        $("#show_mean").removeAttr("checked");
        this.sum_totals = 0;
    }    
    //Define callbacks and paper object
    this.initialize = function(){
        this.width = $("#notepad").width();
        this.height = $("#notepad").height();
        this.paper = Raphael(document.getElementById("notepad"), this.width, this.height);
        this.create_grid();   
        this.set_defaults(); 
        this.draw_dice(this.dice_number, 0); 
        
        $("#f_dice").click(function(){
            if(module_main.intervalID == 0){
                if(module_main.dice_number > 1){
                    module_main.dice_number = module_main.dice_number - 1;
                    module_main.set_defaults();                      
                    for(var i = 1; i <= module_main.dice_number; i++)           
                        module_main.draw_dice(i, 0);  
                }
            }
        });
        $("#m_dice").click(function(){
            if(module_main.intervalID == 0){
                if(module_main.dice_number < 10){
                    module_main.dice_number = module_main.dice_number + 1;
                    module_main.set_defaults();      
                    for(var i = 1; i <= module_main.dice_number; i++)           
                        module_main.draw_dice(i, 0);                            
                }
            }
        });
        
        $("#r_dice").click(function(){
            if(module_main.intervalID == 0){
                if(module_main.rolls == 1) {
					module_main.main();
                } else if(module_main.rolls <= 5) {
                    module_main.intervalID = setInterval('module_main.main()', 500);
                } else if(module_main.rolls > 5 && module_main.rolls <= 25) {
                    module_main.intervalID = setInterval('module_main.main()', 150);
                } else if(module_main.rolls > 25 && module_main.rolls <= 100) {
                    module_main.intervalID = setInterval('module_main.main()', 75);           
                }
            }
        });
        $("#reset").click(function(){
            if(module_main.intervalID == 0){
                module_main.paper.clear();
                module_main.set_defaults();               
				for(var i = 1; i <= module_main.dice_number; i++)           
					module_main.draw_dice(i, 0);                            
            }           
        });
                 
        $("#rolls").val(module_main.rolls);
        $("#rolls").blur(function(){
            if(parseInt($("#rolls").val())){
                if($("#rolls").val() > 100){
                    module_main.rolls = 100;
                    $("#rolls").val(100);                    
                }else                
                    module_main.rolls = parseFloat($("#rolls").val());
            }else
                $("#rolls").val(module_main.rolls);            
        });
        
        $("#show_totals").click(function(){
            if(module_main.intervalID == 0){
                module_main.show_totals();                
            }else{
                if($("#show_totals").is(":checked"))
                    $("#show_totals").removeAttr("checked");
                else
                    $("#show_totals").attr("checked","checked");
            }                 
        });
        $("#show_mean").click(function(){            
            if($("#show_mean").is(":checked")){ 
                module_main.mean_line.show();
            }else{
                module_main.mean_line.hide();
            }                      
        });         
    }    
}

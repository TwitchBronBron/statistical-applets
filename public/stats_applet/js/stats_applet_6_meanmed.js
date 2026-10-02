function receive_applet_action(action) {
var a = player.activity;
	
	
	

	var correct = false;
	if (a.current_question == 2) {
		correct = (action.n >= 5 && action.mean == action.median)
	}
	
	if (correct) {
		$('[data-question_index="2"] [id="query_answer_1_1"]').attr('checked', false);
                $('[data-question_index="2"] [id="query_answer_1_0"]').attr('checked', 'checked');
	}	
    return;
	
}



var meanmed_Player_subtype = Player_subtype.extend({


    initialize2: function () {
        this._super();

        //question 2
        //This is a custom question, set up as "Multiple choice" in digfir. But we are using the multiple choice functionality under the hood only.
        //The radio button choices are hidden from the user. The actual selection of the radio button will be done here (user can't see this).
        
        //Unless the user has put 5 "points" on the graph, and the mean and median are equal, then set multiple choice to wrong choice        
        $('[data-question_index="2"] [id="query_answer_1_1"]').attr('checked', 'checked');        
        
    }

});

player = new meanmed_Player_subtype();
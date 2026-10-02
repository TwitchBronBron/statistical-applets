function receive_applet_action(action) {
	var a = player.activity;
	
	if (a.quiz_completed) {
		return;
	}
	
	// for questions 1 through 3...
	if (a.current_question >= 1 && a.current_question <= 3) {
		// get a reference to the query
		var q = a.questions[a.current_question].queries[0];
		
		// and get the correct answer
		var answer = Math.round(action.hits) + "";
		
		// if the user has shot the correct number of times, set the correct answer
		if (a.current_question == 1) {
			if (action.n >= 5) {
				q.answers[0] = q.correct_answer = answer;
			}
		} else if (a.current_question == 2) {
			if (action.n >= 15) {
				q.answers[0] = q.correct_answer = answer;
			}
		} else if (a.current_question == 3) {
			if (action.n >= 50) {
				q.answers[0] = q.correct_answer = answer;
			}
		}
	}
}
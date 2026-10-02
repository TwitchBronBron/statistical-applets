function receive_applet_action(action) {
	var a = player.activity;
	
	if (a.quiz_completed) {
		return;
	}
	
	// for questions 3 through 5...
	if (a.current_question >= 3 && a.current_question <= 5) {
		// first check to see if parameters are correct
		var msg = "";
		if (action.pop_n != 10) {
			msg += "Set the population size to 10. ";
		}
		if (action.sample_size != 3) {
			msg += "Set the sample size to 3. ";
		}
		if (action.values.length != 3) {
			msg += " ";
		}
		
		// if there is a problem, tell them
		if (msg != "") {
			msg = "To answer this question, you need to first take a sample of 3 balls from a population of 10 balls. " + msg + "Then click \"RESET\" and take a new sample, then calculate the mean of that sample and enter it in the blank.";
			alert(msg);
			return;
		}
		
		// if user has parameters set correctly, set the correct answer to the mean
		var q = a.questions[a.current_question].queries[0];
		var answer = action.mean.toFixed(1) + "";
		q.answers[0] = answer;
		q.correct_answer = answer;
	}
}
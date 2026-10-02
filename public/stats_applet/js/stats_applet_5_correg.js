function receive_applet_action(action) {
	var a = player.activity;
	
	if (a.quiz_completed || a.current_question != 1) {
		return;
	}

	var correct = false;
	if (a.current_question == 1) {
		correct = (action.n >= 8 && action.r > 0.5 && action.r < 0.7)
	}
	
	if (correct) {
		var q = a.questions[a.current_question].queries[0];
		q.setUserAnswer("complete");
		$("#query_answer_" + q.query_index).val("complete");
		a.submit_question(a.current_question);
	}
}
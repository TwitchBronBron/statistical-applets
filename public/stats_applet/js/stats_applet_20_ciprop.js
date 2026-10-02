function receive_applet_action(action) {
	function set_correct_answer(num, val) {
		var q = a.questions[num].queries[0];
		q.answers[0] = q.correct_answer = val + "";
	}
	
	var a = player.activity;
	
	if (a.quiz_completed) {
		return;
	}
	
	// first reset correct answers
	set_correct_answer(1, "Student must use applet to determine answer");
	set_correct_answer(2, "Student must use applet to determine answer");

	// if we're on question 1 or 2 and p or n isn't set right, warn the student
	if (a.current_question == 1 || a.current_question == 2) {
		if (action.total > 0) {
			if (action.p != .52) {
				alert("You need to set the Population Proportion to .52 to answer this question. Click RESET and try again.");
				return;
			}
			if (action.sample_size != 250) {
				alert("You need to set the Sample Size to 250 to answer this question. Click RESET and try again.");
				return;
			}
		}
	}
	
	// now, if params are set correctly, set correct answers
	if (action.p == .52 && action.sample_size == 250 && action.total > 0) {
		set_correct_answer(1, action.hit);

		// answer to question 2 is # of samples that are < .50
		var romneys = 0;
		for (var i = 0; i < action.samples.length; ++i) {
			var s = action.samples[i];
			if (s.p < .50) {
				++romneys;
			}
		}
		set_correct_answer(2, romneys);
	}
	
}
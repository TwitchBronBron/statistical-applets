function receive_applet_action(action) {
	var a = player.activity;
	
	if (a.quiz_completed) {
		return;
	}

	// The hopper value for red needs to be filled in as the correct answer 
	// for question 1, unless we're already past question 1
	if (a.current_question == null || a.current_question == 1) {
		var red = (action.hopper_frequencies.red * 100).toFixed(1) + "";
		var q = a.questions[1].queries[0];
		q.answers[0] = q.correct_answer = red;
	} else {
		var q = a.questions[a.current_question].queries[0];
		if (a.current_question == 3) {
			if (action.n != 20) {
				alert("You must draw bags of 20 candies for this question.")
			} else {
				if (window.applet_action_tests_run_3 == null) {
					window.applet_action_tests_run_3 = 1;
				} else {
					++window.applet_action_tests_run_3;
				}
			}
			if (window.applet_action_tests_run_3 >= 5) {
				q.setUserAnswer("complete");
				$("#query_answer_" + q.query_index).val("complete");
				a.submit_question(a.current_question);
				setTimeout("$(window).scrollTo({top:2000, left:0}, {duration:500});", 1500);
			}
	
		} else if (a.current_question == 4) {
			if (action.n != 200) {
				alert("You must draw bags of 200 candies for this question.")
			} else {
				if (window.applet_action_tests_run_4 == null) {
					window.applet_action_tests_run_4 = 1;
				} else {
					++window.applet_action_tests_run_4;
				}
			}
			if (window.applet_action_tests_run_4 >= 5) {
				q.setUserAnswer("complete");
				$("#query_answer_" + q.query_index).val("complete");
				a.submit_question(a.current_question);
				setTimeout("$(window).scrollTo({top:2000, left:0}, {duration:500});", 1500);
			}
		}
	}
}
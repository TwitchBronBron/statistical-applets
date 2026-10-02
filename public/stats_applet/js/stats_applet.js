var Activity_subtype = Activity_manuscript_type.extend({
    current_question: null,
    quiz_completed: false,

    get_question_number: function (q) {
        // always use q.index here
        return q.index;
    },

    show_next_question: function () {
        if (this.current_question == null) {
            this.current_question = 1;
            this.questions[this.current_question].jq.show();
            $(window).scrollTo({ top: 2000, left: 0 }, { duration: 500 });
        } else if (this.current_question >= this.questions.length - 1) {
            this.complete_quiz();
            return;

        } else {
            $("#question_submit_button_" + this.current_question).val("Next Question")
				.unbind()
				.attr("onclick", "")
				.click({ "question": this.questions[this.current_question], "next_question": this.questions[this.current_question + 1] }, function (e) {
				    // on click of this button, hide the current question and fade in the next one
				    // e.data.question.jq.hide();
				    $("#question_submit_button_" + player.activity.current_question).hide();

				    // use the below animation instead of fadeIn because it doesn't completely hide the item first
				    // and thus doesn't cause the window to scroll to the top.
				    e.data.next_question.jq.show();
				    // $(window).scrollTo(e.data.next_question.jq.find(".query_text"));
				    $(window).scrollTo({ top: 2000, left: 0 }, { duration: 500 });

				    // update current_question
				    player.activity.current_question++;
				    if (player.activity.current_question >= player.activity.questions.length) {
				        player.activity.complete_quiz();
				    }
				})
				.show();
        }
    },

    submit_question: function (question_index) {
        this._super(question_index);
        // LOCAL PATCH: guard in case MathJax hasn't finished loading yet
        if (window.MathJax && MathJax.Hub) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    },

    complete_quiz: function () {
        // show questions
        for (var i = 1; i < this.questions.length; ++i) {
            this.questions[i].jq.show();
        }

        var html = "<div id='total_score_div'>"
			+ "Activity complete. Total score: " + player.activity.total_points_earned
			+ " out of " + player.activity.total_points_possible
			+ " points (" + player.activity.grade_percent + "%)"
			+ "</div>"
        ;
        $("[data-block_type=questions]").append(html);

        // scroll to bottom of screen
        $(window).scrollTo({ top: 2000, left: 0 }, { duration: 500 });

        this.quiz_completed = true;
    }
});

var Player_subtype = Player_manuscript_type.extend({
    // this will be set to true when the quiz starts, so it can't be restarted
    quiz_started: false,

    show_navigation: function () {
        var html = "<div id='top_banner'>";

        if (this.activity_thumbnail_src != null) {
            html += "<img id='banner_thumbnail' src='" + this.activity_thumbnail_src + "' />";
        }

        html += "<div id='banner_activity_type'>" + this.md.activity_type_title + "</div>"
			+ "<div id='banner_activity_title'>" + this.activity_title + "</div>"
			+ "</div>"	// top_banner
        ;

        $("[data-type=chapter]").prepend(html);
    },

    start_quiz: function () {
        if (this.quiz_started) {
            return;
        }

        $("#start_quiz_link").hide();
        $("[data-block_type=questions]").show();
        this.activity.show_next_question();

        this.quiz_started = true;
    },

    extract_activity_metadata: function () {
        this._super();

        this.required_metadata_val("allow_resubmission", "false", true);
        this.required_metadata_val("restore_previous_submissions", "false", true);
    },

    initialize: function () {
        this._super();

        // after we call this.super, re-initialize the activity to the custom
        // activity type for this subtype
        this.activity = new Activity_subtype();

        // LOCAL PATCH: cdn.mathjax.org is retired; load the vendored MathJax 2.7.9 instead.
        // Use a real <script src> (not jQuery.getScript, which evals via XHR) so MathJax
        // can find its root directory and the ?config= parameter.
        var mathjax_script = document.createElement("script");
        mathjax_script.src = "../vendor/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
        document.getElementsByTagName("head")[0].appendChild(mathjax_script);

    },

    initialize2: function () {
        // TEMPORARY: set arga grade to -1, to stop the "You have completed..." screen from coming up
        if (window.Set_ARGA_Grade != null) {
            Set_ARGA_Grade(-1);
        }

        this._super();

        // button for starting the quiz -- at the end of the instructions block
        // ONLY IF (ARGA IS ACTIVE or url includes "quiz_me=true")
        // and questions haven't already been submitted
        // LOCAL PATCH: the quiz used to appear only inside an LMS (ARGA) or with ?quiz_me=true.
        // There is no LMS anymore, so offer it by default; ?quiz_me=false hides it.
        if ((player.ARGA_running || location.search.substr(1).search("quiz_me=false") < 0) &&(window.Get_ARGA_Grade == null || Get_ARGA_Grade() < 0 || Get_ARGA_Grade() == "")) {
            html = "<div id='start_quiz_link'>"
				+ UI_Elements.get_button_html({
				    id: "start_quiz_button"
					, label: "Quiz Me"
					, fn: "player.start_quiz()"
				})
				+ "</div>"

            $("[data-block_type=instructions]").find("p").last().prepend(html);
            UI_Elements.activate_buttons();

            // other wise *hide* the last paragraph in the instructions box,
            // which will be something like "Click Quiz Me to finish the assignment"
        } else {
            $("[data-block_type=instructions]").find("p").last().hide();
        }

    }
});

player = new Player_subtype();

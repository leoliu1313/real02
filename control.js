$(document).ready(function () {
    console.log("ready!");

    /* 
    POST values are not accessible client side
    GET values can be accessed via
    window.location.search
    */

    (function ($) {
        $.QueryString = (function (a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i) {
                var p = a[i].split('=');
                if (p.length != 2) continue;
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        })(window.location.search.substr(1).split('&'))
    })(jQuery);
    window.currentTopicId = $.QueryString["id"];
    window.currentIdeaId = null;

    function cleanup_form() {
        $("#signup .username").val("");
        $("#signup .email").val("");
        $("#signup .password").val("");
        $("#login .username").val("");
        $("#login .password").val("");
        $("#search-real").val("");
        $("#comment-real").val("");
        $("#comment-search-real").val("");
        $(".error").text("");
    }
    cleanup_form();

    function show_section() {
        if (window.currentTopicId == null) {
            show_section1();
        } else {
            show_section2();
        }
    }

    // set up list
    var options = {
        item: '<li class="list-group-item"><a href="#" class="list-group-item topic-real">' +
            '<p class="TopicName"></p>' +
            '<div class="row">' +
            '<div class="col-xs-6 col-sm-3 col-md-3"><p class="CommentCount"></p></div>' +
            '<div class="col-xs-6 col-sm-3 col-md-3"><p class="TopicOwner"></p></div>' +
            '<div class="col-xs-12 col-sm-6 col-md-6"><p class="updatedAt"></p></div>' +
            '</div>' +
            '<p class="objectId"></p>' +
            '</a></li>',
        valueNames: ['TopicName', 'TopicOwner', 'updatedAt', 'CommentCount', 'objectId']
    };
    window.theList = new List('id-search-key', options);
    var options2 = {
        item: '<li class="list-group-item comment">' +
            '<p class="CommentOwner"></p>' +
            '<span class="list-group-item">' +
            '<div class="CommentContent"></div>' +
            '</span>' +
            '<p class="updatedAt"></p>' +
            '<p class="objectId"></p>' +
            '</li>',
        valueNames: ['CommentContent', 'CommentOwner', 'updatedAt', 'objectId']
    };
    window.theList2 = new List('comment-id-search-key', options2);
    var options3 = {
        item: '<li class="list-group-item vote not-ready">' +
            '<p class="CommentOwner"></p>' +
            '<span class="list-group-item">' + // box begins
            '<div class="CommentContent"></div>' +
            '<div class="row">' +
            '<p class="UserVote">What do you think about this idea?</p>' +
            '</div>' +
            '<div class="btn-group row margin-bottom">' +
            '<input type="submit" class="btn btn-default vote" value="Vote">' +
            '<input type="submit" class="btn btn-default agree" value="Agree">' +
            '<input type="submit" class="btn btn-default disagree" value="Disagree">' +
            '</div>' +
            '<div class="row">' +
            '<p class="FinalVote">Vote: </p>' +
            '</div>' +
            '<div class="row">' +
            '<p class="AgreeVote">Agree: </p>' +
            '</div>' +
            '<div class="row">' +
            '<p class="DisagreeVote">Disagree: </p>' +
            '</div>' +
            '<div class="row">' +
            '<p class="Ratio">Ratio: </p>' +
            '</div>' +
            '</span>' + // box ends
            '<p class="updatedAt"></p>' +
            '<p class="objectId"></p>' +
            '</li>',
        valueNames: ['CommentContent', 'CommentOwner', 'updatedAt', 'objectId', 'agreeCount']
    };
    window.theList3 = new List('idea-id-search-key', options3);

    // set up parse.com
    Parse.initialize("gLr9xymyelDTkCD8MTCLt3bVVUgtANSWyA0HUa3P", "P2eQs1HP29cvjU7MHNN8k4iZtXTdqD8xEgKhVDRJ");
    window.ProjectTopic = Parse.Object.extend("ProjectTopic");
    window.CommentTopic = Parse.Object.extend("CommentTopic");
    window.VoteIdea = Parse.Object.extend("VoteIdea");
    window.currentUser = Parse.User.current();
    $("#section1").hide();
    $("#section2").hide();
    if (window.currentUser) {
        $('#headline').css("background-image", "none");
        $('#login').hide();
        $('#signup').hide();
        $('#signout').show();
        show_section();
    } else {
        //
    }

    $('#search-clear').toggle(false);
    $('.not-footer').show();
    $('.footer').show();

    /* define function */
    var waitForFinalEvent = (function () {
        var timers = {};
        return function (callback, ms, uniqueId) {
            if (!uniqueId) {
                uniqueId = "Don't call this twice without a uniqueId";
            }
            if (timers[uniqueId]) {
                clearTimeout(timers[uniqueId]);
            }
            timers[uniqueId] = setTimeout(callback, ms);
        };
    })();

    /* function IsValidImageUrl(url, callback) { */
    function IsValidImageUrl(url, string) {
        // this will start a thread
        // caller codes keep going
        $("<img>", {
            src: url,
            error: function () {
                // false
                $(string + " .theText").show();
            },
            load: function () {
                // true
                $(string + " .theImg").show();
            }
        });
    }

    function show_section1() {
        if (window.currentUser) {
            $('#headline h1').text("Idea for Team - " + window.currentUser.get("username"));
        } else {
            return;
        }
        $('#section1').hide();
        // debug
        // $('#section1').show();
        /* remove the data in the list data structure and the data in the html codes */
        window.theList.clear();
        var query = new Parse.Query(window.ProjectTopic);
        query.find({
            /* wait for server response */
            success: function (results) {
                // $('#addtopic .error').text("Successfully retrieved " + results.length + " data - ");
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    window.theList.add({
                        TopicName: object.get('TopicName'),
                        TopicOwner: object.get('TopicOwner'),
                        updatedAt: object.updatedAt.toLocaleString(),
                        CommentCount: object.get('CommentCount'),
                        objectId: object.id
                    });
                    // $('#addtopic .error').append(object.get('TopicName') + " / " + object.get('TopicOwner') + " - ");
                }
                // update search result
                window.theList.sort("CommentCount", {
                    order: "desc"
                });
                window.theList.search($("#search-real").val(), ['TopicName']);
                // set up GET method parsing query strings
                $("a.list-group-item").each(function (index) {
                    $(this).attr("href", "?id=" + $(this).find(".objectId").text());
                });
                $("p.CommentCount").each(function (index) {
                    $(this).append(" comments");
                });
                /*
                // register event for new items
                $(".topic-real").click(function () {
                    $('#section1').hide();
                    show_section2();
                    return false;
                });
                */
            },
            error: function (error) {
                $('#addtopic .error').text("Error: " + error.code + " " + error.message);
            }
        });
        /* codes keep going without server response */
        $('#section1').show();
    }

    function process_comment(input) {
        var output = input.split("\n").join("</p><p>");
        output = "<p>" + output + "</p>";
        return output;
    }

    function show_section2() {
        if (window.currentUser) {
            $('#headline h1').text("Idea for Team - " + window.currentUser.get("username"));
        } else {
            return;
        }
        $('#section2').hide();
        $('#open-idea-zone').hide();
        window.theList2.clear();
        window.theList3.clear();
        /* access Project Topic Table - use Project Topic ID to get Project Topic info */
        var queryAllTopics = new Parse.Query(window.ProjectTopic);
        queryAllTopics.get(window.currentTopicId, {
            success: function (RqueryAllTopics) {
                // RqueryAllTopics is an object for topic
                $('#section2 .TopicName').text(RqueryAllTopics.get('TopicName'));
                $('#section2 .TopicOwner').text(RqueryAllTopics.get('TopicOwner'));
                $('#section2 .createdAt').text("created at " + RqueryAllTopics.createdAt.toLocaleString());
                $('#section2 .updatedAt').text("updated at " + RqueryAllTopics.updatedAt.toLocaleString());
                /* access Comment system - use Project Topic ID to get comments */
                var queryAllComments = new Parse.Query(window.CommentTopic);
                queryAllComments.equalTo("TopicId", window.currentTopicId);
                queryAllComments.find({
                    /* wait for server response */
                    success: function (RqueryAllComments) {
                        // RqueryAllComments is a collection of objects for comment
                        // update count without catching error messages
                        if (RqueryAllTopics.get("CommentCount") != RqueryAllComments.length) {
                            RqueryAllTopics.set("CommentCount", RqueryAllComments.length);
                            RqueryAllTopics.save();
                        }
                        // process RqueryAllComments
                        // for each comment loop
                        for (var i = 0; i < RqueryAllComments.length; i++) {
                            var OneComment = RqueryAllComments[i];
                            // OneComment is an object for comment
                            if (OneComment.get('Status') == 0) { // comment
                                // OneComment is used for discussion comment, not proposed idea
                                window.theList2.add({
                                    CommentContent: process_comment(OneComment.get('CommentContent')),
                                    CommentOwner: OneComment.get('CommentOwner'),
                                    updatedAt: OneComment.updatedAt.toLocaleString(),
                                    objectId: OneComment.id
                                });
                            } else if (OneComment.get('Status') == 1) { // idea
                                // OneComment is used for proposed idea, not discussion comment
                                window.theList2.add({
                                    CommentContent: "<p>" + OneComment.get('CommentOwner') +
                                        " proposed an idea:</p>" +
                                        process_comment(OneComment.get('CommentContent')),
                                    CommentOwner: "",
                                    updatedAt: OneComment.updatedAt.toLocaleString(),
                                    objectId: OneComment.id
                                });
                                $("li.comment").last().find("span").css("background-color", "aliceblue");
                                // TODO: click to scroll to theList3 directly
                                window.theList3.add({
                                    CommentContent: process_comment(OneComment.get('CommentContent')),
                                    CommentOwner: OneComment.get('CommentOwner'),
                                    updatedAt: OneComment.updatedAt.toLocaleString(),
                                    objectId: OneComment.id, // comment id
                                    agreeCount: 0
                                });
                                var listElement = $('li.vote.not-ready');
                                listElement.attr("id", listElement.find('.objectId').text());
                                listElement.find('input.agree').attr("for", listElement.attr("id"));
                                listElement.find('input.agree').click(function () {
                                    window.currentIdeaId = $(this).attr("for");
                                    waitForFinalEvent(function () {
                                        var queryAllVotes = new Parse.Query(window.VoteIdea);
                                        queryAllVotes.equalTo("Voter", window.currentUser.get("username"));
                                        queryAllVotes.equalTo("IdeaId", window.currentIdeaId);
                                        queryAllVotes.notEqualTo("Vote", 3); // vote
                                        queryAllVotes.find({
                                            /* wait for server response */
                                            success: function (RqueryAllVotes) {
                                                for (var i = 0; i < RqueryAllVotes.length; i++) {
                                                    var textUpdate = null;
													if (RqueryAllVotes[i].get("Vote") == 1) {
														textUpdate = $('li#' + RqueryAllVotes[i].get("IdeaId")).find('.AgreeVote');
													}
													else {
														textUpdate = $('li#' + RqueryAllVotes[i].get("IdeaId")).find('.DisagreeVote');
													}
                                                    var original = textUpdate.text().split("(")[1].split(")");
                                                    var number = parseInt(original[0]);
                                                    number--;
                                                    var name = original[1].replace(window.currentUser.get("username"), "").replace(/ , /g, " ").replace(/, $/g, "");
													if (RqueryAllVotes[i].get("Vote") == 1) {
														textUpdate.text("Agree: (" + number + ")" + name);
													}
													else {
														textUpdate.text("Disagree: (" + number + ")" + name);
													}
                                                    RqueryAllVotes[i].destroy();
                                                }
                                                var aVoteIdea = new VoteIdea();
                                                aVoteIdea.set("Voter", window.currentUser.get("username"));
                                                aVoteIdea.set("IdeaId", window.currentIdeaId);
                                                aVoteIdea.set("Vote", 1); // agree
                                                aVoteIdea.save(null, {
                                                    success: function (aVoteIdea) {
                                                        var textUpdate = $('li#' + aVoteIdea.get("IdeaId")).find('.AgreeVote');
                                                        var original = textUpdate.text().split("(")[1].split(")");
                                                        var number = parseInt(original[0]);
                                                        number++;
                                                        var name = original[1] + ", " + window.currentUser.get("username");
														name = name.replace(/ , /g, " ");
                                                        textUpdate.text("Agree: (" + number + ")" + name);
                                                    },
                                                    error: function (aVoteIdea, error) {
                                                        $('#idea-error').text("Error: " + error.code + " " + error.message);
                                                    }
                                                });
                                            },
                                            error: function (RqueryAllVotes, error) {
                                                $('#idea-error').text("Error: " + error.code + " " + error.message);
                                            }
                                        });
                                    }, 500, "input_agree_disagree_syncup");
                                    return false;
                                });
                                listElement.find('input.disagree').attr("for", listElement.attr("id"));
                                listElement.find('input.disagree').click(function () {
                                    window.currentIdeaId = $(this).attr("for");
                                    waitForFinalEvent(function () {
                                        var queryAllVotes = new Parse.Query(window.VoteIdea);
                                        queryAllVotes.equalTo("Voter", window.currentUser.get("username"));
                                        queryAllVotes.equalTo("IdeaId", window.currentIdeaId);
                                        queryAllVotes.notEqualTo("Vote", 3); // vote
                                        queryAllVotes.find({
                                            /* wait for server response */
                                            success: function (RqueryAllVotes) {
                                                for (var i = 0; i < RqueryAllVotes.length; i++) {
                                                    var textUpdate = null;
													if (RqueryAllVotes[i].get("Vote") == 1) {
														textUpdate = $('li#' + RqueryAllVotes[i].get("IdeaId")).find('.AgreeVote');
													}
													else {
														textUpdate = $('li#' + RqueryAllVotes[i].get("IdeaId")).find('.DisagreeVote');
													}
                                                    var original = textUpdate.text().split("(")[1].split(")");
                                                    var number = parseInt(original[0]);
                                                    number--;
                                                    var name = original[1].replace(window.currentUser.get("username"), "").replace(/ , /g, " ").replace(/, $/g, "");
													if (RqueryAllVotes[i].get("Vote") == 1) {
														textUpdate.text("Agree: (" + number + ")" + name);
													}
													else {
														textUpdate.text("Disagree: (" + number + ")" + name);
													}
                                                    RqueryAllVotes[i].destroy();
                                                }
                                                var aVoteIdea = new VoteIdea();
                                                aVoteIdea.set("Voter", window.currentUser.get("username"));
                                                aVoteIdea.set("IdeaId", window.currentIdeaId);
                                                aVoteIdea.set("Vote", 2); // disagree
                                                aVoteIdea.save(null, {
                                                    success: function (aVoteIdea) {
                                                        var textUpdate = $('li#' + aVoteIdea.get("IdeaId")).find('.DisagreeVote');
                                                        var original = textUpdate.text().split("(")[1].split(")");
                                                        var number = parseInt(original[0]);
                                                        number++;
                                                        var name = original[1] + ", " + window.currentUser.get("username");
														name = name.replace(/ , /g, " ");
                                                        textUpdate.text("Disagree: (" + number + ")" + name);
                                                    },
                                                    error: function (aVoteIdea, error) {
                                                        $('#idea-error').text("Error: " + error.code + " " + error.message);
                                                    }
                                                });
                                            },
                                            error: function (RqueryAllVotes, error) {
                                                $('#idea-error').text("Error: " + error.code + " " + error.message);
                                            }
                                        });
                                    }, 500, "input_agree_disagree_syncup");
                                    return false;
                                });
                                listElement.find('input.vote').attr("for", listElement.attr("id"));
                                listElement.find('input.vote').click(function () {
                                    window.currentIdeaId = $(this).attr("for");
                                    waitForFinalEvent(function () {
                                        var queryAllVotes = new Parse.Query(window.VoteIdea);
                                        queryAllVotes.equalTo("Voter", window.currentUser.get("username"));
                                        queryAllVotes.equalTo("Vote", 3);
                                        queryAllVotes.find({
                                            /* wait for server response */
                                            success: function (RqueryAllVotes) {
											    // includes all the votes even not matching current topic
												// NOTE: bad database design
                                                for (var i = 0; i < RqueryAllVotes.length; i++) {
												    var fetchIdeaId = $('li#' + RqueryAllVotes[i].get("IdeaId"));
												    if (fetchIdeaId.length != 0) {
													    // match current topic
														// NOTE: this is a hack
														// NOTE: hard to maintain the codes.
												        // NOTE: bad database design
                                                        var textUpdate = fetchIdeaId.find('.FinalVote');
                                                        var original = textUpdate.text().split("(")[1].split(")");
                                                        var number = parseInt(original[0]);
                                                        number--;
                                                        window.theList3.get("objectId", RqueryAllVotes[i].get("IdeaId"))[0].values({
                                                            voteCount: number
                                                        });
                                                        var name = original[1].replace(window.currentUser.get("username"), "").replace(/ , /g, " ").replace(/, $/g, "");
                                                        textUpdate.text("Vote: (" + number + ")" + name);
                                                        RqueryAllVotes[i].destroy();
													}
                                                }
                                                var aVoteIdea = new VoteIdea();
                                                aVoteIdea.set("Voter", window.currentUser.get("username"));
                                                aVoteIdea.set("IdeaId", window.currentIdeaId);
                                                aVoteIdea.set("Vote", 3); // agree
                                                aVoteIdea.save(null, {
                                                    success: function (aVoteIdea) {
                                                        var textUpdate = $('li#' + aVoteIdea.get("IdeaId")).find('.FinalVote');
                                                        var original = textUpdate.text().split("(")[1].split(")");
                                                        var number = parseInt(original[0]);
                                                        number++;
                                                        window.theList3.get("objectId", aVoteIdea.get("IdeaId"))[0].values({
                                                            voteCount: number
                                                        });
                                                        var name = original[1] + ", " + window.currentUser.get("username");
														name = name.replace(/ , /g, " ");
                                                        textUpdate.text("Vote: (" + number + ")" + name);
														// update best
                                                        window.theList3.sort("voteCount", {
                                                            order: "desc"
                                                        });
                                                        window.theList3.search($("#idea-search-real").val(), ['CommentContent']);
                                                        var bestIdea = $('li.vote').first();
                                                        $("#current-decision").html(bestIdea.find(".CommentContent").html());
                                                        $("#current-decision-vote").text(bestIdea.find(".FinalVote").text());
                                                    },
                                                    error: function (aVoteIdea, error) {
                                                        $('#idea-error').text("Error: " + error.code + " " + error.message);
                                                    }
                                                });
                                            },
                                            error: function (RqueryAllVotes, error) {
                                                $('#idea-error').text("Error: " + error.code + " " + error.message);
                                            }
                                        });
                                    }, 500, "input_vote_syncup");
                                    return false;
                                });
                                listElement.removeClass("not-ready");
                                // vote status of this idea/comment
                                var queryAllVotes = new Parse.Query(window.VoteIdea);
                                queryAllVotes.equalTo("IdeaId", OneComment.id);
                                queryAllVotes.find({
                                    success: function (RqueryAllVotes) {
                                        if (RqueryAllVotes.length > 0) {
                                            var listElementForCallback = $('li#' + RqueryAllVotes[0].get('IdeaId'));
                                            var agreeCount = 0;
                                            var disagreeCount = 0;
                                            var voteCount = 0;
                                            var youAgree = 0;
                                            var youDisgree = 0;
                                            var youVote = 0;
                                            for (var i = 0; i < RqueryAllVotes.length; i++) {
                                                var OneVote = RqueryAllVotes[i];
                                                if (OneVote.get('Voter') != null) {
                                                    if (OneVote.get('Vote') == 1) {
                                                        listElementForCallback.find('.AgreeVote').append(OneVote.get('Voter') + ", ");
                                                        agreeCount++;
                                                    } else if (OneVote.get('Vote') == 2) {
                                                        listElementForCallback.find('.DisagreeVote').append(OneVote.get('Voter') + ", ");
                                                        disagreeCount++;
                                                    } else if (OneVote.get('Vote') == 3) {
                                                        listElementForCallback.find('.FinalVote').append(OneVote.get('Voter') + ", ");
                                                        voteCount++;
                                                    }
                                                    if (OneVote.get('Voter') == window.currentUser.get("username")) {
                                                        if (OneVote.get('Vote') == 1) {
                                                            youAgree = 1;
                                                        } else if (OneVote.get('Vote') == 2) {
                                                            youDisagree = 1;
                                                        } else if (OneVote.get('Vote') == 3) {
                                                            youVote = 1;
                                                        }
                                                    }
                                                }
                                            }
                                            if (youAgree != 0 || youDisgree != 0 || youVote != 0) {
                                                listElementForCallback.find('.UserVote').text("You ");
                                                if (youAgree == 1) {
                                                    listElementForCallback.find('.UserVote').append("agree and ");
                                                }
                                                if (youDisgree == 1) {
                                                    listElementForCallback.find('.UserVote').append("disagree and ");
                                                }
                                                if (youVote == 1) {
                                                    listElementForCallback.find('.UserVote').append("vote and ");
                                                }
                                                listElementForCallback.find('.UserVote').append("help this decision making on " + OneVote.updatedAt.toLocaleString());
                                            }
                                            window.theList3.get("objectId", listElementForCallback.attr("id"))[0].values({
                                                voteCount: voteCount
                                            });
                                            var agreeFinaltext = listElementForCallback.find('.AgreeVote').text();
                                            var disagreeFinaltext = listElementForCallback.find('.DisagreeVote').text();
                                            var voteFinaltext = listElementForCallback.find('.FinalVote').text();
                                            agreeFinaltext = agreeFinaltext.replace("Agree:", "Agree (" + agreeCount + "):");
                                            disagreeFinaltext = disagreeFinaltext.replace("Disagree:", "Disagree (" + disagreeCount + "):");
                                            voteFinaltext = voteFinaltext.replace("Vote:", "Vote (" + voteCount + "):");
                                            agreeFinaltext = agreeFinaltext.replace(/, $/g, "");
                                            disagreeFinaltext = disagreeFinaltext.replace(/, $/g, "");
                                            voteFinaltext = voteFinaltext.replace(/, $/g, "");
                                            listElementForCallback.find('.AgreeVote').text(agreeFinaltext);
                                            listElementForCallback.find('.DisagreeVote').text(disagreeFinaltext);
                                            listElementForCallback.find('.FinalVote').text(voteFinaltext);
                                            var rateFinalnumber = agreeCount / (agreeCount + disagreeCount) * 100;
                                            listElementForCallback.find('.Ratio').append(rateFinalnumber.toFixed(2) + "%");
                                        }
                                        // update best
                                        window.theList3.sort("voteCount", {
                                            order: "desc"
                                        });
                                        window.theList3.search($("#idea-search-real").val(), ['CommentContent']);
                                        var bestIdea = $('li.vote').first();
                                        $("#current-decision").html(bestIdea.find(".CommentContent").html());
                                        $("#current-decision-vote").text(bestIdea.find(".FinalVote").text());
                                    },
                                    error: function (RqueryAllVotes, error) {
                                        $('#idea-error').text("Error: " + error.code + " " + error.message);
                                    }
                                });
                            }
                        } // for each comment loop

                        // update search result
                        $('#open-idea-zone').show();
                        $("html, body").scrollTop(0);
                        window.theList2.search($("#comment-search-real").val(), ['CommentContent']);
                    },
                    error: function (error) {
                        $('#readcomment .error').text("Error: " + error.code + " " + error.message);
                    }
                });
            },
            error: function (object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                $('#section2 #section2-get .error').text("Error: " + error.code + " " + error.message);
            }
        });
        /* codes keep going without server response */
        $('#section2').show();
    }

    /* register event */

    $("#signup").submit(function (e) {
        var username = $("#signup .username").val().trim();
        var email = $("#signup .email").val().trim();
        var password = $("#signup .password").val();
        if (username.match(/^[a-zA-Z0-9 ]+$/) == null) {
            $('#signup .error').text("username is required as characters, number, and spaces");
            return false;
        }
        if (email.match(/\w+@\w+\.\w+/) == null) {
            $('#signup .error').text("email format is required as <word>@<word>.<word>");
            return false;
        }
        if (password == "") {
            $('#signup .error').text("password is required");
            return false;
        }
        var user = new Parse.User();
        user.set("username", $("#signup .username").val());
        user.set("email", $("#signup .email").val());
        user.set("password", $("#signup .password").val());
        user.signUp(null, {
            success: function (user) {
                window.currentUser = Parse.User.current();
                $('#signup .error').text("");
                // alert("success!");
                $('#headline').css("background-image", "none");
                $('#headline h1').append(" - " + username);
                $('#login').hide();
                $('#signup').hide();
                cleanup_form();
                show_section();
                $('#signout').show();
            },
            error: function (user, error) {
                // console.log("error!");
                // alert("Error: " + error.code + " " + error.message);
                $('#signup .error').text("Error: " + error.code + " " + error.message);
                // $('#signup .error').text(error.message); // real
            }
        });
        return false;
    });
    $("#login").submit(function (e) {
        var username = $("#login .username").val();
        var password = $("#login .password").val();
        if (username == "") {
            $('#login .error').text("username is required");
            return false;
        }
        if (password == "") {
            $('#login .error').text("password is required");
            return false;
        }
        Parse.User.logIn(username, password, {
            success: function (user) {
                window.currentUser = Parse.User.current();
                $('#login .error').text("");
                // alert("success!");
                $('#headline').css("background-image", "none");
                $('#headline h1').append(" - " + username);
                $('#login').hide();
                $('#signup').hide();
                cleanup_form();
                $('#signout').show();
                show_section();
            },
            error: function (user, error) {
                // console.log("error!");
                // alert("Error: " + error.code + " " + error.message);
                $('#login .error').text("Error: " + error.code + " " + error.message);
                // $('#signup .error').text(error.message); // real
            }
        });
        return false;
    });
    $("#signout").submit(function (e) {
        if (window.currentUser) {
            Parse.User.logOut();
            window.currentUser = Parse.User.current();
        }
        $('#headline').css("background-image", "url('berkeley.jpg')");
        $('#headline h1').text("Idea for Team");
        cleanup_form();
        $('#login').show();
        $('#signup').show();
        $('#section1').hide();
        $('#section2').hide();
        $('#signout').hide();
        return false;
    });
    $("#addtopic").submit(function (e) {
        var TopicName = $("#search-real").val();
        var TopicOwner = "";
        if (window.currentUser) {
            TopicOwner = window.currentUser.get("username");
        }
        if (TopicName == "") {
            $('#addtopic .error').text("this field is required");
            return false;
        }
        if (TopicOwner == "") {
            $('#addtopic .error').text("log-in is required");
            return false;
        }
        var aProjectTopic = new ProjectTopic();
        aProjectTopic.set("TopicName", TopicName);
        aProjectTopic.set("TopicOwner", TopicOwner);
        aProjectTopic.set("CommentCount", 0);
        aProjectTopic.save(null, {
            success: function (aProjectTopic) {
                // Execute any logic that should take place after the object is saved.
                // alert('New object created with objectId: ' + gameScore.id);
                show_section1();
            },
            error: function (aProjectTopic, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                $('#addtopic .error').text("Error: " + error.code + " " + error.message);
            }
        });
        return false;
    });
    $("#addcomment").submit(function (e) {
        var CommentContent = $("#comment-real").val();
        var CommentOwner = "";
        if (window.currentUser) {
            CommentOwner = window.currentUser.get("username");
        }
        if (CommentContent == "") {
            $('#addcomment .error').text("this field is required");
            return false;
        }
        if (CommentOwner == "") {
            $('#addcomment .error').text("log-in is required");
            return false;
        }
        var aCommentTopic = new CommentTopic();
        aCommentTopic.set("TopicId", window.currentTopicId);
        aCommentTopic.set("CommentContent", CommentContent);
        aCommentTopic.set("CommentOwner", CommentOwner);
        aCommentTopic.set("Status", 0);
        aCommentTopic.save(null, {
            success: function (aCommentTopic) {
                // Execute any logic that should take place after the object is saved.
                // alert('New object created with objectId: ' + gameScore.id);
                $('#addcomment .error').text("");
                $("#comment-real").val("");
                show_section2();
            },
            error: function (aCommentTopic, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                $('#addcomment .error').text("Error: " + error.code + " " + error.message);
            }
        });
        return false;
    });
    $("#go-to-section1").click(function () {
        $.QueryString["id"] = null;
        $('#section2').hide();
        show_section1();
        return false;
    });
    $("#open-idea-zone").click(function () {
        $("#open-idea-zone").hide();
        $("#idea-zone").show();
        return false;
    });
    $("#close-idea-zone").click(function () {
        $("#idea-zone").hide();
        $("#open-idea-zone").show();
        return false;
    });
    $("#open-help-zone").click(function () {
        $("#open-help-zone").hide();
        $("#help-zone").show();
        return false;
    });
    $("#close-help-zone").click(function () {
        $("#help-zone").hide();
        $("#open-help-zone").show();
        return false;
    });
    $("#addidea").submit(function (e) {
        var CommentContent = $("#idea-real").val();
        var CommentOwner = "";
        if (window.currentUser) {
            CommentOwner = window.currentUser.get("username");
        }
        if (CommentContent == "") {
            $('#addidea .error').text("this field is required");
            return false;
        }
        if (CommentOwner == "") {
            $('#addidea .error').text("log-in is required");
            return false;
        }
        var aCommentTopic = new CommentTopic();
        aCommentTopic.set("TopicId", $.QueryString["id"]);
        aCommentTopic.set("CommentContent", CommentContent);
        aCommentTopic.set("CommentOwner", CommentOwner);
        aCommentTopic.set("Status", 1);
        aCommentTopic.save(null, {
            success: function (aCommentTopic) {
                // Execute any logic that should take place after the object is saved.
                // alert('New object created with objectId: ' + gameScore.id);
                $('#addidea .error').text("");
                $("#idea-real").val("");
                $("#idea-zone").hide();
                $("#open-idea-zone").show();
                show_section2();
            },
            error: function (aCommentTopic, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                $('#addidea .error').text("Error: " + error.code + " " + error.message);
            }
        });
        return false;
    });
    var search_real_sync_up = function () {
        waitForFinalEvent(function () {
            $('#addtopic .error').text("");
            $('#search-clear').toggle(Boolean($("#search-real").val()));
            // theList_do_search is already registed inside api
        }, 100, "search_real_sync_up");
    };
    var search_clear_do_clear = function () {
        waitForFinalEvent(function () {
            $('#search-real').val('');
            $('#search-real').focus();
            $('#search-clear').toggle(false);
            window.theList.sort("CommentCount", {
                order: "desc"
            });
            // change to search TopicOwner column
            // window.theList.search($("#search-real").val(), ['TopicOwner']);
            window.theList.search($("#search-real").val());
        }, 100, "search_clear_do_clear");
    };
    $('#search-real').on("input", search_real_sync_up);
    $('#search-clear').on("click", search_clear_do_clear);
    $('#comment-real').on("input", function () {
        $("#addcomment .error").text("");
    });
});
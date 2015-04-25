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
    // $.QueryString["id"]

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
        if ($.QueryString["id"] == null) {
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
            '<div class="col-xs-6 col-sm-12 col-md-3"><p class="CommentCount"></p></div>' +
            '<div class="col-xs-6 col-sm-6 col-md-3"><p class="TopicOwner"></p></div>' +
            '<div class="col-xs-12 col-sm-6 col-md-6"><p class="updatedAt"></p></div>' +
            '</div>' +
            '<p class="objectId"></p>' +
            '</a></li>',
        valueNames: ['TopicName', 'TopicOwner', 'updatedAt', 'CommentCount', 'objectId']
    };
    window.theList = new List('id-search-key', options);
    var options2 = {
        item: '<li class="list-group-item">' +
            '<p class="CommentOwner"></p>' +
            '<span class="list-group-item">' +
            '<div class="CommentContent2"><p class="CommentContent"></p></div>' +
            '</span>' +
            '<p class="updatedAt"></p>' +
            '<p class="objectId"></p>' +
            '</li>',
        valueNames: ['CommentContent', 'CommentOwner', 'updatedAt', 'objectId']
    };
    window.theList2 = new List('comment-id-search-key', options2);

    // set up parse.com
    Parse.initialize("gLr9xymyelDTkCD8MTCLt3bVVUgtANSWyA0HUa3P", "P2eQs1HP29cvjU7MHNN8k4iZtXTdqD8xEgKhVDRJ");
    window.ProjectTopic = Parse.Object.extend("ProjectTopic");
    window.CommentTopic = Parse.Object.extend("CommentTopic");
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
        }
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
                    $(this).attr("href", "?id=" + $(this).children(".objectId").text());
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

    function show_section2() {
        if (window.currentUser) {
            $('#headline h1').text("Idea for Team - " + window.currentUser.get("username"));
        }
        window.theList2.clear();
        var query = new Parse.Query(window.ProjectTopic);
        query.get($.QueryString["id"], {
            success: function (object) {
                // The object was retrieved successfully.
                $('#section2 .TopicName').text(object.get('TopicName'));
                $('#section2 .TopicOwner').text(object.get('TopicOwner'));
                $('#section2 .updatedAt').text(object.updatedAt.toLocaleString());
                var query = new Parse.Query(window.CommentTopic);
                query.equalTo("TopicId", $.QueryString["id"]);
                query.find({
                    /* wait for server response */
                    success: function (results) {
                        // update count
                        object.set("CommentCount", results.length);
                        object.save();
                        // $('#addtopic .error').text("Successfully retrieved " + results.length + " data - ");
                        for (var i = 0; i < results.length; i++) {
                            var object2 = results[i];
                            window.theList2.add({
                                CommentContent: object2.get('CommentContent'),
                                CommentOwner: object2.get('CommentOwner'),
                                updatedAt: object2.updatedAt.toLocaleString(),
                                objectId: object2.id
                            });
                            // $('#addtopic .error').append(object2.get('TopicName') + " / " + object2.get('TopicOwner') + " - ");
                        }
                        // update search result
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
        var username = $("#signup .username").val();
        var email = $("#signup .email").val();
        var password = $("#signup .password").val();
        if (username == "") {
            $('#signup .error').text("username is required");
            return false;
        }
        if (email.match(/\w+@\w+\.\w+/g) == null) {
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
        aCommentTopic.set("TopicId", $.QueryString["id"]);
        aCommentTopic.set("CommentContent", CommentContent);
        aCommentTopic.set("CommentOwner", CommentOwner);
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
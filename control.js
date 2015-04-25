$(document).ready(function () {
    console.log("ready!");

    function cleanup_form() {
        $("#signup .username").val("");
        $("#signup .email").val("");
        $("#signup .password").val("");
        $("#login .username").val("");
        $("#login .password").val("");
        $("#search-real").val("");
    }
    cleanup_form();

    var options = {
        item: '<li class="list-group-item"><a href="#" class="list-group-item">' +
        '<p class="TopicName"></p>' +
        '<p class="TopicOwner"></p>' +
        '<p class="updatedAt"></p>' +
        '</a></li>',
        valueNames: ['TopicName', 'TopicOwner', 'updatedAt']
    };
    window.theList = new List('id-search-key', options);
    Parse.initialize("gLr9xymyelDTkCD8MTCLt3bVVUgtANSWyA0HUa3P", "P2eQs1HP29cvjU7MHNN8k4iZtXTdqD8xEgKhVDRJ");
    window.ProjectTopic = Parse.Object.extend("ProjectTopic");
    window.currentUser = Parse.User.current();
    if (window.currentUser) {
        $('#headline').css("background-image", "none");
        $('#login').hide();
        $('#signup').hide();
        $('#signout').show();
        show_section1();
    } else {
        //
    }

    $('#search-clear').toggle(false);
    $('.not-footer').show();
    $('.footer').show();

    /* define function */

    function show_section1() {
        if (window.currentUser) {
            $('#headline h1').text("Idea for Team - " + window.currentUser.get("username"));
        }
        $('#section1').show();
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
                        updatedAt: object.updatedAt
                    });
                    // $('#addtopic .error').append(object.get('TopicName') + " / " + object.get('TopicOwner') + " - ");
                }
                window.theList.search($("#search-real").val(), ['TopicName']);
            },
            error: function (error) {
                $('#addtopic .error').text("Error: " + error.code + " " + error.message);
            }
        });
        /* codes keep going without server response */
        $('#section1').show();
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
                show_section1();
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
                show_section1();
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
            $('#search-clear').toggle(Boolean($("#search-real").val()));
            // theList_do_search is already registed inside api
        }, 100, "search_real_sync_up");
    };
    var search_clear_do_clear = function () {
        waitForFinalEvent(function () {
            $('#search-real').val('');
            $('#search-real').focus();
            $('#search-clear').toggle(false);
            // change to search TopicOwner column
            // window.theList.search($("#search-real").val(), ['TopicOwner']);
            window.theList.search($("#search-real").val());
        }, 100, "search_clear_do_clear");
    };
    $('#search-real').on("input", search_real_sync_up);
    $('#search-clear').on("click", search_clear_do_clear);
});
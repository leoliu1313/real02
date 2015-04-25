$(document).ready(function () {
    console.log("ready!");
    Parse.initialize("gLr9xymyelDTkCD8MTCLt3bVVUgtANSWyA0HUa3P", "P2eQs1HP29cvjU7MHNN8k4iZtXTdqD8xEgKhVDRJ");
    var ProjectTopic = Parse.Object.extend("ProjectTopic");
    var options = {
        item: '<li class="list-group-item"><a href="#" class="list-group-item name"></a></li>',
        valueNames: ['name']
    };
    /*
    var values = [
        {
            name: 'https://github.com/leoliu1313'
    }, {
            name: 'https://www.google.com'
    }, {
            name: 'http://getbootstrap.com'
    }, {
            name: 'http://getbootstrap.com/getting-started/#template'
    }];
    var theList = new List('id-search-key', options, values);
    */
    var theList = new List('id-search-key', options);

    function show_section1() {
        var query = new Parse.Query(ProjectTopic);
        query.find({
            success: function (results) {
                // $('#addtopic .error').text("Successfully retrieved " + results.length + " data - ");
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    theList.add({
                        name: object.get('TopicName') + " / " + object.get('TopicOwner')
                    });
                    // $('#addtopic .error').append(object.get('TopicName') + " / " + object.get('TopicOwner') + " - ");
                }
            },
            error: function (error) {
                $('#addtopic .error').text("Error: " + error.code + " " + error.message);
            }
        });
        $('#section1').show();
    }

    var currentUser = Parse.User.current();
    if (currentUser) {
        $('#headline').css("background-image", "none");
        $('#headline h1').append(" - " + currentUser.get("username"));
        $('#login').hide();
        $('#signup').hide();
        $('#signout').show();
        show_section1();
    } else {
        //
    }

    $('#search-clear').toggle(false);
    $('html').show();

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
                $('#signup .error').text("");
                // alert("success!");
                $('#headline').css("background-image", "none");
                $('#headline h1').append(" - " + username);
                $('#login').hide();
                $('#signup').hide();
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
                $('#login .error').text("");
                // alert("success!");
                $('#headline').css("background-image", "none");
                $('#headline h1').append(" - " + username);
                $('#login').hide();
                $('#signup').hide();
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
        var currentUser = Parse.User.current();
        if (currentUser) {
            Parse.User.logOut();
        }
        $('#headline').css("background-image", "url('berkeley.jpg')");
        $('#headline h1').text("Idea for Team");
        $('#login').show();
        $('#signup').show();
        $('#section1').hide();
        $('#signout').hide();
        return false;
    });
    $("#addtopic").submit(function (e) {
        var currentUser = Parse.User.current();
        var TopicName = $("#search-real").val();
        var TopicOwner = "";
        if (currentUser) {
            TopicOwner = currentUser.get("username");
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
                show_section1()
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
    var theList_do_search = function () {
        theList.search($("#search-real").val());
        // console.log('debug theList_do_search');
    };
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
            theList_do_search();
            $('#search-clear').toggle(false);
        }, 100, "search_clear_do_clear");
    };
    $('#search-real').on("input", search_real_sync_up);
    $('#search-clear').on("click", search_clear_do_clear);
});
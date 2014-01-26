define(function(require,exports,module){
	var template = _.template(require("../layout/main.html"));
	var Global = require("./global");
	$("body").html(template());

	var myref = new Firebase(Global.FIREBASE_URL);
	var auth = new FirebaseSimpleLogin( myref, function(error, user) {
		if (error) {
			switch(error.code) {
				case 'INVALID_EMAIL':
				case 'INVALID_PASSWORD':
				default:
			}
		} else if (user) {
			onUserLogin(user);
		} else {
		// user is logged out
			Global.currentUser = null;
			$("#user-login").show();
			$("#user-register").show();
			$("#user-logout").hide();
			$("#user-profile").hide();
		}
	});

	var onUserLogin = function(user){
		$("#login-register-dialog").modal("hide");
		Global.currentUser = user;
		$("#user-login").hide();
		$("#user-register").hide();
		$("#user-logout").show();
		$("#user-profile").show();
	}

	var showDialog = function(){
		$("#user-email").val("");
		$("#user-password").val("");
		$("#login-register-dialog").modal({
			show:true
		});
	}
	$("#user-login").on("click",showDialog);
	$("#user-register").on("click",showDialog);
	$("#user-register-btn").on("click",function(){
		var email = $("#user-email").val().trim();
		var password = $("#user-password").val();
		if ( !email ) {
			$("#user-email").addClass("has-error");
			return;
		}
		$("#user-email").removeClass("has-error");
		if ( !password ){
			$("#user-password").addClass("has-error");
			return;
		}
		$("#user-password").removeClass("has-error");
		auth.createUser(email, password, function(error, user) {
			if (error) {
				switch(error.code) {
					case 'EMAIL_TAKEN':
						//用户已存在
					break;
					default:
						console.log("error:"+error.code);
				}
			} else {
				auth.login('password', {
					email: email,
					password: password,
					//rememberMe: true
				});
			}
		});
	});
	$("#user-login-btn").on("click",function(){
		var email = $("#user-email").val().trim();
		var password = $("#user-password").val();
		if ( !email ) {
			$("#user-email").addClass("has-error");
			return;
		}
		$("#user-email").removeClass("has-error");
		if ( !password ){
			$("#user-password").addClass("has-error");
			return;
		}
		$("#user-password").removeClass("has-error");
		auth.login('password', {
			email: email,
			password: password,
			//rememberMe: true
		});
	});

	$("#user-logout").on("click",function(){
		auth.logout();
	});

	$("#edit-npc").on("click",function(){
		$("#main-board").empty();
		var NpcEditor = require("./npc-editor").NpcEditor;
		var npcEditor = new NpcEditor();
		$("#main-board").append(npcEditor.render().el);
	});

	$("#edit-place").on("click",function(){
		$("#main-board").empty();
		var PlaceEditor = require("./place-editor").PlaceEditor;
		var placeEditor = new PlaceEditor();
		$("#main-board").append(placeEditor.render().el);
	});

	$("#edit-story").on("click",function(){
		$("#main-board").empty();
		var StoryEditor = require("./story-editor").StoryEditor;
		var storyEditor = new StoryEditor();
		$("#main-board").append(storyEditor.render().el);
	});
});
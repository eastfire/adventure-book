define(function(require,exports,module){
	var template = _.template(require("../layout/main.html"));
	var Global = require("./global");

	toastr.options = {
	  "closeButton": false,
	  "debug": false,
	  "positionClass": "toast-top-full-width",
	  "onclick": null,
	  "showDuration": "300",
	  "hideDuration": "1000",
	  "timeOut": "3000",
	  "extendedTimeOut": "1000",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut"
	}

	$("body").html(template());

	var handleError = function(error){
		switch(error.code) {
			case 'INVALID_EMAIL':
				toastr["error"]("不是合法的电子邮件格式");
			break;
			case 'INVALID_USER':
				toastr["error"]("用户不存在");
			break;
			case 'INVALID_PASSWORD':
				toastr["error"]("密码错误");
			break;
			case 'EMAIL_TAKEN':
				toastr["error"]("用户已存在");
			break;
			default:
				console.log("error:"+error.code);
		}
	}

	var myref = new Firebase(Global.FIREBASE_URL);
	var auth = new FirebaseSimpleLogin( myref, function(error, user) {
		if (error) {
			$("#user-login-btn").button('reset');
			handleError(error);
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

		require("./loading").startLoading();
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
	$("#user-register-btn").button().on("click",function(){
		var email = $("#user-email").val().trim();
		var password = $("#user-password").val();
		var remember = $("#remember-me").prop("checked");
		if ( !email ) {
			toastr["error"]("请输入电子邮件帐号");
			return;
		}
		if ( !password ){
			toastr["error"]("请输入密码");
			return;
		}
		$("user-register-btn").button('loading');
		auth.createUser(email, password, function(error, user) {
			$("user-register-btn").button('reset');
			if (error) {
				handleError(error);
			} else {
				auth.login('password', {
					email: email,
					password: password,
					rememberMe: remember
				});
			}
		});
	});
	$("#user-login-btn").button().on("click",function(){
		var email = $("#user-email").val().trim();
		var remember = $("#remember-me").prop("checked");
		var password = $("#user-password").val();
		if ( !email ) {
			toastr["error"]("请输入电子邮件帐号");
			return;
		}
		if ( !password ){
			toastr["error"]("请输入密码");
			return;
		}
		$("#user-login-btn").button('loading');
		auth.login('password', {
			email: email,
			password: password,
			rememberMe: remember
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

	$("#edit-map").on("click",function(){
		$("#main-board").empty();
		var Board = require("./board").Board;
		var board = new Board();
		$("#main-board").append(board.render().el);
	});

});
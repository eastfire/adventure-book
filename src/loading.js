define(function(require,exports,module){
	var Global = require("./global");
	var Model = require("./model");
	var PlaceCollection = Model.PlaceCollection;
	var NpcCollection = Model.NpcCollection;
	var MapTileCollection = Model.MapTileCollection;
	var StoryCollection = Model.StoryCollection;
	var CardTemplateCollection = Model.CardTemplateCollection;
	
	exports.startLoading = function(){
		
		Global.card = new CardTemplateCollection();

		$("#loading-dialog").modal({
			show:true
		});
		
		Global.npcCollection = new NpcCollection();
		$("#loading-content").html("加载NPC");
		Global.npcCollection.firebase.once("child_added",function(){
			$("#loading-content").html("加载NPC成功");
			Global.placeCollection = new PlaceCollection();
			Global.placeCollection.firebase.once("child_added",function(){
				$("#loading-content").html("加载地点成功");
				Global.map = new MapTileCollection();
				$("#loading-content").html("加载地图");
				Global.map.firebase.once("child_added",function(){
					$("#loading-content").html("加载地图成功");
					Global.storyCollection = new StoryCollection();
					$("#loading-content").html("加载故事");
					Global.storyCollection.firebase.once("child_added",function(){
						$("#loading-content").html("加载故事成功");
						require("./all-cards").initCards();
						$("#loading-content").html("加载卡牌成功");
						Global.currentUserProfile = new Model.UserProfile({},{
							firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/profile")
						});
						$("#loading-content").html("加载用户信息");
						Global.currentUserProfile.firebase.once("value",function(){
							var model = Global.currentUserProfile;
							if ( model.get("nickname") )	{
								$("#loading-content").html("加载用户信息成功");
								Global.currentPcId = model.get("currentPcId");
								if ( Global.currentPcId !== null ){
									Global.currentPc = new Model.Pc({},{
										firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/"+Global.currentPcId)
									});
									Global.currentPc.firebase.once("value",function(){
										var model = Global.currentPc
										$("#loading-content").html("加载角色信息成功");
										$("#adventure-book-action-bar").show();
										$("#loading-dialog").modal("hide");
									});
								} else {
									Global.currentPc = new Model.Pc({},{
										firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/1")
									});
									$("#loading-dialog").modal("hide");
									window.showPCEditor();
								}
							} else {
								$("#loading-dialog").modal("hide");
								window.showProfileEditor();
							}
						});		
					});
				});
			});
		});
		
		
		
		
	}
});
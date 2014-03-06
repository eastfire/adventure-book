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
		Global.npcCollection.once("add",function(){
			$("#loading-content").html("加载NPC成功");
			Global.placeCollection = new PlaceCollection();
			Global.placeCollection.once("add",function(){
				$("#loading-content").html("加载地点成功");
				Global.map = new MapTileCollection();
				Global.map.once("add",function(){
					$("#loading-content").html("加载地图成功");
					Global.storyCollection = new StoryCollection();
					Global.storyCollection.once("add",function(){
						$("#loading-content").html("加载故事成功");
						require("./all-cards").initCards();
						Global.currentUserProfile = new Model.UserProfile({},{
							firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/profile")
						});
						Global.currentUserProfile.once("change",function(model){
							if ( model.get("nickname") )	{
								$("#loading-content").html("加载用户信息成功");
								Global.currentPcId = model.get("currentPcId");
								if ( Global.currentPcId !== null ){
									Global.currentPc = new Model.Pc({},{
										firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/"+Global.currentPcId)
									});
									Global.currentPc.once("change",function(model){									
										$("#loading-content").html("加载PC信息成功");
										$("#adventure-book-action-bar").show();
										$("#loading-dialog").modal("hide");
									});
								} else {
									Global.currentPc = new Model.Pc({},{
										firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/0")
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
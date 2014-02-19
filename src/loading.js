define(function(require,exports,module){
	var Global = require("./global");
	var Model = require("./model");
	var PlaceCollection = Model.PlaceCollection;
	var NpcCollection = Model.NpcCollection;
	var MapTileCollection = Model.MapTileCollection;
	var StoryCollection = Model.StoryCollection;
	var CardTemplateCollection = Model.CardTemplateCollection;
	
	exports.startLoading = function(){
		Global.map = new MapTileCollection();
		Global.npcCollection = new NpcCollection();
		Global.placeCollection = new PlaceCollection();
		Global.storyCollection = new StoryCollection();
		Global.card = new CardTemplateCollection();
		
		Global.currentUserProfile = new Model.UserProfile({},{
			firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/profile")
		});

		Global.npcCollection.once("add",function(){
			toastr["info"]("加载NPC成功");			
		});
		Global.placeCollection.once("add",function(){
			toastr["info"]("加载地点成功");
		});
		Global.map.once("add",function(){
			toastr["info"]("加载地图成功");
		});
		Global.storyCollection.once("add",function(){
			toastr["info"]("加载故事成功");
		});
		require("./all-cards").initCards();

		Global.currentUserProfile.on("change",function(model){
			Global.currentPcId = model.get("currentPcId");
			Global.currentPc = new Model.Pc({},{
				firebase: new Firebase(Global.FIREBASE_URL + "/user/"+Global.currentUser.id+"/pc/"+Global.currentPcId)
			});
			Global.currentPc.once("change",function(model){
				$("#adventure-book-action-bar").show();
			});
		});		
	}
});